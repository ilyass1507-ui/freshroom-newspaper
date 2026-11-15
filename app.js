const STORAGE_KEY = "freshroom-state-v1";
const ADMIN_PASSWORD = "Freshroom2026!";
const genres = [
 "All", "Tech House", "House", "Melodic House", "Afro House", "Groove",
 "UK Garage", "Tropical House", "Deep House", "EDM", "Electro", "Techno"
];
const seedStories = [
{
id: "story-1", type: "music", genre: "Afro House",
title: "Afro House selectors are reshaping peak-time festival sets",
meta: "Global scene report",
summary: "A wave of percussion-led records is moving from beach clubs to massive festival stages, with DJs blending soulful vocals and rolling drums.",
body: "Afro House keeps widening its influence because it can feel intimate and enormous at the same time. Promoters are booking longer warmups, labels are signing more vocal-driven club tracks, and artists are building sets around rhythm instead of only drops. FRESHROOM will track the DJs, parties, records, and cities pushing this sound forward.",
date: "2026-05-08", likes: 144, shares: 73,
comments: [{ name: "Lina", text: "This sound is everywhere now. Need a Casablanca guide next.", rating: 5 }]
},
{
id: "story-2", type: "event", genre: "Tech House",
title: "Warehouse Pulse announces an all-night tech house session",
meta: "Marrakech - May 31",
summary: "The late-night party pairs local residents with a European guest lineup, focusing on bass-heavy tech house and stripped-back groove.",
body: "Warehouse Pulse is aiming for a raw club atmosphere: focused lights, a heavy sound system, and no long gaps between sets. The event team says capacity will be limited and the first release of tickets is expected to move quickly.",
date: "2026-05-06", likes: 108, shares: 91, comments: []
},
{
id: "story-3", type: "release", genre: "Melodic House",
title: "New release radar: synth lines, soft vocals, and sunset tension",
meta: "Freshroom release desk",
summary: "This week leans emotional, with melodic house producers choosing cleaner drums and spacious arrangements over maximal drops.",
body: "The strongest new melodic house records leave room for feeling. Instead of crowding the mix, producers are using patient chord progressions, delayed vocal cuts, and percussion that keeps the track moving without overpowering the hook.",
date: "2026-05-05", likes: 89, shares: 42,
comments: [{ name: "Nassim", text: "Add a weekly playlist section please.", rating: 4 }]
},
{
id: "story-4", type: "article", genre: "UK Garage",
title: "Why UK Garage keeps returning to dance floors with new energy",
meta: "Culture essay",
summary: "Speed, swing, and bass pressure make UK Garage feel fresh again for a generation raised on edits, blends, and fast club moments.",
body: "UK Garage has a special ability to sound classic without becoming frozen. Its swing lets DJs bridge R&B, house, breaks, and bass music. That flexibility is why younger producers keep finding new ways into the genre.",
date: "2026-05-03", likes: 72, shares: 39, comments: []
},
{
id: "story-5", type: "music", genre: "Techno",
title: "Hardgroove techno returns with funk in the machine",
meta: "Artist news",
summary: "A new class of DJs is bringing loop-driven, percussive techno back into rooms that want speed without losing soul.",
body: "Hardgroove works because it is functional and playful. The drums are strict, but the samples add personality. That combination is making it a favorite for DJs who want momentum and color inside the same set.",
date: "2026-05-02", likes: 66, shares: 58, comments: []
},
{
id: "story-6", type: "event", genre: "Deep House",
title: "Sunday Room plans a deep house rooftop party",
meta: "Rabat - June 7",
summary: "The daytime gathering focuses on warm deep house, tropical edits, and a no-rush terrace experience.",
body: "Sunday Room is designed for dancers who want groove before volume. Expect warm keys, rolling basslines, and a lineup built around patience instead of pressure.",
date: "2026-05-01", likes: 53, shares: 44, comments: []
}
];

let state = loadState();
let currentRoute = "home";
let currentGenre = "All";

const els = {
accountButton: document.getElementById("accountButton"),
accountDialog: document.getElementById("accountDialog"),
accountForm: document.getElementById("accountForm"),
adminGate: document.getElementById("adminGate"),
adminList: document.getElementById("adminList"),
adminLogin: document.getElementById("adminLogin"),
adminPanel: document.getElementById("adminPanel"),
adminPassword: document.getElementById("adminPassword"),
adminView: document.getElementById("adminView"),
closeAccount: document.getElementById("closeAccount"),
closeSearch: document.getElementById("closeSearch"),
closeStory: document.getElementById("closeStory"),
eventList: document.getElementById("eventList"),
genreTabs: document.getElementById("genreTabs"),
miniProfile: document.getElementById("miniProfile"),
openSearch: document.getElementById("openSearch"),
postForm: document.getElementById("postForm"),
postImage: document.getElementById("postImage"),
routeLabel: document.getElementById("routeLabel"),
routeTitle: document.getElementById("routeTitle"),
savedStories: document.getElementById("savedStories"),
searchDialog: document.getElementById("searchDialog"),
searchInput: document.getElementById("searchInput"),
searchResults: document.getElementById("searchResults"),
sortSelect: document.getElementById("sortSelect"),
storyDetail: document.getElementById("storyDetail"),
storyDialog: document.getElementById("storyDialog"),
storyGrid: document.getElementById("storyGrid"),
tagCloud: document.getElementById("tagCloud")
};

function loadState() {
const saved = localStorage.getItem(STORAGE_KEY);
if (!saved) {
return { stories: seedStories, user: null, liked: [], saved: [], isAdmin: false };
}
return JSON.parse(saved);
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

function trendScore(story) { return story.likes * 2 + story.shares * 3 + story.comments.length * 10; }

function posterBackground(story) {
const palettes = {
event: "linear-gradient(135deg, #10101a, #6c2cff 45%, #ffe14d)",
music: "linear-gradient(135deg, #026b86, #00d9ff 45%, #10101a)",
release: "linear-gradient(135deg, #2b174f, #ffe14d 50%, #ffffff)",
article: "linear-gradient(135deg, #10101a, #ffffff 48%, #6c2cff)"
};
return palettes[story.type] || palettes.article;
}

function getFilteredStories() {
let stories = [...state.stories];
if (currentRoute === "music") stories = stories.filter((story) => ["music", "release"].includes(story.type));
if (currentRoute === "events") stories = stories.filter((story) => story.type === "event");
if (currentRoute === "articles") stories = stories.filter((story) => story.type === "article");
if (currentGenre !== "All") stories = stories.filter((story) => story.genre.toLowerCase() === currentGenre.toLowerCase());
const sort = els.sortSelect.value;
if (sort === "newest") stories.sort((a, b) => new Date(b.date) - new Date(a.date));
if (sort === "likes") stories.sort((a, b) => b.likes - a.likes);
if (sort === "shares") stories.sort((a, b) => b.shares - a.shares);
if (sort === "trending") stories.sort((a, b) => trendScore(b) - trendScore(a));
return stories;
}

function render() {
renderNavigation(); renderGenreTabs(); renderStories(); renderEvents(); renderTags(); renderProfile(); renderSavedStories(); renderAdmin();
}

function renderNavigation() {
document.querySelectorAll("[data-route]").forEach((link) => {
link.classList.toggle("active", link.dataset.route === currentRoute);
});
const titles = {
home: ["Freshroom Front Page", "Trending in the dance music industry"],
music: ["Music desk", "New releases, artist news, labels, and sounds"],
events: ["Event radar", "Club events, festivals, parties, and dance floors"],
articles: ["Culture articles", "Longer reads about the scenes behind the sound"],
admin: ["Publisher control room", "Admin dashboard"]
};
els.routeLabel.textContent = titles[currentRoute][0];
els.routeTitle.textContent = titles[currentRoute][1];
els.adminView.classList.toggle("hidden", currentRoute !== "admin");
document.querySelector(".content-grid").classList.toggle("hidden", currentRoute === "admin");
document.querySelector(".toolbar").classList.toggle("hidden", currentRoute === "admin");
}

function renderGenreTabs() {
els.genreTabs.innerHTML = genres.map((genre) => {
const active = genre === currentGenre ? "active" : "";
return `<button class="${active}" data-genre="${genre}">${genre}</button>`;
}).join("");
}

function renderStories() {
const stories = getFilteredStories();
if (!stories.length) {
els.storyGrid.innerHTML = `<p>No stories in this section yet. Use Admin to publish the first one.</p>`;
return;
}
els.storyGrid.innerHTML = stories.map((story, index) => {
const featured = currentRoute === "home" && index === 0 ? "featured" : "";
const liked = state.liked.includes(story.id) ? "liked" : "";
const saved = state.saved.includes(story.id) ? "saved" : "";
const poster = story.image
? `<div class="poster" style="--poster-bg: url('${story.image}') center / cover"><span>${story.genre}</span></div>`
: `<div class="poster" style="--poster-bg: ${posterBackground(story)}"><span>${story.genre}</span></div>`;
return `<article class="story-card ${featured}"> ${poster} <div class="story-body"> <div class="story-meta"> <span>${story.type.toUpperCase()}</span> <span>${story.meta}</span> <span>${formatDate(story.date)}</span> </div> <h3>${escapeHtml(story.title)}</h3> <p>${escapeHtml(story.summary)}</p> <div class="story-actions"> <button data-action="read" data-id="${story.id}">Read</button> <button class="${liked}" data-action="like" data-id="${story.id}">Like ${story.likes}</button> <button data-action="share" data-id="${story.id}">Share ${story.shares}</button> <button class="${saved}" data-action="save" data-id="${story.id}">Save</button> </div> </div> </article>`;
}).join("");
}

function renderEvents() {
const events = state.stories.filter((story) => story.type === "event").sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
els.eventList.innerHTML = events.map((event) => `<button class="event-item" data-action="read" data-id="${event.id}"> <strong>${escapeHtml(event.title)}</strong> <span>${escapeHtml(event.meta)} - ${event.genre}</span> </button>`).join("");
}

function renderTags() {
els.tagCloud.innerHTML = genres.slice(1).map((genre) => `<button data-genre="${genre}">${genre}</button>`).join("");
}

function renderProfile() {
if (!state.user) {
els.accountButton.textContent = "Join / Login";
els.miniProfile.innerHTML = `<h3>Your profile</h3> <p>Create an account to save stories, like posts, comment, review, and build your FRESHROOM bio.</p> <button class="primary-link" id="miniJoin">Create Account</button>`;
return;
}
els.accountButton.textContent = state.user.name;
els.miniProfile.innerHTML = `<h3>${escapeHtml(state.user.name)}</h3> <p>${escapeHtml(state.user.bio || "No bio yet.")}</p> <p><strong>${state.saved.length}</strong> saved stories - <strong>${state.liked.length}</strong> liked stories</p> <button class="secondary-link" id="miniJoin">Edit Profile</button>`;
}

function renderSavedStories() {
const stories = state.stories.filter((story) => state.saved.includes(story.id));
els.savedStories.innerHTML = stories.length ? stories.map((story) => `<button class="saved-card" data-action="read" data-id="${story.id}"> <strong>${escapeHtml(story.title)}</strong> <span>${story.genre} - ${story.type}</span> </button>`).join("") : "<p>No saved stories yet.</p>";
if (state.user) {
els.userName.value = state.user.name;
els.userEmail.value = state.user.email;
els.userBio.value = state.user.bio || "";
}
}

function renderAdmin() {
els.adminGate.classList.toggle("hidden", state.isAdmin);
els.adminPanel.classList.toggle("hidden", !state.isAdmin);
if (!state.isAdmin) return;
els.adminList.innerHTML = state.stories.map((story) => `<div class="admin-row"> <div> <strong>${escapeHtml(story.title)}</strong> <p>${story.type} - ${story.genre} - ${formatDate(story.date)}</p> </div> <button class="danger-button" data-action="delete" data-id="${story.id}">Delete</button> </div>`).join("");
}

function openStory(id) {
const story = state.stories.find((item) => item.id === id);
if (!story) return;
const comments = story.comments.length ? story.comments.map((comment) => `<div class="comment"> <strong>${escapeHtml(comment.name)} - ${"★".repeat(comment.rating)}${"☆".repeat(5 - comment.rating)}</strong> <p>${escapeHtml(comment.text)}</p> </div>`).join("") : "<p>No comments yet. Start the room.</p>";
const links = Array.isArray(story.links) && story.links.length
? `<div class="story-links"><h3>Links</h3>${story.links.map((link) => `<a href="${escapeAttribute(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)}</a>`).join("")}</div>`
: "";
const heroMedia = story.image
? `<img class="story-image" src="${story.image}" alt="${escapeAttribute(story.title)} cover picture" />`
: `<div class="poster" style="--poster-bg: ${posterBackground(story)}"><span>${story.genre}</span></div>`;
els.storyDetail.innerHTML = `${heroMedia} <div class="story-meta"> <span>${story.type.toUpperCase()}</span> <span>${story.meta}</span> <span>${formatDate(story.date)}</span> </div> <h2>${escapeHtml(story.title)}</h2> <p>${escapeHtml(story.body)}</p> ${links} <div class="story-actions"> <button data-action="like" data-id="${story.id}">Like ${story.likes}</button> <button data-action="share" data-id="${story.id}">Share ${story.shares}</button> <button data-action="save" data-id="${story.id}">Save</button> </div> <section class="comment-box"> <h3>Reviews and comments</h3> <form data-comment-form="${story.id}"> <label>Rating <select name="rating"> <option value="5">5 stars</option> <option value="4">4 stars</option> <option value="3">3 stars</option> <option value="2">2 stars</option> <option value="1">1 star</option> </select> </label> <label>Comment <textarea name="comment" rows="3" required placeholder="Share your reaction..."></textarea> </label> <button class="primary-link" type="submit">Post Review</button> </form> <div class="comment-list">${comments}</div> </section>`;
if (!els.storyDialog.open) { els.storyDialog.showModal(); }
}

function requireUser() { if (state.user) return true; els.accountDialog.showModal(); return false; }

function likeStory(id) {
if (!requireUser()) return;
if (state.liked.includes(id)) return;
const story = state.stories.find((item) => item.id === id);
if (!story) return;
story.likes += 1; state.liked.push(id); saveState(); render();
if (els.storyDialog.open) openStory(id);
}

function saveStory(id) {
if (!requireUser()) return;
state.saved = state.saved.includes(id) ? state.saved.filter((savedId) => savedId !== id) : [...state.saved, id];
saveState(); render();
}

async function shareStory(id) {
const story = state.stories.find((item) => item.id === id);
if (!story) return;
story.shares += 1; saveState(); render();
const shareText = `FRESHROOM: ${story.title}`;
if (navigator.share) { await navigator.share({ title: story.title, text: shareText, url: location.href }); }
else if (navigator.clipboard) { await navigator.clipboard.writeText(`${shareText} ${location.href}`); alert("Story link copied."); }
else { alert(shareText); }
}

function deleteStory(id) {
state.stories = state.stories.filter((story) => story.id !== id);
state.saved = state.saved.filter((savedId) => savedId !== id);
state.liked = state.liked.filter((likedId) => likedId !== id);
saveState(); render();
}

async function publishStory(event) {
event.preventDefault();
const image = await readImageFile(els.postImage.files[0]);
const story = {
id: `story-${Date.now()}`,
type: document.getElementById("postType").value,
genre: document.getElementById("postGenre").value.trim(),
title: document.getElementById("postTitle").value.trim(),
meta: document.getElementById("postMeta").value.trim(),
summary: document.getElementById("postSummary").value.trim(),
body: document.getElementById("postBody").value.trim(),
image, links: parseLinks(document.getElementById("postLinks").value),
date: new Date().toISOString().slice(0, 10), likes: 0, shares: 0, comments: []
};
state.stories.unshift(story); saveState(); els.postForm.reset(); render();
}

function postComment(event, storyId) {
event.preventDefault();
if (!requireUser()) return;
const story = state.stories.find((item) => item.id === storyId);
if (!story) return;
const data = new FormData(event.target);
story.comments.unshift({ name: state.user.name, text: data.get("comment"), rating: Number(data.get("rating")) });
saveState(); render(); openStory(storyId);
}

function runSearch() {
const query = els.searchInput.value.trim().toLowerCase();
const results = state.stories.filter((story) => {
return [story.title, story.summary, story.genre, story.meta, story.type].join(" ").toLowerCase().includes(query);
});
els.searchResults.innerHTML = query && results.length ? results.map((story) => `<button class="search-card" data-action="read" data-id="${story.id}"> <strong>${escapeHtml(story.title)}</strong> <span>${story.genre} - ${story.meta}</span> </button>`).join("") : "<p>Type a genre, artist, event, or release to search.</p>";
}

function handleGlobalClick(event) {
const actionTarget = event.target.closest("[data-action]");
const genreTarget = event.target.closest("[data-genre]");
const miniJoin = event.target.closest("#miniJoin");
if (miniJoin) els.accountDialog.showModal();
if (genreTarget) {
currentGenre = genreTarget.dataset.genre;
if (currentRoute === "admin") location.hash = "#home";
render();
}
if (!actionTarget) return;
const { action, id } = actionTarget.dataset;
if (action === "read") openStory(id);
if (action === "like") likeStory(id);
if (action === "share") shareStory(id);
if (action === "save") saveStory(id);
if (action === "delete" && state.isAdmin) deleteStory(id);
}

function handleRoute() {
const route = location.hash.replace("#", "") || "home";
currentRoute = ["home", "music", "events", "articles", "admin"].includes(route) ? route : "home";
currentGenre = "All";
render();
}

function readImageFile(file) {
if (!file) return Promise.resolve("");
return new Promise((resolve, reject) => {
const reader = new FileReader();
reader.onload = () => resolve(reader.result);
reader.onerror = reject;
reader.readAsDataURL(file);
});
}

function parseLinks(value) {
return value.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
const [url, label] = line.split("|").map((part) => part.trim());
return { url, label: label || url };
}).filter((link) => /^https?:\/\//i.test(link.url));
}

function formatDate(date) { return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }); }

function escapeHtml(value) {
return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function escapeAttribute(value) { return escapeHtml(value).replaceAll("`", "&#96;"); }

document.addEventListener("click", handleGlobalClick);
window.addEventListener("hashchange", handleRoute);
els.sortSelect.addEventListener("change", renderStories);
els.accountButton.addEventListener("click", () => els.accountDialog.showModal());
els.closeAccount.addEventListener("click", () => els.accountDialog.close());
els.closeStory.addEventListener("click", () => els.storyDialog.close());
els.openSearch.addEventListener("click", () => { els.searchDialog.showModal(); els.searchInput.focus(); runSearch(); });
els.closeSearch.addEventListener("click", () => els.searchDialog.close());
els.searchInput.addEventListener("input", runSearch);
els.adminLogin.addEventListener("click", () => {
if (els.adminPassword.value === ADMIN_PASSWORD) { state.isAdmin = true; saveState(); render(); } else { alert("Wrong admin password."); }
});
els.accountForm.addEventListener("submit", (event) => {
event.preventDefault();
state.user = { name: els.userName.value.trim(), email: els.userEmail.value.trim(), bio: els.userBio.value.trim() };
saveState(); els.accountDialog.close(); render();
});
els.postForm.addEventListener("submit", publishStory);
els.storyDetail.addEventListener("submit", (event) => {
const form = event.target.closest("[data-comment-form]");
if (!form) return;
postComment(event, form.dataset.commentForm);
});
handleRoute();