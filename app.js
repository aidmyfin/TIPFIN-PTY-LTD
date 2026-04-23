/* =========================================================
   TIPFIN — shared app logic
   - Baserow integration (signup, login lookup, apply update, file upload)
   - LocalStorage session + 30-day instant-approval rule
   - Currency by country
   - Animated reveal-on-scroll
   ========================================================= */

const TIPFIN = {
  BASEROW_TOKEN: "LG6hnTBxgBG78FueElsSwpHRd4Wep1oL",
  TABLE_ID: 936442,
  API: "https://api.baserow.io/api/database/rows/table/936442/",
  UPLOAD_API: "https://api.baserow.io/api/user-files/upload-file/",
  CASHCODE: "4503183",
  WHATSAPP: "27685299179",
  PHONE_DISPLAY: "068 529 9179",
  INSTANT_APPROVE_DAYS: 30,
  FIRST_REVIEW_MS: 30 * 60 * 1000, // 30 minutes
};

/* ---------- Active nav highlight ---------- */
(function highlightNav(){
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll("[data-nav]").forEach(a=>{
    const target = (a.getAttribute("data-nav")||"").toLowerCase();
    if (target === path || (target === "index.html" && path === "")) a.classList.add("active");
  });
})();

/* ---------- Reveal on scroll ---------- */
(function reveal(){
  const obs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if (e.isIntersecting){ e.target.classList.add("in"); obs.unobserve(e.target); }
    });
  },{threshold:.12});
  document.querySelectorAll(".reveal").forEach(el=>obs.observe(el));
})();

/* ---------- Country → Currency map ---------- */
const COUNTRY_CURRENCY = {
  "South Africa": { sym:"R",   code:"ZAR" },
  "Botswana":     { sym:"P",   code:"BWP" },
  "Namibia":      { sym:"N$",  code:"NAD" },
  "Zimbabwe":     { sym:"Z$",  code:"ZWL" },
  "Nigeria":      { sym:"₦",   code:"NGN" },
  "Ghana":        { sym:"₵",   code:"GHS" },
  "Kenya":        { sym:"KSh", code:"KES" },
  "Tanzania":     { sym:"TSh", code:"TZS" },
  "Uganda":       { sym:"USh", code:"UGX" },
  "Zambia":       { sym:"K",   code:"ZMW" },
  "Mozambique":   { sym:"MT",  code:"MZN" },
  "Eswatini":     { sym:"E",   code:"SZL" },
  "Lesotho":      { sym:"L",   code:"LSL" },
  "Egypt":        { sym:"E£",  code:"EGP" },
  "United States":{ sym:"$",   code:"USD" },
  "United Kingdom":{sym:"£",   code:"GBP" },
  "Canada":       { sym:"C$",  code:"CAD" },
  "Australia":    { sym:"A$",  code:"AUD" },
  "India":        { sym:"₹",   code:"INR" },
  "Eurozone":     { sym:"€",   code:"EUR" },
  "Other":        { sym:"$",   code:"USD" },
};
function currencyFor(country){
  if (!country) return COUNTRY_CURRENCY["Other"];
  return COUNTRY_CURRENCY[country] || COUNTRY_CURRENCY["Other"];
}
function fmtMoney(amount, country){
  const c = currencyFor(country);
  const n = Number(amount||0);
  return c.sym + " " + n.toLocaleString(undefined,{maximumFractionDigits:2});
}
/* Truncate to 2 decimals (no rounding): 875.8888 -> 875.88, 1999.99999 -> 1999.99 */
function trunc2(n){ return Math.floor((Number(n)||0) * 100) / 100; }
/* Format with truncated 2 decimals, always shows .XX */
function fmtMonthly(amount, country){
  const c = currencyFor(country);
  const n = trunc2(amount);
  return c.sym + " " + n.toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2});
}
/* Fixed monthly: amount * 1.05 / months, truncated to 2 decimals */
function calcMonthly(amount, months){
  if (!amount || !months) return 0;
  return trunc2((Number(amount) * 1.05) / Number(months));
}
function calcTotal(amount){
  if (!amount) return 0;
  return trunc2(Number(amount) * 1.05);
}

const COUNTRY_LIST = Object.keys(COUNTRY_CURRENCY).filter(c=>c!=="Other").concat(["Other"]);
function countryOptionsHTML(selected){
  return '<option value="">Select Country</option>' +
    COUNTRY_LIST.map(c=>`<option ${selected===c?"selected":""}>${c}</option>`).join("");
}

window.TIPFIN_COUNTRY = { COUNTRY_CURRENCY, currencyFor, fmtMoney, fmtMonthly, trunc2, calcMonthly, calcTotal, COUNTRY_LIST, countryOptionsHTML };

/* ---------- Session helpers ---------- */
const Session = {
  get(){
    try { return JSON.parse(localStorage.getItem("tipfin_user") || "null"); }
    catch { return null; }
  },
  set(u){ localStorage.setItem("tipfin_user", JSON.stringify(u)); window.dispatchEvent(new Event("tipfin-session")); },
  clear(){ localStorage.removeItem("tipfin_user"); window.dispatchEvent(new Event("tipfin-session")); },
  requireAuth(redirect="login.html"){
    const u = Session.get();
    if (!u) { location.href = redirect; }
    return u;
  },
  /**
   * Instant approval rule: if the user logged in within the last 30 days
   * AND has applied, they skip the 30-min wait and are shown approved.
   */
  approvalState(u){
    if (!u || !u.hasApplied) return { state:"not-applied", pct:5, etaMin:0 };
    const now = Date.now();
    const last = u.lastLoginAt || u.firstLoginAt || now;
    const dayMs = 24*60*60*1000;
    const daysSince = (now - last) / dayMs;
    const isReturning = u.priorLoginAt && (now - u.priorLoginAt) < (TIPFIN.INSTANT_APPROVE_DAYS * dayMs);
    if (isReturning) return { state:"approved", pct:100, etaMin:0 };
    const elapsed = now - (u.firstLoginAt || now);
    if (elapsed >= TIPFIN.FIRST_REVIEW_MS) return { state:"approved", pct:100, etaMin:0 };
    const remaining = TIPFIN.FIRST_REVIEW_MS - elapsed;
    return {
      state:"reviewing",
      pct: Math.min(95, Math.floor(20 + (elapsed / TIPFIN.FIRST_REVIEW_MS) * 70)),
      etaMin: Math.ceil(remaining/60000)
    };
  }
};
window.TIPFIN_SESSION = Session;

/* ---------- Baserow API helpers ---------- */
async function baserowRequest(path, opts={}){
  const url = path.startsWith("http") ? path : TIPFIN.API + path;
  const res = await fetch(url, {
    ...opts,
    headers: {
      "Authorization": "Token " + TIPFIN.BASEROW_TOKEN,
      "Content-Type": "application/json",
      ...(opts.headers||{})
    }
  });
  if (!res.ok){
    const txt = await res.text().catch(()=> "");
    throw new Error("Baserow error "+res.status+": "+txt.slice(0,200));
  }
  return res.json();
}

async function findUserByEmail(email){
  const params = new URLSearchParams({
    user_field_names: "true",
    "filter__Email__equal": email,
    size: "1"
  });
  const data = await baserowRequest("?"+params.toString());
  return data.results && data.results[0] ? data.results[0] : null;
}

async function findUserByEmailAndId(email, idNo){
  const params = new URLSearchParams({
    user_field_names: "true",
    "filter__Email__equal": email,
    "filter__idNo__equal": idNo,
    size: "1"
  });
  const data = await baserowRequest("?"+params.toString());
  return data.results && data.results[0] ? data.results[0] : null;
}

async function getUserRow(rowId){
  const params = new URLSearchParams({ user_field_names: "true" });
  return baserowRequest(rowId+"/?"+params.toString());
}

async function createUserRow(payload){
  const params = new URLSearchParams({ user_field_names: "true" });
  return baserowRequest("?"+params.toString(), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

async function updateUserRow(rowId, payload){
  const params = new URLSearchParams({ user_field_names: "true" });
  return baserowRequest(rowId+"/?"+params.toString(), {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

/* Update/create using raw field_XXXX IDs (no user_field_names). */
async function updateUserRowById(rowId, payload){
  return baserowRequest(rowId+"/", {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}
async function createUserRowById(payload){
  return baserowRequest("", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

/* Baserow field IDs for table 936442 (tipfin) */
const FIELDS = {
  name:        "field_8136507",
  lastname:    "field_8136508",
  loanAmount:  "field_8136509",
  Email:       "field_8136510",
  Phonenumber: "field_8136511",
  IdDoc:       "field_8136512",
  Bankstate:   "field_8136513",
  employ:      "field_8136514",
  income:      "field_8136515",
  loanType:    "field_8136516",
  loanPurpose: "field_8136517",
  loanTearm:   "field_8136518",
  idNo:        "field_8136519",
  reference:   "field_8136520",
  cashcode:    "field_8136521",
  payproof:    "field_8136522",
};

/* Upload a file to Baserow user-files. Returns { name, url, ... }. */
async function uploadFileToBaserow(file, onProgress){
  return new Promise((resolve, reject)=>{
    const xhr = new XMLHttpRequest();
    const fd = new FormData();
    fd.append("file", file, file.name);
    xhr.open("POST", TIPFIN.UPLOAD_API);
    xhr.setRequestHeader("Authorization", "Token " + TIPFIN.BASEROW_TOKEN);
    if (onProgress) {
      xhr.upload.onprogress = e => { if (e.lengthComputable) onProgress(Math.round((e.loaded/e.total)*100)); };
    }
    xhr.onload = ()=>{
      if (xhr.status >= 200 && xhr.status < 300){
        try { resolve(JSON.parse(xhr.responseText)); }
        catch (e) { reject(new Error("Bad upload response")); }
      } else {
        reject(new Error("Upload failed ("+xhr.status+"): "+xhr.responseText.slice(0,200)));
      }
    };
    xhr.onerror = ()=> reject(new Error("Network error during upload"));
    xhr.send(fd);
  });
}

window.TIPFIN_API = {
  findUserByEmail, findUserByEmailAndId, getUserRow,
  createUserRow, updateUserRow, uploadFileToBaserow,
  createUserRowById, updateUserRowById, FIELDS,
  baserow: baserowRequest
};

/* ---------- Toast ---------- */
function toast(msg, kind="info"){
  let host = document.getElementById("toast-host");
  if (!host){
    host = document.createElement("div");
    host.id="toast-host";
    Object.assign(host.style,{position:"fixed",top:"18px",left:"50%",transform:"translateX(-50%)",
      zIndex:9999,display:"flex",flexDirection:"column",gap:"10px"});
    document.body.appendChild(host);
  }
  const colors = {info:"#0ea5e9", ok:"#16a34a", err:"#d8362a"};
  const t = document.createElement("div");
  t.textContent = msg;
  Object.assign(t.style,{
    background:"#fff", color:"#0f1620", padding:"12px 16px", borderRadius:"12px",
    boxShadow:"0 20px 40px -12px rgba(15,22,32,.25)", borderLeft:"4px solid "+(colors[kind]||colors.info),
    fontWeight:"600", fontSize:".92rem", maxWidth:"min(92vw, 380px)"
  });
  host.appendChild(t);
  setTimeout(()=>{ t.style.transition=".4s"; t.style.opacity="0"; t.style.transform="translateY(-10px)"; },2800);
  setTimeout(()=>t.remove(), 3300);
}
window.tipfinToast = toast;

/* ---------- Year stamp ---------- */
document.querySelectorAll("[data-year]").forEach(el=>el.textContent = new Date().getFullYear());

/* ---------- Online users widget (gender-matched avatars, dynamic count up to 21) ---------- */
(function onlineUsers(){
  // Gendered name pool — gender used to pick a matching avatar emoji
  const PEOPLE = [
    // Male — South Africa
    {n:"Thabo K.",g:"m"},{n:"Sipho D.",g:"m"},{n:"Themba L.",g:"m"},{n:"Mpho B.",g:"m"},
    {n:"Bongani P.",g:"m"},{n:"Sibusiso K.",g:"m"},{n:"Andile J.",g:"m"},{n:"Sandile Z.",g:"m"},
    {n:"Vusi C.",g:"m"},{n:"Junior M.",g:"m"},{n:"Nathi M.",g:"m"},{n:"Cebo P.",g:"m"},
    {n:"Tendai G.",g:"m"},{n:"Lebo M.",g:"m"},{n:"Lesego B.",g:"m"},
    // Female — South Africa
    {n:"Naledi S.",g:"f"},{n:"Aisha O.",g:"f"},{n:"Kgomotso N.",g:"f"},{n:"Zanele R.",g:"f"},
    {n:"Nomsa V.",g:"f"},{n:"Refilwe T.",g:"f"},{n:"Tumi A.",g:"f"},{n:"Khanyi M.",g:"f"},
    {n:"Lerato F.",g:"f"},{n:"Karabo W.",g:"f"},{n:"Palesa H.",g:"f"},{n:"Nokuthula E.",g:"f"},
    {n:"Dineo I.",g:"f"},{n:"Mihle S.",g:"f"},{n:"Asanda O.",g:"f"},{n:"Boitumelo P.",g:"f"},
    {n:"Sade K.",g:"f"},{n:"Ayanda L.",g:"f"},{n:"Imani K.",g:"f"},{n:"Onele V.",g:"f"},
    // Male — Intl
    {n:"David M.",g:"m"},{n:"Joshua T.",g:"m"},{n:"Marvin O.",g:"m"},{n:"Yusuf A.",g:"m"},
    {n:"Ridwan B.",g:"m"},{n:"Tunde A.",g:"m"},{n:"Owen R.",g:"m"},{n:"Tariq Y.",g:"m"},
    {n:"Michael R.",g:"m"},{n:"James O.",g:"m"},{n:"Arjun P.",g:"m"},{n:"Kwame B.",g:"m"},
    // Female — Intl
    {n:"Sarah K.",g:"f"},{n:"Daniela R.",g:"f"},{n:"Chiamaka N.",g:"f"},{n:"Ife E.",g:"f"},
    {n:"Nala J.",g:"f"},{n:"Fatima H.",g:"f"},{n:"Priya S.",g:"f"},{n:"Amara O.",g:"f"},
    {n:"Emma W.",g:"f"},{n:"Wanjiku K.",g:"f"}
  ];
  const PLACES = ["JHB","Cape Town","Pretoria","Durban","Sandton","Polokwane","Bloem","PE","East London","Soweto","Lagos","Nairobi","Accra","London","NYC","Mumbai"];
  const MALE_AV   = ["👨🏾","👨🏽","👨🏿","👨🏼","🧔🏾","🧔🏽","👨🏾‍💼","👨🏽‍💼"];
  const FEMALE_AV = ["👩🏾","👩🏽","👩🏿","👩🏼","👩🏾‍🦱","👩🏽‍🦱","👩🏾‍💼","👩🏽‍💼"];

  function pickAvatar(person){
    // stable hash from name → consistent avatar per person
    let h = 0; for (let i=0;i<person.n.length;i++) h = (h*31 + person.n.charCodeAt(i)) >>> 0;
    const set = person.g === "m" ? MALE_AV : FEMALE_AV;
    return set[h % set.length];
  }

  function shuffle(arr){
    const a = arr.slice();
    for (let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]] = [a[j],a[i]];
    }
    return a;
  }

  /* Cross-page sync via localStorage:
     state = { count, names: [indexes], nextAt: ms }
     - On any page load we read the saved state. If still within nextAt, show the saved count.
     - When nextAt passes, we drift the count by ±1–3 (occasional jumps), keep within 1..21,
       reshuffle a few avatar slots, save back, broadcast, and schedule the next tick.
     - 'storage' event keeps multiple open tabs in sync.
  */
  const KEY = "tipfin_online_v2";

  function clamp(n){ return Math.max(1, Math.min(21, n)); }

  function freshState(){
    // First-ever visit: pick a surprising starting number weighted across 1..21
    const r = Math.random();
    let count;
    if (r < 0.08) count = 1 + Math.floor(Math.random()*2);          // 1–2 quiet
    else if (r < 0.55) count = 3 + Math.floor(Math.random()*7);     // 3–9 typical
    else if (r < 0.85) count = 9 + Math.floor(Math.random()*7);     // 9–15 busy
    else count = 15 + Math.floor(Math.random()*7);                  // 15–21 peak
    const idxs = shuffle(PEOPLE.map((_,i)=>i)).slice(0,5);
    return { count: clamp(count), names: idxs, nextAt: Date.now() + (10000 + Math.floor(Math.random()*20000)) };
  }

  function nextState(prev){
    // Drift: usually ±1..3, sometimes a bigger move so it feels alive but never random
    const r = Math.random();
    let delta;
    if (r < 0.6) delta = (Math.random()<0.5?-1:1) * (1 + Math.floor(Math.random()*2));   // ±1–2
    else if (r < 0.9) delta = (Math.random()<0.5?-1:1) * (2 + Math.floor(Math.random()*3)); // ±2–4
    else delta = (Math.random()<0.5?-1:1) * (3 + Math.floor(Math.random()*5));            // ±3–7 jump
    let count = clamp(prev.count + delta);
    if (count === prev.count) count = clamp(count + (Math.random()<0.5?-1:1));
    // Rotate names: keep 2 from previous, add 3 new
    const carry = (prev.names||[]).slice(0,2);
    const fresh = shuffle(PEOPLE.map((_,i)=>i).filter(i=>!carry.includes(i))).slice(0,3);
    return { count, names: carry.concat(fresh).slice(0,5), nextAt: Date.now() + (10000 + Math.floor(Math.random()*20000)) };
  }

  function loadState(){
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (!s || typeof s.count !== "number") return null;
      return s;
    } catch { return null; }
  }
  function saveState(s){
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  }

  function getOrInit(){
    let s = loadState();
    if (!s) { s = freshState(); saveState(s); }
    return s;
  }

  function paint(host, state){
    // Compact: only ever 2 avatars in the header pill — never more
    const avCount = Math.min(state.count, 2);
    const items = (state.names||[]).slice(0, avCount)
      .map(i => PEOPLE[i] || PEOPLE[0]);
    host.innerHTML = `
      <div class="ou-pill" title="${state.count} people online right now">
        <span class="ou-dot"></span>
        <span class="ou-stack">
          ${items.map((u,i)=>`<span class="ou-av ${u.g==='m'?'male':'female'}" style="z-index:${10-i}">${pickAvatar(u)}</span>`).join("")}
        </span>
        <span class="ou-text"><strong>${state.count}</strong> online</span>
      </div>
    `;
  }

  // Single shared driver — only one runs across all hosts on the page
  let driverStarted = false;
  function startDriver(){
    if (driverStarted) return;
    driverStarted = true;
    function loop(){
      let s = loadState() || getOrInit();
      const now = Date.now();
      if (now >= (s.nextAt || 0)){
        s = nextState(s);
        saveState(s);
        paintAll(s);
      }
      setTimeout(loop, 1000);
    }
    loop();
  }

  function paintAll(state){
    document.querySelectorAll("[data-online-users]").forEach(h => paint(h, state));
  }

  function mount(){
    const state = getOrInit();
    document.querySelectorAll("[data-online-users]").forEach(host=>{
      if (host.dataset.bound) return;
      host.dataset.bound = "1";
      paint(host, state);
    });
    startDriver();
  }

  // Sync across open tabs
  window.addEventListener("storage", e=>{
    if (e.key !== KEY || !e.newValue) return;
    try { paintAll(JSON.parse(e.newValue)); } catch {}
  });

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", mount);
  } else { mount(); }
})();

/* ---------- Header sign-in / My Profile swap ---------- */
(function authButton(){
  function swap(){
    const u = Session.get();
    document.querySelectorAll("[data-auth-btn]").forEach(el=>{
      if (u){
        el.textContent = "My Profile";
        el.setAttribute("href","profile.html");
      } else {
        el.textContent = "Sign in";
        el.setAttribute("href","login.html");
      }
    });
    document.querySelectorAll("[data-cta-btn]").forEach(el=>{
      if (u){
        el.textContent = "Open dashboard";
        el.setAttribute("href","dashboard.html");
      }
    });
  }
  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", swap);
  } else { swap(); }
  window.addEventListener("tipfin-session", swap);
})();
