import type { ShelfItem } from "../types/shelf";
import { invoke } from "@tauri-apps/api/core";
import { getFileIcon } from "../utils/fileIcons";
import "../styles/card.css";

interface Props {
  item: ShelfItem;
  onRemove: (id: string) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ShelfCard({ item, onRemove }: Props) {
  const { data } = item;

  const handleDragStart = (e: React.DragEvent) => {
    if (data.kind === "File" || data.kind === "Image") {
      invoke("start_drag", { filePath: data.path });
    } else if (data.kind === "Text") {
      e.dataTransfer.setData("text/plain", data.content);
    } else if (data.kind === "Link") {
      e.dataTransfer.setData("text/uri-list", data.url);
      e.dataTransfer.setData("text/plain", data.url);
    }
  };

  const icon = data.kind === "File" ? getFileIcon(data.extension) : null;

  return (
    <div className="shelf-card" draggable onDragStart={handleDragStart}>
      <button
        className="shelf-card__remove"
        onClick={() => onRemove(item.id)}
        aria-label="Remove item"
      >
        &times;
      </button>

      <div className="shelf-card__preview">
        {data.kind === "Image" && (
          <img
            src={`data:image/jpeg;base64,${data.thumbnail_b64}`}
            alt={data.name}
            className="shelf-card__thumb"
          />
        )}

        {data.kind === "File" && (
          <div className="shelf-card__file-icon">
            <span
              className="shelf-card__ext"
              style={icon ? { background: `${icon.color}22`, color: icon.color } : undefined}
            >
              {icon?.label || data.extension.toUpperCase()}
            </span>
            <span className="shelf-card__size">{formatSize(data.size_bytes)}</span>
          </div>
        )}

        {data.kind === "Text" && (
          <p className="shelf-card__text-preview">{data.preview}</p>
        )}

        {data.kind === "Link" && (
          <div className="shelf-card__link">
            <span className="shelf-card__link-url">
              {data.title || data.url}
            </span>
          </div>
        )}
      </div>

      <div className="shelf-card__label">
        {data.kind === "File" && data.name}
        {data.kind === "Image" && (
          <span>
            {data.name}{" "}
            <small>
              ({data.width}x{data.height})
            </small>
          </span>
        )}
        {data.kind === "Text" && "Text snippet"}
        {data.kind === "Link" && (() => {
          try { return new URL(data.url).hostname; } catch { return data.url; }
        })()}
      </div>
    </div>
  );
}
