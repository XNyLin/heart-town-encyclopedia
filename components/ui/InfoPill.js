"use client";

export default function InfoPill({ label, value, children }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 12px",
        borderRadius: "999px",
        background: "#f3f4f6",
        border: "1px solid #e5e7eb",
        fontSize: "13px",
        color: "#333",
        lineHeight: 1,
      }}
    >
      <span style={{ fontWeight: 700 }}>{label}</span>
      <span>{value}</span>
      {children}
    </div>
  );
}