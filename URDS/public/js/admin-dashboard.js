// admin-dashboard.js
(() => {
  "use strict";

  // ======================================================
  // UEP-URDS Research Management System
  // Admin Dashboard Script
  // ======================================================

  const API = {
    dashboardStats: "../../backend/get_dashboard_stats.php",
    pendingUsers: "../../backend/get_pending_users.php"
  };

  let proposalsChart = null;
  let rolesChart = null;
  let monthlyChart = null;

  const STATUS_META = {
    draft: {
      label: "Draft",
      badge: "bg-gray-100 text-gray-700"
    },
    pending: {
      label: "Pending",
      badge: "bg-yellow-100 text-yellow-800"
    },
    review: {
      label: "Under Review",
      badge: "bg-blue-100 text-blue-800"
    },
    returned: {
      label: "Returned",
      badge: "bg-orange-100 text-orange-800"
    },
    approved: {
      label: "Approved",
      badge: "bg-green-100 text-green-800"
    },
    ongoing: {
      label: "Ongoing",
      badge: "bg-teal-100 text-teal-800"
    },
    rejected: {
      label: "Rejected",
      badge: "bg-red-100 text-red-800"
    }
  };

  const CHART_COLORS = [
    "#0ea5a4",
    "#1f2b3a",
    "#4ade80",
    "#60a5fa",
    "#fbbf24",
    "#a855f7",
    "#ef4444",
    "#14b8a6",
    "#6366f1",
    "#f87171"
  ];

  // ======================================================
  // BASIC HELPERS
  // ======================================================

  function qs(id) {
    return document.getElementById(id);
  }

  function qsa(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function setText(id, value) {
    const element = qs(id);
    if (element) {
      element.textContent = value;
    }
  }

  function setMultipleText(ids, value) {
    ids.forEach((id) => setText(id, value));
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

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function safeNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  function formatNumber(value) {
    return safeNumber(value).toLocaleString();
  }

  function safeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function safeDate(value) {
    if (!value) return null;

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function formatDate(value) {
    const date = safeDate(value);

    if (!date) return "-";

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  function createGradient(ctx, color1, color2) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
  }

  function destroyChart(chart) {
    if (!chart) return;

    try {
      chart.destroy();
    } catch (error) {
      console.warn("Unable to destroy chart:", error);
    }
  }

  function chartAvailable() {
    return typeof Chart !== "undefined";
  }

  // ======================================================
  // STATUS HELPERS
  // ======================================================

  function getStatusGroup(status) {
    const s = normalizeText(status);

    if (!s) return "pending";

    if (
      s.includes("reject") ||
      s.includes("terminated") ||
      s.includes("terminate") ||
      s.includes("disapproved") ||
      s.includes("declined")
    ) {
      return "rejected";
    }

    if (
      s.includes("returned") ||
      s.includes("return") ||
      s.includes("revision") ||
      s.includes("revise") ||
      s.includes("correction")
    ) {
      return "returned";
    }

    if (
      s.includes("ongoing") ||
      s.includes("on going") ||
      s.includes("implementation") ||
      s.includes("implement")
    ) {
      return "ongoing";
    }

    if (
      s.includes("approved") ||
      s.includes("approve") ||
      s.includes("endorsed") ||
      s.includes("special order") ||
      s.includes("notice to proceed") ||
      s.includes("completed") ||
      s.includes("closed") ||
      s.includes("issued")
    ) {
      return "approved";
    }

    if (
      s.includes("review") ||
      s.includes("evaluation") ||
      s.includes("screening") ||
      s.includes("dean") ||
      s.includes("twg") ||
      s.includes("urec") ||
      s.includes("urds") ||
      s.includes("director") ||
      s.includes("in house") ||
      s.includes("monitoring") ||
      s.startsWith("for ")
    ) {
      return "review";
    }

    if (
      s.includes("draft") ||
      s.includes("not started") ||
      s.includes("not yet")
    ) {
      return "draft";
    }

    if (
      s.includes("pending") ||
      s.includes("submitted") ||
      s.includes("waiting") ||
      s.includes("received")
    ) {
      return "pending";
    }

    return "pending";
  }

  function makeReadableStatus(status) {
    const text = String(status || "Pending")
      .replace(/_/g, " ")
      .replace(/-/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return text.replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function statusBadgeHtml(status) {
    const group = getStatusGroup(status);
    const meta = STATUS_META[group] || STATUS_META.pending;

    return `
      <span class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-bold ${meta.badge}">
        <span class="w-2 h-2 rounded-full inline-block" style="background-color: currentColor;"></span>
        ${escapeHtml(makeReadableStatus(status || meta.label))}
      </span>
    `;
  }

  // ======================================================
  // API LOADERS
  // ======================================================

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
        console.error(`Request failed: ${url}`, response.status, response.statusText);
        return fallback;
      }

      const result = await response.json();
      return result || fallback;
    } catch (error) {
      console.error(`Error loading: ${url}`, error);
      return fallback;
    }
  }

  function dashboardFallback() {
    return {
      status: "error",
      stats: {
        users: 0,
        colleges: 0,
        proposals: 0
      },
      recentProposals: [],
      proposalsPerCollege: [],
      userRoles: [],
      monthlySubmissions: []
    };
  }

  async function loadDashboardData() {
    const fallback = dashboardFallback();
    const result = await fetchJson(API.dashboardStats, fallback);

    const success = result.status === "success" || result.success === true;

    if (!success) {
      console.error("Dashboard stats failed:", result.message || result.error || "Unknown error");
    }

    return {
      stats: result.stats || fallback.stats,
      recentProposals: safeArray(result.recentProposals),
      proposalsPerCollege: safeArray(result.proposalsPerCollege),
      userRoles: safeArray(result.userRoles),
      monthlySubmissions: safeArray(result.monthlySubmissions)
    };
  }

  async function loadPendingUsersCount() {
    const result = await fetchJson(API.pendingUsers, {
      status: "error",
      users: [],
      count: 0,
      total: 0
    });

    const success = result.status === "success" || result.success === true;

    if (!success) {
      return 0;
    }

    if (Array.isArray(result.users)) {
      return result.users.length;
    }

    return safeNumber(result.count || result.total || result.pending || 0);
  }

  // ======================================================
  // STAT CARDS
  // ======================================================

  function normalizeStats(stats) {
    return {
      users: safeNumber(stats.users || stats.totalUsers || stats.user_count),
      colleges: safeNumber(stats.colleges || stats.totalColleges || stats.college_count),
      proposals: safeNumber(stats.proposals || stats.totalProposals || stats.proposal_count)
    };
  }

  function renderStats(stats, pendingCount) {
    const normalized = normalizeStats(stats || {});

    setMultipleText(["userCount", "userCountHero"], formatNumber(normalized.users));
    setText("collegeCount", formatNumber(normalized.colleges));
    setText("proposalCount", formatNumber(normalized.proposals));
    setMultipleText(["pendingCount", "pendingCountHero"], formatNumber(pendingCount));
  }

  // ======================================================
  // RECENT PROPOSALS
  // ======================================================

  function getProposalTitle(proposal) {
    return (
      proposal.program_title ||
      proposal.title ||
      proposal.proposal_title ||
      proposal.research_title ||
      "Untitled Proposal"
    );
  }

  function getProposalUser(proposal) {
    return (
      proposal.user_name ||
      proposal.full_name ||
      proposal.researcher ||
      proposal.researcher_name ||
      proposal.proponent ||
      "Unknown User"
    );
  }

  function getProposalStatus(proposal) {
    return (
      proposal.status ||
      proposal.proposal_status ||
      proposal.current_status ||
      "Pending"
    );
  }

  function getProposalDate(proposal) {
    return (
      proposal.created_at ||
      proposal.date_submitted ||
      proposal.submitted_at ||
      proposal.updated_at ||
      ""
    );
  }

  function renderRecentProposals(recentProposals) {
    const activityList = qs("activityList");

    if (!activityList) return;

    if (!Array.isArray(recentProposals) || recentProposals.length === 0) {
      activityList.innerHTML = `
        <div class="p-5 rounded-xl border border-dashed border-gray-200 text-sm text-gray-500 bg-gray-50">
          No recent admin activities or proposal updates yet.
        </div>
      `;
      return;
    }

    activityList.innerHTML = recentProposals
      .slice(0, 8)
      .map((proposal) => {
        const title = getProposalTitle(proposal);
        const user = getProposalUser(proposal);
        const status = getProposalStatus(proposal);
        const date = formatDate(getProposalDate(proposal));

        return `
          <article class="dashboard-search-item p-4 border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50 transition">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="font-semibold text-gray-900 truncate">
                  ${escapeHtml(title)}
                </div>

                <div class="text-xs text-gray-500 mt-1">
                  ${escapeHtml(user)} • ${escapeHtml(date)}
                </div>
              </div>

              <div class="shrink-0">
                ${statusBadgeHtml(status)}
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  }

  // ======================================================
  // CHARTS
  // ======================================================

  function getCollegeLabel(item) {
    return (
      item.college ||
      item.college_name ||
      item.name ||
      item.college_code ||
      "Unknown College"
    );
  }

  function renderProposalsChart(data) {
    const canvas = qs("chartProposals");

    if (!canvas || !chartAvailable()) return;

    const ctx = canvas.getContext("2d");

    destroyChart(proposalsChart);

    const rows = safeArray(data).filter((item) => safeNumber(item.count) > 0);

    const labels = rows.length
      ? rows.map(getCollegeLabel)
      : ["No data"];

    const values = rows.length
      ? rows.map((item) => safeNumber(item.count))
      : [0];

    const gradient = createGradient(ctx, "#0ea5a4", "rgba(31,43,58,0.35)");

    proposalsChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Proposals",
            data: values,
            backgroundColor: rows.length ? gradient : "rgba(156,163,175,0.25)",
            borderRadius: 10,
            borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: rows.length > 0,
            callbacks: {
              label: (context) => `Proposals: ${context.raw}`
            }
          }
        },
        scales: {
          x: {
            ticks: {
              font: {
                size: 11
              }
            },
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              stepSize: 1
            }
          }
        }
      }
    });
  }

  function renderRolesChart(data) {
    const canvas = qs("chartRoles");
    const legendDiv = qs("roleLegend");

    if (!canvas || !chartAvailable()) return;

    const ctx = canvas.getContext("2d");

    destroyChart(rolesChart);

    const rows = safeArray(data).filter((item) => safeNumber(item.count) > 0);

    const labels = rows.length
      ? rows.map((item) => item.role || item.user_role || "Unknown Role")
      : ["No data"];

    const values = rows.length
      ? rows.map((item) => safeNumber(item.count))
      : [1];

    const colors = rows.length
      ? CHART_COLORS.slice(0, labels.length)
      : ["rgba(156,163,175,0.3)"];

    rolesChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: colors,
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "60%",
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: rows.length > 0
          }
        }
      }
    });

    if (legendDiv) {
      if (!rows.length) {
        legendDiv.innerHTML = `
          <div class="text-sm text-gray-500 bg-gray-50 border border-gray-100 rounded-xl p-4">
            No user role data available.
          </div>
        `;
        return;
      }

      legendDiv.innerHTML = labels
        .map((label, index) => {
          const color = CHART_COLORS[index % CHART_COLORS.length];

          return `
            <div class="flex items-center justify-between gap-3 text-sm">
              <div class="flex items-center gap-2 min-w-0">
                <span class="w-3 h-3 rounded-full shrink-0" style="background:${color};"></span>
                <span class="text-gray-700 truncate">${escapeHtml(label)}</span>
              </div>
              <span class="text-gray-500 font-semibold">${formatNumber(values[index])}</span>
            </div>
          `;
        })
        .join("");
    }
  }

  function getLast12Months() {
    const months = [];
    const date = new Date();

    for (let i = 11; i >= 0; i--) {
      const d = new Date(date.getFullYear(), date.getMonth() - i, 1);

      months.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        short: d.toLocaleString("default", { month: "short" }),
        label: d.toLocaleString("default", {
          month: "short",
          year: "numeric"
        })
      });
    }

    return months;
  }

  function normalizeMonthKey(row) {
    const raw =
      row.month_key ||
      row.month ||
      row.monthName ||
      row.month_name ||
      row.label ||
      "";

    const text = String(raw).trim();

    if (/^\d{4}-\d{2}$/.test(text)) {
      return text;
    }

    const parsed = new Date(text);

    if (!Number.isNaN(parsed.getTime())) {
      return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
    }

    return text.slice(0, 3);
  }

  function renderMonthlyChart(dataFromDB) {
    const canvas = qs("chartMonthly");

    if (!canvas || !chartAvailable()) return;

    const ctx = canvas.getContext("2d");

    destroyChart(monthlyChart);

    const months = getLast12Months();
    const dbMap = {};

    safeArray(dataFromDB).forEach((row) => {
      const key = normalizeMonthKey(row);
      const count = safeNumber(row.count || row.total || row.submissions);

      if (key) {
        dbMap[key] = count;
      }
    });

    const labels = months.map((month) => month.short);

    const dataset = months.map((month) => {
      return dbMap[month.key] ?? dbMap[month.short] ?? 0;
    });

    const gradient = ctx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, "rgba(14,165,164,0.45)");
    gradient.addColorStop(1, "rgba(14,165,164,0)");

    monthlyChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Submissions",
            data: dataset,
            fill: true,
            backgroundColor: gradient,
            borderColor: "#0ea5a4",
            borderWidth: 3,
            tension: 0.35,
            pointRadius: 4,
            pointHoverRadius: 7,
            pointBackgroundColor: "#1f2b3a",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => `Submissions: ${context.raw}`
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              stepSize: 1
            }
          }
        }
      }
    });
  }

  function renderCharts(data) {
    renderProposalsChart(data.proposalsPerCollege || []);
    renderRolesChart(data.userRoles || []);
    renderMonthlyChart(data.monthlySubmissions || []);
  }

  // ======================================================
  // DASHBOARD SEARCH
  // ======================================================

  function getSearchableCards() {
    return qsa("main a, .dashboard-search-item").filter((element) => {
      return !element.closest("header");
    });
  }

  function applyDashboardSearch(keyword) {
    const query = normalizeText(keyword);
    const cards = getSearchableCards();

    if (!cards.length) return;

    cards.forEach((card) => {
      const text = normalizeText(card.textContent);
      const matched = !query || text.includes(query);

      card.classList.toggle("hidden", !matched);
    });
  }

  function bindSearchInputs() {
    const desktopSearch = qs("search");
    const mobileSearch = qs("mobileSearch");

    const syncAndSearch = (source, target) => {
      const value = source.value;

      if (target && target.value !== value) {
        target.value = value;
      }

      applyDashboardSearch(value);
    };

    if (desktopSearch) {
      desktopSearch.addEventListener("input", () => {
        syncAndSearch(desktopSearch, mobileSearch);
      });
    }

    if (mobileSearch) {
      mobileSearch.addEventListener("input", () => {
        syncAndSearch(mobileSearch, desktopSearch);
      });
    }
  }

  // ======================================================
  // LOADING STATES
  // ======================================================

  function renderLoadingState() {
    const activityList = qs("activityList");

    if (activityList) {
      activityList.innerHTML = `
        <div class="p-4 rounded-xl border border-dashed border-gray-200 text-sm text-gray-500 bg-gray-50">
          Loading recent activities...
        </div>
      `;
    }

    renderStats(
      {
        users: 0,
        colleges: 0,
        proposals: 0
      },
      0
    );
  }

  // ======================================================
  // INITIALIZATION
  // ======================================================

  async function initAdminDashboard() {
    renderLoadingState();
    bindSearchInputs();

    const [dashboardData, pendingCount] = await Promise.all([
      loadDashboardData(),
      loadPendingUsersCount()
    ]);

    renderStats(dashboardData.stats || {}, pendingCount);
    renderRecentProposals(dashboardData.recentProposals || []);
    renderCharts(dashboardData);
  }

  document.addEventListener("DOMContentLoaded", initAdminDashboard);
})();