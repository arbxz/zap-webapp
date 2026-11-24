import type { ProbeResult } from "./webgl.worker";

/**
 * Renderers that draw WebGL on the CPU. The map's animation loop on one of
 * these blocks the page for seconds, so we show the plain list instead.
 */
const SOFTWARE_RENDERERS =
  /swiftshader|llvmpipe|softpipe|software|basic render/i;

export function isSoftwareRenderer(name: string): boolean {
  return SOFTWARE_RENDERERS.test(name);
}

function probeOnMainThread(): boolean {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2", {
    failIfMajorPerformanceCaveat: true,
  });
  if (!gl) return false;
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer = info
    ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL))
    : String(gl.getParameter(gl.RENDERER));
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  return !isSoftwareRenderer(renderer);
}

/**
 * Whether this browser can draw the 3D map smoothly: WebGL 2 (what three.js
 * needs) on a GPU. The check runs in a worker, because on a software renderer
 * creating a context alone can block for seconds. Browsers without WebGL on
 * an OffscreenCanvas (Safari before 17) check on the main thread instead;
 * those are GPU devices, where the check is quick.
 */
export function hasFastWebGL(): Promise<boolean> {
  if (typeof Worker === "undefined")
    return Promise.resolve(probeOnMainThread());
  return new Promise((resolve) => {
    const worker = new Worker(new URL("./webgl.worker.ts", import.meta.url), {
      type: "module",
    });
    const finish = (fast: boolean) => {
      worker.terminate();
      resolve(fast);
    };
    worker.onmessage = ({ data }: MessageEvent<ProbeResult>) => {
      if (data.kind === "ok") finish(!isSoftwareRenderer(data.renderer));
      else if (data.kind === "slow") finish(false);
      else finish(probeOnMainThread());
    };
    worker.onerror = () => finish(probeOnMainThread());
  });
}
