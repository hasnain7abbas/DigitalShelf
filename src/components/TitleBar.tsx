import "../styles/titlebar.css";

interface Props {
  alwaysOnTop: boolean;
  onTogglePin: () => void;
  onClear: () => void;
  itemCount: number;
}

export function TitleBar({ alwaysOnTop, onTogglePin, onClear, itemCount }: Props) {
  return (
    <div className="titlebar">
      <div className="titlebar__left">
        <span className="titlebar__title">Digital Shelf</span>
        {itemCount > 0 && (
          <span className="titlebar__count">{itemCount}</span>
        )}
      </div>
      <div className="titlebar__actions">
        <button
          className={`titlebar__btn ${alwaysOnTop ? "titlebar__btn--pinned" : ""}`}
          onClick={onTogglePin}
          title={alwaysOnTop ? "Unpin from top" : "Pin to top"}
        >
          {alwaysOnTop ? "\u{1F4CC}" : "\u{1F4CC}"}
        </button>
        {itemCount > 0 && (
          <button
            className="titlebar__btn"
            onClick={onClear}
            title="Clear all items"
          >
            {"\u{1F5D1}"}
          </button>
        )}
      </div>
    </div>
  );
}
