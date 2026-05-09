document.addEventListener("DOMContentLoaded", () => {
  (async function init() {
    try {
      if (typeof window.Auth === 'undefined' || typeof window.Auth.ensureInit !== 'function') {
        const candidates = [
          'js/auth.js',
          './js/auth.js',
          '../js/auth.js',
          '/URDS_PROJECT/URDS/public/js/auth.js',
          '/URDS_PROJECT/public/js/auth.js',
          '/js/auth.js'
        ];
        let loaded = false;
        for (const scriptUrl of candidates) {
          console.warn('Auth helper not present; attempting dynamic load:', scriptUrl);
          const ok = await new Promise((resolve) => {
            let resolved = false;
            const s = document.createElement('script');
            s.src = scriptUrl;
            s.onload = () => { resolved = true; console.debug('auth.js loaded dynamically', scriptUrl); resolve(true); };
            s.onerror = () => { resolved = true; console.warn('Failed to load auth.js', scriptUrl); resolve(false); };
            document.head.appendChild(s);
            setTimeout(() => { if (!resolved) { console.warn('Timed out loading', scriptUrl); resolve(false); } }, 2000);
          });
          if (ok) { loaded = true; break; }
        }

        if (loaded) {
          try { await window.Auth?.ensureInit?.(); } catch (e) { console.warn('Auth.ensureInit after dynamic load threw', e); }
        }
      } else {
        try {
          await window.Auth.ensureInit();
        } catch (e) {
          console.warn('Auth.ensureInit threw', e);
        }
      }

      // Try to get profile, ensuring we've waited for ensureInit above when possible
      let pr = null;
      try {
        pr = window.Auth?.getProfile?.();
        if (!pr && window.Auth?.ensureInit) {
          await window.Auth.ensureInit();
          pr = window.Auth.getProfile?.();
        }
      } catch (e) {
        console.warn('Error obtaining profile from Auth', e);
        pr = null;
      }
      if (!pr) {
        alert('Access denied: please log in.');
        window.location.href = 'login.html';
        return;
      }
      const role = pr.role || localStorage.getItem('userRole') || '';
      if (!["URDS Director", "Director", "URDS"].includes(role)) {
        alert('Access denied: only the Director can access this page.');
        window.location.href = 'index.html';
        return;
      }
      if (pr.fullName) localStorage.setItem('userName', pr.fullName);
    } catch (e) {
      console.error('Auth error', e);
      alert('Unable to validate session.');
      window.location.href = 'login.html';
      return;
    }

    // -------------------------
    // Load proposal from backend
    // -------------------------
    const id = new URLSearchParams(location.search).get("id") || localStorage.getItem("viewProposalId") || "";
    const proposalInfo = document.getElementById("proposalInfo");
    let studiesSummary = document.getElementById("studiesSummary");
    const feedbackMessage = document.getElementById("feedbackMessage");
    const proposalHistory = document.getElementById("proposalHistory");

    // Ensure `studiesSummary` exists (some pages use proposalInfo only)
    if (!studiesSummary) {
      studiesSummary = document.createElement('div');
      studiesSummary.id = 'studiesSummary';
      // insert after proposalInfo if available, otherwise append to left column
      if (proposalInfo && proposalInfo.parentNode) {
        if (proposalHistory && proposalHistory.parentNode === proposalInfo.parentNode) {
          proposalInfo.parentNode.insertBefore(studiesSummary, proposalHistory);
        } else {
          proposalInfo.parentNode.appendChild(studiesSummary);
        }
      } else {
        document.body.appendChild(studiesSummary);
      }
    }

    if (!id) {
      proposalInfo.innerHTML = `<div class="bg-white p-5 rounded-2xl border shadow-card text-red-600 font-semibold">Proposal not found.</div>`;
      return;
    }

    let proposal = null;
    (async function loadProposal() {
      try {
        const resp = await fetch(`../../backend/get_proposal.php?id=${encodeURIComponent(id)}`, { credentials: 'include' });
        const ct = resp.headers.get('content-type') || '';
        const text = await resp.text();
        // If not OK, show response for debugging
        if (!resp.ok) {
          console.error('get_proposal.php returned non-OK', resp.status, text);
          proposalInfo.innerHTML = `<div class='bg-white p-5 rounded-2xl border shadow-card text-red-600 font-semibold'>Error loading proposal (status ${resp.status}).</div>`;
          return;
        }

        // Try parse JSON
        let data = null;
        try { data = JSON.parse(text); } catch (e) {
          console.error('get_proposal.php returned non-JSON', text);
          proposalInfo.innerHTML = `<div class='bg-white p-5 rounded-2xl border shadow-card text-red-600 font-semibold'>Error loading proposal (invalid response).</div>`;
          return;
        }

        if (data.status !== 'success' || !data.proposal) {
          console.warn('get_proposal.php returned error', data);
          proposalInfo.innerHTML = `<div class='bg-white p-5 rounded-2xl border shadow-card text-red-600 font-semibold'>Proposal not found: ${data.message || ''}</div>`;
          return;
        }

        proposal = data.proposal;
        if (!Array.isArray(proposal.history)) proposal.history = [];
        renderProposalHeader(proposal);
        renderStudies(proposal);
        renderProposalHistory();
        document.getElementById("directorSave").addEventListener("click", () => saveDirector(false));
        document.getElementById("directorSubmit").addEventListener("click", () => saveDirector(true));
      } catch (err) {
        console.error('Failed to fetch proposal', err);
        proposalInfo.innerHTML = `<div class='bg-white p-5 rounded-2xl border shadow-card text-red-600 font-semibold'>Error loading proposal.</div>`;
      }
    })();

    function saveDirector(submit = false) {
      const commentsEl = document.getElementById("directorComments");
      const decisionEl = document.getElementById("directorDecision");
      const comments = (commentsEl.value || "").trim();
      const decision = decisionEl.value;

      if (submit && !comments) {
        showToast && showToast("Please enter Director Comments before submitting.", 'error');
        return;
      }

      const review = {
        decision,
        comments,
        date: submit ? new Date().toISOString() : null
      };

      // Save draft locally
      try { localStorage.setItem(`directorDraft_${proposal.id}`, JSON.stringify(review)); } catch(e) {}

      fetch('../../backend/submit_director_review.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ proposal_id: proposal.id, review, submit })
      })
      .then(r => r.json())
      .then(data => {
        if (data.status === 'success') {
          showToast && showToast(submit ? 'Director decision submitted.' : 'Draft saved.', 'success');
          if (Array.isArray(data.history)) {
            proposal.history = data.history;
          }
          if (data.updatedStatus) proposal.status = data.updatedStatus;
          renderProposalHeader(proposal);
          renderProposalHistory();
          if (submit) {
            try { localStorage.setItem('recentlyUpdatedProposal', JSON.stringify({ id: proposal.id, status: data.updatedStatus || proposal.status })); } catch(e){}
            setTimeout(() => { window.location.href = 'proposal_list.html'; }, 700);
          }
        } else {
          showToast && showToast('Error: ' + (data.message || 'Could not save.'), 'error');
        }
      })
      .catch(() => showToast && showToast('Error: Could not connect to server.', 'error'));
    }

  // persistProposal removed; director saves are handled via backend and local draft storage

  function renderProposalHeader(p) {
    proposalInfo.innerHTML = `
      <div class="bg-white border p-5 rounded-2xl shadow-card space-y-3">
        <div class="text-xs text-gray-500">Submitted: ${esc(safeDate(p.dateSubmitted))}</div>
        <h2 class="text-xl font-semibold">${esc(p.title || "Untitled")}</h2>
        <div class="text-sm text-gray-700">
          Leader: ${esc(p.leader || p.studyLeader || p.researcher || "")}
          • ${esc(p.college || "")}${p.department ? " / " + esc(p.department) : ""}
        </div>
        <div class="text-sm text-gray-700">
          Cluster: ${esc(p.cluster || "")} • Nature: ${esc(p.nature || "")} 
          • Status: <strong>${esc(p.status || "")}</strong>
        </div>

        <div class="border-t pt-4">
          <div class="text-sm font-semibold mb-2">Required Viewing (TWG)</div>
          <div class="flex flex-wrap gap-2">
            <a class="px-3 py-2 bg-urds-900 text-white rounded-lg text-sm"
               href="proposal_preview.html?id=${encodeURIComponent(p.id)}">
              View Proposal Preview
            </a>
            <a class="px-3 py-2 bg-white border rounded-lg text-sm"
               href="capsule_print.html?id=${encodeURIComponent(p.id)}">
              View Capsule (FM-003)
            </a>
            <a class="px-3 py-2 bg-white border rounded-lg text-sm"
               href="workplan_print.html?id=${encodeURIComponent(p.id)}">
              View Workplan (FM-004)
            </a>
            <a class="px-3 py-2 bg-white border rounded-lg text-sm"
               href="budget_print.html?id=${encodeURIComponent(p.id)}">
              View Budget (FM-005)
            </a>
          </div>
        </div>
      </div>
    `;
  }

  function renderStudies(p) {
    const items = flattenStudies(p);

    if (!items.length) {
      if (studiesSummary) studiesSummary.innerHTML = '';
      return;
    }

    if (!studiesSummary) return;

    studiesSummary.innerHTML = items.map((x, i) => {
      const twg = getLatestReview(x.study, "twgReviews");
      const urec = getLatestReview(x.study, "urecReviews");

      return `
        <div class="bg-white p-4 rounded-xl border">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-sm text-gray-500">${esc(x.projectTitle)}</div>
              <div class="font-semibold">${esc(x.studyTitle)}</div>
              <div class="text-xs text-gray-600">Leader: ${esc(x.study.leader || "—")}</div>
              <div class="text-xs text-gray-600">Study Status: <strong>${esc(x.study.status || "—")}</strong></div>
            </div>
            <div class="text-xs bg-gray-50 border rounded px-3 py-2">
              <div class="text-gray-500">#</div>
              <div class="font-semibold">${i + 1}</div>
            </div>
          </div>

          <div class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div class="bg-gray-50 border rounded p-3">
              <div class="font-semibold mb-1">TWG</div>
              ${twg
                ? `<div><strong>Recommendation:</strong> ${esc(twg.recommendation || "—")}</div>
                   <div class="text-xs text-gray-600 mt-1">${esc(twg.comments || "")}</div>`
                : `<div class="text-gray-600">No TWG review yet.</div>`
              }
            </div>

            <div class="bg-gray-50 border rounded p-3">
              <div class="font-semibold mb-1">UREC</div>
              ${urec
                ? `<div><strong>Decision:</strong> ${esc(urec.decision || "—")}</div>
                   <div><strong>Risk:</strong> ${esc(urec.riskLevel || "—")}</div>
                   <div class="text-xs text-gray-600 mt-1">${esc(urec.notes || "")}</div>`
                : `<div class="text-gray-600">No UREC review yet.</div>`
              }
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  function flattenStudies(p) {
    const out = [];
    const projects = Array.isArray(p.projects) ? p.projects : [];
    projects.forEach((proj, pi) => {
      const projectTitle = proj.projectTitle || proj.title || `Project ${pi + 1}`;
      const studies = Array.isArray(proj.studies) ? proj.studies : [];
      studies.forEach((study, si) => {
        out.push({
          projectTitle,
          studyTitle: study.studyTitle || study.title || `Study ${si + 1}`,
          study
        });
      });
    });
    return out;
  }

  function getLatestReview(study, key) {
    const arr = Array.isArray(study?.[key]) ? study[key] : [];
    if (!arr.length) return null;
    // latest by submittedAt/reviewedAt/date
    return [...arr].sort((a, b) => new Date(b.submittedAt || b.reviewedAt || b.date || 0) - new Date(a.submittedAt || a.reviewedAt || a.date || 0))[0];
  }

  // Render proposal history (names and comments)
  function renderProposalHistory() {
    const histDiv = document.getElementById("proposalHistory");
    if (!proposal || !Array.isArray(proposal.history) || !histDiv) return;
    if (proposal.history.length === 0) {
      histDiv.innerHTML = '<div class="text-gray-400 text-sm">No history yet.</div>';
      return;
    }
    histDiv.innerHTML = proposal.history.map(h => `
      <div class="mb-2 p-3 rounded-lg border bg-gray-50">
        <div class="text-xs text-gray-500 mb-1">${esc(h.role || '')} ${h.user ? '— ' + esc(h.user) : ''} <span class="float-right">${esc(safeDate(h.date))}</span></div>
        <div class="text-sm font-medium">${esc(h.action || '')}</div>
        <div class="text-sm text-gray-700 whitespace-pre-line">${esc(h.comment || '')}</div>
      </div>
    `).join('');
  }

  // Simple toast notification
  function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toastContainer');
    if (!container) {
      console.warn('Toast:', message);
      return;
    }
    const colors = {
      info: 'bg-gray-800 text-white',
      success: 'bg-emerald-600 text-white',
      error: 'bg-red-600 text-white'
    };
    const el = document.createElement('div');
    el.className = `px-4 py-2 rounded shadow-md ${colors[type] || colors.info} max-w-xs break-words`;
    el.style.opacity = '0';
    el.style.transition = 'opacity 200ms ease';
    el.textContent = message;
    container.appendChild(el);
    requestAnimationFrame(() => el.style.opacity = '1');
    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 200);
    }, duration);
  }

  function lockForm() {
    const form = document.getElementById('directorForm');
    if (!form) return;
    form.querySelectorAll("input, textarea, select, button").forEach(el => {
      el.disabled = true;
      el.classList.add("opacity-75");
    });
  }

  function safeDate(d) {
    if (!d) return "—";
    try { return new Date(d).toLocaleString(); } catch { return String(d); }
  }

  function esc(s) {
    if (s === null || s === undefined) return "";
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
  })();
});
