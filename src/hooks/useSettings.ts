import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import type { ShelfSettings } from "../types/shelf";

const DEFAULTS: ShelfSettings = {
  opacity: 0.85,
  always_on_top: true,
  auto_collapse: true,
  collapse_delay_ms: 2000,
  max_items: 20,
  hotkey: "Ctrl+Shift+D",
  theme: "glass",
  width: 280,
  edge: "Right",
};

export function useSettings() {
  const [settings, setSettings] = useState<ShelfSettings>(DEFAULTS);

  useEffect(() => {
    invoke<ShelfSettings>("load_settings").then(setSettings);
  }, []);

  const update = useCallback(
    async (partial: Partial<ShelfSettings>) => {
      const next = { ...settings, ...partial };
      setSettings(next);
      await invoke("save_settings", { settings: next });

      if (partial.always_on_top !== undefined) {
        const win = getCurrentWindow();
        await win.setAlwaysOnTop(partial.always_on_top);
      }
    },
    [settings]
  );

  return { settings, update };
}
