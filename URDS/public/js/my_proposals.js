document.addEventListener("DOMContentLoaded", async () => {
  "use strict";

  // =========================================================
  // UEP-URDS Research Management System
  // My Proposals Script
  // =========================================================

  const proposalList = document.getElementById("proposalList");
  const searchEl = document.getElementById("search");
  const countLine = document.getElementById("countLine");
  const tabSubmitted = document.getElementById("tabSubmitted");
  const tabDrafts = document.getElementById("tabDrafts");

  let proposals = [];
  let currentTab = "submitted";

  const STATUS_META = {
    draft: {
      label: "Draft",
      badge: "bg-gray-100 text-gray-700"
    },
    pending: {
      label: "Submitted / Pending",
      badge: "bg-yellow-100 text-yellow-800"
    },
    review: {
      label: "Under Review",
      badge: "bg-blue-100 text-blue-800"
    },
    returned: {
      label: "Returned for Revision",
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

  // =========================================================
  // Basic helpers
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

  function safeDate(value) {
    if (!value) return null;

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function formatDateShort(value) {
    const date = safeDate(value);

    if (!date) return "-";

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
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

  function getProposalTitle(proposal) {
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

  function getStatus(proposal) {
    return (
      proposal.status ||
      proposal.proposal_status ||
      proposal.current_status ||
      proposal.currentStatus ||
      "Submitted"
    );
  }

  function getSubmittedDate(proposal) {
    return (
      proposal.dateSubmitted ||
      proposal.date_submitted ||
      proposal.submitted_at ||
      proposal.created_at ||
      proposal.createdAt ||
      proposal.updated_at ||
      proposal.updatedAt ||
      ""
    );
  }

  function showMessage(type, message) {
    if (!proposalList) return;

    const colorClass =
      type === "error"
        ? "text-red-600 border-red-200 bg-red-50"
        : "text-gray-500 border-gray-200 bg-white";

    proposalList.innerHTML = `
      <div class="p-6 rounded-2xl border border-dashed ${colorClass} text-sm text-center">
        ${message}
      </div>
    `;
  }

  // =========================================================
  // Load proposals
  // =========================================================

  async function loadProposals() {
    try {
      if (proposalList) {
        proposalList.innerHTML = `
          <div class="bg-white p-5 rounded-2xl shadow-card border border-dashed border-gray-200 text-sm text-gray-500">
            Loading proposals...
          </div>
        `;
      }

      const response = await fetch("../../backend/get_my_proposals.php", {
        method: "GET",
        credentials: "include"
      });

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

      if (Array.isArray(result)) {
        return result;
      }

      if (result.status === "success" || result.success === true) {
        return result.proposals || result.data || [];
      }

      const message = result.message || result.error || "Unable to load proposals.";

      if (String(message).toLowerCase().includes("not logged in")) {
        showMessage(
          "error",
          `Please <a href="login.html" class="text-blue-600 underline">login</a> to view your proposals.`
        );

        setTimeout(() => {
          window.location.href = "login.html";
        }, 1200);

        return [];
      }

      showMessage("error", `Error: ${escapeHtml(message)}`);
      return [];
    } catch (error) {
      console.error("Error fetching proposals:", error);
      showMessage("error", `Failed to connect to database. ${escapeHtml(error.message)}`);
      return [];
    }
  }

  // =========================================================
  // Filtering and rendering
  // =========================================================

  function getSearchText(proposal) {
    return [
      getProposalTitle(proposal),
      getLeader(proposal),
      getCollege(proposal),
      getDepartment(proposal),
      getStatus(proposal)
    ]
      .join(" ")
      .toLowerCase();
  }

  function getFilteredProposals() {
    const query = String(searchEl?.value || "").trim().toLowerCase();

    return proposals.filter((proposal) => {
      const statusGroup = getStatusGroup(getStatus(proposal));
      const isDraft = statusGroup === "draft";

      if (currentTab === "drafts" && !isDraft) return false;
      if (currentTab === "submitted" && isDraft) return false;

      if (!query) return true;

      return getSearchText(proposal).includes(query);
    });
  }

  function updateCountLine(count) {
    if (!countLine) return;

    if (currentTab === "drafts") {
      countLine.textContent = `${count} draft${count === 1 ? "" : "s"}`;
    } else {
      countLine.textContent = `${count} submitted proposal${count === 1 ? "" : "s"}`;
    }
  }

  function emptyStateHtml() {
    const label = currentTab === "drafts" ? "drafts" : "submitted proposals";

    return `
      <div class="bg-white p-8 rounded-2xl shadow-card border border-dashed border-gray-200 text-center">
        <div class="text-lg font-semibold text-gray-700">No ${label} found</div>
        <p class="text-sm text-gray-500 mt-1">
          ${currentTab === "drafts"
            ? "Your saved draft proposals will appear here."
            : "Your submitted research proposals will appear here."}
        </p>
        ${currentTab === "submitted"
          ? `
            <a href="submit_proposal_wizard.html"
               class="inline-flex items-center justify-center mt-4 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 active:bg-emerald-800 hover:shadow-md active:scale-95 transition">
              + New Submission
            </a>
          `
          : ""}
      </div>
    `;
  }

  function proposalCardHtml(proposal) {
    const id = getProposalId(proposal);
    const title = getProposalTitle(proposal);
    const leader = getLeader(proposal);
    const college = getCollege(proposal);
    const department = getDepartment(proposal);
    const status = getStatus(proposal);
    const statusGroup = getStatusGroup(status);
    const isDraft = statusGroup === "draft";
    const submitted = formatDateShort(getSubmittedDate(proposal));

    const borderColor = {
      draft: "border-l-gray-400",
      pending: "border-l-yellow-400",
      review: "border-l-blue-500",
      returned: "border-l-orange-500",
      approved: "border-l-green-500",
      ongoing: "border-l-teal-500",
      rejected: "border-l-red-500"
    }[statusGroup] || "border-l-gray-400";

    return `
      <div class="bg-white p-5 rounded-2xl shadow-card border border-gray-100 border-l-4 ${borderColor} hover:shadow-lg transition">
        <div class="flex flex-col gap-4">

          <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="text-lg font-semibold text-gray-900">
                  ${escapeHtml(title)}
                </h3>
                ${statusBadgeHtml(status)}
              </div>

              <p class="text-sm text-gray-600 mt-2">
                ${isDraft ? "Last saved" : "Submitted"}:
                <span class="font-medium">${escapeHtml(submitted)}</span>
              </p>

              <p class="text-xs text-gray-500 mt-1">
                Leader:
                <span class="font-medium">${escapeHtml(leader)}</span>
                • ${escapeHtml(college)}
                ${department ? " / " + escapeHtml(department) : ""}
              </p>
            </div>
          </div>

          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-4 border-t border-gray-100">
            <div class="flex flex-wrap gap-2">
              ${
                isDraft
                  ? `
                    <button
                      class="btnEdit px-3 py-2 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg text-xs font-bold hover:bg-yellow-100 hover:border-yellow-300 active:bg-yellow-200 active:scale-95 transition"
                      data-id="${escapeHtml(id)}"
                      type="button"
                    >
                      Edit Draft
                    </button>
                  `
                  : `
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
                  `
              }
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

  function render() {
    if (!proposalList) return;

    const filtered = getFilteredProposals();

    updateCountLine(filtered.length);

    if (!filtered.length) {
      proposalList.innerHTML = emptyStateHtml();
      return;
    }

    proposalList.innerHTML = filtered.map(proposalCardHtml).join("");
  }

  // =========================================================
  // Tabs
  // =========================================================

  function setActiveTab(tab) {
    currentTab = tab;

    const activeClass =
      "tab-btn px-4 py-3 text-sm font-semibold border-b-2 border-urds-accent text-urds-accent";

    const inactiveClass =
      "tab-btn px-4 py-3 text-sm font-semibold border-b-2 border-transparent text-gray-500 hover:text-gray-700";

    if (tabSubmitted) {
      tabSubmitted.className = tab === "submitted" ? activeClass : inactiveClass;
    }

    if (tabDrafts) {
      tabDrafts.className = tab === "drafts" ? activeClass : inactiveClass;
    }

    render();
  }

  tabSubmitted?.addEventListener("click", () => setActiveTab("submitted"));
  tabDrafts?.addEventListener("click", () => setActiveTab("drafts"));
  searchEl?.addEventListener("input", render);

  // =========================================================
  // Button actions using event delegation
  // =========================================================

  proposalList?.addEventListener("click", (event) => {
    const viewButton = event.target.closest(".btnView");
    const editButton = event.target.closest(".btnEdit");
    const formButton = event.target.closest(".btnForm");

    if (viewButton) {
      const id = viewButton.dataset.id;
      localStorage.setItem("viewProposalId", id);
      window.location.href = `proposal_preview.html?id=${encodeURIComponent(id)}`;
      return;
    }

    if (editButton) {
      const id = editButton.dataset.id;
      window.location.href = `submit_proposal_wizard.html?edit=${encodeURIComponent(id)}`;
      return;
    }

    if (formButton) {
      const id = formButton.dataset.id;
      const form = formButton.dataset.form;

      localStorage.setItem("viewProposalId", id);

      const formPages = {
        fm003: "capsule_print.html",
        fm004: "workplan_print.html",
        fm005: "budget_print.html"
      };

      const page = formPages[form];

      if (page) {
        window.location.href = `${page}?id=${encodeURIComponent(id)}`;
      }
    }
  });

  // =========================================================
  // Initialize
  // =========================================================

  proposals = await loadProposals();
  setActiveTab("submitted");
});