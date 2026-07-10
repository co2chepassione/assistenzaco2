import "./Card.css";

export default function Card({
  title,
  icon,
  children,
}) {
  return (
    <section className="card">

      {(title || icon) && (
        <div className="card-header">

          {icon && (
            <span className="card-icon">
              {icon}
            </span>
          )}

          {title && (
            <h2 className="card-title">
              {title}
            </h2>
          )}

        </div>
      )}

      <div className="card-content">
        {children}
      </div>

    </section>
  );
}