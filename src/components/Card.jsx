export default function Card({
  title,
  icon,
  children,
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 25,
        marginBottom: 30,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      {(title || icon) && (
        <h2
          style={{
            margin: 0,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#1f2937",
            fontSize: 22,
          }}
        >
          <span>{icon}</span>
          <span>{title}</span>
        </h2>
      )}

      {children}
    </div>
  );
}