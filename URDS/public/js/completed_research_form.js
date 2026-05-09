document.addEventListener("DOMContentLoaded", () => {
  const formEl = document.getElementById("completedResearchForm");
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

    setTimeout(() => {
      toast.remove();
    }, 2800);
  }

  function setValue(id, value) {
    const el = document.getElementById(id);
    if (el && value != null) el.value = value;
  }

  function getProposalIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id") || params.get("proposal_id") || params.get("edit") || "";
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
    setValue("researchers", p.leader || p.study_leader || "");
    setValue("projectLocation", p.location || p.project_location || "");

    if (p.duration || p.duration_months || p.durationMonths) {
      const months = p.durationMonths || p.duration_months || p.duration;
      const dur = Number.isFinite(Number(months)) ? `${months} months` : String(months);
      setValue("duration", dur);
    }

    setValue("totalAmount", p.estimatedBudget || p.estimated_budget || 0);

    setValue("rationale", p.rationale || "");
    setValue("objectives", p.objectives || "");
    setValue("literature", p.literature || "");
    setValue("methodology", p.methodology || "");

    // Common defaults that can still be edited manually
    if (!document.getElementById("designation")?.value) {
      setValue("designation", "Project Leader");
    }
    if (!document.getElementById("fundingAgency")?.value) {
      setValue("fundingAgency", "University of Eastern Philippines");
    }
    if (!document.getElementById("implementingAgency")?.value) {
      setValue("implementingAgency", "University of Eastern Philippines");
    }
  }

  async function fetchProposalById(proposalId) {
    const res = await fetch(`../../backend/get_proposal.php?id=${encodeURIComponent(proposalId)}`, {
      credentials: "include",
    });
    const data = await res.json();

    if (data.status !== "success" || !data.proposal) {
      throw new Error(data.message || "Unable to load proposal");
    }

    return data.proposal;
  }

  function getDraftKey(proposalId) {
    return `completed_research_draft_${proposalId || "new"}`;
  }

  function collectFormPayload() {
    return {
      updated_at: new Date().toISOString(),
      report_title: document.getElementById("reportTitle")?.value || "",
      researchers: document.getElementById("researchers")?.value || "",
      designation: document.getElementById("designation")?.value || "",
      funding_agency: document.getElementById("fundingAgency")?.value || "",
      implementing_agency: document.getElementById("implementingAgency")?.value || "",
      cooperating_agency: document.getElementById("cooperatingAgency")?.value || "",
      project_location: document.getElementById("projectLocation")?.value || "",
      duration: document.getElementById("duration")?.value || "",
      total_amount: document.getElementById("totalAmount")?.value || "",
      acknowledgement: document.getElementById("acknowledgement")?.value || "",
      abstract: document.getElementById("abstract")?.value || "",
      rationale: document.getElementById("rationale")?.value || "",
      objectives: document.getElementById("objectives")?.value || "",
      literature: document.getElementById("literature")?.value || "",
      methodology: document.getElementById("methodology")?.value || "",
      results_discussion: document.getElementById("resultsDiscussion")?.value || "",
      summary: document.getElementById("summary")?.value || "",
      conclusion: document.getElementById("conclusion")?.value || "",
      recommendation: document.getElementById("recommendation")?.value || "",
      literature_cited: document.getElementById("literatureCited")?.value || "",
      appendices: document.getElementById("appendices")?.value || "",
      documentation_notes: document.getElementById("documentationNotes")?.value || "",
    };
  }

  function loadDraft(proposalId) {
    const raw = localStorage.getItem(getDraftKey(proposalId || currentProposalId || "new"));
    if (!raw) return false;

    try {
      const d = JSON.parse(raw);
      setValue("reportTitle", d.report_title || "");
      setValue("researchers", d.researchers || "");
      setValue("designation", d.designation || "");
      setValue("fundingAgency", d.funding_agency || "");
      setValue("implementingAgency", d.implementing_agency || "");
      setValue("cooperatingAgency", d.cooperating_agency || "");
      setValue("projectLocation", d.project_location || "");
      setValue("duration", d.duration || "");
      setValue("totalAmount", d.total_amount || "");
      setValue("acknowledgement", d.acknowledgement || "");
      setValue("abstract", d.abstract || "");
      setValue("rationale", d.rationale || "");
      setValue("objectives", d.objectives || "");
      setValue("literature", d.literature || "");
      setValue("methodology", d.methodology || "");
      setValue("resultsDiscussion", d.results_discussion || "");
      setValue("summary", d.summary || "");
      setValue("conclusion", d.conclusion || "");
      setValue("recommendation", d.recommendation || "");
      setValue("literatureCited", d.literature_cited || "");
      setValue("appendices", d.appendices || "");
      setValue("documentationNotes", d.documentation_notes || "");
      return true;
    } catch (error) {
      console.warn("Failed to parse completed research draft", error);
      return false;
    }
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
      <label for="proposalSelect" class="block text-xs text-gray-600 mb-1">Choose a title to auto-fill this completed report</label>
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
    localStorage.setItem(getDraftKey(proposalId), JSON.stringify(collectFormPayload()));
    showToast("Completed research draft saved.");
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
    window.location.href = `completed_research_print.html?id=${encodeURIComponent(proposalId)}`;
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

  // Prevent accidental page reload submit.
  formEl?.addEventListener("submit", (e) => e.preventDefault());

  loadProposalContext();
});
