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

function formatTheirPrefs(tp) {
  if (!tp) return "no preferences saved yet";

  let ageLine = "any age";
  if (tp.min_age != null && tp.max_age != null) ageLine = `ages ${tp.min_age}–${tp.max_age}`;
  else if (tp.min_age != null) ageLine = `ages ${tp.min_age}+`;
  else if (tp.max_age != null) ageLine = `up to age ${tp.max_age}`;

  let genderLine = "any gender";
  if (tp.genders && tp.genders.length) genderLine = tp.genders.join(", ");

  let rankLine = "any rank";
  if (tp.rank_max != null && typeof tp.rank_max === "number") rankLine = `#${tp.rank_max}+`;

  return `${ageLine} · ${genderLine} · ${rankLine}`;
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
        const badges = typeof u.badge_count === "number" ? ` · ${u.badge_count} badges` : "";
        const tags = [
          u.age ? `${u.age}+` : "",
          u.gender ? u.gender : "",
          u.country_code ? u.country_code : "",
          typeof u.badge_count === "number" ? `${u.badge_count} badges` : "",
        ]
          .filter(Boolean)
          .join(" · ");

        return `
          <a class="showcase-card${u.cute_tint ? " showcase-card-cute" : ""}" href="/browse" title="go browse">
            <img class="avatar smol" src="${u.avatar_url || AVATAR_PLACEHOLDER}" alt="" />
            <div class="showcase-name">${u.username}${rank}${badges}</div>
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
  const theirPrefsEl = qs("[data-browse-their-prefs]");

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
      if (theirPrefsEl) setText(theirPrefsEl, "");
      root.classList.remove("profile-card-cute");
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;
      return;
    }

    if (idx < 0) idx = 0;
    if (idx > users.length - 1) idx = users.length - 1;

    const u = users[idx];

    setText(idxEl, idx + 1);
    const rankText = u.global_rank ? ` (#${u.global_rank})` : "";
    const badgeText = typeof u.badge_count === "number" ? ` · ${u.badge_count} badges` : "";
    setText(nameEl, `${u.username}${rankText}${badgeText}`);
    if (avatarEl) avatarEl.src = u.avatar_url || AVATAR_PLACEHOLDER;

    const pieces = [];
    pieces.push(`<span class="tag">${u.age}+</span>`);
    if (u.gender) pieces.push(`<span class="tag">${u.gender}</span>`);
    if (u.country_code) pieces.push(`<span class="tag">${u.country_code}</span>`);
    if (typeof u.badge_count === "number") pieces.push(`<span class="tag">${u.badge_count} badges</span>`);
    setHtml(tagsEl, pieces.join(" "));

    setText(bioEl, u.bio);
    if (theirPrefsEl) setText(theirPrefsEl, formatTheirPrefs(u.their_prefs));
    if (u.cute_tint) root.classList.add("profile-card-cute");
    else root.classList.remove("profile-card-cute");
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
  // 18+ gate (only shows once)
  try {
    const ageBackdrop = qs("[data-age-backdrop]");
    const ageAgreeBtn = qs("[data-age-agree]");
    if (ageBackdrop && ageAgreeBtn) {
      const ok = localStorage.getItem("age_ok") === "1";
      if (!ok) {
        ageBackdrop.hidden = false;
        document.body.style.overflow = "hidden";
      }
      ageAgreeBtn.addEventListener("click", () => {
        localStorage.setItem("age_ok", "1");
        ageBackdrop.hidden = true;
        document.body.style.overflow = "";
      });
    }
  } catch (e) {
    // ignore
  }

  renderHomeShowcase();
  renderBrowseStack();
});

