"use client";

import { useState } from "react";
import { panelStyle, actionButtonStyle } from "@/styles/bioStyles";

export default function DogGallery({ setTab }) {
  const [showResult, setShowResult] = useState(false);

  if (showResult) {
    return (
      <section
        style={{
          ...panelStyle,
          textAlign: "center",
          padding: "36px 24px",
        }}
      >
        <div
          style={{
            fontSize: "26px",
            fontWeight: 800,
            color: "#111",
          }}
        >
          我是貓派
        </div>
      </section>
    );
  }

  return (
    <section
      style={{
        ...panelStyle,
        textAlign: "center",
        padding: "36px 24px",
      }}
    >
      <div
        style={{
          fontSize: "20px",
          fontWeight: 700,
          marginBottom: "24px",
          color: "#333",
          lineHeight: 1.8,
        }}
      >
        很吵、很黏、超級容易餓，
        <br />
        一直搞破壞還要幫牠撿屎，
        <br />
        確定嗎？
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
        }}
      >
        <button
          onClick={() => setTab("貓")}
          style={{
            ...actionButtonStyle,
            background: "#111",
            color: "#fff",
            border: "1px solid #111",
          }}
        >
          我選貓
        </button>

        <button
          onClick={() => setShowResult(true)}
          style={{
            ...actionButtonStyle,
            background: "#fff",
            color: "#333",
            border: "1px solid #ddd",
          }}
        >
          我選狗
        </button>
      </div>
    </section>
  );
}