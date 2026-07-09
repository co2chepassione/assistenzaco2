export default function SelectCampo({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
}) {
  return (
    <div style={{ width: "100%" }}>
      <label
        style={{
          display: "block",
          marginBottom: 6,
          fontWeight: 600,
          color: "#374151",
          fontSize: 14,
        }}
      >
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        style={{
          width: "100%",
          padding: "12px 14px",
          border: "1px solid #d1d5db",
          borderRadius: 8,
          fontSize: 15,
          background: "#fff",
          outline: "none",
          boxSizing: "border-box",
          cursor: "pointer",
        }}
      >
        <option value="">Seleziona...</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}