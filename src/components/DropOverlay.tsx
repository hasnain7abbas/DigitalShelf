import "../styles/shelf.css";

export function DropOverlay() {
  return (
    <div className="drop-overlay">
      <div className="drop-overlay__content">
        <div className="drop-overlay__icon">+</div>
        <p>Drop to add to shelf</p>
      </div>
    </div>
  );
}
