// Runs the WebGL check off the main thread: on a software renderer, just
// creating a context can block for a couple of seconds.
export type ProbeResult =
  | { kind: "ok"; renderer: string }
  /** WebGL 2 works, but only with a major performance caveat. */
  | { kind: "slow" }
  /** No WebGL 2 on an OffscreenCanvas here; ask the main thread instead. */
  | { kind: "unsupported" };

function probe(): ProbeResult {
  if (typeof OffscreenCanvas === "undefined") return { kind: "unsupported" };
  const canvas = new OffscreenCanvas(1, 1);
  const gl = canvas.getContext("webgl2", {
    failIfMajorPerformanceCaveat: true,
  });
  if (!gl) {
    return new OffscreenCanvas(1, 1).getContext("webgl2")
      ? { kind: "slow" }
      : { kind: "unsupported" };
  }
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer = info
    ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL))
    : String(gl.getParameter(gl.RENDERER));
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  return { kind: "ok", renderer };
}

postMessage(probe());
