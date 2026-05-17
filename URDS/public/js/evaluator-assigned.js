// evaluator-assigned.js
document.addEventListener("DOMContentLoaded", async () => {
  "use strict";

  const API = {
    assignments: "../../backend/get_evaluator_assignments.php"
  };

  const CATEGORY_META = {
    new_proposal: {
      label: "New Proposal",
      documentNo: "UEP-URDS-FM-011",
      form: "agency_in_house_evaluation_newproposals_form.html",
      print: "agency_in_house_evaluation_newproposals_print.html",
      draftKeys: [
        "agency_in_house_review_draft_",
        "agencyReviewDraft:",
        "fm011_agency_review_draft_"
      ]
    },

    ongoing_natural_sciences: {
      label: "On-going Natural Sciences",
      documentNo: "UEP-URDS-FM-012",
      form: "agency_in_house_ongoing_natural_sciences_form.html",
      print: "agency_in_house_ongoing_natural_sciences_print.html",
      draftKeys: [
        "ongoing_natural_sciences_review_draft_",
        "agencyOngoingNaturalReviewDraft:",
        "fm012_ongoing_natural_sciences_draft_"
      ]
    },

    ongoing_social_sciences: {
      label: "On-going Social Sciences",
      documentNo: "UEP-URDS-FM-013",
      form: "agency_in_house_ongoing_social_sciences_form.html",
      print: "agency_in_house_ongoing_social_sciences_print.html",
      draftKeys: [
        "ongoing_social_sciences_review_draft_",
        "agencyOngoingSocialReviewDraft:",
        "fm013_ongoing_social_sciences_draft_"
      ]
    },

    completed_natural_sciences: {
      label: "Completed Natural Sciences",
      documentNo: "UEP-URDS-FM-014",
      form: "agency_in_house_completed_natural_sciences_form.html",
      print: "agency_in_house_completed_natural_sciences_print.html",
      draftKeys: [
        "completed_natural_sciences_review_draft_",
        "agencyCompletedNaturalReviewDraft:",
        "fm014_completed_natural_sciences_draft_"
      ]
    },

    completed_social_sciences: {
      label: "Completed Social Sciences",
      documentNo: "UEP-URDS-FM-015",
      form: "agency_in_house_completed_social_sciences_form.html",
      print: "agency_in_house_completed_social_sciences_print.html",
      draftKeys: [
        "completed_social_sciences_review_draft_",
        "agencyCompletedSocialReviewDraft:",
        "fm015_completed_social_sciences_draft_"
      ]
    }
  };

  let assignments = [];

  const qs = (id) => document.getElementById(id);

  const elements = {
    assignedCount: qs("assignedCount"),
    pendingCount: qs("pendingCount"),
    draftCount: qs("draftCount"),
    submittedCount: qs("submittedCount"),

    search: qs("evaluationSearch"),
    categoryFilter: qs("categoryFilter"),
    statusFilter: qs("statusFilter"),
    sortFilter: qs("sortFilter"),

    resultCount: qs("resultCount"),
    table: qs("evaluationTable"),
    emptyState: qs("emptyState"),

    refreshBtn: qs("refreshBtn"),
    clearFiltersBtn: qs("clearFiltersBtn"),

    toastContainer: qs("toastContainer")
  };

  bindEvents();
  await loadAssignments();

  async function loadAssignments() {
    setTableLoading();

    const result = await fetchJson(API.assignments);

    const rows = getRowsFromResponse(result);
    assignments = rows.map(normalizeAssignment);

    render();
  }

  function getRowsFromResponse(result) {
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.assignments)) return result.assignments;
    if (Array.isArray(result?.data)) return result.data;
    return [];
  }

  async function fetchJson(url) {
    try {
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const text = await response.text();

      try {
        return JSON.parse(text);
      } catch (error) {
        console.error("Invalid JSON response:", text.slice(0, 500));
        return { status: "error", assignments: [] };
      }
    } catch (error) {
      console.warn("Unable to load evaluator assignments from database.", error);
      return { status: "error", assignments: [] };
    }
  }

  function normalizeAssignment(raw) {
    const id =
      raw.id ||
      raw.proposal_id ||
      raw.proposalId ||
      raw.research_id ||
      raw.researchId ||
      raw.assignment_id ||
      raw.assignmentId ||
      "";

    const category = normalizeCategory(
      raw.category ||
      raw.evaluation_category ||
      raw.form_category ||
      raw.review_type ||
      raw.type ||
      ""
    );

    let status = normalizeStatus(
      raw.status ||
      raw.evaluation_status ||
      raw.assignment_status ||
      "pending"
    );

    const item = {
      id: String(id),

      title:
        raw.title ||
        raw.project_title ||
        raw.study_title ||
        raw.activity_title ||
        raw.proposal_title ||
        raw.research_title ||
        "Untitled Proposal",

      proponent:
        raw.proponent ||
        raw.proponents ||
        raw.program_project_leaders ||
        raw.researcher ||
        raw.researcher_name ||
        raw.leader ||
        "Unknown Proponent",

      college:
        raw.college ||
        raw.college_name ||
        raw.implementing_college ||
        raw.implementingCollege ||
        "Unknown College",

      department:
        raw.department ||
        raw.department_name ||
        raw.implementing_department ||
        raw.implementingDepartment ||
        "",

      category,
      status,

      assigned_at:
        raw.assigned_at ||
        raw.assignedAt ||
        raw.created_at ||
        raw.date_assigned ||
        "",

      deadline:
        raw.deadline ||
        raw.due_date ||
        raw.evaluation_deadline ||
        raw.target_date ||
        ""
    };

    if (hasDraft(item) && item.status !== "submitted") {
      item.status = "draft";
    }

    return item;
  }

  function normalizeCategory(value) {
    const raw = String(value || "");
    const text = normalizeText(raw);

    if (CATEGORY_META[raw]) return raw;

    if (
      text.includes("new proposal") ||
      text.includes("new proposals") ||
      text.includes("fm 011") ||
      text.includes("fm011")
    ) {
      return "new_proposal";
    }

    if (
      text.includes("ongoing natural") ||
      text.includes("on going natural") ||
      text.includes("on-going natural") ||
      text.includes("fm 012") ||
      text.includes("fm012")
    ) {
      return "ongoing_natural_sciences";
    }

    if (
      text.includes("ongoing social") ||
      text.includes("on going social") ||
      text.includes("on-going social") ||
      text.includes("fm 013") ||
      text.includes("fm013")
    ) {
      return "ongoing_social_sciences";
    }

    if (
      text.includes("completed natural") ||
      text.includes("complete natural") ||
      text.includes("fm 014") ||
      text.includes("fm014")
    ) {
      return "completed_natural_sciences";
    }

    if (
      text.includes("completed social") ||
      text.includes("complete social") ||
      text.includes("fm 015") ||
      text.includes("fm015")
    ) {
      return "completed_social_sciences";
    }

    return "new_proposal";
  }

  function normalizeStatus(value) {
    const text = normalizeText(value);

    if (!text) return "pending";

    if (text.includes("draft")) return "draft";

    if (
      text.includes("submitted") ||
      text.includes("submit") ||
      text.includes("completed") ||
      text.includes("complete") ||
      text.includes("done") ||
      text.includes("finished")
    ) {
      return "submitted";
    }

    if (
      text.includes("returned") ||
      text.includes("return") ||
      text.includes("revision") ||
      text.includes("revise")
    ) {
      return "returned";
    }

    if (
      text.includes("pending") ||
      text.includes("assigned") ||
      text.includes("review") ||
      text.includes("evaluate") ||
      text.includes("evaluation")
    ) {
      return "pending";
    }

    return text.replace(/\s+/g, "_");
  }

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function render() {
    const filtered = getFilteredAssignments();

    renderStats();
    renderTable(filtered);

    if (elements.resultCount) {
      elements.resultCount.textContent =
        `${filtered.length.toLocaleString()} of ${assignments.length.toLocaleString()} assigned evaluations shown`;
    }
  }

  function renderStats() {
    const assigned = assignments.length;
    const pending = assignments.filter((item) => item.status === "pending").length;
    const draft = assignments.filter((item) => item.status === "draft").length;
    const submitted = assignments.filter((item) => item.status === "submitted").length;

    setText(elements.assignedCount, assigned);
    setText(elements.pendingCount, pending);
    setText(elements.draftCount, draft);
    setText(elements.submittedCount, submitted);
  }

  function getFilteredAssignments() {
    const search = normalizeText(elements.search?.value || "");
    const category = elements.categoryFilter?.value || "";
    const status = elements.statusFilter?.value || "";
    const sort = elements.sortFilter?.value || "deadline_asc";

    let output = assignments.filter((item) => {
      if (category && item.category !== category) return false;
      if (status && item.status !== status) return false;

      if (!search) return true;

      const haystack = normalizeText(
        [
          item.title,
          item.proponent,
          item.college,
          item.department,
          getCategoryLabel(item.category),
          item.status,
          item.id
        ].join(" ")
      );

      return haystack.includes(search);
    });

    output = sortAssignments(output, sort);

    return output;
  }

  function sortAssignments(items, sort) {
    return [...items].sort((a, b) => {
      if (sort === "deadline_desc") {
        return getTime(b.deadline) - getTime(a.deadline);
      }

      if (sort === "assigned_desc") {
        return getTime(b.assigned_at) - getTime(a.assigned_at);
      }

      if (sort === "title_asc") {
        return a.title.localeCompare(b.title);
      }

      return getTime(a.deadline) - getTime(b.deadline);
    });
  }

  function renderTable(items) {
    if (!elements.table) return;

    if (!items.length) {
      elements.table.innerHTML = "";
      elements.emptyState?.classList.remove("hidden");
      return;
    }

    elements.emptyState?.classList.add("hidden");
    elements.table.innerHTML = items.map(rowTemplate).join("");
  }

  function rowTemplate(item) {
    const categoryMeta = CATEGORY_META[item.category] || CATEGORY_META.new_proposal;
    const formUrl = getFormUrl(item);
    const printUrl = getPrintUrl(item);
    const hasSavedDraft = hasDraft(item);

    return `
      <tr class="hover:bg-blue-50 transition-colors">
        <td class="px-5 py-4 align-top">
          <div class="font-semibold text-gray-900">
            ${escapeHtml(item.title)}
          </div>

          <div class="text-xs text-gray-500 mt-1">
            ${escapeHtml(item.proponent)}
          </div>

          <div class="text-xs text-gray-400 mt-1">
            ID: ${escapeHtml(item.id || "-")}
          </div>
        </td>

        <td class="px-5 py-4 align-top">
          <div class="text-sm font-semibold text-gray-800">
            ${escapeHtml(categoryMeta.label)}
          </div>

          <div class="text-xs text-gray-500 mt-1">
            ${escapeHtml(categoryMeta.documentNo)}
          </div>
        </td>

        <td class="px-5 py-4 align-top">
          <div class="text-sm text-gray-800">
            ${escapeHtml(item.college)}
          </div>

          <div class="text-xs text-gray-500 mt-1">
            ${escapeHtml(item.department || "No department specified")}
          </div>
        </td>

        <td class="px-5 py-4 align-top text-sm text-gray-700">
          ${escapeHtml(formatDate(item.assigned_at))}
        </td>

        <td class="px-5 py-4 align-top">
          <div class="text-sm font-semibold text-gray-800">
            ${escapeHtml(formatDate(item.deadline))}
          </div>

          <div class="text-xs ${isOverdue(item.deadline) && item.status !== "submitted" ? "text-red-600 font-semibold" : "text-gray-500"} mt-1">
            ${getDeadlineText(item.deadline, item.status)}
          </div>
        </td>

        <td class="px-5 py-4 align-top">
          ${statusBadge(item.status)}
        </td>

        <td class="px-5 py-4 align-top">
          <div class="flex items-center justify-center gap-2">
            <a
              href="${escapeHtml(formUrl)}"
              class="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition"
            >
              ${hasSavedDraft || item.status === "draft" ? "Continue" : "Evaluate"}
            </a>

            <a
              href="${escapeHtml(printUrl)}"
              class="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition"
            >
              Preview
            </a>
          </div>
        </td>
      </tr>
    `;
  }

  function statusBadge(status) {
    const meta = {
      pending: {
        label: "Pending",
        wrapper: "bg-yellow-100 text-yellow-800",
        dot: "bg-yellow-500"
      },
      draft: {
        label: "Draft",
        wrapper: "bg-gray-100 text-gray-700",
        dot: "bg-gray-500"
      },
      submitted: {
        label: "Submitted",
        wrapper: "bg-green-100 text-green-800",
        dot: "bg-green-500"
      },
      returned: {
        label: "Returned",
        wrapper: "bg-orange-100 text-orange-800",
        dot: "bg-orange-500"
      }
    };

    const item = meta[status] || meta.pending;

    return `
      <span class="status-badge ${item.wrapper}">
        <span class="status-dot ${item.dot}"></span>
        ${item.label}
      </span>
    `;
  }

  function getCategoryLabel(category) {
    return CATEGORY_META[category]?.label || "New Proposal";
  }

  function getFormUrl(item) {
    const meta = CATEGORY_META[item.category] || CATEGORY_META.new_proposal;
    return `${meta.form}?id=${encodeURIComponent(item.id)}`;
  }

  function getPrintUrl(item) {
    const meta = CATEGORY_META[item.category] || CATEGORY_META.new_proposal;
    return `${meta.print}?id=${encodeURIComponent(item.id)}`;
  }

  function hasDraft(item) {
    const meta = CATEGORY_META[item.category];

    if (!meta || !item.id) return false;

    return meta.draftKeys.some((prefix) => {
      return localStorage.getItem(prefix + item.id);
    });
  }

  function setTableLoading() {
    if (!elements.table) return;

    elements.table.innerHTML = `
      <tr>
        <td colspan="7" class="px-5 py-8 text-center text-sm text-gray-500">
          Loading assigned evaluations...
        </td>
      </tr>
    `;
  }

  function clearFilters() {
    if (elements.search) elements.search.value = "";
    if (elements.categoryFilter) elements.categoryFilter.value = "";
    if (elements.statusFilter) elements.statusFilter.value = "";
    if (elements.sortFilter) elements.sortFilter.value = "deadline_asc";

    render();
  }

  function bindEvents() {
    elements.search?.addEventListener("input", render);
    elements.categoryFilter?.addEventListener("change", render);
    elements.statusFilter?.addEventListener("change", render);
    elements.sortFilter?.addEventListener("change", render);

    elements.clearFiltersBtn?.addEventListener("click", clearFilters);

    elements.refreshBtn?.addEventListener("click", async () => {
      showToast("Refreshing assigned evaluations...");
      await loadAssignments();
      showToast("Assigned evaluations updated.");
    });
  }

  function formatDate(value) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  function getTime(value) {
    if (!value) return Number.MAX_SAFE_INTEGER;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return Number.MAX_SAFE_INTEGER;
    }

    return date.getTime();
  }

  function isOverdue(value) {
    if (!value) return false;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    date.setHours(0, 0, 0, 0);

    return date.getTime() < today.getTime();
  }

  function getDeadlineText(value, status) {
    if (!value) return "No deadline";

    if (status === "submitted") {
      return "Completed";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const diffMs = date.getTime() - today.getTime();
    const days = Math.round(diffMs / 86400000);

    if (days < 0) return `${Math.abs(days)} day(s) overdue`;
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";

    return `${days} days left`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setText(element, value) {
    if (element) {
      element.textContent = String(value);
    }
  }

  function showToast(message, type = "success") {
    const container = elements.toastContainer || createToastContainer();
    const toast = document.createElement("div");

    const colorClass =
      type === "error"
        ? "bg-red-600"
        : type === "warning"
        ? "bg-amber-600"
        : "bg-emerald-600";

    toast.className =
      `${colorClass} text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold ` +
      "translate-y-2 opacity-0 transition";

    toast.textContent = message;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove("translate-y-2", "opacity-0");
    });

    setTimeout(() => {
      toast.classList.add("translate-y-2", "opacity-0");

      setTimeout(() => {
        toast.remove();
      }, 200);
    }, 2300);
  }

  function createToastContainer() {
    let container = qs("toastContainer");

    if (container) return container;

    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "fixed bottom-6 right-6 space-y-2 z-50";
    document.body.appendChild(container);

    return container;
  }
});
