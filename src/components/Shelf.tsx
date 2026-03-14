import { useCallback, useState } from "react";
import { useShelfItems } from "../hooks/useShelfItems";
import { useDragDrop } from "../hooks/useDragDrop";
import { useSettings } from "../hooks/useSettings";
import { ShelfCard } from "./ShelfCard";
import { TitleBar } from "./TitleBar";
import { TransparencySlider } from "./TransparencySlider";
import { DropOverlay } from "./DropOverlay";
import "../styles/shelf.css";

export function Shelf() {
  const { items, remove, clear, addText, addLink } = useShelfItems();
  const { isDragOver } = useDragDrop();
  const { settings, update } = useSettings();
  const [htmlDragOver, setHtmlDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setHtmlDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setHtmlDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setHtmlDragOver(false);

    // Files are handled by Tauri's native DragDropEvent, skip here
    if (e.dataTransfer.files.length > 0) return;

    const url = e.dataTransfer.getData("text/uri-list");
    const text = e.dataTransfer.getData("text/plain");

    if (url && url.startsWith("http")) {
      await addLink(url, undefined);
    } else if (text && text.trim().length > 0) {
      await addText(text);
    }
  }, [addText, addLink]);

  return (
    <div
      className={`shelf shelf--${settings.theme}`}
      style={{ '--shelf-opacity': settings.opacity } as React.CSSProperties}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <TitleBar
        alwaysOnTop={settings.always_on_top}
        onTogglePin={() => update({ always_on_top: !settings.always_on_top })}
        onClear={clear}
        itemCount={items.length}
      />

      <TransparencySlider
        value={settings.opacity}
        onChange={(opacity) => update({ opacity })}
      />

      <div className="shelf__items">
        {items.length === 0 ? (
          <div className="shelf__empty">
            <p>Drop files, images, or text here</p>
          </div>
        ) : (
          items.map((item) => (
            <ShelfCard key={item.id} item={item} onRemove={remove} />
          ))
        )}
      </div>

      {(isDragOver || htmlDragOver) && <DropOverlay />}
    </div>
  );
}
