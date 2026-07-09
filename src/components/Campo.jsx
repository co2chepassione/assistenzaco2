export default function Campo({
  label,
  style = {},
  ...props
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

      <input
        {...props}
        style={{
          width: "100%",
          padding: "12px 14px",
          border: "1px solid #d1d5db",
          borderRadius: 8,
          fontSize: 15,
          outline: "none",
          boxSizing: "border-box",
          transition: "0.2s",
          ...style,
        }}
      />
    </div>
  );
}