import "./Campo.css";

export default function Campo({
  label,
  className = "",
  ...props
}) {
  return (
    <div className="campo">

      <label className="campo-label">
        {label}
      </label>

      <input
        {...props}
        className={`campo-input ${className}`.trim()}
      />

    </div>
  );
}