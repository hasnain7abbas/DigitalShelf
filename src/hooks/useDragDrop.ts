import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";

export function useDragDrop() {
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    const unlistenHover = listen<boolean>("drag-hover", (e) => {
      setIsDragOver(e.payload);
    });

    return () => {
      unlistenHover.then((fn) => fn());
    };
  }, []);

  return { isDragOver };
}
