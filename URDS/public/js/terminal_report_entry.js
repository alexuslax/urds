document.addEventListener("DOMContentLoaded", async () => {
  "use strict";

  const toastContainer = document.getElementById("toastContainer");
  const $ = (id) => document.getElementById(id);

  const proposalId =
    new URLSearchParams(window.location.search).get("id") ||
    localStorage.getItem("viewProposalId") ||
    "";

  const draftKey = `terminal_report_draft_${proposalId || "no_proposal"}`;

  if (proposalId) {
    localStorage.setItem("viewProposalId", proposalId);
  }

  function toast(message, type = "success") {
    if (!toastContainer) {
      alert(message);
      return;
    }

    const el = document.createElement("div");

    el.className =
      type === "error"
        ? "bg-red-600 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-semibold"
        : "bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-semibold";

    el.textContent = message;
    toastContainer.appendChild(el);

    setTimeout(() => el.remove(), 3000);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function setValue(id, value, fallback = "") {
    const el = $(id);
    if (!el) return;
    el.value = value ?? fallback;
  }

  function getValue(id) {
    return $(id)?.value?.trim() || "";
  }

  function getTitle(proposal) {
    return (
      proposal.title ||
      proposal.program_title ||
      proposal.proposal_title ||
      proposal.research_title ||
      "Untitled Research"
    );
  }

  function getLeader(proposal) {
    return (
      proposal.leader ||
      proposal.studyLeader ||
      proposal.study_leader ||
      proposal.researcher ||
      proposal.researcher_name ||
      proposal.proponent ||
      ""
    );
  }

  function renderProposalSummary(proposal) {
    const box = $("proposalSummary");
    if (!box) return;

    if (!proposal) {
      box.innerHTML = `
        <div class="text-sm text-gray-600">
          <div class="font-semibold text-gray-900">No proposal auto-loaded</div>
          <p class="mt-1">You can still fill out the terminal report manually.</p>
        </div>
      `;
      return;
    }

    box.innerHTML = `
      <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
        <div>
          <div class="text-xs text-gray-500">Selected Research</div>
          <h2 class="text-lg font-bold text-gray-900 mt-1">${escapeHtml(getTitle(proposal))}</h2>
          <p class="text-sm text-gray-600 mt-1">
            ${escapeHtml(getLeader(proposal) || "Researcher")} • ${escapeHtml(proposal.college || proposal.college_name || "College")}
          </p>
          <p class="text-xs text-gray-500 mt-1">
            Status: ${escapeHtml(proposal.status || "—")}
          </p>
        </div>

        <div class="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-bold w-fit">
          Terminal Report
        </div>
      </div>
    `;
  }

  function applyProposalData(proposal) {
    const title = getTitle(proposal);
    const leader = getLeader(proposal);

    setValue("studyProjectTitle", title);
    setValue("authorResearcher", leader);

    setValue("introduction", proposal.introduction || proposal.rationale || "");
    setValue("methodology", proposal.methodology || "");
    setValue("resultsDiscussion", proposal.results_discussion || proposal.resultsDiscussion || "");
    setValue("literatureCited", proposal.literature_cited || proposal.literatureCited || "");
  }

  async function loadProposal() {
    if (!proposalId) {
      renderProposalSummary(null);
      toast("No proposal ID found. You may still fill out the form manually.", "error");
      return;
    }

    try {
      const response = await fetch(`../../backend/get_proposal.php?id=${encodeURIComponent(proposalId)}`, {
        method: "GET",
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if ((result.status === "success" || result.success === true) && (result.proposal || result.data)) {
        const proposal = result.proposal || result.data;
        renderProposalSummary(proposal);
        applyProposalData(proposal);
        return;
      }

      throw new Error(result.message || "Failed to load proposal.");
    } catch (error) {
      console.error(error);
      renderProposalSummary(null);
      toast("Failed to load proposal. You may still fill out the form manually.", "error");
    }
  }

  function collectFormData() {
    return {
      proposal_id: proposalId,
      study_project_title: getValue("studyProjectTitle"),
      author_researcher: getValue("authorResearcher"),
      abstract: getValue("abstract"),
      keywords: getValue("keywords"),
      introduction: getValue("introduction"),
      methodology: getValue("methodology"),
      results_discussion: getValue("resultsDiscussion"),
      conclusions: getValue("conclusions"),
      acknowledgement: getValue("acknowledgement"),
      literature_cited: getValue("literatureCited"),
      saved_at: new Date().toISOString()
    };
  }

  function saveDraft() {
    localStorage.setItem(draftKey, JSON.stringify(collectFormData()));
    toast("Terminal report entry saved.");
  }

  function loadDraft() {
    const raw = localStorage.getItem(draftKey);
    if (!raw) return;

    try {
      const d = JSON.parse(raw);

      setValue("studyProjectTitle", d.study_project_title || "");
      setValue("authorResearcher", d.author_researcher || "");
      setValue("abstract", d.abstract || "");
      setValue("keywords", d.keywords || "");
      setValue("introduction", d.introduction || "");
      setValue("methodology", d.methodology || "");
      setValue("resultsDiscussion", d.results_discussion || "");
      setValue("conclusions", d.conclusions || "");
      setValue("acknowledgement", d.acknowledgement || "");
      setValue("literatureCited", d.literature_cited || "");

      toast("Saved terminal report entry loaded.");
    } catch (error) {
      console.warn("Failed to load terminal report draft:", error);
      toast("Failed to load saved terminal report entry.", "error");
    }
  }

  function validateBeforePreview() {
    const required = [
      ["studyProjectTitle", "Study / Project Title"],
      ["authorResearcher", "Author / Researcher"],
      ["abstract", "Abstract"],
      ["keywords", "Keywords"],
      ["introduction", "Introduction"],
      ["methodology", "Methodology"],
      ["resultsDiscussion", "Results and Discussion"],
      ["conclusions", "Conclusions"]
    ];

    document.querySelectorAll(".border-red-500").forEach((el) => {
      el.classList.remove("border-red-500", "bg-red-50");
    });

    for (const [id, label] of required) {
      const el = $(id);

      if (!getValue(id)) {
        el?.classList.add("border-red-500", "bg-red-50");
        el?.focus();
        toast(`Please complete: ${label}`, "error");
        return false;
      }
    }

    return true;
  }

  function openPreview() {
    if (!validateBeforePreview()) return;

    saveDraft();

    const url = proposalId
      ? `terminal_report_print.html?id=${encodeURIComponent(proposalId)}`
      : "terminal_report_print.html";

    window.open(url, "_blank");
  }

  function resetDraft() {
    if (!confirm("Clear the saved terminal report entry?")) return;

    localStorage.removeItem(draftKey);
    location.reload();
  }

  $("saveDraftBtn")?.addEventListener("click", saveDraft);
  $("saveDraftBtnBottom")?.addEventListener("click", saveDraft);

  $("previewPrintBtn")?.addEventListener("click", openPreview);
  $("previewPrintBtnBottom")?.addEventListener("click", openPreview);

  $("resetBtn")?.addEventListener("click", resetDraft);

  $("backBtn")?.addEventListener("click", () => {
    if (history.length > 1) {
      history.back();
    } else {
      window.location.href = "proposal_list.html";
    }
  });

  await loadProposal();
  loadDraft();
});