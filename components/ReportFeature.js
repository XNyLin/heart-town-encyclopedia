"use client";

import { useEffect, useRef, useState } from "react";

import { REPORT_CATEGORIES } from "@/lib/report-validation";

const fieldStyle = {
  width: "100%",
  minHeight: "42px",
  border: "1px solid #d8d8d8",
  borderRadius: "10px",
  background: "#fff",
  color: "#222",
  fontSize: "16px",
  padding: "9px 11px",
  boxSizing: "border-box",
};

const initialForm = {
  type: "補充",
  category: "魚",
  level: "Lv.1",
  name: "",
  description: "",
};

export default function ReportFeature() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [screenshot, setScreenshot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const dialogRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    function closeOnEscape(event) {
      if (event.key === "Escape" && !submitting) setOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, submitting]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setMessage("");
  }

  async function submitReport(event) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    payload.append("website", event.currentTarget.elements.website.value);
    if (screenshot) payload.append("screenshot", screenshot);

    try {
      const response = await fetch("/api/report", { method: "POST", body: payload });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.message || "目前無法送出回報。");

      setForm(initialForm);
      setScreenshot(null);
      if (fileRef.current) fileRef.current.value = "";
      setMessage("已收到回報，謝謝你的補充！");
    } catch (error) {
      setMessage(error.message || "目前無法送出回報，請稍後再試。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 40,
          padding: "10px 16px calc(10px + env(safe-area-inset-bottom))",
          background: "rgba(247,247,247,0.94)",
          borderTop: "1px solid #e2e2e2",
          backdropFilter: "blur(10px)",
        }}
      >
        <button
          type="button"
          onClick={() => {
            setMessage("");
            setOpen(true);
          }}
          style={{
            display: "block",
            width: "min(100%, 1000px)",
            height: "42px",
            margin: "0 auto",
            border: "1px solid #d8d8d8",
            borderRadius: "12px",
            background: "#fff",
            color: "#222",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          錯誤回報／資料補充
        </button>
      </div>

      {open && (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !submitting) setOpen(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "grid",
            placeItems: "center",
            padding: "20px",
            background: "rgba(0,0,0,0.45)",
          }}
        >
          <section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-title"
            tabIndex={-1}
            style={{
              width: "min(100%, 520px)",
              maxHeight: "calc(100vh - 40px)",
              overflowY: "auto",
              borderRadius: "18px",
              background: "#fff",
              boxShadow: "0 24px 70px rgba(0,0,0,0.24)",
              padding: "22px",
              boxSizing: "border-box",
              outline: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
              <h2 id="report-title" style={{ margin: 0, fontSize: "21px", color: "#111" }}>
                錯誤回報／資料補充
              </h2>
              <button
                type="button"
                aria-label="關閉回報表單"
                disabled={submitting}
                onClick={() => setOpen(false)}
                style={{ border: 0, background: "transparent", fontSize: "26px", cursor: "pointer", color: "#666" }}
              >
                ×
              </button>
            </div>

            <form onSubmit={submitReport} style={{ display: "grid", gap: "15px", marginTop: "18px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {["補充", "錯誤"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, type }))}
                    style={{
                      height: "42px",
                      borderRadius: "10px",
                      border: form.type === type ? "1px solid #111" : "1px solid #ddd",
                      background: form.type === type ? "#111" : "#fff",
                      color: form.type === type ? "#fff" : "#333",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {type === "補充" ? "資料補充" : "錯誤回報"}
                  </button>
                ))}
              </div>

              <label style={{ display: "grid", gap: "6px", color: "#333", fontSize: "14px", fontWeight: 700 }}>
                種類 *
                <select name="category" value={form.category} onChange={updateField} style={fieldStyle}>
                  {REPORT_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
                </select>
              </label>

              <label style={{ display: "grid", gap: "6px", color: "#333", fontSize: "14px", fontWeight: 700 }}>
                等級 *
                <select name="level" value={form.level} onChange={updateField} style={fieldStyle}>
                  {Array.from({ length: 12 }, (_, index) => `Lv.${index + 1}`).map((level) => (
                    <option key={level}>{level}</option>
                  ))}
                </select>
              </label>

              <label style={{ display: "grid", gap: "6px", color: "#333", fontSize: "14px", fontWeight: 700 }}>
                名稱 *
                <input name="name" value={form.name} onChange={updateField} maxLength={80} required style={fieldStyle} />
              </label>

              {form.type === "錯誤" && (
                <label style={{ display: "grid", gap: "6px", color: "#333", fontSize: "14px", fontWeight: 700 }}>
                  說明 *
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={updateField}
                    maxLength={1000}
                    required
                    rows={4}
                    style={{ ...fieldStyle, resize: "vertical", fontFamily: "inherit" }}
                  />
                </label>
              )}

              <label style={{ display: "grid", gap: "6px", color: "#333", fontSize: "14px", fontWeight: 700 }}>
                截圖（選填，JPG／PNG／WebP，最多 4 MB）
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => {
                    setScreenshot(event.target.files?.[0] || null);
                    setMessage("");
                  }}
                  style={{ ...fieldStyle, padding: "8px" }}
                />
              </label>

              <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: "none" }} />

              {message && (
                <p role="status" style={{ margin: 0, color: message.startsWith("已收到") ? "#18794e" : "#b42318", fontSize: "14px" }}>
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  height: "44px",
                  border: 0,
                  borderRadius: "11px",
                  background: submitting ? "#777" : "#111",
                  color: "#fff",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: submitting ? "wait" : "pointer",
                }}
              >
                {submitting ? "送出中…" : "送出回報"}
              </button>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
