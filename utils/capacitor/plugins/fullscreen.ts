import { registerPlugin } from "@capacitor/core";

export interface FullscreenPlugin {
  enable(params: {
    mode: "all" | "status-bar";
  }): Promise<{ mode: "all" | "status-bar" }>;
  disable(): Promise<void>;
}

const CapacitorPluginFullscreen =
  registerPlugin<FullscreenPlugin>("FullscreenPlugin");

export default CapacitorPluginFullscreen;
