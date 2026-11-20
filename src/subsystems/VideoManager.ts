import type { ICoreAdapter } from '../adapters/ICoreAdapter';

export interface IVideoManager {
  readonly aspectRatio: string;
  readonly rotation: number;
  readonly currentShader: string;
  setShader(
    shader:
      | 'crt-geom'
      | 'scanlines'
      | 'xbrz'
      | 'sharp-bilinear'
      | 'disabled'
      | string,
  ): Promise<void>;
  setAspectRatio(
    mode: 'auto' | '4:3' | '16:9' | 'stretch' | 'pixel-perfect',
  ): void;
  setRotation(degrees: 0 | 90 | 180 | 270): void;
  setVsync(enabled: boolean): void;
  takeScreenshot(
    format?: 'image/png' | 'image/jpeg' | 'image/webp',
    quality?: number,
  ): Promise<Blob>;
  getMetrics(): { internalWidth: number; internalHeight: number; fps: number };
  clear(): void;
  destroy(): void;
}

export class VideoManager implements IVideoManager {
  private _aspectRatio: 'auto' | '4:3' | '16:9' | 'stretch' | 'pixel-perfect' =
    'auto';
  private _rotation: 0 | 90 | 180 | 270 = 0;
  private _currentShader = 'disabled';
  private _resizeObserver: any = null;

  constructor(
    private readonly _getAdapter: () => ICoreAdapter | null,
    private readonly _getCanvas: () => HTMLCanvasElement | null,
  ) {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => this.updateLayout());
    }
  }

  public get aspectRatio(): string {
    return this._aspectRatio;
  }

  public get rotation(): number {
    return this._rotation;
  }

  public get currentShader(): string {
    return this._currentShader;
  }

  public async setShader(shader: string): Promise<void> {
    this._currentShader = shader;
    const canvas = this._getCanvas();
    if (!canvas) return;

    if (shader === 'scanlines') {
      canvas.style.filter = 'contrast(1.05) brightness(0.98)';
    } else {
      canvas.style.filter = 'none';
    }
  }

  public setAspectRatio(
    mode: 'auto' | '4:3' | '16:9' | 'stretch' | 'pixel-perfect',
  ): void {
    this._aspectRatio = mode;
    this.updateLayout();
  }

  public updateLayout(): void {
    const canvas = this._getCanvas();
    if (!canvas) return;

    // Attach ResizeObserver to canvas parent if not already attached
    if (
      typeof ResizeObserver !== 'undefined' &&
      canvas.parentElement &&
      !this._resizeObserver
    ) {
      try {
        this._resizeObserver = new ResizeObserver(() => this.updateLayout());
        this._resizeObserver.observe(canvas.parentElement);
      } catch (_) {}
    }

    if (this._aspectRatio === 'stretch') {
      canvas.style.aspectRatio = 'unset';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.maxWidth = '100%';
      canvas.style.maxHeight = '100%';
      canvas.style.objectFit = 'fill';
      return;
    }

    const parent = canvas.parentElement;
    const pW = parent
      ? parent.clientWidth
      : typeof window !== 'undefined'
        ? window.innerWidth
        : 800;
    const pH = parent
      ? parent.clientHeight
      : typeof window !== 'undefined'
        ? window.innerHeight
        : 600;

    const cW = canvas.width || 240;
    const cH = canvas.height || 160;

    if (this._aspectRatio === 'pixel-perfect') {
      const scale = Math.max(1, Math.floor(Math.min(pW / cW, pH / cH)));
      canvas.style.aspectRatio = 'unset';
      canvas.style.width = `${cW * scale}px`;
      canvas.style.height = `${cH * scale}px`;
      canvas.style.maxWidth = '100%';
      canvas.style.maxHeight = '100%';
      canvas.style.objectFit = 'contain';
      return;
    }

    let targetRatio = cW / cH;
    if (this._aspectRatio === '4:3') {
      targetRatio = 4 / 3;
    } else if (this._aspectRatio === '16:9') {
      targetRatio = 16 / 9;
    }

    // Auto / 4:3 / 16:9: upscale to the highest resolution that fits the container bounds
    canvas.style.aspectRatio = `${targetRatio}`;
    canvas.style.maxWidth = '100%';
    canvas.style.maxHeight = '100%';
    canvas.style.objectFit = 'contain';

    const containerRatio = pW && pH ? pW / pH : targetRatio;
    if (containerRatio > targetRatio) {
      // Container is wider than the target aspect ratio -> scale to fill height, width scales proportionately
      canvas.style.height = '100%';
      canvas.style.width = 'auto';
    } else {
      // Container is taller than the target aspect ratio -> scale to fill width, height scales proportionately
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
    }
  }

  public setRotation(degrees: 0 | 90 | 180 | 270): void {
    this._rotation = degrees;
    const canvas = this._getCanvas();
    if (canvas) {
      canvas.style.transform = degrees === 0 ? 'none' : `rotate(${degrees}deg)`;
    }
  }

  public setVsync(_enabled: boolean): void {
    // Vsync in modern browsers is tied to requestAnimationFrame
  }

  public async takeScreenshot(
    format: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png',
    quality = 0.92,
  ): Promise<Blob> {
    const canvas = this._getCanvas();
    if (!canvas) {
      throw new Error('[VideoManager] Canvas is not available.');
    }

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else
            reject(
              new Error('[VideoManager] Failed to create screenshot blob.'),
            );
        },
        format,
        quality,
      );
    });
  }

  public getMetrics(): {
    internalWidth: number;
    internalHeight: number;
    fps: number;
  } {
    const adapter = this._getAdapter();
    const canvas = this._getCanvas();
    return {
      internalWidth: canvas?.width || 0,
      internalHeight: canvas?.height || 0,
      fps: adapter?.rawGetFps() || 60,
    };
  }

  public clear(): void {
    const canvas = this._getCanvas();
    if (!canvas) return;

    try {
      const gl =
        canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl');
      if (gl) {
        const glCtx = gl as WebGLRenderingContext;
        glCtx.clearColor(0.0, 0.0, 0.0, 1.0);
        glCtx.clear(
          glCtx.COLOR_BUFFER_BIT |
            glCtx.DEPTH_BUFFER_BIT |
            glCtx.STENCIL_BUFFER_BIT,
        );
        return;
      }
    } catch (_) {}

    try {
      const ctx2d = canvas.getContext('2d');
      if (ctx2d) {
        ctx2d.fillStyle = '#000000';
        ctx2d.fillRect(0, 0, canvas.width, canvas.height);
        return;
      }
    } catch (_) {}
  }

  public destroy(): void {
    if (this._resizeObserver) {
      try {
        this._resizeObserver.disconnect();
      } catch (_) {}
      this._resizeObserver = null;
    }
    this.clear();
  }
}
