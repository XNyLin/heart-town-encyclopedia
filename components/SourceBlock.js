"use client";

export default function SourceBlock({ tab }) {
  const sourceMap = {
    魚: "https://www.taptap.cn/moment/749717851794834457",
    蟲: "https://www.taptap.cn/moment/750798610429379688",
    鳥: "https://www.taptap.cn/moment/751907102351427401",
    貓: "https://www.taptap.cn/moment/577453568177472572",
  };

  if (!sourceMap[tab]) return null;

  return (
    <div
      style={{
        marginTop: "18px",
        paddingTop: "12px",
        borderTop: "1px solid #eee",
        fontSize: "13px",
        color: "#777",
        textAlign: "center",
      }}
    >
      資料來源：
      <a
        href={sourceMap[tab]}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          marginLeft: "6px",
          color: "#2563eb",
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        TapTap
      </a>
    </div>
  );
}