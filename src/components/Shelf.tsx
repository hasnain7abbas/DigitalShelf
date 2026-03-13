import { useShelfItems } from "../hooks/useShelfItems";
import { useDragDrop } from "../hooks/useDragDrop";
import { useSettings } from "../hooks/useSettings";
import { ShelfCard } from "./ShelfCard";
import { TitleBar } from "./TitleBar";
import { TransparencySlider } from "./TransparencySlider";
import { DropOverlay } from "./DropOverlay";
import "../styles/shelf.css";

export function Shelf() {
  const { items, remove, clear } = useShelfItems();
  const { isDragOver } = useDragDrop();
  const { settings, update } = useSettings();

  return (
    <div
      className={`shelf shelf--${settings.theme}`}
      style={{ opacity: settings.opacity }}
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

      {isDragOver && <DropOverlay />}
    </div>
  );
}
