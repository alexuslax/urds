document.addEventListener("DOMContentLoaded", async () => {
  "use strict";

  // =========================================================
  // UEP-URDS Research Management System
  // Notice to Proceed Metadata Script
  // FM-006
  // =========================================================

  const toastContainer = document.getElementById("toastContainer");
  const form = document.getElementById("ntpForm");
  const proposalSummary = document.getElementById("proposalSummary");
  const backToProposalBtn = document.getElementById("backToProposalBtn");

  const saveDraftBtn = document.getElementById("saveDraftBtn");
  const resetDraftBtn = document.getElementById("resetDraftBtn");
  const previewPrintBtn = document.getElementById("previewPrintBtn");

  const proposalId =
    new URLSearchParams(window.location.search).get("id") ||
    localStorage.getItem("viewProposalId") ||
    "";

  const draftKey = `notice_to_proceed_draft_${proposalId || "no_proposal"}`;

  let currentProposal = null;
  let isLoading = false;

  const STATUS_META = {
    draft: {
      badge: "bg-gray-100 text-gray-700"
    },
    pending: {
      badge: "bg-yellow-100 text-yellow-800"
    },
    review: {
      badge: "bg-blue-100 text-blue-800"
    },
    returned: {
      badge: "bg-orange-100 text-orange-800"
    },
    approved: {
      badge: "bg-green-100 text-green-800"
    },
    ongoing: {
      badge: "bg-teal-100 text-teal-800"
    },
    rejected: {
      badge: "bg-red-100 text-red-800"
    }
  };

  // =========================================================
  // Initialization
  // =========================================================

  if (!proposalId) {
    showToast("No proposal ID found. Please open this page from the proposal list.", "error");
    renderNoProposal();
    disableForm(true);
    return;
  }

  localStorage.setItem("viewProposalId", proposalId);

  if (backToProposalBtn) {
    backToProposalBtn.href = `proposal_preview.html?id=${encodeURIComponent(proposalId)}`;
  }

  bindEvents();

  setLoadingState();
  await loadProposal();
  loadDraft();

  // =========================================================
  // Events
  // =========================================================

  function bindEvents() {
    saveDraftBtn?.addEventListener("click", saveDraft);
    resetDraftBtn?.addEventListener("click", resetDraft);
    previewPrintBtn?.addEventListener("click", openPrintPage);

    const startDate = $("startDate");
    const duration = $("proposalDuration");

    startDate?.addEventListener("change", suggestCompletionDate);
    duration?.addEventListener("input", suggestCompletionDate);
  }

  // =========================================================
  // Loading proposal
  // =========================================================

  async function loadProposal() {
    if (!proposalId || isLoading) return;

    isLoading = true;
    setButtonLoading(true);

    try {
      const response = await fetch(
        `../../backend/get_proposal.php?id=${encodeURIComponent(proposalId)}`,
        {
          method: "GET",
          credentials: "include"
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const text = await response.text();

      let result;
      try {
        result = JSON.parse(text);
      } catch (error) {
        console.error("Invalid JSON response:", text);
        throw new Error("Server returned an invalid JSON response.");
      }

      if (!(result.status === "success" || result.success === true)) {
        throw new Error(result.message || result.error || "Failed to load proposal.");
      }

      currentProposal = result.proposal || result.data || null;

      if (!currentProposal) {
        throw new Error("Proposal data was not found.");
      }

      applyProposalData(currentProposal);
      fillSummaryCard(currentProposal);
      applyDefaultDates(currentProposal);

      showToast("Proposal details loaded.");
    } catch (error) {
      console.error("Failed to load proposal:", error);
      renderError(`Failed to load proposal details. ${error.message}`);
      showToast(`Failed to load proposal: ${error.message}`, "error");
    } finally {
      isLoading = false;
      setButtonLoading(false);
    }
  }

  // =========================================================
  // Render proposal summary
  // =========================================================

  function fillSummaryCard(proposal) {
    if (!proposalSummary) return;

    const id = getProposalId(proposal);
    const title = getTitle(proposal);
    const nature = getNature(proposal);
    const leader = getLeader(proposal);
    const college = getCollege(proposal);
    const department = getDepartment(proposal);
    const status = getStatus(proposal);
    const submitted = formatDate(getDateSubmitted(proposal));
    const budget = getBudgetTotal(proposal);

    proposalSummary.innerHTML = `
      <div class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Proposal Summary</h2>
            <p class="text-xs text-gray-500 mt-0.5">
              Selected proposal for FM-006 Notice to Proceed.
            </p>
          </div>

          <div class="shrink-0">
            ${statusBadgeHtml(status)}
          </div>
        </div>

        <div class="space-y-2 text-sm">
          <div>
            <span class="text-gray-500">Title:</span>
            <div class="font-semibold text-gray-900 mt-0.5">${escapeHtml(title)}</div>
          </div>

          <div>
            <span class="text-gray-500">Nature:</span>
            <span class="font-medium">${escapeHtml(nature || "—")}</span>
          </div>

          <div>
            <span class="text-gray-500">Leader:</span>
            <span class="font-medium">${escapeHtml(leader || "—")}</span>
          </div>

          <div>
            <span class="text-gray-500">College / Department:</span>
            <span class="font-medium">
              ${escapeHtml(college || "—")}
              ${department ? " / " + escapeHtml(department) : ""}
            </span>
          </div>

          <div>
            <span class="text-gray-500">Approved / Estimated Budget:</span>
            <span class="font-medium">${escapeHtml(budget)}</span>
          </div>

          <div>
            <span class="text-gray-500">Submitted:</span>
            <span class="font-medium">${escapeHtml(submitted || "—")}</span>
          </div>
        </div>

        <div class="pt-3 border-t border-gray-200 flex flex-wrap gap-2">
          <a
            href="proposal_preview.html?id=${encodeURIComponent(id)}"
            class="inline-flex px-3 py-2 text-sm rounded-lg bg-urds-900 text-white font-bold hover:bg-urds-800 active:scale-95 transition"
          >
            Open Proposal Preview
          </a>

          <a
            href="proposal_list.html"
            class="inline-flex px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 font-bold hover:bg-gray-100 active:scale-95 transition"
          >
            Proposal List
          </a>
        </div>
      </div>
    `;
  }

  function renderNoProposal() {
    if (!proposalSummary) return;

    proposalSummary.innerHTML = `
      <div class="bg-white border border-red-200 p-6 rounded-2xl text-center">
        <div class="text-red-700 font-bold">No proposal selected</div>
        <p class="text-sm text-gray-600 mt-1">
          Please open Notice to Proceed from an approved proposal record.
        </p>
        <a
          href="proposal_list.html"
          class="inline-flex mt-4 px-4 py-2 rounded-xl bg-urds-900 text-white text-sm font-bold hover:bg-urds-800 transition"
        >
          Back to Proposal List
        </a>
      </div>
    `;
  }

  function renderError(message) {
    if (!proposalSummary) return;

    proposalSummary.innerHTML = `
      <div class="bg-white border border-red-200 p-5 rounded-2xl text-red-700 text-sm">
        ${escapeHtml(message)}
      </div>
    `;
  }

  function setLoadingState() {
    if (!proposalSummary) return;

    proposalSummary.innerHTML = `
      <div class="text-sm text-gray-500">
        Loading proposal...
      </div>
    `;
  }

  // =========================================================
  // Form data
  // =========================================================

  function applyProposalData(proposal) {
    const id = getProposalId(proposal);
    const nature = getNature(proposal);
    const title = getTitle(proposal);
    const leader = getLeader(proposal);
    const otherPersonnel = getOtherPersonnel(proposal);
    const college = getCollege(proposal);
    const department = getDepartment(proposal);
    const location = getProjectLocation(proposal);
    const duration = getDuration(proposal);
    const budget = getBudgetNumber(proposal);

    setValue("proposalId", id || proposalId);
    setValue("proposalNature", nature);
    setValue("proposalTitle", title);
    setValue("proponentName", leader);
    setValue("otherPersonnel", otherPersonnel);
    setValue("collegeName", college);
    setValue("departmentName", department);
    setValue("projectLocation", location);
    setValue("proposalDuration", duration);

    if (!getValue("approvedBudget") && budget !== "") {
      setValue("approvedBudget", budget);
    }

    if (!getValue("documentNo")) {
      setValue("documentNo", "UEP-URDS-FM-006");
    }

    if (!getValue("signatoryPosition")) {
      setValue("signatoryPosition", "Director, University Research and Development Services");
    }
  }

  function applyDefaultDates(proposal) {
    const today = new Date().toISOString().slice(0, 10);

    if (!getValue("letterDate")) {
      setValue("letterDate", today);
    }

    const approvedDate =
      proposal.dateApproved ||
      proposal.date_approved ||
      proposal.approved_at ||
      proposal.approvedAt ||
      proposal.updated_at ||
      proposal.updatedAt ||
      "";

    if (!getValue("approvalDate") && approvedDate) {
      setValue("approvalDate", formatDateForInput(approvedDate));
    }

    if (!getValue("startDate")) {
      setValue("startDate", today);
    }

    suggestCompletionDate();
  }

  function collectFormData() {
    return {
      proposal_id: proposalId,

      proposal_title: getValue("proposalTitle"),
      proposal_nature: getValue("proposalNature"),
      proponent_name: getValue("proponentName"),
      other_personnel: getValue("otherPersonnel"),
      college_name: getValue("collegeName"),
      department_name: getValue("departmentName"),
      project_location: getValue("projectLocation"),
      proposal_duration: getValue("proposalDuration"),

      document_no: getValue("documentNo"),
      letter_date: getValue("letterDate"),
      approval_date: getValue("approvalDate"),
      start_date: getValue("startDate"),
      completion_date: getValue("completionDate"),
      approved_budget: getValue("approvedBudget"),
      reference_no: getValue("referenceNo"),
      signatory_name: getValue("signatoryName"),
      signatory_position: getValue("signatoryPosition"),
      cc_list: getValue("ccList"),
      additional_note: getValue("additionalNote"),

      saved_at: new Date().toISOString()
    };
  }

  // =========================================================
  // Draft management
  // =========================================================

  function saveDraft() {
    if (!proposalId) {
      showToast("No proposal selected.", "error");
      return;
    }

    const payload = collectFormData();

    localStorage.setItem(draftKey, JSON.stringify(payload));
    showToast("Notice to Proceed draft saved.");
  }

  function loadDraft() {
    const raw = localStorage.getItem(draftKey);

    if (!raw) return;

    try {
      const draft = JSON.parse(raw);

      setValue("proposalTitle", draft.proposal_title);
      setValue("proposalNature", draft.proposal_nature);
      setValue("proponentName", draft.proponent_name);
      setValue("otherPersonnel", draft.other_personnel);
      setValue("collegeName", draft.college_name);
      setValue("departmentName", draft.department_name);
      setValue("projectLocation", draft.project_location);
      setValue("proposalDuration", draft.proposal_duration);

      setValue("documentNo", draft.document_no || "UEP-URDS-FM-006");
      setValue("letterDate", draft.letter_date);
      setValue("approvalDate", draft.approval_date);
      setValue("startDate", draft.start_date);
      setValue("completionDate", draft.completion_date);
      setValue("approvedBudget", draft.approved_budget);
      setValue("referenceNo", draft.reference_no);
      setValue("signatoryName", draft.signatory_name);
      setValue(
        "signatoryPosition",
        draft.signatory_position || "Director, University Research and Development Services"
      );
      setValue("ccList", draft.cc_list);
      setValue("additionalNote", draft.additional_note);

      showToast("Saved draft loaded.");
    } catch (error) {
      console.warn("Failed to load NTP draft:", error);
      showToast("Saved draft could not be loaded.", "error");
    }
  }

  function resetDraft() {
    if (!confirm("Clear the saved draft for this Notice to Proceed?")) return;

    localStorage.removeItem(draftKey);
    showToast("Draft cleared.");

    setTimeout(() => {
      window.location.reload();
    }, 500);
  }

  // =========================================================
  // Validation and print page
  // =========================================================

  function validateBeforePreview() {
    const requiredFields = [
      ["proposalTitle", "Research title"],
      ["proponentName", "Leader / Proponent"],
      ["letterDate", "Letter date"],
      ["approvalDate", "Approval / Meeting date"],
      ["startDate", "Effectivity / Start date"],
      ["completionDate", "Completion date"],
      ["approvedBudget", "Approved budget"],
      ["referenceNo", "Special Order / Board / Reference No."],
      ["signatoryName", "Signatory name"],
      ["signatoryPosition", "Signatory position"]
    ];

    clearValidationStyles();

    for (const [id, label] of requiredFields) {
      const value = getValue(id);
      const element = $(id);

      if (!value) {
        markInvalid(element);
        element?.focus();
        showToast(`Please complete: ${label}`, "error");
        return false;
      }
    }

    const start = safeDate(getValue("startDate"));
    const completion = safeDate(getValue("completionDate"));

    if (start && completion && completion < start) {
      markInvalid($("completionDate"));
      showToast("Completion date cannot be earlier than the start date.", "error");
      return false;
    }

    const budget = Number(getValue("approvedBudget"));

    if (!Number.isFinite(budget) || budget < 0) {
      markInvalid($("approvedBudget"));
      showToast("Approved budget must be a valid amount.", "error");
      return false;
    }

    return true;
  }

  function openPrintPage() {
    if (!validateBeforePreview()) return;

    const payload = collectFormData();

    localStorage.setItem(draftKey, JSON.stringify(payload));

    const params = new URLSearchParams({
      id: proposalId,
      source: "ntp"
    });

    window.open(`notice_to_proceed_print.html?${params.toString()}`, "_blank");
  }

  // =========================================================
  // Completion date helper
  // =========================================================

  function suggestCompletionDate() {
    const completionEl = $("completionDate");
    if (!completionEl || completionEl.value) return;

    const startDate = safeDate(getValue("startDate"));
    const durationText = getValue("proposalDuration");

    if (!startDate || !durationText) return;

    const months = extractMonths(durationText);

    if (!months) return;

    const completion = new Date(startDate);
    completion.setMonth(completion.getMonth() + months);

    completionEl.value = completion.toISOString().slice(0, 10);
  }

  function extractMonths(value) {
    const text = String(value || "").toLowerCase();

    const yearMatch = text.match(/(\d+(?:\.\d+)?)\s*year/);
    if (yearMatch) {
      return Math.round(Number(yearMatch[1]) * 12);
    }

    const monthMatch = text.match(/(\d+(?:\.\d+)?)\s*month/);
    if (monthMatch) {
      return Math.round(Number(monthMatch[1]));
    }

    const numberOnly = Number(text.replace(/[^\d.]/g, ""));
    return Number.isFinite(numberOnly) && numberOnly > 0 ? Math.round(numberOnly) : 0;
  }

  // =========================================================
  // Proposal helpers
  // =========================================================

  function getProposalId(proposal) {
    return (
      proposal?.id ||
      proposal?.proposal_id ||
      proposal?.proposalId ||
      proposal?.research_id ||
      proposal?.researchId ||
      proposalId ||
      ""
    );
  }

  function getTitle(proposal) {
    return (
      proposal?.title ||
      proposal?.program_title ||
      proposal?.proposal_title ||
      proposal?.research_title ||
      proposal?.project_title ||
      "Untitled Proposal"
    );
  }

  function getNature(proposal) {
    return (
      proposal?.nature ||
      proposal?.research_nature ||
      proposal?.proposal_nature ||
      ""
    );
  }

  function getLeader(proposal) {
    return (
      proposal?.leader ||
      proposal?.studyLeader ||
      proposal?.study_leader ||
      proposal?.researcher ||
      proposal?.researcher_name ||
      proposal?.proponent ||
      ""
    );
  }

  function getOtherPersonnel(proposal) {
    const direct =
      proposal?.otherPersonnel ||
      proposal?.other_personnel ||
      proposal?.team_members ||
      proposal?.members ||
      "";

    if (Array.isArray(direct)) {
      return direct
        .map((item) => {
          if (typeof item === "string") return item;
          return item.name || item.fullName || item.full_name || "";
        })
        .filter(Boolean)
        .join(", ");
    }

    return direct;
  }

  function getCollege(proposal) {
    return (
      proposal?.college ||
      proposal?.collegeName ||
      proposal?.college_name ||
      ""
    );
  }

  function getDepartment(proposal) {
    return (
      proposal?.department ||
      proposal?.departmentName ||
      proposal?.department_name ||
      proposal?.dept ||
      ""
    );
  }

  function getProjectLocation(proposal) {
    return (
      proposal?.location ||
      proposal?.project_location ||
      proposal?.projectLocation ||
      proposal?.site ||
      ""
    );
  }

  function getDuration(proposal) {
    if (proposal?.durationMonths || proposal?.duration_months) {
      return `${proposal.durationMonths || proposal.duration_months} months`;
    }

    return (
      proposal?.duration ||
      proposal?.proposal_duration ||
      ""
    );
  }

  function getStatus(proposal) {
    return (
      proposal?.status ||
      proposal?.proposal_status ||
      proposal?.current_status ||
      proposal?.currentStatus ||
      "Approved"
    );
  }

  function getDateSubmitted(proposal) {
    return (
      proposal?.dateSubmitted ||
      proposal?.date_submitted ||
      proposal?.submitted_at ||
      proposal?.created_at ||
      proposal?.createdAt ||
      ""
    );
  }

  function getBudgetNumber(proposal) {
    const direct =
      proposal?.approvedBudget ||
      proposal?.approved_budget ||
      proposal?.budgetTotal ||
      proposal?.budget_total ||
      proposal?.estimatedBudget ||
      proposal?.estimated_budget ||
      "";

    if (direct !== "") {
      return normalizeMoneyInput(direct);
    }

    const budget = parseMaybeJson(proposal?.budget);

    if (!budget || typeof budget !== "object") return "";

    const groups = [
      budget.personalServices,
      budget.personal_services,
      budget.mooe,
      budget.MOOE,
      budget.equipment,
      budget.equipment_items
    ];

    let total = 0;

    groups.forEach((group) => {
      if (Array.isArray(group)) {
        group.forEach((item) => {
          total += toNumber(item.year1) + toNumber(item.year2) + toNumber(item.year3);
        });
      }
    });

    return total > 0 ? String(total.toFixed(2)) : "";
  }

  function getBudgetTotal(proposal) {
    const amount = getBudgetNumber(proposal);

    if (amount === "") return "N/A";

    return `₱ ${money(amount)}`;
  }

  function parseMaybeJson(value) {
    if (!value) return value;

    if (typeof value !== "string") return value;

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  // =========================================================
  // Status badge
  // =========================================================

  function getStatusGroup(status) {
    const s = normalizeText(status);

    if (!s) return "approved";

    if (s.includes("reject") || s.includes("terminate") || s.includes("declined")) {
      return "rejected";
    }

    if (s.includes("return") || s.includes("revision") || s.includes("correction")) {
      return "returned";
    }

    if (s.includes("ongoing") || s.includes("implementation") || s.includes("monitoring")) {
      return "ongoing";
    }

    if (
      s.includes("approved") ||
      s.includes("approve") ||
      s.includes("special order") ||
      s.includes("notice to proceed") ||
      s.includes("ntp") ||
      s.includes("issued") ||
      s.includes("completed") ||
      s.includes("cleared")
    ) {
      return "approved";
    }

    if (
      s.includes("review") ||
      s.includes("evaluation") ||
      s.includes("screening") ||
      s.startsWith("for ")
    ) {
      return "review";
    }

    if (s.includes("submitted") || s.includes("pending") || s.includes("waiting")) {
      return "pending";
    }

    if (s.includes("draft")) {
      return "draft";
    }

    return "approved";
  }

  function statusBadgeHtml(status) {
    const group = getStatusGroup(status);
    const meta = STATUS_META[group] || STATUS_META.approved;

    return `
      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${meta.badge}">
        <span class="w-2 h-2 rounded-full inline-block" style="background-color: currentColor;"></span>
        ${escapeHtml(makeReadableStatus(status))}
      </span>
    `;
  }

  function makeReadableStatus(status) {
    const text = String(status || "Approved")
      .replace(/_/g, " ")
      .replace(/-/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return text.replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  // =========================================================
  // UI helpers
  // =========================================================

  function disableForm(disabled) {
    if (!form) return;

    form.querySelectorAll("input, textarea, select, button").forEach((element) => {
      element.disabled = disabled;
    });
  }

  function setButtonLoading(loading) {
    if (previewPrintBtn) {
      previewPrintBtn.disabled = loading;
      previewPrintBtn.classList.toggle("opacity-70", loading);
      previewPrintBtn.classList.toggle("cursor-not-allowed", loading);
    }

    if (saveDraftBtn) {
      saveDraftBtn.disabled = loading;
      saveDraftBtn.classList.toggle("opacity-70", loading);
      saveDraftBtn.classList.toggle("cursor-not-allowed", loading);
    }
  }

  function clearValidationStyles() {
    form?.querySelectorAll(".border-red-500").forEach((element) => {
      element.classList.remove("border-red-500");
      element.classList.remove("bg-red-50");
    });
  }

  function markInvalid(element) {
    if (!element) return;

    element.classList.add("border-red-500");
    element.classList.add("bg-red-50");
  }

  function showToast(message, type = "info") {
    if (!toastContainer) {
      alert(message);
      return;
    }

    const el = document.createElement("div");

    const classes =
      type === "error"
        ? "bg-red-600 text-white"
        : type === "success"
          ? "bg-green-600 text-white"
          : "bg-white border border-gray-200 text-gray-800";

    el.className = `px-4 py-3 rounded-xl shadow-lg text-sm font-semibold ${classes}`;
    el.textContent = message;

    toastContainer.appendChild(el);

    setTimeout(() => {
      el.remove();
    }, 3500);
  }

  function $(id) {
    return document.getElementById(id);
  }

  function setValue(id, value, fallback = "") {
    const element = $(id);
    if (!element) return;

    element.value = value ?? fallback;
  }

  function getValue(id) {
    return $(id)?.value?.trim() || "";
  }

  // =========================================================
  // General helpers
  // =========================================================

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function escapeHtml(value) {
    if (value === null || value === undefined) return "";

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function safeDate(value) {
    if (!value) return null;

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function formatDate(value) {
    const date = safeDate(value);

    if (!date) return "";

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  function formatDateForInput(value) {
    const date = safeDate(value);

    if (!date) return "";

    return date.toISOString().slice(0, 10);
  }

  function normalizeMoneyInput(value) {
    const number = Number(String(value || "").replace(/,/g, ""));

    return Number.isFinite(number) ? String(number.toFixed(2)) : "";
  }

  function toNumber(value) {
    const number = Number(String(value || "").replace(/,/g, ""));

    return Number.isFinite(number) ? number : 0;
  }

  function money(value) {
    return toNumber(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
});