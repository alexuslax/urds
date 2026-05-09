// evaluator-history.js
document.addEventListener("DOMContentLoaded", async () => {
  "use strict";

  const API = {
    history: "../../backend/get_evaluator_history.php"
  };

  const CATEGORY_META = {
    new_proposal: {
      label: "New Proposal",
      documentNo: "UEP-URDS-FM-011",
      print: "agency_in_house_evaluation_newproposals_print.html"
    },

    ongoing_natural_sciences: {
      label: "On-going Natural Sciences",
      documentNo: "UEP-URDS-FM-012",
      print: "agency_in_house_ongoing_natural_sciences_print.html"
    },

    ongoing_social_sciences: {
      label: "On-going Social Sciences",
      documentNo: "UEP-URDS-FM-013",
      print: "agency_in_house_ongoing_social_sciences_print.html"
    },

    completed_natural_sciences: {
      label: "Completed Natural Sciences",
      documentNo: "UEP-URDS-FM-014",
      print: "agency_in_house_completed_natural_sciences_print.html"
    },

    completed_social_sciences: {
      label: "Completed Social Sciences",
      documentNo: "UEP-URDS-FM-015",
      print: "agency_in_house_completed_social_sciences_print.html"
    }
  };

  const SAMPLE_HISTORY = [
    {
      id: "EV-2026-001",
      proposal_id: "P-2026-001",
      title: "Development of a Smart Irrigation Monitoring System",
      proponent: "Dr. Maria Santos",
      college: "College of Engineering",
      department: "Electrical Engineering",
      category: "completed_natural_sciences",
      score: 92,
      recommendation: "For presentation in the Inter-agency In-House Review",
      recommendation_type: "presentation",
      submitted_at: "2026-04-26",
      remarks: "The research is well-developed, technically sound, and ready for presentation."
    },
    {
      id: "EV-2026-002",
      proposal_id: "P-2026-002",
      title: "Community-Based Livelihood Assessment in Northern Samar",
      proponent: "Prof. Juan Dela Cruz",
      college: "College of Arts and Communication",
      department: "Social Sciences",
      category: "completed_social_sciences",
      score: 88,
      recommendation: "Submission of Terminal Report",
      recommendation_type: "terminal_report",
      submitted_at: "2026-04-24",
      remarks: "The completed study has acceptable documentation and clear social relevance."
    },
    {
      id: "EV-2026-003",
      proposal_id: "P-2026-003",
      title: "Biodiversity Mapping of Coastal Resources",
      proponent: "Dr. Ana Reyes",
      college: "College of Science",
      department: "Biology",
      category: "ongoing_natural_sciences",
      score: 84,
      recommendation: "Project/study for continuation",
      recommendation_type: "approved",
      submitted_at: "2026-04-22",
      remarks: "The project shows good progress and should continue with minor documentation improvements."
    },
    {
      id: "EV-2026-004",
      proposal_id: "P-2026-004",
      title: "Feasibility of Digital Records Management for Research Offices",
      proponent: "Dr. Elena Cruz",
      college: "College of Business Administration",
      department: "Management",
      category: "new_proposal",
      score: 79,
      recommendation: "For revision before approval",
      recommendation_type: "revision",
      submitted_at: "2026-03-29",
      remarks: "The proposal needs clearer methodology and stronger expected output indicators."
    },
    {
      id: "EV-2026-005",
      proposal_id: "P-2026-005",
      title: "Local Governance and Disaster Preparedness Practices",
      proponent: "Prof. Ramon Lim",
      college: "College of Arts and Communication",
      department: "Political Science",
      category: "ongoing_social_sciences",
      score: 81,
      recommendation: "Project/study for continuation",
      recommendation_type: "approved",
      submitted_at: "2026-03-20",
      remarks: "The research remains relevant and may continue subject to improved timeline monitoring."
    }
  ];

  let historyRecords = [];

  const qs = (id) => document.getElementById(id);

  const elements = {
    totalHistoryCount: qs("totalHistoryCount"),
    monthHistoryCount: qs("monthHistoryCount"),
    averageScore: qs("averageScore"),
    latestDate: qs("latestDate"),

    search: qs("historySearch"),
    categoryFilter: qs("categoryFilter"),
    recommendationFilter: qs("recommendationFilter"),
    dateFromFilter: qs("dateFromFilter"),
    sortFilter: qs("sortFilter"),

    resultCount: qs("resultCount"),
    table: qs("historyTable"),
    emptyState: qs("emptyState"),

    clearFiltersBtn: qs("clearFiltersBtn"),
    refreshBtn: qs("refreshBtn"),
    printPageBtn: qs("printPageBtn"),

    modal: qs("historyDetailsModal"),
    modalTitle: qs("modalTitle"),
    modalSubtitle: qs("modalSubtitle"),
    modalBody: qs("modalBody"),
    closeDetailsModal: qs("closeDetailsModal"),

    toastContainer: qs("toastContainer")
  };

  bindEvents();
  await loadHistory();

  async function loadHistory() {
    setTableLoading();

    const result = await fetchJson(API.history, {
      status: "fallback",
      history: SAMPLE_HISTORY
    });

    const rows = getRowsFromResponse(result);
    historyRecords = rows.map(normalizeHistoryRecord);

    render();
  }

  function getRowsFromResponse(result) {
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.history)) return result.history;
    if (Array.isArray(result?.evaluations)) return result.evaluations;
    if (Array.isArray(result?.data)) return result.data;
    return SAMPLE_HISTORY;
  }

  async function fetchJson(url, fallback) {
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
        return fallback;
      }
    } catch (error) {
      console.warn("Unable to load evaluator history. Using fallback data.", error);
      return fallback;
    }
  }

  function normalizeHistoryRecord(raw) {
    const proposalId =
      raw.proposal_id ||
      raw.proposalId ||
      raw.research_id ||
      raw.researchId ||
      raw.assignment_id ||
      raw.assignmentId ||
      raw.id ||
      "";

    const category = normalizeCategory(
      raw.category ||
      raw.evaluation_category ||
      raw.form_category ||
      raw.review_type ||
      raw.type ||
      ""
    );

    const score = Number(
      raw.score ||
      raw.rating ||
      raw.total_score ||
      raw.total_rating ||
      raw.total_point ||
      0
    );

    return {
      id: String(raw.id || raw.evaluation_id || raw.evaluationId || `EV-${proposalId}`),
      proposal_id: String(proposalId),

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

      score: Number.isFinite(score) ? score : 0,

      recommendation:
        raw.recommendation ||
        raw.recommendation_text ||
        raw.final_recommendation ||
        "Submitted evaluation",

      recommendation_type: normalizeRecommendationType(
        raw.recommendation_type ||
        raw.recommendation ||
        raw.final_recommendation ||
        ""
      ),

      submitted_at:
        raw.submitted_at ||
        raw.submittedAt ||
        raw.evaluated_at ||
        raw.evaluation_date ||
        raw.created_at ||
        "",

      remarks:
        raw.remarks ||
        raw.general_comments ||
        raw.comments ||
        raw.evaluator_comments ||
        ""
    };
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

  function normalizeRecommendationType(value) {
    const text = normalizeText(value);

    if (!text) return "approved";

    if (
      text.includes("revision") ||
      text.includes("revise") ||
      text.includes("returned")
    ) {
      return "revision";
    }

    if (
      text.includes("presentation") ||
      text.includes("paper") ||
      text.includes("poster")
    ) {
      return "presentation";
    }

    if (
      text.includes("terminal") ||
      text.includes("report")
    ) {
      return "terminal_report";
    }

    if (
      text.includes("suspension") ||
      text.includes("suspend")
    ) {
      return "suspension";
    }

    if (
      text.includes("termination") ||
      text.includes("terminate") ||
      text.includes("completion")
    ) {
      return "termination";
    }

    return "approved";
  }

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function render() {
    const filtered = getFilteredRecords();

    renderStats();
    renderTable(filtered);

    if (elements.resultCount) {
      elements.resultCount.textContent =
        `${filtered.length.toLocaleString()} of ${historyRecords.length.toLocaleString()} submitted evaluations shown`;
    }
  }

  function renderStats() {
    const total = historyRecords.length;
    const thisMonth = countThisMonth(historyRecords);
    const average = getAverageScore(historyRecords);
    const latest = getLatestSubmittedDate(historyRecords);

    setText(elements.totalHistoryCount, total);
    setText(elements.monthHistoryCount, thisMonth);
    setText(elements.averageScore, average ? `${average}%` : "0");
    setText(elements.latestDate, latest ? shortDate(latest) : "-");
  }

  function countThisMonth(records) {
    const now = new Date();

    return records.filter((record) => {
      const date = safeDate(record.submitted_at);
      if (!date) return false;

      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      );
    }).length;
  }

  function getAverageScore(records) {
    const scored = records
      .map((record) => Number(record.score || 0))
      .filter((score) => Number.isFinite(score) && score > 0);

    if (!scored.length) return 0;

    const total = scored.reduce((sum, score) => sum + score, 0);
    return Math.round(total / scored.length);
  }

  function getLatestSubmittedDate(records) {
    const sorted = [...records]
      .map((record) => safeDate(record.submitted_at))
      .filter(Boolean)
      .sort((a, b) => b.getTime() - a.getTime());

    return sorted[0] || null;
  }

  function getFilteredRecords() {
    const search = normalizeText(elements.search?.value || "");
    const category = elements.categoryFilter?.value || "";
    const recommendation = elements.recommendationFilter?.value || "";
    const dateFrom = elements.dateFromFilter?.value || "";
    const sort = elements.sortFilter?.value || "submitted_desc";

    let output = historyRecords.filter((record) => {
      if (category && record.category !== category) return false;
      if (recommendation && record.recommendation_type !== recommendation) return false;

      if (dateFrom) {
        const submitted = safeDate(record.submitted_at);
        const from = safeDate(dateFrom);

        if (submitted && from) {
          submitted.setHours(0, 0, 0, 0);
          from.setHours(0, 0, 0, 0);

          if (submitted.getTime() < from.getTime()) return false;
        }
      }

      if (!search) return true;

      const haystack = normalizeText(
        [
          record.title,
          record.proponent,
          record.college,
          record.department,
          getCategoryLabel(record.category),
          record.recommendation,
          record.remarks,
          record.proposal_id
        ].join(" ")
      );

      return haystack.includes(search);
    });

    output = sortRecords(output, sort);

    return output;
  }

  function sortRecords(records, sort) {
    return [...records].sort((a, b) => {
      if (sort === "submitted_asc") {
        return getTime(a.submitted_at) - getTime(b.submitted_at);
      }

      if (sort === "score_desc") {
        return Number(b.score || 0) - Number(a.score || 0);
      }

      if (sort === "score_asc") {
        return Number(a.score || 0) - Number(b.score || 0);
      }

      if (sort === "title_asc") {
        return a.title.localeCompare(b.title);
      }

      return getTime(b.submitted_at) - getTime(a.submitted_at);
    });
  }

  function renderTable(records) {
    if (!elements.table) return;

    if (!records.length) {
      elements.table.innerHTML = "";
      elements.emptyState?.classList.remove("hidden");
      return;
    }

    elements.emptyState?.classList.add("hidden");
    elements.table.innerHTML = records.map(rowTemplate).join("");
  }

  function rowTemplate(record) {
    const categoryMeta = CATEGORY_META[record.category] || CATEGORY_META.new_proposal;
    const printUrl = getPrintUrl(record);
    const scoreClass = getScoreClass(record.score);

    return `
      <tr class="hover:bg-blue-50 transition-colors">
        <td class="px-5 py-4 align-top">
          <div class="font-semibold text-gray-900">
            ${escapeHtml(record.title)}
          </div>

          <div class="text-xs text-gray-500 mt-1">
            ${escapeHtml(record.proponent)}
          </div>

          <div class="text-xs text-gray-400 mt-1">
            Proposal ID: ${escapeHtml(record.proposal_id || "-")}
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
            ${escapeHtml(record.college)}
          </div>

          <div class="text-xs text-gray-500 mt-1">
            ${escapeHtml(record.department || "No department specified")}
          </div>
        </td>

        <td class="px-5 py-4 align-top text-sm text-gray-700">
          ${escapeHtml(formatDate(record.submitted_at))}
        </td>

        <td class="px-5 py-4 align-top">
          <span class="inline-flex px-3 py-1 rounded-full text-xs font-bold ${scoreClass}">
            ${Number(record.score || 0)}%
          </span>
        </td>

        <td class="px-5 py-4 align-top">
          ${recommendationBadge(record.recommendation_type, record.recommendation)}
        </td>

        <td class="px-5 py-4 align-top no-print">
          <div class="flex items-center justify-center gap-2">
            <button
              type="button"
              data-action="details"
              data-id="${escapeHtml(record.id)}"
              class="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-bold transition"
            >
              Details
            </button>

            <a
              href="${escapeHtml(printUrl)}"
              class="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition"
            >
              Print Form
            </a>
          </div>
        </td>
      </tr>
    `;
  }

  function recommendationBadge(type, text) {
    const meta = {
      approved: {
        wrapper: "bg-green-100 text-green-800",
        dot: "bg-green-500"
      },
      revision: {
        wrapper: "bg-orange-100 text-orange-800",
        dot: "bg-orange-500"
      },
      presentation: {
        wrapper: "bg-blue-100 text-blue-800",
        dot: "bg-blue-500"
      },
      terminal_report: {
        wrapper: "bg-purple-100 text-purple-800",
        dot: "bg-purple-500"
      },
      suspension: {
        wrapper: "bg-yellow-100 text-yellow-800",
        dot: "bg-yellow-500"
      },
      termination: {
        wrapper: "bg-red-100 text-red-800",
        dot: "bg-red-500"
      }
    };

    const item = meta[type] || meta.approved;

    return `
      <span class="status-badge ${item.wrapper}">
        <span class="status-dot ${item.dot}"></span>
        ${escapeHtml(text || "Submitted")}
      </span>
    `;
  }

  function getScoreClass(score) {
    const value = Number(score || 0);

    if (value >= 90) return "bg-green-100 text-green-800";
    if (value >= 80) return "bg-blue-100 text-blue-800";
    if (value >= 70) return "bg-yellow-100 text-yellow-800";

    return "bg-red-100 text-red-800";
  }

  function getCategoryLabel(category) {
    return CATEGORY_META[category]?.label || "New Proposal";
  }

  function getPrintUrl(record) {
    const meta = CATEGORY_META[record.category] || CATEGORY_META.new_proposal;
    return `${meta.print}?id=${encodeURIComponent(record.proposal_id || record.id)}`;
  }

  function openDetailsModal(recordId) {
    const record = historyRecords.find((item) => item.id === recordId);

    if (!record || !elements.modal || !elements.modalBody) return;

    const categoryMeta = CATEGORY_META[record.category] || CATEGORY_META.new_proposal;

    if (elements.modalTitle) {
      elements.modalTitle.textContent = record.title;
    }

    if (elements.modalSubtitle) {
      elements.modalSubtitle.textContent =
        `${categoryMeta.documentNo} • ${categoryMeta.label}`;
    }

    elements.modalBody.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${detailCard("Proposal ID", record.proposal_id || "-")}
        ${detailCard("Submitted Date", formatDate(record.submitted_at))}
        ${detailCard("Proponent", record.proponent)}
        ${detailCard("College", record.college)}
        ${detailCard("Department", record.department || "No department specified")}
        ${detailCard("Score", `${Number(record.score || 0)}%`)}
      </div>

      <div class="p-4 rounded-2xl bg-gray-50 border border-gray-100">
        <div class="text-xs uppercase tracking-wide font-bold text-gray-500">
          Recommendation
        </div>
        <div class="mt-2">
          ${recommendationBadge(record.recommendation_type, record.recommendation)}
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-gray-50 border border-gray-100">
        <div class="text-xs uppercase tracking-wide font-bold text-gray-500">
          Evaluator Remarks
        </div>
        <p class="text-sm text-gray-700 mt-2 whitespace-pre-line">
          ${escapeHtml(record.remarks || "No remarks provided.")}
        </p>
      </div>

      <div class="flex flex-col sm:flex-row sm:justify-end gap-2 pt-2">
        <a
          href="${escapeHtml(getPrintUrl(record))}"
          class="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition text-center"
        >
          Open Printable Form
        </a>

        <button
          type="button"
          id="modalCloseBtn"
          class="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 transition"
        >
          Close
        </button>
      </div>
    `;

    qs("modalCloseBtn")?.addEventListener("click", closeDetailsModal);

    elements.modal.classList.remove("hidden");
    elements.modal.classList.add("flex");
    elements.modal.setAttribute("aria-hidden", "false");
  }

  function detailCard(label, value) {
    return `
      <div class="p-4 rounded-2xl bg-gray-50 border border-gray-100">
        <div class="text-xs uppercase tracking-wide font-bold text-gray-500">
          ${escapeHtml(label)}
        </div>
        <div class="text-sm font-semibold text-gray-900 mt-1">
          ${escapeHtml(value)}
        </div>
      </div>
    `;
  }

  function closeDetailsModal() {
    if (!elements.modal) return;

    elements.modal.classList.add("hidden");
    elements.modal.classList.remove("flex");
    elements.modal.setAttribute("aria-hidden", "true");
  }

  function setTableLoading() {
    if (!elements.table) return;

    elements.table.innerHTML = `
      <tr>
        <td colspan="7" class="px-5 py-8 text-center text-sm text-gray-500">
          Loading evaluation history...
        </td>
      </tr>
    `;
  }

  function clearFilters() {
    if (elements.search) elements.search.value = "";
    if (elements.categoryFilter) elements.categoryFilter.value = "";
    if (elements.recommendationFilter) elements.recommendationFilter.value = "";
    if (elements.dateFromFilter) elements.dateFromFilter.value = "";
    if (elements.sortFilter) elements.sortFilter.value = "submitted_desc";

    render();
  }

  function bindEvents() {
    elements.search?.addEventListener("input", render);
    elements.categoryFilter?.addEventListener("change", render);
    elements.recommendationFilter?.addEventListener("change", render);
    elements.dateFromFilter?.addEventListener("change", render);
    elements.sortFilter?.addEventListener("change", render);

    elements.clearFiltersBtn?.addEventListener("click", clearFilters);

    elements.refreshBtn?.addEventListener("click", async () => {
      showToast("Refreshing evaluation history...");
      await loadHistory();
      showToast("Evaluation history updated.");
    });

    elements.printPageBtn?.addEventListener("click", () => {
      window.print();
    });

    elements.table?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-action='details']");
      if (!button) return;

      openDetailsModal(button.dataset.id);
    });

    elements.closeDetailsModal?.addEventListener("click", closeDetailsModal);

    elements.modal?.addEventListener("click", (event) => {
      if (event.target === elements.modal) {
        closeDetailsModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeDetailsModal();
      }
    });
  }

  function formatDate(value) {
    const date = safeDate(value);

    if (!date) return value || "-";

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  function shortDate(value) {
    const date = value instanceof Date ? value : safeDate(value);

    if (!date) return "-";

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric"
    });
  }

  function safeDate(value) {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return null;

    return date;
  }

  function getTime(value) {
    const date = safeDate(value);
    return date ? date.getTime() : 0;
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