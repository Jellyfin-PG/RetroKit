import { crc32 } from '../crc32';

export type PatchFormat = 'IPS' | 'BPS' | 'UPS';

export interface PatchResult {
  patchedRom: Uint8Array;
  format: PatchFormat;
  originalCrc32: number;
  patchedCrc32: number;
}

/**
 * Universal ROM Patcher supporting standard formats: IPS, BPS, and UPS.
 */
export class RomPatcher {
  /**
   * Identifies patch format based on binary magic headers.
   */
  public static identifyFormat(patch: Uint8Array): PatchFormat {
    if (
      patch.length >= 5 &&
      patch[0] === 0x50 &&
      patch[1] === 0x41 &&
      patch[2] === 0x54 &&
      patch[3] === 0x43 &&
      patch[4] === 0x48
    ) {
      return 'IPS'; // 'PATCH'
    }
    if (
      patch.length >= 4 &&
      patch[0] === 0x42 &&
      patch[1] === 0x50 &&
      patch[2] === 0x53 &&
      patch[3] === 0x31
    ) {
      return 'BPS'; // 'BPS1'
    }
    if (
      patch.length >= 4 &&
      patch[0] === 0x55 &&
      patch[1] === 0x50 &&
      patch[2] === 0x53 &&
      patch[3] === 0x31
    ) {
      return 'UPS'; // 'UPS1'
    }
    throw new Error(
      '[RomPatcher] Unknown or unsupported patch format. Expected IPS, BPS, or UPS header.',
    );
  }

  /**
   * Applies an IPS, BPS, or UPS patch to source ROM in-memory.
   */
  public static applyPatch(
    rom: Uint8Array,
    patch: Uint8Array,
    verifyChecksum = true,
  ): PatchResult {
    const format = this.identifyFormat(patch);
    const originalCrc = crc32(rom);
    let patched: Uint8Array;

    switch (format) {
      case 'IPS':
        patched = this.applyIps(rom, patch);
        break;
      case 'BPS':
        patched = this.applyBps(rom, patch, verifyChecksum);
        break;
      case 'UPS':
        patched = this.applyUps(rom, patch, verifyChecksum);
        break;
    }

    return {
      patchedRom: patched,
      format,
      originalCrc32: originalCrc,
      patchedCrc32: crc32(patched),
    };
  }

  // --- IPS (International Patching System) ---
  private static applyIps(rom: Uint8Array, patch: Uint8Array): Uint8Array {
    let offset = 5; // Skip 'PATCH'
    let output = new Uint8Array(rom);

    const ensureCapacity = (requiredLen: number) => {
      if (requiredLen > output.length) {
        const next = new Uint8Array(Math.max(requiredLen, output.length * 2));
        next.set(output);
        output = next;
      }
    };

    while (offset < patch.length) {
      // Check for EOF (0x454F46)
      if (
        offset + 3 <= patch.length &&
        patch[offset] === 0x45 &&
        patch[offset + 1] === 0x4f &&
        patch[offset + 2] === 0x46
      ) {
        offset += 3;
        // Optional 3-byte truncation offset
        if (offset + 3 <= patch.length) {
          const truncateLen =
            (patch[offset] << 16) |
            (patch[offset + 1] << 8) |
            patch[offset + 2];
          if (truncateLen < output.length) {
            output = output.subarray(0, truncateLen);
          }
        }
        break;
      }

      if (offset + 5 > patch.length) break;

      const destOffset =
        (patch[offset] << 16) | (patch[offset + 1] << 8) | patch[offset + 2];
      const length = (patch[offset + 3] << 8) | patch[offset + 4];
      offset += 5;

      if (length === 0) {
        // RLE Record
        if (offset + 3 > patch.length) break;
        const rleLength = (patch[offset] << 8) | patch[offset + 1];
        const val = patch[offset + 2];
        offset += 3;

        ensureCapacity(destOffset + rleLength);
        output.fill(val, destOffset, destOffset + rleLength);
      } else {
        // Standard copy record
        if (offset + length > patch.length) break;
        ensureCapacity(destOffset + length);
        output.set(patch.subarray(offset, offset + length), destOffset);
        offset += length;
      }
    }

    return output;
  }

  // --- BPS (beat patch system) ---
  private static applyBps(
    rom: Uint8Array,
    patch: Uint8Array,
    verify = true,
  ): Uint8Array {
    let offset = 4; // Skip 'BPS1'

    const readVlq = (): number => {
      let data = 0;
      let shift = 1;
      while (true) {
        if (offset >= patch.length)
          throw new Error('[RomPatcher] Unexpected EOF in BPS patch');
        const x = patch[offset++];
        data += (x & 0x7f) * shift;
        if (x & 0x80) break;
        shift <<= 7;
        data += shift;
      }
      return data;
    };

    const sourceSize = readVlq();
    const targetSize = readVlq();
    const metadataSize = readVlq();
    offset += metadataSize;

    if (verify && sourceSize !== rom.length) {
      console.warn(
        `[RomPatcher] BPS Source size mismatch. Expected ${sourceSize}, got ${rom.length}.`,
      );
    }

    const output = new Uint8Array(targetSize);
    let outputOffset = 0;
    let sourceRelativeOffset = 0;
    let targetRelativeOffset = 0;

    const footerLength = 12;
    const endOffset = patch.length - footerLength;

    while (offset < endOffset) {
      const data = readVlq();
      const action = data & 3;
      const length = (data >> 2) + 1;

      switch (action) {
        case 0: {
          // SourceRead
          while (length > 0) {
            output[outputOffset] = rom[outputOffset];
            outputOffset++;
            length - 1;
            break;
          }
          // Direct bulk copy
          const count = (data >> 2) + 1;
          output.set(
            rom.subarray(outputOffset, outputOffset + count),
            outputOffset,
          );
          outputOffset += count;
          break;
        }
        case 1: {
          // TargetRead
          const count = (data >> 2) + 1;
          output.set(patch.subarray(offset, offset + count), outputOffset);
          offset += count;
          outputOffset += count;
          break;
        }
        case 2: {
          // SourceCopy
          const offsetData = readVlq();
          sourceRelativeOffset += (offsetData & 1 ? -1 : 1) * (offsetData >> 1);
          const count = (data >> 2) + 1;
          for (let i = 0; i < count; i++) {
            output[outputOffset++] = rom[sourceRelativeOffset++];
          }
          break;
        }
        case 3: {
          // TargetCopy
          const offsetData = readVlq();
          targetRelativeOffset += (offsetData & 1 ? -1 : 1) * (offsetData >> 1);
          const count = (data >> 2) + 1;
          for (let i = 0; i < count; i++) {
            output[outputOffset++] = output[targetRelativeOffset++];
          }
          break;
        }
      }
    }

    return output;
  }

  // --- UPS (Universal Patching System) ---
  private static applyUps(
    rom: Uint8Array,
    patch: Uint8Array,
    _verify = true,
  ): Uint8Array {
    let offset = 4; // Skip 'UPS1'

    const readVlq = (): number => {
      let data = 0;
      let shift = 1;
      while (true) {
        if (offset >= patch.length)
          throw new Error('[RomPatcher] Unexpected EOF in UPS patch');
        const x = patch[offset++];
        data += (x & 0x7f) * shift;
        if (x & 0x80) break;
        shift <<= 7;
        data += shift;
      }
      return data;
    };

    const _sourceSize = readVlq();
    const targetSize = readVlq();
    const output = new Uint8Array(targetSize);

    // Initialize output with source rom bytes up to targetSize
    output.set(rom.subarray(0, Math.min(rom.length, targetSize)));

    let outPtr = 0;
    const endOffset = patch.length - 12;

    while (offset < endOffset) {
      const skip = readVlq();
      outPtr += skip;

      while (offset < endOffset) {
        const b = patch[offset++];
        if (b === 0) break;
        if (outPtr < output.length) {
          output[outPtr] ^= b;
        }
        outPtr++;
      }
      outPtr++;
    }

    return output;
  }
}
