import "../styles/shelf.css";

interface Props {
  value: number;
  onChange: (value: number) => void;
}

export function TransparencySlider({ value, onChange }: Props) {
  return (
    <div className="transparency-slider">
      <label className="transparency-slider__label">Opacity</label>
      <input
        type="range"
        min={0.2}
        max={1}
        step={0.05}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="transparency-slider__input"
      />
      <span className="transparency-slider__value">
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}
