"use client";

import { useState, useMemo } from "react";

function ToggleSwitch({ checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: "44px",
        height: "24px",
        background: checked ? "#4CAF50" : "#ccc",
        borderRadius: "999px",
        position: "relative",
        cursor: "pointer",
        transition: "0.2s",
      }}
    >
      <div
        style={{
          width: "20px",
          height: "20px",
          background: "#fff",
          borderRadius: "50%",
          position: "absolute",
          top: "2px",
          left: checked ? "22px" : "2px",
          transition: "0.2s",
        }}
      />
    </div>
  );
}

export default function Home() {
  const [weatherFilter, setWeatherFilter] = useState("全部");
  const [areaFilter, setAreaFilter] = useState("全部");
  const [manualPeriod, setManualPeriod] = useState("全部");

  const [fishLevel, setFishLevel] = useState("全部");
  const [bugLevel, setBugLevel] = useState("全部");
  const [birdLevel, setBirdLevel] = useState("全部");

  const [autoPeriod, setAutoPeriod] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [search, setSearch] = useState("");

  const now = new Date();
  const currentTime = now.toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const hour = now.getHours();

  let periodName = "晚上";
  if (hour >= 5 && hour < 8) periodName = "清晨";
  else if (hour >= 8 && hour < 16) periodName = "上午";
  else if (hour >= 16 && hour < 20) periodName = "下午";

  const selectStyle = {
    height: "36px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    padding: "0 8px",
    background: "#fff",
  };

  const inlineFilterItem = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const labelStyle = {
    fontSize: "13px",
    fontWeight: 600,
    color: "#555",
    whiteSpace: "nowrap",
  };

  const badgeStyle = {
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#eee",
    fontSize: "13px",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f7f7",
        padding: "40px 20px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, Segoe UI, Noto Sans TC",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "28px", marginBottom: "6px" }}>
          心動小鎮 | 生物圖鑑
        </h1>

        <p style={{ color: "#666", marginBottom: "20px" }}>
          篩選與搜尋生物資料
        </p>

        <div
          style={{
            background: "#fff",
            borderRadius: "14px",
            padding: "18px",
            border: "1px solid #eee",
          }}
        >
          {/* 控制區 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "20px",
            }}
          >
            {/* 左側 */}
            <div style={{ flex: 1 }}>
              {/* 時間 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "14px",
                }}
              >
                <div style={badgeStyle}>目前時間 {currentTime}</div>

                <div
                  style={{
                    ...badgeStyle,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  目前時段 {periodName}

                  <ToggleSwitch
                    checked={autoPeriod}
                    onChange={setAutoPeriod}
                  />

                  <span style={{ fontSize: "12px", color: "#444" }}>
                    自動判斷
                  </span>
                </div>
              </div>

              {/* 第一排 */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <div style={inlineFilterItem}>
                  <span style={labelStyle}>天氣</span>

                  <select
                    value={weatherFilter}
                    onChange={(e) => setWeatherFilter(e.target.value)}
                    style={selectStyle}
                  >
                    <option>全部</option>
                    <option>晴天</option>
                    <option>雨天</option>
                  </select>
                </div>

                <div style={inlineFilterItem}>
                  <span style={labelStyle}>地區</span>

                  <select
                    value={areaFilter}
                    onChange={(e) => setAreaFilter(e.target.value)}
                    style={selectStyle}
                  >
                    <option>全部</option>
                    <option>森林</option>
                    <option>湖泊</option>
                  </select>
                </div>

                <div style={inlineFilterItem}>
                  <span style={labelStyle}>時段</span>

                  <select
                    value={manualPeriod}
                    onChange={(e) => setManualPeriod(e.target.value)}
                    style={{
                      ...selectStyle,
                      opacity: autoPeriod ? 0.5 : 1,
                    }}
                    disabled={autoPeriod}
                  >
                    <option>全部</option>
                    <option>清晨</option>
                    <option>上午</option>
                    <option>下午</option>
                    <option>晚上</option>
                  </select>
                </div>
              </div>

              {/* 愛好等級 */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "999px",
                  border: "1px solid #ddd",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                愛好等級 {showAdvanced ? "▲" : "▼"}
              </button>

              {showAdvanced && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "12px",
                    borderRadius: "12px",
                    background: "#fafafa",
                    border: "1px solid #eee",
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: "12px",
                  }}
                >
                  <div style={inlineFilterItem}>
                    <span style={labelStyle}>釣魚</span>

                    <select
                      value={fishLevel}
                      onChange={(e) => setFishLevel(e.target.value)}
                      style={selectStyle}
                    >
                      <option>全部</option>
                      <option>1</option>
                      <option>2</option>
                    </select>
                  </div>

                  <div style={inlineFilterItem}>
                    <span style={labelStyle}>捕蟲</span>

                    <select
                      value={bugLevel}
                      onChange={(e) => setBugLevel(e.target.value)}
                      style={selectStyle}
                    >
                      <option>全部</option>
                      <option>1</option>
                      <option>2</option>
                    </select>
                  </div>

                  <div style={inlineFilterItem}>
                    <span style={labelStyle}>觀鳥</span>

                    <select
                      value={birdLevel}
                      onChange={(e) => setBirdLevel(e.target.value)}
                      style={selectStyle}
                    >
                      <option>全部</option>
                      <option>1</option>
                      <option>2</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* 右側搜尋 */}
            <div style={{ width: "320px" }}>
              <div style={{ fontWeight: 600, marginBottom: "6px" }}>
                搜尋
              </div>

              <input
                placeholder="輸入生物名稱"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  height: "36px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  padding: "0 10px",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}