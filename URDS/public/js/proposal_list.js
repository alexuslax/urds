document.addEventListener("DOMContentLoaded", async () => {
  "use strict";

  // =========================================================
  // UEP-URDS Research Management System
  // Proposal List Script
  // =========================================================

  const listEl = document.getElementById("proposalList");
  const countLine = document.getElementById("countLine");

  const searchTop = document.getElementById("search");
  const filterCollege = document.getElementById("filterCollege");
  const filterCluster = document.getElementById("filterCluster");
  const filterStatus = document.getElementById("filterStatus");
  const filterText = document.getElementById("filterText");
  const clearBtn = document.getElementById("clearFilters");

  const pageTitleEl = document.getElementById("pageTitle");

  let proposals = [];
  let reviewedMap = new Map();

  const rawRole = localStorage.getItem("userRole") || "";
  const userRole = normalizeRole(rawRole);

  const STATUS_META = {
    draft: {
      label: "Draft",
      badge: "bg-gray-100 text-gray-700",
      border: "border-l-gray-400"
    },
    pending: {
      label: "Submitted / Pending",
      badge: "bg-yellow-100 text-yellow-800",
      border: "border-l-yellow-400"
    },
    review: {
      label: "Under Review",
      badge: "bg-blue-100 text-blue-800",
      border: "border-l-blue-500"
    },
    returned: {
      label: "Returned for Revision",
      badge: "bg-orange-100 text-orange-800",
      border: "border-l-orange-500"
    },
    approved: {
      label: "Approved / Completed",
      badge: "bg-green-100 text-green-800",
      border: "border-l-green-500"
    },
    ongoing: {
      label: "Ongoing / Implementation",
      badge: "bg-teal-100 text-teal-800",
      border: "border-l-teal-500"
    },
    rejected: {
      label: "Rejected / Terminated",
      badge: "bg-red-100 text-red-800",
      border: "border-l-red-500"
    }
  };

  // =========================================================
  // Helpers
  // =========================================================

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

  function normalizeRole(role) {
    const r = normalizeText(role);

    if (!r) return "";

    if (r.includes("administrator") || r === "admin") return "Administrator";
    if (r.includes("college research coordinator") || r === "crc" || r.includes("research coordinator")) return "College Research Coordinator";
    if (r.includes("college dean") || r.includes("dean")) return "Dean";
    if (r.includes("senior faculty") || r.includes("twg") || r.includes("technical working group")) return "TWG";
    if (r.includes("urec")) return "UREC";
    if (r.includes("director")) return "URDS Director";
    if (r.includes("staff")) return "URDS Staff";
    if (r.includes("faculty researcher") || r === "researcher") return "Faculty Researcher";

    return role;
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

  function getProposalId(proposal) {
    return (
      proposal.id ||
      proposal.proposal_id ||
      proposal.proposalId ||
      proposal.research_id ||
      proposal.researchId ||
      ""
    );
  }

  function getTitle(proposal) {
    return (
      proposal.title ||
      proposal.program_title ||
      proposal.proposal_title ||
      proposal.research_title ||
      proposal.project_title ||
      "Untitled Proposal"
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
      "Unknown Leader"
    );
  }

  function getCollege(proposal) {
    return (
      proposal.college ||
      proposal.college_name ||
      "Unknown College"
    );
  }

  function getDepartment(proposal) {
    return (
      proposal.department ||
      proposal.department_name ||
      proposal.dept ||
      ""
    );
  }

  function getCluster(proposal) {
    return (
      proposal.cluster ||
      proposal.commodity ||
      proposal.category ||
      "Unspecified Cluster"
    );
  }

  function getStatus(proposal) {
    return (
      proposal.status ||
      proposal.proposal_status ||
      proposal.current_status ||
      proposal.currentStatus ||
      "Submitted"
    );
  }

  function makeReadableStatus(status) {
    const text = String(status || "Submitted")
      .replace(/_/g, " ")
      .replace(/-/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return text.replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function getStatusGroup(status) {
    const s = normalizeText(status);

    if (!s) return "pending";

    if (
      s.includes("draft") ||
      s.includes("not started") ||
      s.includes("not yet")
    ) {
      return "draft";
    }

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
      s.includes("correction") ||
      s.includes("needs correction")
    ) {
      return "returned";
    }

    if (
      s.includes("ongoing") ||
      s.includes("on going") ||
      s.includes("implementation") ||
      s.includes("implement") ||
      s.includes("conduct of research")
    ) {
      return "ongoing";
    }

    if (
      s.includes("approved") ||
      s.includes("approve") ||
      s.includes("endorsed") ||
      s.includes("endorsement") ||
      s.includes("special order") ||
      s.includes("notice to proceed") ||
      s.includes("ntp") ||
      s.includes("issued") ||
      s.includes("completed") ||
      s.includes("closed") ||
      s.includes("passed")
    ) {
      return "approved";
    }

    if (
      s.includes("review") ||
      s.includes("evaluation") ||
      s.includes("evaluate") ||
      s.includes("screening") ||
      s.includes("screen") ||
      s.includes("dean") ||
      s.includes("twg") ||
      s.includes("urec") ||
      s.includes("urds") ||
      s.includes("director") ||
      s.includes("in house") ||
      s.includes("inhouse") ||
      s.includes("monitoring") ||
      s.startsWith("for ")
    ) {
      return "review";
    }

    if (
      s.includes("submitted") ||
      s.includes("pending") ||
      s.includes("waiting") ||
      s.includes("received")
    ) {
      return "pending";
    }

    return "pending";
  }

  function statusBadgeHtml(status) {
    const group = getStatusGroup(status);
    const meta = STATUS_META[group] || STATUS_META.pending;

    return `
      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${meta.badge}">
        <span class="w-2 h-2 rounded-full inline-block" style="background-color: currentColor;"></span>
        ${escapeHtml(makeReadableStatus(status || meta.label))}
      </span>
    `;
  }

  function showMessage(type, message) {
    if (!listEl) return;

    const className =
      type === "error"
        ? "bg-red-50 border-red-200 text-red-700"
        : "bg-white border-gray-200 text-gray-500";

    listEl.innerHTML = `
      <div class="p-6 rounded-2xl border border-dashed ${className} text-sm text-center">
        ${message}
      </div>
    `;
  }

  function getPageTitleByRole(role) {
    const titles = {
      "College Research Coordinator": "College Proposals for Screening",
      "Dean": "College Proposals for Dean Endorsement",
      "URDS Staff": "URDS Review and Evaluation Proposals",
      "TWG": "Proposals for TWG Evaluation",
      "UREC": "Proposals for UREC Review",
      "URDS Director": "Proposals for Director Review",
      "Administrator": "All Proposals",
      "Faculty Researcher": "My Proposals"
    };

    return titles[role] || "Proposals";
  }

  function setPageTitle() {
    const title = getPageTitleByRole(userRole);

    if (pageTitleEl) pageTitleEl.textContent = title;
    document.title = `${title} - URDS`;
  }

  // =========================================================
  // API helpers
  // =========================================================

  async function fetchJson(url, fallback) {
    try {
      const response = await fetch(url, {
        method: "GET",
        credentials: "include"
      });

      if (!response.ok) {
        console.error(`Request failed: ${url}`, response.status, response.statusText);
        return fallback;
      }

      const text = await response.text();

      try {
        return JSON.parse(text);
      } catch (error) {
        console.error(`Invalid JSON from ${url}:`, text);
        return fallback;
      }
    } catch (error) {
      console.error(`Error loading ${url}:`, error);
      return fallback;
    }
  }

  async function fetchColleges() {
    const result = await fetchJson("../../backend/get_colleges.php", {
      status: "error",
      colleges: []
    });

    return result.status === "success" || result.success === true
      ? result.colleges || []
      : [];
  }

  async function fetchClusters() {
    const result = await fetchJson("../../backend/get_clusters.php", {
      status: "error",
      clusters: []
    });

    return result.status === "success" || result.success === true
      ? result.clusters || []
      : [];
  }

  async function fetchReviewedProposals() {
    reviewedMap = new Map();

    const result = await fetchJson("../../backend/get_reviewed_proposals.php", {
      status: "error",
      proposals: []
    });

    const section = document.getElementById("monitoredSection");
    const list = document.getElementById("monitoredList");

    if (!section || !list) return;

    if (!(result.status === "success" || result.success === true) || !Array.isArray(result.proposals) || !result.proposals.length) {
      section.classList.add("hidden");
      list.innerHTML = "";
      return;
    }

    result.proposals.forEach((proposal) => {
      const id = getProposalId(proposal);
      reviewedMap.set(String(id), String(proposal.last_action || "").toLowerCase());
    });

    list.innerHTML = result.proposals
      .slice(0, 6)
      .map((proposal) => {
        const id = getProposalId(proposal);
        const title = getTitle(proposal);
        const lastReviewed = proposal.last_reviewed_at || proposal.reviewed_at || "";
        const lastAction = proposal.last_action || "Reviewed";

        return `
          <div class="bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div class="min-w-0">
              <div class="font-semibold text-gray-900 truncate">${escapeHtml(title)}</div>
              <div class="text-xs text-gray-500 mt-1">
                Last reviewed: ${escapeHtml(formatDate(lastReviewed))} • ${escapeHtml(makeReadableStatus(lastAction))}
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                class="btnOpenReviewed px-3 py-2 bg-urds-900 text-white rounded-lg text-xs font-bold hover:bg-urds-800 active:scale-95 transition"
                data-id="${escapeHtml(id)}"
                type="button"
              >
                Open
              </button>

              <a
                class="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-100 transition"
                href="proposal_preview.html?id=${encodeURIComponent(id)}"
              >
                Preview
              </a>
            </div>
          </div>
        `;
      })
      .join("");

    section.classList.remove("hidden");
  }

  async function fetchProposals() {
    if (listEl) {
      listEl.innerHTML = `
        <div class="bg-white p-5 rounded-2xl shadow-card border border-dashed border-gray-200 text-sm text-gray-500">
          Loading proposals...
        </div>
      `;
    }

    const result = await fetchJson("../../backend/get_all_proposals.php", {
      status: "error",
      proposals: []
    });

    if (result.status === "success" || result.success === true) {
      proposals = result.proposals || result.data || [];

      applyRecentlyUpdatedProposal();

      const [colleges, clusters] = await Promise.all([
        fetchColleges(),
        fetchClusters()
      ]);

      populateFilters(proposals, colleges, clusters);
      await fetchReviewedProposals();
      render();

      return;
    }

    const message = result.message || result.error || "Failed to load proposals.";

    showMessage("error", escapeHtml(message));

    if (String(message).toLowerCase().includes("not logged in")) {
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1200);
    }
  }

  function applyRecentlyUpdatedProposal() {
    try {
      const recent = JSON.parse(localStorage.getItem("recentlyUpdatedProposal") || "null");

      if (!recent || !recent.id) return;

      const index = proposals.findIndex((proposal) => {
        return String(getProposalId(proposal)) === String(recent.id);
      });

      if (index >= 0 && recent.status) {
        proposals[index].status = recent.status;
      }

      localStorage.removeItem("recentlyUpdatedProposal");
    } catch (error) {
      console.warn("Unable to apply recently updated proposal:", error);
    }
  }

  // =========================================================
  // Filters
  // =========================================================

  function getCollegeName(college) {
    if (typeof college === "string") return college;

    return (
      college.college_name ||
      college.name ||
      college.title ||
      ""
    );
  }

  function getClusterName(cluster) {
    if (typeof cluster === "string") return cluster;

    return (
      cluster.cluster_name ||
      cluster.name ||
      cluster.title ||
      ""
    );
  }

  function uniqueSorted(values) {
    return [...new Set(values.map(String).filter(Boolean))].sort((a, b) => {
      return a.localeCompare(b);
    });
  }

  function populateSelect(selectEl, defaultLabel, values) {
    if (!selectEl) return;

    selectEl.innerHTML =
      `<option value="">${escapeHtml(defaultLabel)}</option>` +
      values
        .map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)
        .join("");
  }

  function hideCollegeFilterForCollegeRoles() {
    if (!filterCollege) return;

    const shouldHide =
      userRole === "College Research Coordinator" ||
      userRole === "Dean";

    const wrapper = filterCollege.closest("div");

    if (wrapper && shouldHide) {
      wrapper.style.display = "none";
    }
  }

  function getStatusOptionsByRole() {
    const common = [
      "Draft",
      "Submitted",
      "For Screening",
      "For Dean Endorsement",
      "For URDS Review",
      "For TWG Evaluation",
      "For In-House Review",
      "For UREC Review",
      "For Director Review",
      "Returned for Revision",
      "Approved",
      "Rejected",
      "Special Order Issued",
      "Notice to Proceed Issued",
      "Ongoing",
      "Monitoring",
      "Completed",
      "Terminated"
    ];

    const roleStatuses = {
      "College Research Coordinator": [
        "For Screening",
        "Returned for Revision",
        "For Dean Endorsement",
        "Approved",
        "Rejected"
      ],
      "Dean": [
        "For Dean Endorsement",
        "Returned for Revision",
        "For URDS Review",
        "Approved",
        "Rejected"
      ],
      "URDS Staff": [
        "For URDS Review",
        "For TWG Evaluation",
        "For UREC Review",
        "For Director Review",
        "Returned for Revision",
        "Approved",
        "Rejected"
      ],
      "TWG": [
        "For TWG Evaluation",
        "For UREC Review",
        "Returned for Revision",
        "Approved",
        "Rejected"
      ],
      "UREC": [
        "For UREC Review",
        "For Director Review",
        "Returned for Revision",
        "Approved",
        "Rejected"
      ],
      "URDS Director": [
        "For Director Review",
        "Returned for Revision",
        "Approved",
        "Rejected"
      ]
    };

    return roleStatuses[userRole] || common;
  }

  function populateFilters(data, colleges, clusters) {
    hideCollegeFilterForCollegeRoles();

    const collegeValues = colleges.length
      ? uniqueSorted(colleges.map(getCollegeName))
      : uniqueSorted(data.map(getCollege));

    const clusterValues = clusters.length
      ? uniqueSorted(clusters.map(getClusterName))
      : uniqueSorted(data.map(getCluster));

    const statusValues = getStatusOptionsByRole();

    populateSelect(filterCollege, "All Colleges", collegeValues);
    populateSelect(filterCluster, "All Clusters", clusterValues);
    populateSelect(filterStatus, "All Statuses", statusValues);
  }

  function clearFilters() {
    if (filterCollege) filterCollege.value = "";
    if (filterCluster) filterCluster.value = "";
    if (filterStatus) filterStatus.value = "";
    if (filterText) filterText.value = "";
    if (searchTop) searchTop.value = "";

    render();
  }

  function proposalMatchesFilters(proposal) {
    const college = getCollege(proposal);
    const cluster = getCluster(proposal);
    const status = getStatus(proposal);
    const title = getTitle(proposal);
    const leader = getLeader(proposal);
    const department = getDepartment(proposal);

    const selectedCollege = filterCollege?.value || "";
    const selectedCluster = filterCluster?.value || "";
    const selectedStatus = filterStatus?.value || "";

    const keyword = String(filterText?.value || "").trim().toLowerCase();

    const matchesCollege = !selectedCollege || college === selectedCollege;
    const matchesCluster = !selectedCluster || cluster === selectedCluster;
    const matchesStatus = !selectedStatus || normalizeText(status).includes(normalizeText(selectedStatus));

    const searchString = `${title} ${leader} ${college} ${department} ${cluster} ${status}`.toLowerCase();
    const matchesKeyword = !keyword || searchString.includes(keyword);

    return matchesCollege && matchesCluster && matchesStatus && matchesKeyword;
  }

  function proposalVisibleToRole(proposal) {
    const status = normalizeText(getStatus(proposal));

    if (userRole === "Faculty Researcher") {
      return true;
    }

    if (userRole === "UREC") {
      return !status.includes("director");
    }

    if (userRole === "URDS Director") {
      return (
        status.includes("for director") ||
        status === "approved" ||
        status === "rejected" ||
        status === "returned for revision"
      );
    }

    return true;
  }

  // =========================================================
  // Role-based actions
  // =========================================================

  function actionForProposal(proposal) {
    const status = normalizeText(getStatus(proposal));
    const statusText = makeReadableStatus(getStatus(proposal));

    if (userRole === "College Research Coordinator") {
      if (status === "for screening") {
        return actionButton("Initial Screening", "screening", "bg-orange-600 hover:bg-orange-700 active:bg-orange-800");
      }

      if (status === "for dean endorsement") {
        return readOnlyPill("Monitoring: Awaiting Dean Endorsement", "bg-blue-50 border-blue-200 text-blue-700");
      }
    }

    if (userRole === "Dean") {
      if (status === "for dean endorsement") {
        return actionButton("Endorse Proposal", "endorse", "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800");
      }

      if (status === "for urds review") {
        return readOnlyPill("View Only: At URDS Review", "bg-green-50 border-green-200 text-green-700");
      }
    }

    if (userRole === "URDS Staff") {
      if (status === "for urds review") {
        return actionButton("Review Proposal", "urds", "bg-green-600 hover:bg-green-700 active:bg-green-800");
      }

      if (
        status === "for twg evaluation" ||
        status === "for urec review" ||
        status === "for director review"
      ) {
        return readOnlyPill(`Monitoring: ${statusText}`, "bg-purple-50 border-purple-200 text-purple-700");
      }
    }

    if (userRole === "TWG") {
      if (status === "for twg evaluation") {
        return actionButton("Evaluate Proposal", "twg", "bg-purple-600 hover:bg-purple-700 active:bg-purple-800");
      }

      if (status === "for urec review") {
        return readOnlyPill("Monitoring: At UREC Review", "bg-indigo-50 border-indigo-200 text-indigo-700");
      }
    }

    if (userRole === "UREC") {
      if (status === "for urec review") {
        return actionButton("UREC Review", "urec", "bg-blue-600 hover:bg-blue-700 active:bg-blue-800");
      }

      if (status === "for director review") {
        return readOnlyPill("Monitoring: At Director Review", "bg-emerald-50 border-emerald-200 text-emerald-700");
      }
    }

    if (userRole === "URDS Director") {
      if (status === "for director review") {
        return actionButton("Approve / Final Review", "approve", "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800");
      }

      if (
        status === "for urds review" ||
        status === "for twg evaluation" ||
        status === "for urec review" ||
        status === "returned for revision"
      ) {
        return readOnlyPill(`Monitoring: ${statusText}`, "bg-yellow-50 border-yellow-200 text-yellow-700");
      }
    }

    if (status === "returned for revision") {
      return readOnlyPill("Returned for Revision", "bg-orange-50 border-orange-200 text-orange-700");
    }

    if (status === "approved" || status === "rejected") {
      return readOnlyPill(
        status === "approved" ? "Approved Record" : "Rejected Record",
        "bg-gray-50 border-gray-200 text-gray-600"
      );
    }

    return "";
  }

  function actionButton(label, action, colorClasses) {
    return `
      <button
        class="btnAction px-4 py-2 ${colorClasses} text-white rounded-lg text-sm font-bold hover:shadow-md active:scale-95 transition"
        data-action="${escapeHtml(action)}"
        type="button"
      >
        ${escapeHtml(label)}
      </button>
    `;
  }

  function readOnlyPill(label, colorClasses) {
    return `
      <div class="inline-flex items-center px-4 py-2 border rounded-lg text-sm font-semibold ${colorClasses}">
        ${escapeHtml(label)}
      </div>
    `;
  }

  function getActionRoute(action) {
    const routes = {
      screening: "initial_screening.html",
      endorse: "dean_endorse.html",
      urds: "staff_inhousereview.html",
      twg: "twg_evaluation.html",
      urec: "urec_review.html",
      approve: "director_inhousereview.html"
    };

    return routes[action] || "proposal_preview.html";
  }

  // =========================================================
  // Rendering
  // =========================================================

  function render() {
    if (!listEl) return;

    const visibleProposals = proposals
      .filter(proposalVisibleToRole)
      .filter(proposalMatchesFilters);

    if (countLine) {
      countLine.textContent = `${visibleProposals.length} of ${proposals.length} proposals`;
    }

    if (!visibleProposals.length) {
      listEl.innerHTML = `
        <div class="bg-white p-8 rounded-2xl shadow-card border border-dashed border-gray-200 text-center">
          <div class="text-lg font-semibold text-gray-700">No proposals found</div>
          <p class="text-sm text-gray-500 mt-1">Try changing your search or filters.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = visibleProposals
      .map((proposal) => proposalCardHtml(proposal))
      .join("");
  }

  function proposalCardHtml(proposal) {
    const id = getProposalId(proposal);
    const title = getTitle(proposal);
    const leader = getLeader(proposal);
    const college = getCollege(proposal);
    const department = getDepartment(proposal);
    const cluster = getCluster(proposal);
    const status = getStatus(proposal);
    const statusGroup = getStatusGroup(status);
    const statusMeta = STATUS_META[statusGroup] || STATUS_META.pending;

    const reviewedAction = reviewedMap.get(String(id));
    const reviewedText = reviewedAction
      ? `<div class="text-xs text-gray-500 mt-1">Last action by you: <span class="font-semibold">${escapeHtml(makeReadableStatus(reviewedAction))}</span></div>`
      : "";

    const actionHtml = actionForProposal(proposal);

    return `
      <div class="proposal-card bg-white p-5 rounded-2xl border border-gray-100 border-l-4 ${statusMeta.border} shadow-sm hover:shadow-lg transition"
           data-id="${escapeHtml(id)}">
        <div class="flex flex-col gap-4">

          <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="font-semibold text-base text-gray-900">
                  ${escapeHtml(title)}
                </h3>
                ${statusBadgeHtml(status)}
              </div>

              <div class="text-xs text-gray-600 mt-2">
                Leader:
                <span class="font-medium">${escapeHtml(leader)}</span>
                • ${escapeHtml(college)}
                ${department ? " / " + escapeHtml(department) : ""}
              </div>

              <div class="text-xs text-gray-600 mt-1">
                Cluster:
                <span class="font-medium">${escapeHtml(cluster)}</span>
              </div>

              ${reviewedText}
            </div>
          </div>

          ${
            actionHtml
              ? `
                <div class="border-t border-gray-100 pt-3">
                  ${actionHtml}
                </div>
              `
              : ""
          }

          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-3 border-t border-gray-100">
            <div class="flex flex-wrap gap-2">
              <button
                class="btnForm px-3 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 hover:border-blue-300 active:bg-blue-200 active:scale-95 transition"
                data-form="fm003"
                data-id="${escapeHtml(id)}"
                type="button"
              >
                Capsule
              </button>

              <button
                class="btnForm px-3 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs font-bold hover:bg-green-100 hover:border-green-300 active:bg-green-200 active:scale-95 transition"
                data-form="fm004"
                data-id="${escapeHtml(id)}"
                type="button"
              >
                Workplan
              </button>

              <button
                class="btnForm px-3 py-2 bg-purple-50 border border-purple-200 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-100 hover:border-purple-300 active:bg-purple-200 active:scale-95 transition"
                data-form="fm005"
                data-id="${escapeHtml(id)}"
                type="button"
              >
                Budget
              </button>
            </div>

            <button
              class="btnView px-4 py-2 bg-urds-800 text-white rounded-lg text-xs font-bold hover:bg-urds-900 hover:shadow-md active:scale-95 transition"
              data-id="${escapeHtml(id)}"
              type="button"
            >
              View Full
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================
  // Events
  // =========================================================

  function bindEvents() {
    if (searchTop && filterText) {
      searchTop.addEventListener("input", () => {
        filterText.value = searchTop.value;
        render();
      });

      filterText.addEventListener("input", () => {
        searchTop.value = filterText.value;
        render();
      });
    } else {
      searchTop?.addEventListener("input", render);
      filterText?.addEventListener("input", render);
    }

    filterCollege?.addEventListener("change", render);
    filterCluster?.addEventListener("change", render);
    filterStatus?.addEventListener("change", render);
    clearBtn?.addEventListener("click", clearFilters);

    listEl?.addEventListener("click", (event) => {
      const actionBtn = event.target.closest(".btnAction");
      const viewBtn = event.target.closest(".btnView");
      const formBtn = event.target.closest(".btnForm");
      const openReviewedBtn = event.target.closest(".btnOpenReviewed");

      if (actionBtn) {
        const card = actionBtn.closest(".proposal-card");
        const id = card?.dataset.id;
        const action = actionBtn.dataset.action;

        if (!id) return;

        localStorage.setItem("viewProposalId", id);

        const route = getActionRoute(action);
        window.location.href = `${route}?id=${encodeURIComponent(id)}`;
        return;
      }

      if (viewBtn) {
        const id = viewBtn.dataset.id;

        localStorage.setItem("viewProposalId", id);
        window.location.href = `proposal_preview.html?id=${encodeURIComponent(id)}`;
        return;
      }

      if (formBtn) {
        const id = formBtn.dataset.id;
        const form = formBtn.dataset.form;

        const formPages = {
          fm003: "capsule_print.html",
          fm004: "workplan_print.html",
          fm005: "budget_print.html"
        };

        const page = formPages[form];

        if (!page) return;

        localStorage.setItem("viewProposalId", id);
        window.location.href = `${page}?id=${encodeURIComponent(id)}`;
        return;
      }

      if (openReviewedBtn) {
        const id = openReviewedBtn.dataset.id;

        localStorage.setItem("viewProposalId", id);
        window.location.href = `urec_review.html?id=${encodeURIComponent(id)}`;
      }
    });

    document.addEventListener("click", (event) => {
      const reviewedBtn = event.target.closest(".btnOpenReviewed");

      if (!reviewedBtn) return;

      const id = reviewedBtn.dataset.id;

      localStorage.setItem("viewProposalId", id);
      window.location.href = `urec_review.html?id=${encodeURIComponent(id)}`;
    });
  }

  // =========================================================
  // Init
  // =========================================================

  async function init() {
    setPageTitle();
    bindEvents();
    await fetchProposals();
  }

  init();
});