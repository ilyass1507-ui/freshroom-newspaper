(() => {
'use strict';

const GENRES = ["All","Tech House","House","Melodic House","Afro House","Groove","UK Garage","Tropical House","Deep House","EDM","Electro","Techno"];
const ROUTE_TITLES = {
  fr: { all:"À la une", music:"Musique", event:"Agenda", article:"Articles", release:"Sorties" },
  en: { all:"Front page", music:"Music desk", event:"Event radar", article:"Culture", release:"New releases" }
};
const I18N = {
  fr: { menu:"MENU", search:"RECHERCHE", join:"REJOINDRE", join_title:"Rejoindre FRESHROOM", nav_agenda:"Agenda", nav_music:"Musique", nav_articles:"Articles", nav_releases:"Sorties",
        nav_about:"Le Freshroom", nav_info:"Infos pratiques", hero_sub:"Le journal de la musique électronique : tech house, afro house, melodic, club culture.",
        see_agenda:"Voir l'agenda", upcoming:"Prochainement", about_title:"Au cœur de la culture club",
        about_text:"FRESHROOM couvre les soirées, festivals, labels et DJs : chaque salle où la house, la techno, le garage, l'afro et l'EDM font vibrer la nuit.",
        read_more:"En savoir plus", s_trending:"Tendance", s_newest:"Plus récent", s_likes:"Plus aimé", private:"Privatisation",
        nl_title:"Pour recevoir toutes les actualités du Freshroom, c'est ici !", nl_consent:"J'accepte de recevoir l'actualité du Freshroom", send:"ENVOYER",
        search_ph:"Rechercher…", no_events:"Aucun événement à venir.", no_stories:"Aucun article trouvé.", like:"J'aime", share:"Partager", copied:"Lien copié !",
        nl_ok:"Merci, vous êtes inscrit !", nl_err:"Une erreur est survenue, réessayez.", nl_dup:"Cet email est déjà inscrit.", nl_bad:"Email invalide ou case non cochée.", spot:"À la une" },
  en: { menu:"MENU", search:"SEARCH", join:"JOIN", join_title:"Join FRESHROOM", nav_agenda:"Agenda", nav_music:"Music", nav_articles:"Articles", nav_releases:"Releases",
        nav_about:"About Freshroom", nav_info:"Practical info", hero_sub:"The electronic music paper: tech house, afro house, melodic, club culture.",
        see_agenda:"See the agenda", upcoming:"Coming up", about_title:"At the heart of club culture",
        about_text:"FRESHROOM covers parties, festivals, labels and DJs: every room where house, techno, garage, afro and EDM keep the night moving.",
        read_more:"Read more", s_trending:"Trending", s_newest:"Newest", s_likes:"Most liked", private:"Private hire",
        nl_title:"To get all the Freshroom news, sign up here!", nl_consent:"I agree to receive Freshroom news", send:"SEND",
        search_ph:"Search…", no_events:"No upcoming events.", no_stories:"No stories found.", like:"Like", share:"Share", copied:"Link copied!",
        nl_ok:"Thanks, you're subscribed!", nl_err:"Something went wrong, try again.", nl_dup:"This email is already subscribed.", nl_bad:"Invalid email or box not ticked.", spot:"Spotlight" }
};
const SEED = [
  {id:"s1",type:"music",genre:"Afro House",title:"Afro House selectors reshaping festival sets",meta:"Global scene report",summary:"Percussion-led records moving from beach clubs to massive stages.",body:"Percussion-led records are moving from beach clubs to the biggest stages.\n\nSelectors are blending organic drums with deep, melodic basslines.",date:"2026-05-08",likes:144,shares:73,links:[]},
  {id:"s2",type:"event",genre:"Tech House",title:"Warehouse Pulse all-night session",meta:"Marrakech - May 31",summary:"Late-night party with European guest lineup.",body:"A late-night session with a European guest lineup.",date:"2026-05-06",event_date:"2026-12-05",likes:108,shares:91,links:[]},
  {id:"s3",type:"release",genre:"Melodic House",title:"New release radar: synth lines",meta:"Freshroom desk",summary:"Emotional melodic house with cleaner drums.",body:"Emotional melodic house with cleaner drums.",date:"2026-05-05",likes:89,shares:42,links:[]},
  {id:"s4",type:"article",genre:"UK Garage",title:"Why UK Garage keeps returning",meta:"Culture essay",summary:"Speed, swing, and bass pressure.",body:"Speed, swing, and bass pressure.",date:"2026-05-03",likes:72,shares:39,links:[]},
  {id:"s5",type:"event",genre:"Deep House",title:"Sunday Room rooftop party",meta:"Rabat - June 7",summary:"Daytime gathering focused on warm deep house.",body:"Daytime gathering focused on warm deep house.",date:"2026-05-01",event_date:"2026-12-13",likes:53,shares:44,links:[]}
];

// ---------- helpers ----------
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
const safeUrl = u => /^https?:\/\//i.test(u) ? u : "#";
const locale = () => lang === "fr" ? "fr-FR" : "en-GB";
const toDate = d => new Date(String(d).slice(0, 10) + "T12:00:00");
const fmtShort = d => toDate(d).toLocaleDateString(locale(), { day: "2-digit", month: "short" }).toUpperCase().replace(".", "");
const fmtLong = d => toDate(d).toLocaleDateString(locale(), { day: "2-digit", month: "short", year: "numeric" }).toUpperCase().replace(".", "");
const t = k => (I18N[lang] && I18N[lang][k]) || k;

// ---------- state ----------
let lang = store.get("fr-lang", "fr");
let stories = [];
let route = "all", genre = "All", sort = "newest";
let user = store.get("fr-user", null);
const liked = new Set(store.get("fr-liked", []));

const els = {
  header: $("#siteHeader"), menuBtn: $("#menuBtn"), overlay: $("#menuOverlay"),
  strip: $("#eventStrip"), grid: $("#storyGrid"), tabs: $("#genreTabs"), label: $("#routeLabel"), sort: $("#sortSelect"),
  storyDialog: $("#storyDialog"), storyDetail: $("#storyDetail"),
  accountDialog: $("#accountDialog"), accountBtn: $("#accountButton"),
  searchDialog: $("#searchDialog"), searchInput: $("#searchInput"), searchResults: $("#searchResults")
};

// ---------- data ----------
async function loadStories() {
  try {
    if (!db) throw new Error("no db");
    const { data, error } = await db.from("stories").select("*").order("date", { ascending: false });
    if (error) throw error;
    stories = (data || []).map(s => ({ ...s, links: Array.isArray(s.links) ? s.links : [], likes: s.likes || 0, shares: s.shares || 0 }));
  } catch (e) {
    console.warn("Using offline demo stories:", e.message || e);
    stories = SEED.slice();
  }
}

// ---------- i18n ----------
function applyLang() {
  document.documentElement.lang = lang;
  $$("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  $$("[data-i18n-ph]").forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  $$(".lang button").forEach(b => b.classList.toggle("on", b.dataset.lang === lang));
  renderProfile();
}

// ---------- render ----------
function filtered() {
  let list = stories.slice();
  if (route !== "all") list = list.filter(s => s.type === route);
  if (genre !== "All") list = list.filter(s => (s.genre || "").toLowerCase() === genre.toLowerCase());
  if (sort === "newest") list.sort((a, b) => toDate(b.date) - toDate(a.date));
  else if (sort === "likes") list.sort((a, b) => b.likes - a.likes);
  else list.sort((a, b) => (b.likes + b.shares * 2) - (a.likes + a.shares * 2));
  return list;
}

function renderTabs() {
  els.tabs.innerHTML = GENRES.map(g => `<button type="button" class="${g === genre ? "active" : ""}" data-genre="${esc(g)}">${esc(g)}</button>`).join("");
}

function renderLabel() { els.label.textContent = ROUTE_TITLES[lang][route] || ROUTE_TITLES[lang].all; }

function renderStrip() {
  const today = new Date().toISOString().slice(0, 10);
  let ev = stories.filter(s => s.type === "event");
  const upcoming = ev.filter(s => (s.event_date || s.date) >= today);
  ev = (upcoming.length ? upcoming : ev).sort((a, b) => toDate(a.event_date || a.date) - toDate(b.event_date || b.date)).slice(0, 10);
  els.strip.innerHTML = ev.map(e => `
    <button class="ev" data-open="${esc(e.id)}" type="button">
      <div class="ev-img ${e.image ? "" : "ph"}" ${e.image ? `style="background-image:url('${esc(safeUrl(e.image))}')"` : ""}></div>
      <span class="ev-date">${esc(fmtShort(e.event_date || e.date))}</span>
      <h3>${esc(e.title)}</h3><small>${esc(e.meta || e.genre)}</small>
    </button>`).join("") || `<p class="empty">${esc(t("no_events"))}</p>`;
}

const rowHtml = s => `
  <button class="story reveal" data-open="${esc(s.id)}" type="button">
    <span class="story-date">${esc(fmtLong(s.date))}</span>
    <h3>${esc(s.title)}</h3>
    <span class="story-meta">${esc(s.genre)}<br>${esc(s.meta || "")}</span>
  </button>`;

function renderStories() {
  const list = filtered();
  els.grid.innerHTML = list.map(rowHtml).join("") || `<p class="empty">${esc(t("no_stories"))}</p>`;
  observeReveal();
}

function renderSections() {
  [["music", "musicList"], ["article", "articlesList"], ["release", "releasesList"]].forEach(([type, id]) => {
    const box = $("#" + id);
    if (!box) return;
    const list = stories.filter(s => s.type === type).sort((a, b) => toDate(b.date) - toDate(a.date));
    box.innerHTML = list.map(rowHtml).join("") || `<p class="empty">${esc(t("no_stories"))}</p>`;
  });
}

function renderSpotlight() {
  const sec = $("#spotlight");
  const s = stories.filter(x => x.image).sort((a, b) => toDate(b.date) - toDate(a.date))[0] || stories[0];
  if (!s) { sec.hidden = true; return; }
  sec.hidden = false;
  $("#spotlightKicker").textContent = `${t("spot")} • ${s.genre}`;
  $("#spotlightTitle").textContent = s.title;
  $("#spotlightText").textContent = s.summary || "";
  $("#spotlightBtn").dataset.open = s.id;
  $("#spotlightImg").style.backgroundImage = s.image ? `url('${safeUrl(s.image)}')` : "";
}

function renderProfile() { els.accountBtn.textContent = user ? String(user.name).toUpperCase() : t("join"); }

function render() { renderLabel(); renderTabs(); renderStrip(); renderSections(); renderStories(); renderSpotlight(); renderProfile(); observeReveal(); }

// ---------- reveal animation ----------
let io;
function observeReveal() {
  if (!("IntersectionObserver" in window)) { $$(".reveal").forEach(e => e.classList.add("in")); return; }
  io = io || new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
  }), { threshold: .12 });
  $$(".reveal:not(.in)").forEach(e => io.observe(e));
}

// ---------- story dialog ----------
function openStory(id) {
  const s = stories.find(x => String(x.id) === String(id));
  if (!s) return;
  const paras = String(s.body || s.summary || "").split(/\n{2,}|\n/).filter(Boolean).map(p => `<p>${esc(p)}</p>`).join("");
  const links = (s.links || []).map(l => `<a href="${esc(safeUrl(l.url))}" target="_blank" rel="noopener noreferrer">${esc(l.label || l.url)} ↗</a>`).join("");
  els.storyDetail.innerHTML = `
    ${s.image ? `<img class="d-img" src="${esc(safeUrl(s.image))}" alt="" loading="lazy">` : ""}
    <div class="d-kicker">${esc(s.type)} • ${esc(s.genre)} • ${esc(fmtLong(s.event_date || s.date))}</div>
    <h2>${esc(s.title)}</h2>
    ${s.meta ? `<p class="story-meta" style="text-align:left;margin-bottom:1rem">${esc(s.meta)}</p>` : ""}
    <div class="d-body">${paras}</div>
    ${links ? `<div class="d-links">${links}</div>` : ""}
    <div class="d-actions">
      <button class="btn-outline ${liked.has(String(s.id)) ? "on" : ""}" data-like="${esc(s.id)}" type="button">♥ ${esc(t("like"))} (${s.likes})</button>
      <button class="btn-outline" data-share="${esc(s.id)}" type="button">${esc(t("share"))}</button>
    </div>`;
  if (!els.storyDialog.open) els.storyDialog.showModal();
  els.storyDialog.scrollTop = 0;
}

async function toggleLike(id) {
  const s = stories.find(x => String(x.id) === String(id));
  if (!s) return;
  const key = String(s.id), was = liked.has(key), delta = was ? -1 : 1;
  was ? liked.delete(key) : liked.add(key);
  s.likes = Math.max(0, s.likes + delta);
  store.set("fr-liked", [...liked]);
  openStory(id); renderStories(); renderSections();
  try { if (db) await db.rpc("increment_likes", { p_id: s.id, p_delta: delta }); } catch {}
}

async function shareStory(id) {
  const s = stories.find(x => String(x.id) === String(id));
  if (!s) return;
  const url = location.href.split("#")[0];
  try {
    if (navigator.share) await navigator.share({ title: s.title, text: s.summary || "", url });
    else { await navigator.clipboard.writeText(url); alert(t("copied")); }
  } catch {}
}

// ---------- menu ----------
function setMenu(open) {
  document.body.classList.toggle("menu-open", open);
  document.body.classList.toggle("lock", open);
  els.menuBtn.setAttribute("aria-expanded", String(open));
  els.overlay.setAttribute("aria-hidden", String(!open));
}

// ---------- search ----------
function runSearch() {
  const q = els.searchInput.value.trim().toLowerCase();
  if (!q) { els.searchResults.innerHTML = ""; return; }
  const hits = stories.filter(s => [s.title, s.summary, s.genre, s.meta].join(" ").toLowerCase().includes(q)).slice(0, 12);
  els.searchResults.innerHTML = hits.map(s => `<button type="button" data-open="${esc(s.id)}">${esc(s.title)}<small>${esc(s.genre)} • ${esc(s.meta || "")}</small></button>`).join("") || `<p class="empty">${esc(t("no_stories"))}</p>`;
}

// ---------- events ----------
document.addEventListener("click", e => {
  if (e.target.closest("[data-close]")) setMenu(false);

  const open = e.target.closest("[data-open]");
  if (open) { els.searchDialog.open && els.searchDialog.close(); openStory(open.dataset.open); return; }

  const like = e.target.closest("[data-like]"); if (like) { toggleLike(like.dataset.like); return; }
  const share = e.target.closest("[data-share]"); if (share) { shareStory(share.dataset.share); return; }

  const g = e.target.closest("[data-genre]");
  if (g) { genre = g.dataset.genre; renderTabs(); renderStories(); return; }

  const lg = e.target.closest("[data-lang]");
  if (lg) { lang = lg.dataset.lang; store.set("fr-lang", lang); applyLang(); render(); return; }

  const r = e.target.closest("[data-route]");
  if (r) { route = r.dataset.route; genre = "All"; render(); }
});

els.menuBtn.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });
els.sort.addEventListener("change", () => { sort = els.sort.value; renderStories(); });

$("#openSearch").addEventListener("click", () => { els.searchDialog.showModal(); els.searchInput.focus(); });
$("#closeSearch").addEventListener("click", () => els.searchDialog.close());
$("#closeStory").addEventListener("click", () => els.storyDialog.close());
$("#closeAccount").addEventListener("click", () => els.accountDialog.close());
els.searchInput.addEventListener("input", runSearch);
[els.storyDialog, els.accountDialog, els.searchDialog].forEach(d => d.addEventListener("click", e => { if (e.target === d) d.close(); }));

els.accountBtn.addEventListener("click", () => {
  if (user) { $("#userName").value = user.name; $("#userEmail").value = user.email; $("#userBio").value = user.bio || ""; }
  els.accountDialog.showModal();
});
$("#accountForm").addEventListener("submit", e => {
  e.preventDefault();
  user = { name: $("#userName").value.trim(), email: $("#userEmail").value.trim(), bio: $("#userBio").value.trim() };
  store.set("fr-user", user); els.accountDialog.close(); renderProfile();
});

// newsletter
$("#newsletterForm").addEventListener("submit", async e => {
  e.preventDefault();
  const msg = $("#nlMsg"), email = $("#nlEmail").value.trim();
  msg.className = "form-msg";
  if ($("#nlHoney").value) return; // bot
  if (!/^\S+@\S+\.\S+$/.test(email) || !$("#nlConsent").checked) { msg.textContent = t("nl_bad"); msg.classList.add("err"); return; }
  try {
    if (!db) throw new Error("offline");
    const { error } = await db.from("subscribers").insert([{ email }]);
    if (error && error.code === "23505") { msg.textContent = t("nl_dup"); return; }
    if (error) throw error;
    msg.textContent = t("nl_ok"); msg.classList.add("ok"); e.target.reset();
  } catch { msg.textContent = t("nl_err"); msg.classList.add("err"); }
});

// header hide/show on scroll
let lastY = 0;
window.addEventListener("scroll", () => {
  const y = window.scrollY;
  els.header.classList.toggle("scrolled", y > 40);
  els.header.classList.toggle("hide", y > lastY && y > 200 && !document.body.classList.contains("menu-open"));
  lastY = y;
}, { passive: true });

// ---------- init ----------
(async function init() {
  applyLang();
  observeReveal();
  await loadStories();
  render();
})();
})();