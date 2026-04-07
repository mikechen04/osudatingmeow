// root-level copy for static hosting (same as public/app.js)

const AVATAR_PLACEHOLDER = "https://files.catbox.moe/evvmvg.webp";

function qs(sel) {
  return document.querySelector(sel);
}

function setText(el, text) {
  if (!el) return;
  el.textContent = text == null ? "" : String(text);
}

function setHtml(el, html) {
  if (!el) return;
  el.innerHTML = html || "";
}

async function renderHomeShowcase() {
  const wrap = qs("[data-home-showcase]");
  const grid = qs("[data-home-showcase-grid]");
  if (!wrap || !grid) return;

  try {
    const res = await fetch("/api/featured", { credentials: "same-origin" });
    if (!res.ok) return;
    const data = await res.json();
    const users = data && Array.isArray(data.users) ? data.users : [];
    if (users.length === 0) return;

    wrap.hidden = false;

    const cards = users
      .map(u => {
        const rank = u.global_rank ? ` #${u.global_rank}` : "";
        const tags = [
          u.age ? `${u.age}+` : "",
          u.gender ? u.gender : "",
          u.country_code ? u.country_code : "",
        ]
          .filter(Boolean)
          .join(" · ");

        return `
          <a class="showcase-card" href="/browse" title="go browse">
            <img class="avatar smol" src="${u.avatar_url || AVATAR_PLACEHOLDER}" alt="" />
            <div class="showcase-name">${u.username}${rank}</div>
            <div class="muted showcase-tags">${tags}</div>
          </a>
        `;
      })
      .join("");

    grid.innerHTML = cards;
  } catch (e) {
    // ignore
  }
}

function renderBrowseStack() {
  const root = qs("[data-browse-root]");
  if (!root) return;

  const raw = root.getAttribute("data-users-json") || "[]";
  let users = [];
  try {
    users = JSON.parse(raw);
  } catch (e) {
    users = [];
  }

  const idxEl = qs("[data-browse-idx]");
  const totalEl = qs("[data-browse-total]");
  const prevBtn = qs("[data-browse-prev]");
  const nextBtn = qs("[data-browse-next]");

  const avatarEl = qs("[data-browse-avatar]");
  const nameEl = qs("[data-browse-name]");
  const tagsEl = qs("[data-browse-tags]");
  const bioEl = qs("[data-browse-bio]");
  const osuLinkEl = qs("[data-browse-osu-link]");
  const toUserIdEl = qs("[data-browse-to-user-id]");

  let idx = 0;

  function draw() {
    setText(totalEl, users.length);

    if (users.length === 0) {
      setText(idxEl, "0");
      setText(nameEl, "nobody here yet");
      if (avatarEl) avatarEl.src = AVATAR_PLACEHOLDER;
      setHtml(tagsEl, "");
      setText(bioEl, "tell ur friends to make a profile so u have ppl to browse");
      if (osuLinkEl) osuLinkEl.href = "#";
      if (toUserIdEl) toUserIdEl.value = "";
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;
      return;
    }

    if (idx < 0) idx = 0;
    if (idx > users.length - 1) idx = users.length - 1;

    const u = users[idx];

    setText(idxEl, idx + 1);
    setText(nameEl, u.username);
    if (avatarEl) avatarEl.src = u.avatar_url || AVATAR_PLACEHOLDER;

    const pieces = [];
    pieces.push(`<span class="tag">${u.age}+</span>`);
    if (u.gender) pieces.push(`<span class="tag">${u.gender}</span>`);
    if (u.country_code) pieces.push(`<span class="tag">${u.country_code}</span>`);
    setHtml(tagsEl, pieces.join(" "));

    setText(bioEl, u.bio);
    if (osuLinkEl) osuLinkEl.href = `https://osu.ppy.sh/users/${u.osu_id}`;
    if (toUserIdEl) toUserIdEl.value = u.id;

    if (prevBtn) prevBtn.disabled = idx === 0;
    if (nextBtn) nextBtn.disabled = idx === users.length - 1;
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      idx -= 1;
      draw();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      idx += 1;
      draw();
    });
  }

  draw();
}

document.addEventListener("DOMContentLoaded", () => {
  renderHomeShowcase();
  renderBrowseStack();
});

