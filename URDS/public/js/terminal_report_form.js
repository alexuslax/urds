document.addEventListener("DOMContentLoaded", () => {
  const formEl = document.getElementById("terminalReportForm");
  const toastContainer = document.getElementById("toastContainer");
  const summaryEl = document.getElementById("proposalSummary");

  const saveDraftBtn = document.getElementById("saveDraftBtn");
  const resetDraftBtn = document.getElementById("resetDraftBtn");
  const previewBtn = document.getElementById("previewPrintBtn") || document.getElementById("previewBtn");
  const backBtn = document.getElementById("backBtn");

  let currentProposalId = "";

  function showToast(message, type = "success") {
    if (!toastContainer) return;

    const toast = document.createElement("div");
    const palette = type === "error"
      ? "bg-red-600 text-white"
      : "bg-urds-900 text-white";

    toast.className = `${palette} px-4 py-3 rounded-lg shadow-card text-sm`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => toast.remove(), 2800);
  }

  function setValue(id, value) {
    const el = document.getElementById(id);
    if (el && value != null) el.value = value;
  }

  function getProposalIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id") || params.get("proposal_id") || params.get("edit") || "";
  }

  function getDraftKey(proposalId) {
    return `terminal_report_${proposalId || "new"}`;
  }

  function renderSummary(data) {
    if (!summaryEl) return;

    const summaryTarget = document.getElementById("selectedProposalSummary") || summaryEl;

    const title = data.title || data.program_title || "Untitled Proposal";
    const nature = data.nature || "-";
    const cluster = data.cluster || data.research_cluster || "-";
    const status = data.status || "-";

    summaryTarget.innerHTML = `
      <h2 class="text-base font-semibold mb-3">Proposal Summary</h2>
      <div class="space-y-2 text-sm">
        <div><span class="text-gray-500">Title:</span> <span class="font-medium">${title}</span></div>
        <div><span class="text-gray-500">Nature:</span> ${nature}</div>
        <div><span class="text-gray-500">Cluster:</span> ${cluster}</div>
        <div><span class="text-gray-500">Status:</span> ${status}</div>
      </div>
    `;
  }

  function fillFormFromProposal(p) {
    setValue("reportTitle", p.title || p.program_title || "");
    setValue("leader", p.leader || p.study_leader || "");
    setValue("college", p.college || p.collegeName || "");
    setValue("location", p.location || p.project_location || "");

    if (p.duration || p.duration_months || p.durationMonths) {
      const months = p.durationMonths || p.duration_months || p.duration;
      const dur = Number.isFinite(Number(months)) ? `${months} months` : String(months);
      setValue("duration", dur);
    }

    setValue("objectives", p.objectives || "");
    setValue("results", p.methodology || "");
    setValue("impact", p.impact || "");
    setValue("outputs", p.expectedOutput || p.expected_output || "");
  }

  function collectPayload() {
    return {
      proposal_id: currentProposalId || getProposalIdFromUrl() || "",
      title: document.getElementById("reportTitle")?.value || "",
      leader: document.getElementById("leader")?.value || "",
      college: document.getElementById("college")?.value || "",
      location: document.getElementById("location")?.value || "",
      duration: document.getElementById("duration")?.value || "",
      objectives: document.getElementById("objectives")?.value || "",
      accomplishments: document.getElementById("accomplishments")?.value || "",
      results: document.getElementById("results")?.value || "",
      impact: document.getElementById("impact")?.value || "",
      outputs: document.getElementById("outputs")?.value || "",
      recommendations: document.getElementById("recommendations")?.value || "",
      updated_at: new Date().toISOString(),
    };
  }

  function loadDraft(proposalId) {
    const raw = localStorage.getItem(getDraftKey(proposalId || currentProposalId || "new"));
    if (!raw) return false;

    try {
      const d = JSON.parse(raw);
      setValue("reportTitle", d.title || "");
      setValue("leader", d.leader || "");
      setValue("college", d.college || "");
      setValue("location", d.location || "");
      setValue("duration", d.duration || "");
      setValue("objectives", d.objectives || "");
      setValue("accomplishments", d.accomplishments || "");
      setValue("results", d.results || "");
      setValue("impact", d.impact || "");
      setValue("outputs", d.outputs || "");
      setValue("recommendations", d.recommendations || "");
      return true;
    } catch (error) {
      console.warn("Failed to parse terminal report draft", error);
      return false;
    }
  }

  async function fetchProposalById(proposalId) {
    const response = await fetch(`../../backend/get_proposal.php?id=${encodeURIComponent(proposalId)}`, {
      credentials: "include",
    });
    const result = await response.json();

    if (result.status !== "success" || !result.proposal) {
      throw new Error(result.message || "Unable to load proposal");
    }

    return result.proposal;
  }

  async function onProposalSelected(proposalId) {
    if (!proposalId) return;

    currentProposalId = String(proposalId);

    try {
      const p = await fetchProposalById(proposalId);
      renderSummary(p);
      fillFormFromProposal(p);

      if (loadDraft(proposalId)) {
        showToast("Draft loaded for selected proposal.");
      } else {
        showToast("Proposal loaded.");
      }
    } catch (error) {
      const summaryTarget = document.getElementById("selectedProposalSummary") || summaryEl;
      if (summaryTarget) {
        summaryTarget.innerHTML = `<div class="text-sm text-red-600">Failed to load proposal: ${error.message}</div>`;
      }
    }
  }

  async function renderProposalDropdown() {
    if (!summaryEl) return;

    summaryEl.innerHTML = `
      <h2 class="text-base font-semibold mb-3">Select Proposal</h2>
      <label for="proposalSelect" class="block text-xs text-gray-600 mb-1">Choose a title to auto-fill this terminal report</label>
      <select id="proposalSelect" class="w-full border rounded-lg px-3 py-2 text-sm">
        <option value="">Loading proposals...</option>
      </select>
      <p class="text-xs text-gray-500 mt-2">You can switch to another proposal anytime.</p>
      <div id="selectedProposalSummary" class="mt-4 border-t pt-4 text-sm text-gray-500">Select a proposal to view details.</div>
    `;

    const proposalSelect = document.getElementById("proposalSelect");
    if (!proposalSelect) return;

    try {
      const endpoints = [
        "../../backend/get_my_proposals.php",
        "../../backend/get_all_proposals.php",
      ];

      let proposals = [];
      let lastError = "";

      for (const endpoint of endpoints) {
        try {
          const resp = await fetch(endpoint, { credentials: "include" });
          const result = await resp.json();

          if (result.status === "success" && Array.isArray(result.proposals)) {
            proposals = result.proposals;
            if (proposals.length > 0) break;
            lastError = "No proposals available for your account.";
            continue;
          }

          lastError = result.message || "Unable to load proposals.";
        } catch (err) {
          lastError = err.message || "Unable to load proposals.";
        }
      }

      proposalSelect.innerHTML = '<option value="">Select proposal title...</option>';

      if (!proposals.length) {
        proposalSelect.innerHTML = '<option value="">No proposal titles available</option>';
        const helper = document.createElement("p");
        helper.className = "text-xs text-red-600 mt-2";
        helper.textContent = `Reason: ${lastError || "No proposals found."}`;
        summaryEl.appendChild(helper);
        return;
      }

      proposals.forEach((proposal) => {
        const opt = document.createElement("option");
        opt.value = proposal.id;
        opt.textContent = proposal.title || `Proposal #${proposal.id}`;
        proposalSelect.appendChild(opt);
      });

      proposalSelect.addEventListener("change", async (e) => {
        await onProposalSelected(e.target.value);
      });
    } catch (error) {
      proposalSelect.innerHTML = '<option value="">Unable to load proposals</option>';
      showToast(`Failed to load proposal list: ${error.message}`, "error");
    }
  }

  async function loadProposalContext() {
    const proposalId = getProposalIdFromUrl();

    if (!proposalId) {
      await renderProposalDropdown();
      return;
    }

    currentProposalId = String(proposalId);

    try {
      const p = await fetchProposalById(proposalId);
      renderSummary(p);
      fillFormFromProposal(p);

      if (loadDraft(proposalId)) {
        showToast("Draft loaded.");
      }
    } catch (error) {
      if (summaryEl) {
        summaryEl.innerHTML = `<div class="text-sm text-red-600">Failed to load proposal: ${error.message}</div>`;
      }
    }
  }

  function saveDraft() {
    const proposalId = currentProposalId || getProposalIdFromUrl() || "new";
    localStorage.setItem(getDraftKey(proposalId), JSON.stringify(collectPayload()));
    showToast("Terminal report draft saved.");
  }

  function resetDraft() {
    const proposalId = currentProposalId || getProposalIdFromUrl() || "new";
    localStorage.removeItem(getDraftKey(proposalId));
    formEl?.reset();
    showToast("Draft reset.");
  }

  function previewPrint() {
    const proposalId = currentProposalId || getProposalIdFromUrl();
    if (!proposalId) {
      showToast("Please select a proposal first.", "error");
      return;
    }

    saveDraft();
    window.location.href = `terminal_report_print.html?id=${encodeURIComponent(proposalId)}`;
  }

  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.href = "my_proposals.html";
  }

  saveDraftBtn?.addEventListener("click", saveDraft);
  resetDraftBtn?.addEventListener("click", resetDraft);
  previewBtn?.addEventListener("click", previewPrint);
  backBtn?.addEventListener("click", goBack);

  formEl?.addEventListener("submit", (e) => e.preventDefault());

  loadProposalContext();
});
