"use client";

export default function ToggleSwitch({ checked, onChange }) {
  return (
    <label
      style={{
        position: "relative",
        display: "inline-block",
        width: "42px",
        height: "24px",
        flexShrink: 0,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ opacity: 0, width: 0, height: 0 }}
      />
      <span
        style={{
          position: "absolute",
          inset: 0,
          cursor: "pointer",
          backgroundColor: checked ? "#34C759" : "#ccc",
          transition: "0.2s",
          borderRadius: "999px",
        }}
      />
      <span
        style={{
          position: "absolute",
          width: "20px",
          height: "20px",
          top: "2px",
          left: checked ? "20px" : "2px",
          backgroundColor: "#fff",
          borderRadius: "50%",
          transition: "0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.22)",
        }}
      />
    </label>
  );
}