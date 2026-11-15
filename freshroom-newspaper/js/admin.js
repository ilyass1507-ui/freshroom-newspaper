(() => {
'use strict';

const $ = id => document.getElementById(id);
const els = {
  gate: $('adminGate'), panel: $('adminPanel'), loginForm: $('adminLoginForm'),
  email: $('adminEmail'), password: $('adminPassword'), loginMsg: $('loginMsg'),
  postForm: $('postForm'), postMsg: $('postMsg'), publishBtn: $('publishBtn'),
  list: $('adminList'), logout: $('logoutBtn')
};

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtDate = d => new Date(String(d).slice(0, 10) + 'T12:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const setMsg = (el, text, kind = '') => { el.textContent = text; el.className = 'msg ' + kind; };

function parseLinks(value) {
  return value.split('\n').map(l => l.trim()).filter(Boolean).map(line => {
    const [url, ...rest] = line.split('|').map(p => p.trim());
    return { url, label: rest.join(' | ') || url };
  }).filter(l => /^https?:\/\//i.test(l.url));
}

function showPanel(on) {
  els.gate.classList.toggle('hidden', on);
  els.panel.classList.toggle('hidden', !on);
  els.logout.classList.toggle('hidden', !on);
  if (on) loadStories();
}

// ---------- auth ----------
async function init() {
  if (!db) { setMsg(els.loginMsg, 'Supabase failed to load. Check your connection.', 'err'); return; }
  const { data } = await db.auth.getSession();
  showPanel(!!data.session);
  db.auth.onAuthStateChange((_e, session) => showPanel(!!session));
}

els.loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  if (!db) return;
  setMsg(els.loginMsg, 'Signing in…');
  const { error } = await db.auth.signInWithPassword({ email: els.email.value.trim(), password: els.password.value });
  if (error) { setMsg(els.loginMsg, 'Wrong email or password.', 'err'); return; }
  els.password.value = '';
  setMsg(els.loginMsg, '');
});

els.logout.addEventListener('click', async () => { await db.auth.signOut(); });

// ---------- stories ----------
async function loadStories() {
  const { data, error } = await db.from('stories').select('*').order('created_at', { ascending: false });
  if (error) { els.list.innerHTML = `<p class="msg err">Could not load stories: ${esc(error.message)}</p>`; return; }
  els.list.innerHTML = data.map(s => `
    <div class="row">
      <div>
        <strong>${esc(s.title)}</strong>
        <p>${esc(s.type)} • ${esc(s.genre)} • ${esc(fmtDate(s.date))} • ♥ ${s.likes || 0}</p>
      </div>
      <button class="danger" data-delete="${esc(s.id)}" data-image="${esc(s.image || '')}" type="button">Delete</button>
    </div>`).join('') || '<p class="msg">No stories yet.</p>';
}

async function uploadImage(file) {
  if (!file) return null;
  if (file.size > 8 * 1024 * 1024) throw new Error('Image is larger than 8 MB.');
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `stories/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await db.storage.from('story-images').upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return db.storage.from('story-images').getPublicUrl(path).data.publicUrl;
}

els.postForm.addEventListener('submit', async e => {
  e.preventDefault();
  els.publishBtn.disabled = true;
  setMsg(els.postMsg, 'Publishing…');
  try {
    const { data: sess } = await db.auth.getSession();
    if (!sess.session) throw new Error('Session expired. Please sign in again.');

    const image = await uploadImage($('postImage').files[0]);
    const story = {
      type: $('postType').value,
      genre: $('postGenre').value.trim(),
      title: $('postTitle').value.trim(),
      meta: $('postMeta').value.trim(),
      summary: $('postSummary').value.trim(),
      body: $('postBody').value.trim(),
      image,
      links: parseLinks($('postLinks').value),
      date: new Date().toISOString().slice(0, 10),
      event_date: $('postEventDate').value || null,
      likes: 0,
      shares: 0
    };
    const { error } = await db.from('stories').insert([story]);
    if (error) throw error;

    els.postForm.reset();
    setMsg(els.postMsg, 'Story published!', 'ok');
    loadStories();
  } catch (err) {
    console.error(err);
    setMsg(els.postMsg, 'Failed: ' + (err.message || 'unknown error'), 'err');
  } finally {
    els.publishBtn.disabled = false;
  }
});

document.addEventListener('click', async e => {
  const btn = e.target.closest('[data-delete]');
  if (!btn) return;
  if (!confirm('Delete this story permanently?')) return;
  const { error } = await db.from('stories').delete().eq('id', btn.dataset.delete);
  if (error) { alert('Failed to delete: ' + error.message); return; }
  // best-effort removal of the cover image
  const m = btn.dataset.image.match(/story-images\/(.+)$/);
  if (m) { try { await db.storage.from('story-images').remove([decodeURIComponent(m[1])]); } catch {} }
  loadStories();
});

init();
})();