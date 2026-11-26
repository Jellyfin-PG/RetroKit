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
  private _shaderOverlay: HTMLDivElement | null = null;

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

    const s = (shader || 'disabled').toLowerCase().replace(/\.glslp$/, '');
    const parent = canvas.parentElement;

    const removeOverlay = () => {
      if (this._shaderOverlay && this._shaderOverlay.parentNode) {
        this._shaderOverlay.parentNode.removeChild(this._shaderOverlay);
      }
      this._shaderOverlay = null;
    };

    const ensureOverlay = (background: string, boxShadow = 'none') => {
      if (!parent || typeof document === 'undefined') return;
      if (getComputedStyle(parent).position === 'static') {
        parent.style.position = 'relative';
      }
      if (!this._shaderOverlay) {
        const el = document.createElement('div');
        el.setAttribute('data-retrokit-shader', 'true');
        el.style.position = 'absolute';
        el.style.inset = '0';
        el.style.pointerEvents = 'none';
        el.style.zIndex = '5';
        parent.appendChild(el);
        this._shaderOverlay = el;
      }
      this._shaderOverlay.style.background = background;
      this._shaderOverlay.style.boxShadow = boxShadow;
    };

    if (s === 'disabled' || s === 'none' || s === '') {
      removeOverlay();
      canvas.style.filter = 'none';
      canvas.style.imageRendering = 'auto';
    } else if (s === 'scanlines' || s.startsWith('crt-')) {
      canvas.style.filter =
        s === 'crt-geom'
          ? 'contrast(1.14) saturate(1.16) brightness(1.02)'
          : 'contrast(1.1) saturate(1.1) brightness(1.0)';
      canvas.style.imageRendering = 'pixelated';

      if (s === 'crt-aperture') {
        ensureOverlay(
          'repeating-linear-gradient(0deg, rgba(0,0,0,0.34) 0px, rgba(0,0,0,0.34) 1px, transparent 1px, transparent 3px), repeating-linear-gradient(90deg, rgba(255,0,0,0.04) 0px, rgba(0,255,0,0.04) 1px, rgba(0,0,255,0.04) 2px, transparent 3px)',
          'inset 0 0 48px rgba(0,0,0,0.45)',
        );
      } else if (s === 'crt-geom' || s === 'crt-mattias') {
        ensureOverlay(
          'repeating-linear-gradient(0deg, rgba(0,0,0,0.38) 0px, rgba(0,0,0,0.38) 1px, transparent 1px, transparent 3px)',
          'inset 0 0 70px rgba(0,0,0,0.6)',
        );
      } else {
        ensureOverlay(
          'repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 1px, transparent 1px, transparent 3px)',
        );
      }
    } else if (s.includes('scalehq') || s === 'sabr') {
      removeOverlay();
      canvas.style.filter = 'contrast(1.08) saturate(1.1)';
      canvas.style.imageRendering = 'pixelated';
    } else if (s === 'bicubic') {
      removeOverlay();
      canvas.style.filter = 'contrast(1.02) saturate(1.04)';
      canvas.style.imageRendering = 'auto';
    } else if (s === 'mix-frames') {
      removeOverlay();
      canvas.style.filter = 'contrast(1.03) brightness(0.98)';
      canvas.style.imageRendering = 'auto';
    } else {
      removeOverlay();
      canvas.style.filter = 'none';
    }
  }

  private _getDisplayTarget(): HTMLElement | null {
    const canvas = this._getCanvas();
    if (!canvas) return null;
    if (canvas.style.display === 'none' && canvas.parentElement) {
      const ruffle = canvas.parentElement.querySelector(
        'ruffle-player',
      ) as HTMLElement | null;
      if (ruffle) return ruffle;
    }
    return canvas;
  }

  public setAspectRatio(
    mode: 'auto' | '4:3' | '16:9' | 'stretch' | 'pixel-perfect',
  ): void {
    this._aspectRatio = mode;
    this.updateLayout();
  }

  public updateLayout(): void {
    const canvas = this._getCanvas();
    if (!canvas || !canvas.style) return;

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

    const target = this._getDisplayTarget();
    if (!target) return;

    if (target.tagName.toLowerCase() === 'ruffle-player') {
      target.style.display = 'block';
      target.style.margin = 'auto';
      target.style.maxWidth = '100%';
      target.style.maxHeight = '100%';
      if (this._aspectRatio === 'stretch') {
        target.style.aspectRatio = 'unset';
        target.style.width = '100%';
        target.style.height = '100%';
        (target as any).config = {
          ...((target as any).config || {}),
          scale: 'exactFit',
        };
      } else {
        target.style.aspectRatio =
          this._aspectRatio === '4:3'
            ? '4 / 3'
            : this._aspectRatio === '16:9'
              ? '16 / 9'
              : 'unset';
        target.style.width = '100%';
        target.style.height = '100%';
        (target as any).config = {
          ...((target as any).config || {}),
          scale: 'showAll',
          letterbox: 'on',
        };
      }
      return;
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
    const target = this._getDisplayTarget();
    if (target) {
      target.style.transform = degrees === 0 ? 'none' : `rotate(${degrees}deg)`;
    }
  }

  public setVsync(_enabled: boolean): void {
    // Vsync in modern browsers is tied to requestAnimationFrame
  }

  public async takeScreenshot(
    format: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png',
    quality = 0.92,
  ): Promise<Blob> {
    const adapter = this._getAdapter() as any;
    if (adapter && typeof adapter.rawTakeScreenshot === 'function') {
      try {
        const rawBytes: Uint8Array | null = await adapter.rawTakeScreenshot();
        if (rawBytes && rawBytes.byteLength > 0) {
          const copy = new Uint8Array(rawBytes.byteLength);
          copy.set(rawBytes);
          return new Blob([copy.buffer], { type: 'image/png' });
        }
      } catch (_) {}
    }

    const canvas = this._getCanvas();
    if (!canvas) {
      throw new Error('[VideoManager] Canvas is not available.');
    }

    // Wait one animation frame so WebGL cores with preserveDrawingBuffer=false have a freshly rendered frame
    if (typeof requestAnimationFrame === 'function') {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
    }

    let sourceCanvas: HTMLCanvasElement = canvas;
    const dpr =
      typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const displayW = Math.round((canvas.clientWidth || canvas.width) * dpr);
    const displayH = Math.round((canvas.clientHeight || canvas.height) * dpr);

    // Upscale low-res pixel-art canvases (e.g. PICO-8 128x128) to displayed resolution cleanly
    if (
      canvas.width > 0 &&
      canvas.height > 0 &&
      (displayW > canvas.width || displayH > canvas.height)
    ) {
      const offscreen = document.createElement('canvas');
      offscreen.width = displayW;
      offscreen.height = displayH;
      const ctx = offscreen.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(canvas, 0, 0, displayW, displayH);
        sourceCanvas = offscreen;
      }
    }

    return new Promise<Blob>((resolve, reject) => {
      sourceCanvas.toBlob(
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
      // Avoid calling getContext('2d') on a canvas without a context as it permanently prevents WebGL creation.
      // Reassigning width clears the canvas buffer cleanly without binding any context.
      const w = canvas.width;
      const h = canvas.height;
      canvas.width = w;
      canvas.height = h;
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
