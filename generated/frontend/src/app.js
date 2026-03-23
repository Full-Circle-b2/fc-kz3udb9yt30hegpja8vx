const config = window.__APP_CONFIG__ || {};
const apiBaseUrl = String(config.apiBaseUrl || "").replace(/\/$/, "");

const els = {
  form: document.querySelector("#item-form"),
  title: document.querySelector("#title-input"),
  details: document.querySelector("#details-input"),
  items: document.querySelector("#items"),
  runtimeStatus: document.querySelector("#runtime-status"),
  runtimeMeta: document.querySelector("#runtime-meta"),
};

async function api(path, init = {}) {
  if (!apiBaseUrl) throw new Error("FRONTEND_API_BASE_URL is not configured.");
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    ...init,
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(body?.message || body?.error || `Request failed with ${response.status}`);
  }
  return body;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderItems(items) {
  if (!items.length) {
    els.items.innerHTML = '<div class="empty">No items yet. Create one to verify the generated backend and database path.</div>';
    return;
  }

  els.items.innerHTML = items.map((item) => `
    <article class="item" data-id="${escapeHtml(item.id)}">
      <div class="item-header">
        <div>
          <span class="badge">${escapeHtml(item.status)}</span>
          <h3>${escapeHtml(item.title)}</h3>
        </div>
      </div>
      <p>${escapeHtml(item.details || "No details yet.")}</p>
      <div class="item-actions">
        <button class="ghost" data-action="toggle">Toggle status</button>
        <button class="ghost" data-action="delete">Delete</button>
      </div>
    </article>
  `).join("");
}

async function loadRuntime() {
  try {
    const version = await api("/api/version");
    els.runtimeStatus.textContent = "Connected";
    els.runtimeMeta.textContent = `Backend ${version.backendVersion} • Project ${version.projectId} • DB ${version.databaseConfigured ? "ready" : "missing"}`;
  } catch (error) {
    els.runtimeStatus.textContent = "Backend unavailable";
    els.runtimeMeta.textContent = error instanceof Error ? error.message : String(error);
  }
}

async function loadItems() {
  try {
    const payload = await api("/api/items");
    renderItems(payload.items || []);
  } catch (error) {
    els.items.innerHTML = `<div class="empty error">${escapeHtml(error instanceof Error ? error.message : String(error))}</div>`;
  }
}

els.form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = els.title.value.trim();
  const details = els.details.value.trim();
  if (!title) return;
  try {
    await api("/api/items", {
      method: "POST",
      body: JSON.stringify({ title, details }),
    });
    els.form.reset();
    await loadItems();
  } catch (error) {
    alert(error instanceof Error ? error.message : String(error));
  }
});

els.items?.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const article = button.closest("[data-id]");
  const id = article?.getAttribute("data-id");
  if (!id) return;

  try {
    if (button.dataset.action === "delete") {
      await api(`/api/items/${id}`, { method: "DELETE" });
    } else if (button.dataset.action === "toggle") {
      const currentStatus = article.querySelector(".badge")?.textContent === "done" ? "todo" : "done";
      await api(`/api/items/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: currentStatus }),
      });
    }
    await loadItems();
  } catch (error) {
    alert(error instanceof Error ? error.message : String(error));
  }
});

loadRuntime();
loadItems();
