export default function Card({ children, style }) {
  return (
    <div
      style={{
        border: "1.5px solid var(--border-subtle)",
        borderRadius: "var(--r-lg)",
        padding: "1.25rem",
        background: "var(--bg-surface)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}