/**
 * ArchiveExtractor provides utilities to decompress 7z and zip archives
 * inside a Web Worker to prevent blocking the main browser thread.
 */
export class ArchiveExtractor {
  private static _workerScriptCache: Map<string, string> = new Map();

  /**
   * Decompresses an archive buffer into a key-value mapping of relative file paths to Uint8Array contents.
   */
  public static async decompress(
    archiveData: Uint8Array,
    format: '7z' | 'zip',
    onProgress?: (percent: number) => void,
  ): Promise<Record<string, Uint8Array>> {
    const scriptCode = await this._getWorkerScript(format);
    const workerBlob = new Blob([scriptCode], {
      type: 'application/javascript',
    });
    const workerUrl = URL.createObjectURL(workerBlob);
    const worker = new Worker(workerUrl);

    return new Promise((resolve, reject) => {
      const extractedFiles: Record<string, Uint8Array> = {};

      worker.onmessage = (event: MessageEvent) => {
        const msg = event.data;
        if (!msg) return;

        // Progress notification
        if (msg.t === 4 && msg.total && onProgress) {
          const pct = Math.floor((msg.current / msg.total) * 100);
          onProgress(Number.isNaN(pct) ? 0 : pct);
          return;
        }

        // Extracted file entry
        if (msg.t === 2 && msg.file && msg.data) {
          extractedFiles[msg.file] = msg.data;
          return;
        }

        // Extraction completed successfully
        if (msg.t === 1) {
          cleanup();
          resolve(extractedFiles);
        }
      };

      worker.onerror = (err: ErrorEvent) => {
        cleanup();
        reject(
          new Error(
            `[ArchiveExtractor] Failed to unpack ${format} archive: ${err.message || 'Worker error'}`,
          ),
        );
      };

      const cleanup = () => {
        try {
          worker.terminate();
        } catch (_) {}
        try {
          URL.revokeObjectURL(workerUrl);
        } catch (_) {}
      };

      // Post the buffer to the worker thread
      const buffer = archiveData.buffer.slice(
        archiveData.byteOffset,
        archiveData.byteOffset + archiveData.byteLength,
      );
      worker.postMessage(new Uint8Array(buffer), [buffer]);
    });
  }

  /**
   * Fetches the decompression worker script text from local proxy or CDN, caching the text in memory.
   */
  private static async _getWorkerScript(format: '7z' | 'zip'): Promise<string> {
    const cached = this._workerScriptCache.get(format);
    if (cached) return cached;

    const fileName = format === '7z' ? 'extract7z.js' : 'extractzip.js';
    const localUrl = `/compression/${fileName}`;
    const fallbackUrl = `https://cdn.emulatorjs.org/stable/data/compression/${fileName}`;

    try {
      const res = await fetch(localUrl);
      if (res.ok) {
        const code = await res.text();
        this._workerScriptCache.set(format, code);
        return code;
      }
    } catch (_) {
      // Fall back to CDN if local server route is unavailable
    }

    const fallbackRes = await fetch(fallbackUrl);
    if (!fallbackRes.ok) {
      throw new Error(
        `[ArchiveExtractor] Could not retrieve decompression worker from "${fallbackUrl}" (status: ${fallbackRes.status})`,
      );
    }

    const code = await fallbackRes.text();
    this._workerScriptCache.set(format, code);
    return code;
  }
}
