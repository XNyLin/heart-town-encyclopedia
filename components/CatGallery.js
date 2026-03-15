"use client";

import { useState } from "react";
import SourceBlock from "./SourceBlock";
import { panelStyle, miniChipStyle } from "@/styles/bioStyles";

const CAT_SECTIONS = [
  { id: "熊貓貓", name: "熊貓貓", img: "/熊貓貓.png" },
  { id: "浣熊貓", name: "浣熊貓", img: "/浣熊貓.png" },
  { id: "白貓", name: "白貓", img: "/白貓.png" },
  { id: "黑貓", name: "黑貓", img: "/黑貓.png" },
  { id: "金漸層", name: "金漸層", img: "/金漸層.png" },
  { id: "銀漸層", name: "銀漸層", img: "/銀漸層.png" },
  { id: "奶牛貓", name: "奶牛貓", img: "/奶牛貓.png" },
  { id: "三花貓", name: "三花貓", img: "/三花貓.png" },
  { id: "暹羅貓", name: "暹羅貓", img: "/暹羅貓.png" },
  { id: "玳瑁貓", name: "玳瑁貓", img: "/玳瑁貓.png" },
  { id: "藍貓", name: "藍貓", img: "/藍貓.png" },
  { id: "橘貓", name: "橘貓", img: "/橘貓.png" },
  { id: "銀虎斑", name: "銀色古典斑貓", img: "/銀虎斑.png" },
  { id: "棕色虎斑", name: "棕色虎斑貓", img: "/棕色虎斑.png" },
];

export default function CatGallery() {
  const [catFilter, setCatFilter] = useState("全部");

  const visibleCats =
    catFilter === "全部"
      ? CAT_SECTIONS
      : CAT_SECTIONS.filter((cat) => cat.name === catFilter);

  const catTabs = ["全部", ...CAT_SECTIONS.map((cat) => cat.name)];

  return (
    <section style={panelStyle}>
      <h2
        style={{
          fontSize: "22px",
          fontWeight: 800,
          margin: "0 0 14px 0",
          color: "#111",
        }}
      >
        貓咪圖鑑
      </h2>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "18px",
        }}
      >
        {catTabs.map((name) => {
          const active = catFilter === name;
          return (
            <button
              key={name}
              onClick={() => setCatFilter(name)}
              style={{
                ...miniChipStyle,
                background: active ? "#111" : "#f3f4f6",
                border: active ? "1px solid #111" : "1px solid #e5e7eb",
                color: active ? "#fff" : "#333",
              }}
            >
              {name}
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: catFilter === "全部" ? "grid" : "block",
          gridTemplateColumns:
            catFilter === "全部"
              ? "repeat(auto-fill, minmax(420px, 1fr))"
              : "none",
          gap: "16px",
        }}
      >
        {visibleCats.map((cat) => (
          <div key={cat.id}>
            <img
              src={cat.img}
              alt={cat.name}
              style={{
                width: "100%",
                display: "block",
                borderRadius: "14px",
              }}
            />
          </div>
        ))}
      </div>

      <SourceBlock tab="貓" />
    </section>
  );
}