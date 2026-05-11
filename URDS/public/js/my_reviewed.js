document.addEventListener('DOMContentLoaded', async () => {
  if (!window.Auth) return;
  const profile = await window.Auth.ensureInit();
  if (!profile) { window.location.href = 'login.html'; return; }

  // fetch reviewed proposals
  try {
    const resp = await fetch('../../backend/get_reviewed_proposals.php', { credentials: 'include' });
    const data = await resp.json();
    const container = document.getElementById('listContainer');
    if (data.status !== 'success') {
      container.innerHTML = `<div class="bg-white p-4 rounded border text-red-600">Failed to load reviewed proposals.</div>`;
      return;
    }
    const list = data.proposals || [];
    if (!list.length) {
      container.innerHTML = `<div class="bg-white p-4 rounded border text-gray-600">You have not reviewed any proposals yet.</div>`;
      return;
    }

    container.innerHTML = '';
    list.forEach(p => {
      const el = document.createElement('div');
      el.className = 'bg-white p-4 rounded border flex items-center justify-between';
      el.innerHTML = `
        <div>
          <div class="font-medium">${escapeHtml(p.title || 'Untitled')}</div>
          <div class="text-xs text-gray-500">Last reviewed: ${escapeHtml(p.last_reviewed_at || '')} — ${escapeHtml(p.last_action || '')}</div>
        </div>
        <div class="flex gap-2">
          <a class="px-3 py-2 bg-urds-900 text-white rounded-lg text-sm" href="urec_review.html?id=${encodeURIComponent(p.id)}">Open</a>
          <a class="px-3 py-2 bg-white border rounded-lg text-sm" href="proposal_preview.html?id=${encodeURIComponent(p.id)}">Preview</a>
        </div>
      `;
      container.appendChild(el);
    });
  } catch (e) {
    const container = document.getElementById('listContainer');
    container.innerHTML = `<div class="bg-white p-4 rounded border text-red-600">Error loading reviewed proposals.</div>`;
    console.error(e);
  }

  function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#039;");
  }
});