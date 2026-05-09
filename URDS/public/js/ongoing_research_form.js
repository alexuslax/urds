document.addEventListener("DOMContentLoaded", () => {
  const toastContainer = document.getElementById("toastContainer");

  const $ = (id) => document.getElementById(id);

  const proposalId = new URLSearchParams(window.location.search).get("id") || "";
  const draftKey = `ongoing_research_draft_${proposalId}`;

  function toast(msg, type = "info") {
    if (!toastContainer) {
      alert(msg);
      return;
    }

    const el = document.createElement("div");
    el.className = "px-4 py-3 rounded-xl shadow bg-white border text-sm flex items-start gap-2";
    el.innerHTML = `
      <div class="mt-[2px] ${type === "error" ? "text-red-600" : "text-urds-accent"}">●</div>
      <div class="text-gray-800">${escapeHtml(msg)}</div>
    `;
    toastContainer.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }

  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function formatMoney(n) {
    const num = Number(n || 0);
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function setValue(id, value, fallback = "") {
    const el = $(id);
    if (!el) return;
    el.value = value ?? fallback;
  }

  function getValue(id) {
    return $(id)?.value?.trim() || "";
  }

  function computeReleaseTotal() {
    const ps = Number(getValue("releasePS") || 0);
    const mooe = Number(getValue("releaseMOOE") || 0);
    const co = Number(getValue("releaseCO") || 0);
    const total = ps + mooe + co;
    setValue("releaseTotal", formatMoney(total));
  }

  function renderProposalSummary(proposal) {
    const box = $("proposalSummary");
    if (!box) return;

    box.innerHTML = `
      <h2 class="text-base font-semibold mb-3">Proposal Summary</h2>
      <div class="space-y-2 text-sm">
        <div><strong>Title:</strong> ${escapeHtml(proposal.title || "—")}</div>
        <div><strong>Nature:</strong> ${escapeHtml(proposal.nature || "—")}</div>
        <div><strong>Leader:</strong> ${escapeHtml(proposal.leader || proposal.studyLeader || "—")}</div>
        <div><strong>Status:</strong> ${escapeHtml(proposal.status || "—")}</div>
        <div><strong>Location:</strong> ${escapeHtml(proposal.location || "—")}</div>
      </div>
    `;
  }

  function applyProposalData(proposal) {
    const leader = proposal.leader || proposal.studyLeader || proposal.researcher || "";
    const duration = proposal.durationMonths
      ? `${proposal.durationMonths} months`
      : (proposal.duration || "");

    setValue("reportTitle", proposal.title || "");
    setValue("researchers", [leader, proposal.otherPersonnel].filter(Boolean).join(", "));
    setValue("designation", "Faculty Researcher");
    setValue("implementingAgency", "University of Eastern Philippines");
    setValue("cooperatingAgency", proposal.cooperatingAgency || "");
    setValue("projectLocation", proposal.location || "");
    setValue("duration", duration);

    // If existing proposal fields available, prefill technical sections
    setValue("rationale", proposal.rationale || "");
    setValue("objectives", proposal.objectives || "");
    setValue("literature", proposal.literature || "");
    setValue("methodology", proposal.methodology || "");
  }

  function collectExpenditures() {
    return Array.from(document.querySelectorAll("#expenditureRows .exp-row")).map(row => ({
      period: row.querySelector(".expenditure-period")?.value?.trim() || "",
      amount: row.querySelector(".expenditure-amount")?.value?.trim() || ""
    }));
  }

  function renderExpenditures(items = []) {
    const tbody = $("expenditureRows");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!items.length) {
      items = [{ period: "", amount: "" }];
    }

    items.forEach(item => {
      const tr = document.createElement("tr");
      tr.className = "exp-row";
      tr.innerHTML = `
        <td class="border px-2 py-2">
          <input type="text" class="w-full px-2 py-1 border rounded expenditure-period"
            placeholder="e.g. 2026 / 1st Quarter" value="${escapeHtml(item.period || "")}">
        </td>
        <td class="border px-2 py-2">
          <input type="number" min="0" step="0.01"
            class="w-full px-2 py-1 border rounded expenditure-amount"
            placeholder="0.00" value="${escapeHtml(item.amount || "")}">
        </td>
        <td class="border px-2 py-2 text-center">
          <button type="button"
            class="removeRow text-red-500 hover:text-red-700 text-xs leading-none w-6 h-6 rounded hover:bg-red-50">
            ❌
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function collectFormData() {
    return {
      proposal_id: proposalId,
      report_title: getValue("reportTitle"),
      researchers: getValue("researchers"),
      designation: getValue("designation"),
      implementing_agency: getValue("implementingAgency"),
      cooperating_agency: getValue("cooperatingAgency"),
      project_location: getValue("projectLocation"),
      duration: getValue("duration"),

      release_ps: getValue("releasePS"),
      release_mooe: getValue("releaseMOOE"),
      release_co: getValue("releaseCO"),
      release_total: getValue("releaseTotal"),

      expenditures: collectExpenditures(),

      executive_summary: getValue("executiveSummary"),
      rationale: getValue("rationale"),
      objectives: getValue("objectives"),
      literature: getValue("literature"),
      methodology: getValue("methodology"),
      results_discussion: getValue("resultsDiscussion"),
      literature_cited: getValue("literatureCited")
    };
  }

  function saveDraft() {
    localStorage.setItem(draftKey, JSON.stringify(collectFormData()));
    toast("On-going Research draft saved.");
  }

  function loadDraft() {
    const raw = localStorage.getItem(draftKey);
    if (!raw) return;

    try {
      const d = JSON.parse(raw);

      setValue("reportTitle", d.report_title || "");
      setValue("researchers", d.researchers || "");
      setValue("designation", d.designation || "");
      setValue("implementingAgency", d.implementing_agency || "");
      setValue("cooperatingAgency", d.cooperating_agency || "");
      setValue("projectLocation", d.project_location || "");
      setValue("duration", d.duration || "");

      setValue("releasePS", d.release_ps || "");
      setValue("releaseMOOE", d.release_mooe || "");
      setValue("releaseCO", d.release_co || "");
      computeReleaseTotal();

      renderExpenditures(d.expenditures || []);

      setValue("executiveSummary", d.executive_summary || "");
      setValue("rationale", d.rationale || "");
      setValue("objectives", d.objectives || "");
      setValue("literature", d.literature || "");
      setValue("methodology", d.methodology || "");
      setValue("resultsDiscussion", d.results_discussion || "");
      setValue("literatureCited", d.literature_cited || "");

      toast("Draft loaded.");
    } catch (err) {
      console.warn("Failed to load ongoing research draft:", err);
    }
  }

  function validateBeforePreview() {
    const required = [
      ["reportTitle", "Program / Project / Study Title"],
      ["researchers", "Researcher(s)"],
      ["projectLocation", "Project Location"],
      ["duration", "Duration"],
      ["executiveSummary", "Executive Summary"],
      ["resultsDiscussion", "Results and Discussion"]
    ];

    for (const [id, label] of required) {
      const val = getValue(id);
      const el = $(id);
      if (!val) {
        el?.classList.add("border-red-500");
        el?.focus();
        toast(`Please complete: ${label}`, "error");
        return false;
      }
      el?.classList.remove("border-red-500");
    }

    return true;
  }

  function openPreview() {
    if (!validateBeforePreview()) return;
    saveDraft();
    window.open(`ongoing_research_print.html?id=${encodeURIComponent(proposalId)}`, "_blank");
  }

  function addExpenditureRow() {
    const items = collectExpenditures();
    items.push({ period: "", amount: "" });
    renderExpenditures(items);
  }

  async function loadProposal() {
    if (!proposalId) {
      toast("No proposal ID found in URL.", "error");
      return;
    }

    try {
      const response = await fetch(`../../backend/get_proposal.php?id=${encodeURIComponent(proposalId)}`, {
        method: "GET",
        credentials: "include"
      });

      const result = await response.json();

      if (result.status === "success" && result.proposal) {
        renderProposalSummary(result.proposal);
        applyProposalData(result.proposal);
      } else {
        toast(result.message || "Failed to load proposal.", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Failed to load proposal.", "error");
    }
  }

  // Events
  document.querySelectorAll(".release-input").forEach(input => {
    input.addEventListener("input", computeReleaseTotal);
  });

  $("addExpenditureBtn")?.addEventListener("click", addExpenditureRow);

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".removeRow");
    if (!btn) return;

    const rows = document.querySelectorAll("#expenditureRows .exp-row");
    if (rows.length <= 1) {
      toast("At least one expenditure row must remain.", "error");
      return;
    }

    btn.closest("tr")?.remove();
  });

  $("saveDraftBtn")?.addEventListener("click", saveDraft);
  $("previewBtn")?.addEventListener("click", openPreview);
  $("backBtn")?.addEventListener("click", () => history.back());

  // Init
  loadProposal().then(() => {
    loadDraft();
    computeReleaseTotal();
    if (!document.querySelector("#expenditureRows .exp-row")) {
      renderExpenditures();
    }
  });
});