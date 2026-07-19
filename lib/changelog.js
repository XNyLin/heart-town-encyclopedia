export const CHANGELOG = [
  {
    date: "2026-07-19",
    version: "v2.6.0",
    items: [
      "新增貝圖鑑分類（🐚）與海洋清潔愛好",
    ],
  },
  {
    date: "2026-05-13",
    version: "v2.5.2",
    items: [
      "v2主版本：<br />　　升級可追蹤收藏進度的圖鑑工具",
      "新增篩選設定記憶：<br />　　自動保存天氣與魚／蟲／鳥愛好等級",
      "新增地點群組聯動：<br />　　支援河流／海洋／湖泊群組互相帶入",
      "修正地點辨識：<br />　　移除箭頭／emoji 前綴避免篩選失效",
      "修正圖鑑資料：<br />　　補上鳥類五星條件",
      "排版視覺優化：<br />　　重構篩選區、新增圖鑑進度區",
    ],
  },
  {
    date: "2026-03-21",
    version: "v0.3",
    items: ["蟈蟈 [地區]已修正"],
  },
  {
    date: "2026-03-18",
    version: "v0.3",
    items: [
      "白斑尾梳蜂 [地區]已修正",
      "林[<del>䳭</del>]伯勞 名稱已修正",
      "大[斑]金吉鱸 名稱已修正",
      "[斑]皇鳩 名稱已修正",
      "手機版卡片列表已修正",
      "時段格式優化（跨日顯示）",
      "表格列高度與交替底色調整",
    ],
  },
  {
    date: "2026-03-17",
    version: "v0.2",
    items: ["支援地點篩選", "優化手機版 ControlPanel 排版"],
  },
];

function createVersionBlock(entry) {
  const block = document.createElement("div");
  block.style.marginBottom = "14px";

  const title = document.createElement("div");
  title.style.fontSize = "13px";
  title.style.fontWeight = "700";
  title.style.color = "#333";
  title.style.marginBottom = "6px";
  title.textContent = `${entry.version} · ${entry.date}`;

  const list = document.createElement("ul");
  list.style.margin = "0";
  list.style.paddingLeft = "20px";
  list.style.fontSize = "13px";
  list.style.lineHeight = "1.7";
  list.style.color = "#666";

  entry.items.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = item;
    list.appendChild(listItem);
  });

  block.append(title, list);
  return block;
}

function mountChangelog() {
  if (document.getElementById("heart-town-changelog")) return;

  const heading = Array.from(document.querySelectorAll("h1")).find((element) =>
    element.textContent?.includes("心動小鎮｜生物圖鑑")
  );
  const header = heading?.closest("header");
  if (!header || !CHANGELOG.length) return;

  const section = document.createElement("section");
  section.id = "heart-town-changelog";
  section.style.margin = "-6px 0 18px";
  section.style.padding = "12px 14px";
  section.style.background = "#fff";
  section.style.border = "1px solid #e8e8e8";
  section.style.borderRadius = "12px";

  section.appendChild(createVersionBlock(CHANGELOG[0]));

  if (CHANGELOG.length > 1) {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.style.cursor = "pointer";
    summary.style.listStyle = "none";
    summary.style.fontSize = "13px";
    summary.style.fontWeight = "700";
    summary.style.color = "#555";
    summary.textContent = "More +";

    const history = document.createElement("div");
    history.style.marginTop = "12px";
    CHANGELOG.slice(1).forEach((entry) => history.appendChild(createVersionBlock(entry)));

    details.addEventListener("toggle", () => {
      summary.textContent = details.open ? "More −" : "More +";
    });

    details.append(summary, history);
    section.appendChild(details);
  }

  header.insertAdjacentElement("afterend", section);
}

if (typeof window !== "undefined") {
  const start = () => {
    mountChangelog();
    const observer = new MutationObserver(mountChangelog);
    observer.observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    queueMicrotask(start);
  }
}
