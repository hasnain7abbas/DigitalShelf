import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { ShelfItem } from "../types/shelf";

export function useShelfItems() {
  const [items, setItems] = useState<ShelfItem[]>([]);

  useEffect(() => {
    invoke<ShelfItem[]>("get_shelf_items").then(setItems);
  }, []);

  useEffect(() => {
    const unlisten = listen<string>("file-dropped", async (event) => {
      try {
        const newItem = await invoke<ShelfItem>("add_file_to_shelf", {
          path: event.payload,
        });
        setItems((prev) => [...prev, newItem]);
      } catch (err) {
        console.error("Failed to add file:", err);
      }
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const addText = useCallback(async (content: string) => {
    const item = await invoke<ShelfItem>("add_text_to_shelf", { content });
    setItems((prev) => [...prev, item]);
  }, []);

  const addLink = useCallback(async (url: string, title?: string) => {
    const item = await invoke<ShelfItem>("add_link_to_shelf", { url, title });
    setItems((prev) => [...prev, item]);
  }, []);

  const remove = useCallback(async (id: string) => {
    await invoke("remove_from_shelf", { id });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(async () => {
    await invoke("clear_shelf");
    setItems([]);
  }, []);

  return { items, addText, addLink, remove, clear };
}
