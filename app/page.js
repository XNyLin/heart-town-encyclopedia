"use client";

import { useEffect, useMemo, useState } from "react";

const SHEET_CSV_URL =
"https://docs.google.com/spreadsheets/d/1dCQmBErMhSXriigbgKQma1dQ2q7qNAo2AUTWiFv_AsQ/export?format=csv&gid=1514414564";

function parseCSVLine(line) {
const result = [];
let current = "";
let inQuotes = false;

for (let i = 0; i < line.length; i++) {
const char = line[i];
const next = line[i + 1];

if (char === '"') {
if (inQuotes && next === '"') {
current += '"';
i++;
} else {
inQuotes = !inQuotes;
}
} else if (char === "," && !inQuotes) {
result.push(current);
current = "";
} else {
current += char;
}
}

result.push(current);
return result;
}

function parseCSV(text) {
const lines = text.split(/\r?\n/).filter(l => l.trim() !== "");
if (!lines.length) return [];

const headers = parseCSVLine(lines[0]);

return lines.slice(1).map(line => {
const values = parseCSVLine(line);
const row = {};
headers.forEach((h,i)=>{
row[h.trim()] = (values[i] || "").trim();
});
return row;
});
}

function normalizeText(v){
return String(v || "").replace(/\s+/g,"");
}

function getField(row,keys){
for(const k of keys){
if(row[k]) return row[k];
}
return "";
}

function matchesWeather(v,filter){
if(filter==="全部") return true;
return normalizeText(v).includes(normalizeText(filter));
}

function matchesArea(v,filter){
if(filter==="全部") return true;
return normalizeText(v).includes(filter);
}

function matchesPeriod(v,p){
if(p==="全部") return true;
const digits = normalizeText(v).replace(/[^\d]/g,"");
return digits.includes(String(p));
}

function getPeriodName(p){
return {1:"清晨",2:"上午",3:"下午",4:"晚上"}[p];
}

function formatPeriodDisplay(v){
const digits = normalizeText(v).replace(/[^\d]/g,"");
const set = [...new Set(digits.split(""))];

if(set.includes("1")&&set.includes("2")&&set.includes("3")&&set.includes("4")){
return "全天";
}

return set.map(x=>getPeriodName(x)).join("、");
}

function formatWeatherDisplay(v){
const text = normalizeText(v);

const all = ["彩虹","晴天","雨天","雪天"];
if(all.every(w=>text.includes(w))) return "全天氣";

const map={
彩虹:"🌈",
晴天:"☀️",
雨天:"☔️",
雪天:"⛄️"
};

return Object.keys(map)
.filter(k=>text.includes(k))
.map(k=>map[k])
.join(" ");
}

function formatFishShadowDisplay(v){
const text = String(v||"");

if(text.includes("金魚影")){
return <span style={{color:"#d97706",fontWeight:700}}>{text}</span>;
}

if(text.includes("藍魚影")){
return <span style={{color:"#2563eb",fontWeight:700}}>{text}</span>;
}

return text;
}

function formatPlaceDisplay(v){
const text = String(v||"");

let color="#333";

if(text.includes("⬆")) color="#8B5A2B";
else if(text.includes("⬅")) color="#9AD87A";
else if(text.includes("⮕")) color="#1F7A3A";
else if(text.includes("⬇")) color="#2563EB";
else if(text.includes("🏘️")||text.includes("⊡")) color="#EAB308";
else if(text.includes("河")) color="#38BDF8";

return <span style={{color,fontWeight:600}}>{text}</span>;
}

function sortRows(rows,order){
if(order==="none") return rows;

return [...rows].sort((a,b)=>{
const la=Number(getField(a,["Level","等級"]))||0;
const lb=Number(getField(b,["Level","等級"]))||0;
return order==="asc"?la-lb:lb-la;
});
}

function Toggle({checked,onChange}){
return(
<label style={{position:"relative",width:44,height:24,display:"inline-block"}}>
<input
type="checkbox"
checked={checked}
onChange={e=>onChange(e.target.checked)}
style={{opacity:0,width:0,height:0}}
/>

<span style={{
position:"absolute",
inset:0,
background:checked?"#34C759":"#ccc",
borderRadius:24
}}/>

<span style={{
position:"absolute",
top:2,
left:checked?22:2,
width:20,
height:20,
background:"#fff",
borderRadius:"50%",
boxShadow:"0 1px 3px rgba(0,0,0,.3)"
}}/>
</label>
);
}

export default function Page(){

const [rows,setRows]=useState([]);
const [loading,setLoading]=useState(true);

const [tab,setTab]=useState("全部");
const [keyword,setKeyword]=useState("");

const [weather,setWeather]=useState("全部");
const [area,setArea]=useState("全部");

const [fishLevel,setFishLevel]=useState("全部");
const [bugLevel,setBugLevel]=useState("全部");
const [birdLevel,setBirdLevel]=useState("全部");

const [sort,setSort]=useState("none");

const [autoPeriod,setAutoPeriod]=useState(true);
const [manualPeriod,setManualPeriod]=useState("全部");

const [now,setNow]=useState(new Date());

useEffect(()=>{
fetch(SHEET_CSV_URL)
.then(r=>r.text())
.then(t=>{
setRows(parseCSV(t).filter(r=>getField(r,["名稱"])));
setLoading(false);
});
},[]);

useEffect(()=>{
const t=setInterval(()=>setNow(new Date()),60000);
return()=>clearInterval(t);
},[]);

const hour=now.getHours();
let period="1";
if(hour>=6&&hour<12)period="2";
else if(hour>=12&&hour<18)period="3";
else if(hour>=18)period="4";

const effectivePeriod=autoPeriod?period:manualPeriod;

const filtered=useMemo(()=>{
let data=rows.filter(r=>{
const type=getField(r,["類型"]);
const name=getField(r,["名稱"]);
const level=Number(getField(r,["Level","等級"]));
const weatherV=getField(r,["天氣"]);
const periodV=getField(r,["時段","時間"]);
const areaV=getField(r,["地區"]);

const matchTab=tab==="全部"||type===tab;
const matchName=keyword?name.includes(keyword):true;
const matchWeather=matchesWeather(weatherV,weather);
const matchArea=matchesArea(areaV,area);
const matchPeriod=matchesPeriod(periodV,effectivePeriod);

let matchLevel=true;

if(tab!=="全部"){
if(type==="魚"&&fishLevel!=="全部")matchLevel=level<=fishLevel;
if(type==="蟲"&&bugLevel!=="全部")matchLevel=level<=bugLevel;
if(type==="鳥"&&birdLevel!=="全部")matchLevel=level<=birdLevel;
}

return matchTab&&matchName&&matchWeather&&matchArea&&matchPeriod&&matchLevel;
});

return sortRows(data,sort);

},[rows,tab,keyword,weather,area,fishLevel,bugLevel,birdLevel,effectivePeriod,sort]);

return(

<main style={{padding:40,fontFamily:"system-ui"}}>

<h1>心動小鎮｜生物圖鑑</h1>

<div style={{display:"flex",gap:8,marginBottom:20}}>
{["全部","魚","蟲","鳥"].map(t=>(
<button key={t}
onClick={()=>setTab(t)}
style={{
padding:"6px 12px",
background:tab===t?"#111":"#eee",
color:tab===t?"#fff":"#333",
borderRadius:8
}}>
{t}
</button>
))}
</div>

<div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>

<input
placeholder="搜尋名稱"
value={keyword}
onChange={e=>setKeyword(e.target.value)}
/>

<select value={weather} onChange={e=>setWeather(e.target.value)}>
<option>全部</option>
<option>晴天</option>
<option>雨天</option>
<option>雪天</option>
<option>彩虹</option>
</select>

<select value={area} onChange={e=>setArea(e.target.value)}>
<option>全部</option>
<option>中心城區</option>
<option>北部</option>
<option>東部</option>
<option>西部</option>
<option>南部</option>
</select>

<select disabled={autoPeriod}
value={manualPeriod}
onChange={e=>setManualPeriod(e.target.value)}>
<option value="全部">全部</option>
<option value="1">清晨</option>
<option value="2">上午</option>
<option value="3">下午</option>
<option value="4">晚上</option>
</select>

<Toggle checked={autoPeriod} onChange={setAutoPeriod}/>

</div>

<table border="1" cellPadding="8">
<thead>
<tr>
<th>類型</th>
<th>
Level
<select value={sort} onChange={e=>setSort(e.target.value)}>
<option value="none">預設</option>
<option value="asc">低→高</option>
<option value="desc">高→低</option>
</select>
</th>
<th>名稱</th>
<th>天氣</th>
<th>時段</th>
<th>地點</th>
<th>Note</th>
</tr>
</thead>

<tbody>

{loading?(
<tr><td colSpan="7">資料載入中...</td></tr>
):

filtered.map((r,i)=>(
<tr key={i}>
<td>{getField(r,["類型"])}</td>
<td>{getField(r,["Level","等級"])}</td>
<td><b>{getField(r,["名稱"])}</b></td>
<td>{formatWeatherDisplay(getField(r,["天氣"]))}</td>
<td>{formatPeriodDisplay(getField(r,["時段","時間"]))}</td>
<td>{formatPlaceDisplay(getField(r,["地點"]))}</td>
<td>{formatFishShadowDisplay(getField(r,["Note","備註"]))}</td>
</tr>
))

}

</tbody>
</table>

</main>

);

}