import "./Campo.css";

export default function SelectCampo({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
}) {
  return (
    <div className="campo">
      <label className="campo-label">
        {label}
      </label>

      <select
        className="campo-input campo-select"
        name={name}
        value={value}
        onChange={onChange}
        required={required}
      >
        <option value="">
          Seleziona...
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}