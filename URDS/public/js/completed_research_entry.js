document.addEventListener("DOMContentLoaded", async () => {
  "use strict";

  const toastContainer = document.getElementById("toastContainer");
  const $ = (id) => document.getElementById(id);

  const proposalId =
    new URLSearchParams(window.location.search).get("id") ||
    localStorage.getItem("viewProposalId") ||
    "";

  const draftKey = `completed_research_draft_${proposalId || "no_proposal"}`;

  let documentationFilesData = [];

  const documentationFilesInput = $("documentationFiles");
  const documentationFileList = $("documentationFileList");
  const clearDocumentationFiles = $("clearDocumentationFiles");

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

  function escapeAttr(value) {
    return escapeHtml(value).replaceAll('"', "&quot;");
  }

  function setValue(id, value, fallback = "") {
    const el = $(id);
    if (!el) return;
    el.value = value ?? fallback;
  }

  function getValue(id) {
    return $(id)?.value?.trim() || "";
  }

  function toNumber(value) {
    const number = Number(String(value || "").replace(/,/g, ""));
    return Number.isFinite(number) ? number : 0;
  }

  function formatBytes(bytes) {
    const size = Number(bytes || 0);

    if (size < 1024) return size + " B";
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";

    return (size / (1024 * 1024)).toFixed(1) + " MB";
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);

      reader.readAsDataURL(file);
    });
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

  function getDuration(proposal) {
    if (proposal.durationMonths || proposal.duration_months) {
      return `${proposal.durationMonths || proposal.duration_months} months`;
    }

    return proposal.duration || proposal.proposal_duration || "";
  }

  function getBudgetNumber(proposal) {
    const direct =
      proposal.approvedBudget ||
      proposal.approved_budget ||
      proposal.budgetTotal ||
      proposal.budget_total ||
      proposal.estimatedBudget ||
      proposal.estimated_budget ||
      "";

    return direct ? String(direct).replace(/,/g, "") : "";
  }

  function renderProposalSummary(proposal) {
    const box = $("proposalSummary");
    if (!box) return;

    if (!proposal) {
      box.innerHTML = `
        <div class="text-sm text-gray-600">
          <div class="font-semibold text-gray-900">No proposal auto-loaded</div>
          <p class="mt-1">You can still fill out the completed research entry manually.</p>
        </div>
      `;
      return;
    }

    box.innerHTML = `
      <h2 class="text-base font-semibold mb-3">Proposal Summary</h2>
      <div class="space-y-2 text-sm">
        <div><strong>Title:</strong> ${escapeHtml(getTitle(proposal))}</div>
        <div><strong>Nature:</strong> ${escapeHtml(proposal.nature || proposal.research_nature || "—")}</div>
        <div><strong>Leader:</strong> ${escapeHtml(getLeader(proposal) || "—")}</div>
        <div><strong>Status:</strong> ${escapeHtml(proposal.status || "—")}</div>
        <div><strong>Location:</strong> ${escapeHtml(proposal.location || proposal.project_location || "—")}</div>
      </div>
    `;
  }

  function applyProposalData(proposal) {
    const title = getTitle(proposal);
    const leader = getLeader(proposal);
    const budget = getBudgetNumber(proposal);

    setValue("programProjectTitle", title);
    setValue("studyTitle", title);
    setValue("reportTitle", title);

    setValue(
      "researchers",
      [leader, proposal.otherPersonnel || proposal.other_personnel]
        .filter(Boolean)
        .join(", ")
    );

    setValue("designation", "Faculty Researcher");
    setValue("fundingAgency", proposal.fundingAgency || proposal.funding_agency || "University of Eastern Philippines");
    setValue("implementingAgency", proposal.implementingAgency || proposal.implementing_agency || "University of Eastern Philippines");
    setValue("cooperatingAgency", proposal.cooperatingAgency || proposal.cooperating_agency || "");
    setValue("projectLocation", proposal.location || proposal.project_location || proposal.projectLocation || "");
    setValue("duration", getDuration(proposal));

    if (budget) {
      setValue("releaseMOOE", budget);
      setValue("totalAmount", budget);
      updateResearchTotal();
    }

    setValue("rationale", proposal.rationale || "");
    setValue("objectives", proposal.objectives || "");
    setValue("literature", proposal.literature || proposal.review_literature || "");
    setValue("methodology", proposal.methodology || "");
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

  function updateResearchTotal() {
    const total =
      toNumber(getValue("releasePS")) +
      toNumber(getValue("releaseMOOE")) +
      toNumber(getValue("releaseCO"));

    setValue("researchTotal", total > 0 ? total.toFixed(2) : "");
  }

  function createExpenditureRow(period = "", amount = "") {
    const expenditureRows = $("expenditureRows");
    if (!expenditureRows) return;

    const tr = document.createElement("tr");
    tr.className = "exp-row";

    tr.innerHTML = `
      <td class="border border-gray-200 px-2 py-2">
        <input
          type="text"
          class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm expenditure-period focus:outline-none focus:ring-2 focus:ring-urds-accent/30 focus:border-urds-accent"
          placeholder="Example: 2026 / Final Period"
          value="${escapeAttr(period)}"
        />
      </td>

      <td class="border border-gray-200 px-2 py-2">
        <input
          type="number"
          min="0"
          step="0.01"
          class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm expenditure-amount focus:outline-none focus:ring-2 focus:ring-urds-accent/30 focus:border-urds-accent"
          placeholder="0.00"
          value="${escapeAttr(amount)}"
        />
      </td>

      <td class="border border-gray-200 px-2 py-2 text-center">
        <button
          type="button"
          class="removeRow inline-flex items-center justify-center text-red-600 hover:text-red-700 text-xs w-8 h-8 rounded-lg hover:bg-red-50 transition"
        >
          ✕
        </button>
      </td>
    `;

    expenditureRows.appendChild(tr);
  }

  function getExpenditures() {
    return [...document.querySelectorAll(".exp-row")]
      .map((row) => ({
        period: row.querySelector(".expenditure-period")?.value?.trim() || "",
        amount: row.querySelector(".expenditure-amount")?.value?.trim() || ""
      }))
      .filter((item) => item.period || item.amount);
  }

  async function handleDocumentationFiles(event) {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    const maxSize = 2 * 1024 * 1024;
    const convertedFiles = [];

    for (const file of files) {
      if (file.size > maxSize) {
        toast(`${file.name} is too large. Maximum is 2 MB per file.`, "error");
        continue;
      }

      try {
        const dataUrl = await fileToDataUrl(file);

        convertedFiles.push({
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size,
          dataUrl,
          uploaded_at: new Date().toISOString()
        });
      } catch (error) {
        console.warn("Failed to read file:", file.name, error);
        toast(`Failed to read ${file.name}`, "error");
      }
    }

    documentationFilesData = documentationFilesData.concat(convertedFiles);
    renderDocumentationFiles();

    if (convertedFiles.length) {
      toast(`${convertedFiles.length} documentation file(s) added.`);
    }

    if (documentationFilesInput) {
      documentationFilesInput.value = "";
    }
  }

  function renderDocumentationFiles() {
    if (!documentationFileList) return;

    if (!documentationFilesData.length) {
      documentationFileList.innerHTML = `
        <div class="text-sm text-gray-500">
          No documentation files uploaded yet.
        </div>
      `;
      return;
    }

    documentationFileList.innerHTML = documentationFilesData
      .map((file, index) => {
        const isImage = String(file.type || "").startsWith("image/");

        return `
          <div class="flex items-center justify-between gap-3 p-3 bg-white border border-gray-200 rounded-xl">
            <div class="flex items-center gap-3 min-w-0">
              ${
                isImage
                  ? `<img src="${file.dataUrl}" alt="${escapeAttr(file.name)}" class="w-12 h-12 object-cover rounded-lg border border-gray-200">`
                  : `<div class="w-12 h-12 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">FILE</div>`
              }

              <div class="min-w-0">
                <div class="text-sm font-semibold text-gray-900 truncate">
                  ${escapeHtml(file.name)}
                </div>
                <div class="text-xs text-gray-500">
                  ${escapeHtml(file.type || "File")} • ${formatBytes(file.size)}
                </div>
              </div>
            </div>

            <button
              type="button"
              class="removeDocFile text-red-600 hover:text-red-700 text-xs font-bold px-2 py-1 rounded-lg hover:bg-red-50"
              data-index="${index}"
            >
              Remove
            </button>
          </div>
        `;
      })
      .join("");

    documentationFileList.querySelectorAll(".removeDocFile").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.index);
        documentationFilesData.splice(index, 1);
        renderDocumentationFiles();
        toast("Documentation file removed.");
      });
    });
  }

  function collectFormData() {
    return {
      proposal_id: proposalId,

      program_project_title: getValue("programProjectTitle") || getValue("reportTitle"),
      study_title: getValue("studyTitle") || getValue("reportTitle"),
      report_title: getValue("reportTitle"),

      researchers: getValue("researchers"),
      designation: getValue("designation"),
      funding_agency: getValue("fundingAgency"),
      implementing_agency: getValue("implementingAgency"),
      cooperating_agency: getValue("cooperatingAgency"),

      project_location: getValue("projectLocation"),
      duration: getValue("duration"),

      release_ps: getValue("releasePS"),
      release_mooe: getValue("releaseMOOE"),
      release_co: getValue("releaseCO"),
      research_total: getValue("researchTotal") || getValue("totalAmount"),
      total_amount: getValue("totalAmount") || getValue("researchTotal"),

      expenditures: getExpenditures(),

      acknowledgement: getValue("acknowledgement"),
      abstract: getValue("abstract") || getValue("abstractText"),

      rationale: getValue("rationale"),
      objectives: getValue("objectives"),
      literature: getValue("literature"),
      methodology: getValue("methodology"),
      results_discussion: getValue("resultsDiscussion"),

      summary: getValue("summary"),
      conclusion: getValue("conclusion"),
      recommendation: getValue("recommendation"),
      summary_conclusion:
        getValue("summaryConclusion") ||
        [getValue("summary"), getValue("conclusion"), getValue("recommendation")]
          .filter(Boolean)
          .join("\n\n"),

      literature_cited: getValue("literatureCited"),
      appendices: getValue("appendices"),

      documentation: getValue("documentation") || getValue("documentationNotes"),
      documentation_notes: getValue("documentationNotes") || getValue("documentation"),
      documentation_files: documentationFilesData,

      saved_at: new Date().toISOString()
    };
  }

  function saveDraft() {
    localStorage.setItem(draftKey, JSON.stringify(collectFormData()));
    toast("Completed Research entry saved.");
  }

  function loadDraft() {
    const raw = localStorage.getItem(draftKey);
    if (!raw) return;

    try {
      const d = JSON.parse(raw);

      setValue("programProjectTitle", d.program_project_title || d.report_title || "");
      setValue("studyTitle", d.study_title || d.report_title || "");
      setValue("reportTitle", d.report_title || d.study_title || d.program_project_title || "");

      setValue("researchers", d.researchers || "");
      setValue("designation", d.designation || "");
      setValue("fundingAgency", d.funding_agency || "");
      setValue("implementingAgency", d.implementing_agency || "");
      setValue("cooperatingAgency", d.cooperating_agency || "");
      setValue("projectLocation", d.project_location || "");
      setValue("duration", d.duration || "");

      setValue("releasePS", d.release_ps || "");
      setValue("releaseMOOE", d.release_mooe || "");
      setValue("releaseCO", d.release_co || "");
      setValue("researchTotal", d.research_total || "");
      setValue("totalAmount", d.total_amount || d.research_total || "");

      setValue("acknowledgement", d.acknowledgement || "");
      setValue("abstract", d.abstract || "");
      setValue("abstractText", d.abstract || "");

      setValue("rationale", d.rationale || "");
      setValue("objectives", d.objectives || "");
      setValue("literature", d.literature || "");
      setValue("methodology", d.methodology || "");
      setValue("resultsDiscussion", d.results_discussion || "");

      setValue("summary", d.summary || "");
      setValue("conclusion", d.conclusion || "");
      setValue("recommendation", d.recommendation || "");
      setValue("summaryConclusion", d.summary_conclusion || "");

      setValue("literatureCited", d.literature_cited || "");
      setValue("appendices", d.appendices || "");
      setValue("documentation", d.documentation || d.documentation_notes || "");
      setValue("documentationNotes", d.documentation_notes || d.documentation || "");

      const expenditureRows = $("expenditureRows");

      if (expenditureRows) {
        expenditureRows.innerHTML = "";

        if (Array.isArray(d.expenditures) && d.expenditures.length) {
          d.expenditures.forEach((item) => {
            createExpenditureRow(item.period || item.year || "", item.amount || item.total || "");
          });
        } else {
          createExpenditureRow();
        }
      }

      documentationFilesData = Array.isArray(d.documentation_files)
        ? d.documentation_files
        : [];

      renderDocumentationFiles();
      updateResearchTotal();

      toast("Saved draft loaded.");
    } catch (error) {
      console.warn("Failed to load completed research draft:", error);
      toast("Failed to load saved draft.", "error");
    }
  }

  function validateBeforePreview() {
    const required = [
      ["programProjectTitle", "Program / Project Title"],
      ["studyTitle", "Study Title"],
      ["researchers", "Researcher(s)"],
      ["duration", "Duration"],
      ["abstract", "Abstract"],
      ["resultsDiscussion", "Results and Discussion"]
    ];

    document.querySelectorAll(".border-red-500").forEach((el) => {
      el.classList.remove("border-red-500", "bg-red-50");
    });

    for (const [id, label] of required) {
      const el = $(id);
      const value = getValue(id);

      if (!value) {
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
      ? `completed_research_print.html?id=${encodeURIComponent(proposalId)}`
      : "completed_research_print.html";

    window.open(url, "_blank");
  }

  function resetDraft() {
    if (!confirm("Clear the saved completed research entry?")) return;

    localStorage.removeItem(draftKey);
    location.reload();
  }

  $("saveDraftBtn")?.addEventListener("click", saveDraft);
  $("saveDraftBtnBottom")?.addEventListener("click", saveDraft);

  $("previewBtn")?.addEventListener("click", openPreview);
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

  $("addExpenditureBtn")?.addEventListener("click", () => {
    createExpenditureRow();
  });

  $("expenditureRows")?.addEventListener("click", (event) => {
    const btn = event.target.closest(".removeRow");
    if (!btn) return;

    const rows = document.querySelectorAll(".exp-row");

    if (rows.length <= 1) {
      toast("At least one expenditure row is required.", "error");
      return;
    }

    btn.closest("tr")?.remove();
  });

  document.querySelectorAll(".budget-input").forEach((input) => {
    input.addEventListener("input", updateResearchTotal);
  });

  documentationFilesInput?.addEventListener("change", handleDocumentationFiles);

  clearDocumentationFiles?.addEventListener("click", () => {
    if (!documentationFilesData.length) {
      toast("No documentation files to clear.", "error");
      return;
    }

    if (!confirm("Remove all uploaded documentation files?")) return;

    documentationFilesData = [];

    if (documentationFilesInput) {
      documentationFilesInput.value = "";
    }

    renderDocumentationFiles();
    toast("Documentation files cleared.");
  });

  if (!$("expenditureRows")?.querySelector(".exp-row")) {
    createExpenditureRow();
  }

  await loadProposal();
  loadDraft();
  renderDocumentationFiles();
  updateResearchTotal();
});