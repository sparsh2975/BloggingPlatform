/* ──────────────────────────────────────────────
   Visitor Manager — Frontend Logic
   Communicates with Express backend via fetch()
────────────────────────────────────────────── */

const API = '';  // same origin — served by Express

// ─── DOM References ────────────────────────────
const form          = document.getElementById('add-form');
const nameInput     = document.getElementById('visitor-name');
const addBtn        = document.getElementById('add-btn');
const formError     = document.getElementById('form-error');
const visitorList   = document.getElementById('visitor-list');
const emptyState    = document.getElementById('empty-state');
const countEl       = document.getElementById('visitor-count');
const toastContainer= document.getElementById('toast-container');

// ─── Toast Notification ─────────────────────────
function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 420);
  }, duration);
}

// ─── Format Date ───────────────────────────────
function formatTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) +
    ' · ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// ─── Get Initials ──────────────────────────────
function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}


// ─── Render Visitor Cards ──────────────────────
function renderVisitors(visitors) {
  visitorList.innerHTML = '';

  if (visitors.length === 0) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  visitors.forEach(visitor => {
    const card = document.createElement('article');
    card.className = 'visitor-card';
    card.dataset.id = visitor.id;
    card.setAttribute('aria-label', `Visitor: ${visitor.name}`);

    card.innerHTML = `
      <div class="card-top">
        <div class="avatar" aria-hidden="true">${getInitials(visitor.name)}</div>
        <div class="card-info">
          <div class="visitor-name" title="${escapeHtml(visitor.name)}">${escapeHtml(visitor.name)}</div>
          <div class="visitor-id">ID #${visitor.id}</div>
        </div>
      </div>
      <div class="card-footer">
        <span class="check-in-time">⏰ ${formatTime(visitor.checkInTime)}</span>
        <button
          class="btn btn-danger"
          id="delete-btn-${visitor.id}"
          data-id="${visitor.id}"
          aria-label="Remove ${escapeHtml(visitor.name)}"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="14" height="14">
            <path d="M9 3h6l1 1h4v2H4V4h4L9 3zM5 7h14l-1 14H6L5 7zm5 2v9h1V9h-1zm3 0v9h1V9h-1z"/>
          </svg>
          Remove
        </button>
      </div>
    `;

    visitorList.appendChild(card);
  });

  // Attach delete listeners
  visitorList.querySelectorAll('.btn-danger').forEach(btn => {
    btn.addEventListener('click', () => deleteVisitor(btn.dataset.id));
  });
}

// ─── XSS-safe escape ───────────────────────────
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ─── Load All Visitors ─────────────────────────
async function loadVisitors() {
  try {
    const res = await fetch(`${API}/visitors`);
    if (!res.ok) throw new Error('Failed to load visitors');
    const data = await res.json();
    renderVisitors(data);
    countEl.textContent = data.length;
  } catch (err) {
    showToast('Could not load visitors. Is the server running?', 'error');
    console.error(err);
  }
}

// ─── Add Visitor ───────────────────────────────
async function addVisitor(name) {
  formError.textContent = '';
  addBtn.disabled = true;
  addBtn.textContent = 'Adding…';

  try {
    const res = await fetch(`${API}/visitors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();

    if (!res.ok) {
      formError.textContent = data.error || 'Something went wrong.';
      return;
    }

    nameInput.value = '';
    await loadVisitors();
    showToast(`✅ ${data.name} checked in!`, 'success');
  } catch (err) {
    formError.textContent = 'Network error. Please try again.';
    console.error(err);
  } finally {
    addBtn.disabled = false;
    addBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19 11H13V5a1 1 0 0 0-2 0v6H5a1 1 0 0 0 0 2h6v6a1 1 0 0 0 2 0v-6h6a1 1 0 0 0 0-2z"/>
      </svg>
      Add Visitor
    `;
  }
}

// ─── Delete Visitor ───────────────────────────
async function deleteVisitor(id) {
  const btn = document.getElementById(`delete-btn-${id}`);
  if (btn) {
    btn.disabled = true;
    btn.textContent = '…';
  }

  try {
    const res  = await fetch(`${API}/visitors/${id}`, { method: 'DELETE' });
    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || 'Delete failed.', 'error');
      return;
    }

    await loadVisitors();
    showToast(`🗑️ ${data.visitor?.name ?? 'Visitor'} removed.`, 'info');
  } catch (err) {
    showToast('Network error during delete.', 'error');
    console.error(err);
  }
}

// ─── Form Submit ───────────────────────────────
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();

  if (!name) {
    formError.textContent = 'Please enter a visitor name.';
    nameInput.focus();
    return;
  }

  addVisitor(name);
});

// ─── Clear error on input ─────────────────────
nameInput.addEventListener('input', () => {
  if (formError.textContent) formError.textContent = '';
});

// ─── Init ─────────────────────────────────────
loadVisitors();
