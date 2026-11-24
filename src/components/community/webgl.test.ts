import { describe, expect, it } from "vitest";

import { isSoftwareRenderer } from "@/components/community/webgl";

describe("isSoftwareRenderer", () => {
  it("spots CPU renderers", () => {
    for (const name of [
      "ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)",
      "llvmpipe (LLVM 15.0.7, 256 bits)",
      "ANGLE (Microsoft, Microsoft Basic Render Driver Direct3D11 vs_5_0 ps_5_0)",
      "Google SwiftShader",
    ]) {
      expect(isSoftwareRenderer(name), name).toBe(true);
    }
  });

  it("lets GPUs through", () => {
    for (const name of [
      "ANGLE (Apple, ANGLE Metal Renderer: Apple M2, Unspecified Version)",
      "ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)",
      "Adreno (TM) 730",
      "Mali-G78",
      "Apple GPU",
    ]) {
      expect(isSoftwareRenderer(name), name).toBe(false);
    }
  });
});
