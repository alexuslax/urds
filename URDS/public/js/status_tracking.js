document.addEventListener("DOMContentLoaded", async () => {
  "use strict";

  // =========================================================
  // UEP-URDS Research Management System
  // Status Tracking Script
  // Role-aware version with Evaluator support
  // =========================================================

  const proposalSelect = document.getElementById("proposalSelect");
  const proposalTitleEl = document.getElementById("propTitle");
  const proposalMetaEl = document.getElementById("propMeta");
  const statusTimeline = document.getElementById("timeline");
  const revisionList = document.getElementById("revisionList");
  const revisionsCard = document.getElementById("revisionsCard");
  const searchInput = document.getElementById("search");
  const countLine = document.getElementById("countLine");
  const currentStatusWrap = document.getElementById("currentStatusWrap");

  let proposals = [];
  let role = normalizeRole(localStorage.getItem("userRole") || "");

  const ENDPOINTS = {
    myProposals: "../../backend/get_my_proposals.php",
    allProposals: "../../backend/get_all_proposals.php",
    evaluatorAssignments: "../../backend/get_evaluator_assignments.php"
  };

  const allowedRoles = [
    "Faculty Researcher",
    "Evaluator",
    "College Research Coordinator",
    "Dean",
    "College Dean",
    "URDS Staff",
    "URDS Director",
    "TWG",
    "Senior Faculty Researcher",
    "UREC",
    "Administrator"
  ];

  const WORKFLOW_STEPS = [
    {
      key: "SUBMITTED",
      label: "Submitted",
      description: "The faculty researcher submitted the proposal.",
      statusKeywords: ["submitted", "pending", "received"]
    },
    {
      key: "CRC",
      label: "Coordinator Screening",
      description: "The College Research Coordinator checks the proposal requirements.",
      statusKeywords: ["for screening", "screening", "coordinator", "crc"]
    },
    {
      key: "DEAN",
      label: "Dean Endorsement",
      description: "The Dean reviews and endorses the proposal for URDS processing.",
      statusKeywords: ["for dean endorsement", "dean"]
    },
    {
      key: "URDS",
      label: "URDS Internal Review",
      description: "URDS staff checks and prepares the proposal for evaluation or in-house review.",
      statusKeywords: ["for urds review", "urds", "in house", "inhouse"]
    },
    {
      key: "EVALUATOR",
      label: "Assigned Evaluator Review",
      description: "The assigned evaluator reviews the proposal, encodes ratings, and provides recommendations.",
      statusKeywords: ["for evaluator", "evaluator", "evaluation", "assigned evaluation"]
    },
    {
      key: "TWG",
      label: "TWG Technical Evaluation",
      description: "The Technical Working Group evaluates the research proposal.",
      statusKeywords: ["for twg evaluation", "twg", "technical working group"]
    },
    {
      key: "UREC",
      label: "UREC Review",
      description: "The proposal and budget are reviewed for approval requirements.",
      statusKeywords: ["for urec review", "urec", "ethical"]
    },
    {
      key: "DIRECTOR",
      label: "Director Final Review",
      description: "The URDS Director performs final review or approval action.",
      statusKeywords: ["for director review", "director"]
    },
    {
      key: "APPROVED",
      label: "Approved / Notice to Proceed",
      description: "The proposal has been approved or issued official authority to proceed.",
      statusKeywords: ["approved", "special order", "notice to proceed", "ntp", "issued"]
    },
    {
      key: "IMPLEMENTATION",
      label: "Implementation / Monitoring",
      description: "The research is being implemented and monitored.",
      statusKeywords: ["ongoing", "implementation", "monitoring", "conduct of research"]
    },
    {
      key: "COMPLETED",
      label: "Completed / Closed",
      description: "The research has been completed and closed through final reporting.",
      statusKeywords: ["completed", "terminal report", "closed"]
    }
  ];

  const STATUS_META = {
    draft: {
      label: "Draft / Not Started",
      badge: "bg-gray-100 text-gray-700",
      dot: "bg-gray-400",
      text: "text-gray-700",
      border: "border-gray-200"
    },
    pending: {
      label: "Submitted / Pending",
      badge: "bg-yellow-100 text-yellow-800",
      dot: "bg-yellow-400",
      text: "text-yellow-700",
      border: "border-yellow-200"
    },
    review: {
      label: "Under Review / Evaluation",
      badge: "bg-blue-100 text-blue-800",
      dot: "bg-blue-500",
      text: "text-blue-700",
      border: "border-blue-200"
    },
    returned: {
      label: "Returned for Revision",
      badge: "bg-orange-100 text-orange-800",
      dot: "bg-orange-500",
      text: "text-orange-700",
      border: "border-orange-200"
    },
    approved: {
      label: "Approved / Completed",
      badge: "bg-green-100 text-green-800",
      dot: "bg-green-500",
      text: "text-green-700",
      border: "border-green-200"
    },
    ongoing: {
      label: "Ongoing / Implementation",
      badge: "bg-teal-100 text-teal-800",
      dot: "bg-teal-500",
      text: "text-teal-700",
      border: "border-teal-200"
    },
    rejected: {
      label: "Rejected / Terminated",
      badge: "bg-red-100 text-red-800",
      dot: "bg-red-500",
      text: "text-red-700",
      border: "border-red-200"
    }
  };

  const EVALUATION_FORM_ROUTES = {
    new_proposal: "agency_in_house_evaluation_newproposals_form.html",
    ongoing_natural_sciences: "agency_in_house_ongoing_natural_sciences_form.html",
    ongoing_social_sciences: "agency_in_house_ongoing_social_sciences_form.html",
    completed_natural_sciences: "agency_in_house_completed_natural_sciences_form.html",
    completed_social_sciences: "agency_in_house_completed_social_sciences_form.html"
  };

  const EVALUATION_PRINT_ROUTES = {
    new_proposal: "agency_in_house_evaluation_newproposals_print.html",
    ongoing_natural_sciences: "agency_in_house_ongoing_natural_sciences_print.html",
    ongoing_social_sciences: "agency_in_house_ongoing_social_sciences_print.html",
    completed_natural_sciences: "agency_in_house_completed_natural_sciences_print.html",
    completed_social_sciences: "agency_in_house_completed_social_sciences_print.html"
  };

  // =========================================================
  // Initialization
  // =========================================================

  try {
    await window.Auth?.ensureInit?.();

    const profile = window.Auth?.getProfile?.();

    if (profile) {
      role = normalizeRole(profile.role || role);

      if (profile.fullName || profile.full_name || profile.name) {
        localStorage.setItem(
          "userName",
          profile.fullName || profile.full_name || profile.name
        );
      }

      if (profile.role) {
        localStorage.setItem("userRole", profile.role);
      }
    }
  } catch (error) {
    console.warn("Profile fetch failed:", error);
  }

  if (!allowedRoles.includes(role)) {
    document.body.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div class="bg-white border border-red-200 rounded-2xl shadow-card p-8 max-w-md text-center">
          <div class="text-red-600 text-xl font-bold">Access Denied</div>
          <p class="text-sm text-gray-600 mt-2">
            Your account role is not authorized to view status tracking.
          </p>
          <a href="dashboard.html" class="inline-flex mt-5 px-4 py-2 rounded-xl bg-urds-900 text-white text-sm font-bold">
            Back to Dashboard
          </a>
        </div>
      </div>
    `;
    return;
  }

  bindEvents();
  await fetchProposals();

  // =========================================================
  // Data loading
  // =========================================================

  async function fetchProposals() {
    try {
      setSelectLoading("Loading proposals...");
      setCountLine("Loading proposals...");

      let result;

      if (role === "Faculty Researcher") {
        result = await fetchJson(ENDPOINTS.myProposals, {
          status: "error",
          proposals: []
        });
      } else if (role === "Evaluator") {
        result = await fetchEvaluatorProposals();
      } else {
        result = await fetchJson(ENDPOINTS.allProposals, {
          status: "error",
          proposals: []
        });
      }

      if (result.status === "success" || result.success === true || Array.isArray(result)) {
        proposals = normalizeProposalRows(result);

        if (!proposals.length) {
          setSelectLoading("No proposals available");
          setCountLine(role === "Evaluator" ? "0 assigned evaluations" : "0 proposals");
          renderEmptySelection(
            role === "Evaluator"
              ? "No assigned proposals found for your evaluator account."
              : "No proposals available."
          );
          return;
        }

        buildOptions("");
        return;
      }

      const message = result.message || result.error || "Failed to load proposals.";

      setSelectLoading("Error loading proposals");
      setCountLine(message);
      renderTimelineMessage("error", message);

      if (String(message).toLowerCase().includes("not logged in")) {
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1200);
      }
    } catch (error) {
      console.error("Error fetching proposals:", error);
      setSelectLoading("Error loading proposals");
      setCountLine("Error loading proposals");
      renderTimelineMessage("error", `Error loading proposals: ${error.message}`);
    }
  }

  async function fetchEvaluatorProposals() {
    const assigned = await fetchJson(ENDPOINTS.evaluatorAssignments, {
      status: "error",
      assignments: []
    });

    const assignedRows = normalizeProposalRows(assigned);

    if (assignedRows.length) {
      return {
        status: "success",
        proposals: assignedRows
      };
    }

    console.warn("No evaluator assignments loaded. Falling back to all proposals for status tracking.");

    const fallback = await fetchJson(ENDPOINTS.allProposals, {
      status: "error",
      proposals: []
    });

    return fallback;
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
        console.error(`Request failed: ${url}`, response.status, response.statusText);
        return fallback;
      }

      const text = await response.text();

      try {
        return JSON.parse(text);
      } catch (error) {
        console.error(`Invalid JSON from ${url}:`, text.slice(0, 500));
        return fallback;
      }
    } catch (error) {
      console.error(`Error loading ${url}:`, error);
      return fallback;
    }
  }

  function normalizeProposalRows(result) {
    const rows = Array.isArray(result)
      ? result
      : Array.isArray(result.proposals)
      ? result.proposals
      : Array.isArray(result.assignments)
      ? result.assignments
      : Array.isArray(result.data)
      ? result.data
      : [];

    return rows.map((row) => normalizeProposal(row));
  }

  function normalizeProposal(raw) {
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
      raw.research_category ||
      ""
    );

    return {
      ...raw,

      id,
      proposal_id: raw.proposal_id || raw.proposalId || id,

      title:
        raw.title ||
        raw.program_title ||
        raw.proposal_title ||
        raw.research_title ||
        raw.project_title ||
        raw.study_title ||
        raw.activity_title ||
        "Untitled Proposal",

      leader:
        raw.leader ||
        raw.studyLeader ||
        raw.study_leader ||
        raw.researcher ||
        raw.researcher_name ||
        raw.proponent ||
        raw.proponents ||
        raw.program_project_leaders ||
        "Unknown Leader",

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

      cluster:
        raw.cluster ||
        raw.commodity ||
        raw.category ||
        raw.research_category ||
        category ||
        "Unspecified Cluster",

      category,
      evaluation_category: category,

      status:
        raw.status ||
        raw.proposal_status ||
        raw.current_status ||
        raw.currentStatus ||
        raw.evaluation_status ||
        raw.assignment_status ||
        "Submitted",

      dateSubmitted:
        raw.dateSubmitted ||
        raw.date_submitted ||
        raw.submitted_at ||
        raw.created_at ||
        raw.createdAt ||
        raw.assigned_at ||
        raw.assignedAt ||
        ""
    };
  }

  // =========================================================
  // Proposal select and search
  // =========================================================

  function buildOptions(filterText = "") {
    if (!proposalSelect) return;

    const query = normalizeText(filterText);

    const filtered = proposals
      .map((proposal, index) => ({ proposal, index }))
      .filter(({ proposal }) => {
        const searchable = [
          getTitle(proposal),
          getLeader(proposal),
          getCollege(proposal),
          getCluster(proposal),
          getStatus(proposal),
          getEvaluationCategoryLabel(proposal)
        ]
          .join(" ")
          .toLowerCase();

        return !query || searchable.includes(query);
      });

    if (!filtered.length) {
      proposalSelect.innerHTML = `<option value="">No matching proposals</option>`;
      setCountLine("0 proposals shown");
      renderEmptySelection("No matching proposals found.");
      return;
    }

    proposalSelect.innerHTML = filtered
      .map(({ proposal, index }) => {
        const title = getTitle(proposal);
        const status = getStatus(proposal);

        return `
          <option value="${index}">
            ${escapeHtml(title)} — ${escapeHtml(makeReadableStatus(status))}
          </option>
        `;
      })
      .join("");

    const label = role === "Evaluator" ? "assigned proposal" : "proposal";
    setCountLine(`${filtered.length} ${label}${filtered.length === 1 ? "" : "s"} shown`);

    const storedId = localStorage.getItem("viewProposalId");
    let selectedIndex = filtered[0].index;

    if (storedId) {
      const found = filtered.find(({ proposal }) => {
        return String(getProposalId(proposal)) === String(storedId);
      });

      if (found) {
        selectedIndex = found.index;
      }
    }

    proposalSelect.value = String(selectedIndex);
    renderAll(proposals[selectedIndex]);
  }

  function bindEvents() {
    proposalSelect?.addEventListener("change", () => {
      const index = Number(proposalSelect.value);
      const proposal = proposals[index];

      if (!proposal) {
        renderEmptySelection();
        return;
      }

      localStorage.setItem("viewProposalId", getProposalId(proposal));
      renderAll(proposal);
    });

    searchInput?.addEventListener("input", (event) => {
      buildOptions(event.target.value);
    });
  }

  // =========================================================
  // Rendering
  // =========================================================

  function renderAll(proposal) {
    if (!proposal) {
      renderEmptySelection();
      return;
    }

    localStorage.setItem("viewProposalId", getProposalId(proposal));

    renderProposalInfo(proposal);
    renderCurrentStatus(proposal);
    renderStatusTimeline(proposal);
    renderRevisions(proposal);
  }

  function renderProposalInfo(proposal) {
    if (!proposalTitleEl || !proposalMetaEl) return;

    const title = getTitle(proposal);
    const leader = getLeader(proposal);
    const college = getCollege(proposal);
    const cluster = getCluster(proposal);
    const category = getEvaluationCategoryLabel(proposal);
    const status = getStatus(proposal);
    const date = getDateSubmitted(proposal);

    proposalTitleEl.textContent = title;

    proposalMetaEl.textContent = [
      leader,
      college,
      cluster,
      role === "Evaluator" ? `Evaluation Type: ${category}` : "",
      `Status: ${makeReadableStatus(status)}`,
      date ? `Submitted/Assigned: ${formatDate(date)}` : ""
    ]
      .filter(Boolean)
      .join(" • ");
  }

  function renderCurrentStatus(proposal) {
    if (!currentStatusWrap) return;

    currentStatusWrap.innerHTML = statusBadgeHtml(getStatus(proposal));
  }

  function renderStatusTimeline(proposal) {
    if (!statusTimeline) return;

    const status = getStatus(proposal);
    const statusGroup = getStatusGroup(status);

    if (statusGroup === "rejected") {
      statusTimeline.innerHTML = rejectedTimelineHtml(proposal);
      return;
    }

    if (statusGroup === "returned") {
      statusTimeline.innerHTML = returnedTimelineHtml(proposal);
      return;
    }

    const currentIndex = getCurrentStageIndex(status);

    statusTimeline.innerHTML = `
      <div class="relative">
        <div class="absolute left-[18px] top-10 bottom-6 w-[3px] bg-gray-200 rounded-full"></div>

        <div class="space-y-5">
          ${WORKFLOW_STEPS.map((step, index) => {
            const completed = index < currentIndex;
            const current = index === currentIndex;
            const upcoming = index > currentIndex;

            return workflowStepHtml(step, index, proposal, completed, current, upcoming);
          }).join("")}
        </div>
      </div>

      ${role === "Evaluator" ? evaluatorQuickActionsHtml(proposal) : ""}
    `;
  }

  function workflowStepHtml(step, index, proposal, completed, current, upcoming) {
    const dateRaw = getStageDate(proposal, step.key);

    let dotClass = "bg-gray-300";
    let titleClass = "text-gray-700";
    let cardClass = "border-gray-200 bg-white";
    let statusLabel = "Pending";

    if (completed) {
      dotClass = "bg-green-500";
      titleClass = "text-green-700";
      cardClass = "border-green-200 bg-green-50";
      statusLabel = "Completed";
    }

    if (current) {
      dotClass = "bg-blue-500";
      titleClass = "text-blue-700";
      cardClass = "border-blue-200 bg-blue-50";
      statusLabel = "Current Step";
    }

    if (upcoming) {
      dotClass = "bg-gray-300";
      titleClass = "text-gray-700";
      cardClass = "border-gray-200 bg-gray-50";
      statusLabel = "Upcoming";
    }

    if (step.key === "EVALUATOR" && role === "Evaluator" && current) {
      cardClass = "border-emerald-200 bg-emerald-50";
      titleClass = "text-emerald-700";
      dotClass = "bg-emerald-500";
      statusLabel = "Your Evaluation Step";
    }

    const dateText = dateRaw
      ? formatDateTime(dateRaw)
      : current
      ? "Ongoing"
      : "No date recorded";

    return `
      <div class="flex gap-4 relative">
        <div class="w-9 h-9 rounded-full ${dotClass} text-white flex items-center justify-center text-sm font-extrabold shrink-0 z-10 shadow">
          ${completed ? "✓" : index + 1}
        </div>

        <div class="flex-1 border ${cardClass} rounded-xl p-4">
          <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
            <div>
              <div class="text-sm font-bold ${titleClass}">
                ${escapeHtml(step.label)}
              </div>

              <p class="text-xs text-gray-600 mt-1">
                ${escapeHtml(step.description)}
              </p>
            </div>

            <span class="inline-flex w-fit px-2.5 py-1 rounded-full text-xs font-bold bg-white border border-gray-200 text-gray-600">
              ${escapeHtml(statusLabel)}
            </span>
          </div>

          <div class="text-xs text-gray-500 mt-2">
            ${completed || current ? escapeHtml(dateText) : "Waiting for previous step"}
          </div>
        </div>
      </div>
    `;
  }

  function evaluatorQuickActionsHtml(proposal) {
    const id = getProposalId(proposal);
    const category = getEvaluationCategory(proposal);
    const formUrl = EVALUATION_FORM_ROUTES[category] || "evaluator-assigned.html";
    const printUrl = EVALUATION_PRINT_ROUTES[category] || "evaluator-history.html";

    return `
      <div class="mt-6 p-4 rounded-2xl border border-blue-100 bg-blue-50 no-print">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 class="text-sm font-bold text-blue-900">Evaluator Actions</h3>
            <p class="text-xs text-blue-700 mt-1">
              Open the correct evaluation form or preview the printable document for this proposal.
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <a
              href="${escapeHtml(formUrl)}?id=${encodeURIComponent(id)}"
              class="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 active:scale-95 transition"
            >
              Open Evaluation Form
            </a>

            <a
              href="${escapeHtml(printUrl)}?id=${encodeURIComponent(id)}"
              class="px-4 py-2 rounded-xl bg-white border border-blue-200 text-blue-700 text-sm font-bold hover:bg-blue-100 active:scale-95 transition"
            >
              Preview Printable Form
            </a>
          </div>
        </div>
      </div>
    `;
  }

  function returnedTimelineHtml(proposal) {
    const status = getStatus(proposal);
    const date = getLatestActionDate(proposal);
    const id = getProposalId(proposal);

    const revisionLink =
      role === "Evaluator"
        ? "evaluator-assigned.html"
        : `submit_proposal_wizard.html?edit=${encodeURIComponent(id)}`;

    const revisionText =
      role === "Evaluator"
        ? "Back to Assigned Evaluations"
        : "Open Revisions";

    return `
      <div class="border border-orange-200 bg-orange-50 rounded-2xl p-5">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-extrabold shrink-0">
            !
          </div>

          <div class="flex-1">
            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
              <div>
                <h3 class="font-bold text-orange-800">Returned for Revision</h3>
                <p class="text-sm text-orange-700 mt-1">
                  This proposal needs corrections before it can continue to the next stage.
                </p>
              </div>

              ${statusBadgeHtml(status)}
            </div>

            <div class="text-xs text-orange-700 mt-3">
              ${date ? `Last update: ${escapeHtml(formatDateTime(date))}` : "No revision date recorded."}
            </div>

            <div class="mt-4 no-print">
              <a
                href="${escapeHtml(revisionLink)}"
                class="inline-flex px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-bold hover:bg-orange-700 active:bg-orange-800 active:scale-95 transition"
              >
                ${escapeHtml(revisionText)}
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function rejectedTimelineHtml(proposal) {
    const status = getStatus(proposal);
    const date = getLatestActionDate(proposal);

    return `
      <div class="border border-red-200 bg-red-50 rounded-2xl p-5">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center font-extrabold shrink-0">
            ×
          </div>

          <div class="flex-1">
            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
              <div>
                <h3 class="font-bold text-red-800">Rejected / Terminated</h3>
                <p class="text-sm text-red-700 mt-1">
                  This proposal did not proceed to approval.
                </p>
              </div>

              ${statusBadgeHtml(status)}
            </div>

            <div class="text-xs text-red-700 mt-3">
              ${date ? `Last update: ${escapeHtml(formatDateTime(date))}` : "No rejection date recorded."}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderRevisions(proposal) {
    if (!revisionList || !revisionsCard) return;

    const status = getStatus(proposal);
    const statusGroup = getStatusGroup(status);

    if (statusGroup !== "returned") {
      revisionsCard.classList.add("hidden");
      revisionList.innerHTML = "";
      return;
    }

    revisionsCard.classList.remove("hidden");

    const id = getProposalId(proposal);
    const title = getTitle(proposal);
    const date = getLatestActionDate(proposal);

    const primaryUrl =
      role === "Evaluator"
        ? "evaluator-assigned.html"
        : `submit_proposal_wizard.html?edit=${encodeURIComponent(id)}`;

    const primaryText =
      role === "Evaluator"
        ? "Back to Assigned Evaluations"
        : "Edit and Resubmit";

    revisionList.innerHTML = `
      <div class="bg-orange-50 border border-orange-200 p-4 rounded-xl">
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div>
            <div class="text-sm font-bold text-orange-800">
              ${escapeHtml(title)}
            </div>

            <div class="text-xs text-orange-700 mt-1">
              This proposal was returned for revision.
              ${date ? `Last update: ${escapeHtml(formatDateTime(date))}` : ""}
            </div>
          </div>

          <span class="shrink-0">
            ${statusBadgeHtml(status)}
          </span>
        </div>

        <div class="mt-4 flex flex-wrap gap-2 no-print">
          <a
            href="${escapeHtml(primaryUrl)}"
            class="inline-flex px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-bold hover:bg-orange-700 active:bg-orange-800 active:scale-95 transition"
          >
            ${escapeHtml(primaryText)}
          </a>

          <a
            href="proposal_preview.html?id=${encodeURIComponent(id)}"
            class="inline-flex px-4 py-2 rounded-xl bg-white border border-orange-200 text-orange-700 text-sm font-bold hover:bg-orange-100 active:scale-95 transition"
          >
            View Proposal
          </a>
        </div>
      </div>
    `;
  }

  function renderEmptySelection(message = "Select a proposal to view its tracking status.") {
    if (proposalTitleEl) proposalTitleEl.textContent = "—";
    if (proposalMetaEl) proposalMetaEl.textContent = "—";

    if (currentStatusWrap) {
      currentStatusWrap.innerHTML = `<span class="status-badge status-draft">No Status Selected</span>`;
    }

    renderTimelineMessage("empty", message);

    revisionsCard?.classList.add("hidden");
    if (revisionList) revisionList.innerHTML = "";
  }

  function renderTimelineMessage(type, message) {
    if (!statusTimeline) return;

    const className =
      type === "error"
        ? "bg-red-50 border-red-200 text-red-700"
        : "bg-white border-gray-200 text-gray-500";

    statusTimeline.innerHTML = `
      <div class="p-5 rounded-xl border border-dashed ${className} text-sm">
        ${escapeHtml(message)}
      </div>
    `;
  }

  // =========================================================
  // Stage helpers
  // =========================================================

  function getCurrentStageIndex(status) {
    const s = normalizeText(status);

    if (!s) return 0;

    if (s.includes("completed") || s.includes("closed") || s.includes("terminal report")) {
      return 10;
    }

    if (s.includes("ongoing") || s.includes("implementation") || s.includes("monitoring")) {
      return 9;
    }

    if (
      s.includes("approved") ||
      s.includes("special order") ||
      s.includes("notice to proceed") ||
      s.includes("ntp") ||
      s.includes("issued")
    ) {
      return 8;
    }

    if (s.includes("director")) return 7;
    if (s.includes("urec") || s.includes("ethical")) return 6;
    if (s.includes("twg") || s.includes("technical working group")) return 5;

    if (
      s.includes("evaluator") ||
      s.includes("evaluation") ||
      s.includes("evaluate") ||
      s.includes("assigned evaluation")
    ) {
      return 4;
    }

    if (s.includes("urds") || s.includes("in house") || s.includes("inhouse")) return 3;
    if (s.includes("dean")) return 2;
    if (s.includes("screen") || s.includes("coordinator") || s.includes("crc")) return 1;
    if (s.includes("submitted") || s.includes("pending") || s.includes("received")) return 0;

    return 0;
  }

  function getStageDate(proposal, stageKey) {
    if (stageKey === "SUBMITTED") {
      return (
        proposal.dateSubmitted ||
        proposal.date_submitted ||
        proposal.submitted_at ||
        proposal.created_at ||
        proposal.createdAt ||
        ""
      );
    }

    if (stageKey === "CRC") {
      return (
        proposal.screening_date ||
        getLastDateFromArray(proposal.screeningHistory, ["date", "created_at", "reviewed_at"])
      );
    }

    if (stageKey === "DEAN") {
      return (
        proposal.dean_review_date ||
        getNestedDate(proposal.deanReview, ["date", "created_at", "reviewed_at"])
      );
    }

    if (stageKey === "URDS") {
      return (
        proposal.urds_review_date ||
        getNestedDate(proposal.urdsReview, ["date", "created_at", "reviewed_at"])
      );
    }

    if (stageKey === "EVALUATOR") {
      return (
        proposal.evaluator_review_date ||
        proposal.evaluation_date ||
        proposal.evaluated_at ||
        proposal.assigned_at ||
        proposal.assignedAt ||
        getLatestNestedReviewDate(proposal, ["evaluatorReviews", "evaluations"], ["submittedAt", "reviewedAt", "date", "created_at"]) ||
        ""
      );
    }

    if (stageKey === "TWG") {
      return (
        proposal.twg_review_date ||
        getLatestNestedReviewDate(proposal, ["twgReviews"], ["submittedAt", "reviewedAt", "date", "created_at"])
      );
    }

    if (stageKey === "UREC") {
      return (
        proposal.urec_review_date ||
        getLatestNestedReviewDate(proposal, ["urecReviews"], ["reviewedAt", "submittedAt", "date", "created_at"])
      );
    }

    if (stageKey === "DIRECTOR") {
      return (
        proposal.director_review_date ||
        getNestedDate(proposal.directorReview, ["date", "created_at", "reviewed_at"])
      );
    }

    if (stageKey === "APPROVED") {
      return (
        getNestedDate(proposal.directorReview, ["date", "created_at", "reviewed_at"]) ||
        proposal.approved_at ||
        proposal.approvedAt ||
        ""
      );
    }

    if (stageKey === "IMPLEMENTATION") {
      return proposal.implementation_date || proposal.implementationDate || proposal.started_at || "";
    }

    if (stageKey === "COMPLETED") {
      return proposal.completed_at || proposal.completedAt || proposal.terminal_report_date || "";
    }

    return "";
  }

  function getLatestActionDate(proposal) {
    const candidates = [
      proposal.last_action_date,
      proposal.updated_at,
      proposal.updatedAt,
      proposal.returned_at,
      proposal.rejected_at,
      proposal.approved_at,
      proposal.evaluation_date,
      proposal.evaluated_at,
      proposal.assigned_at,
      proposal.assignedAt,
      proposal.dateSubmitted,
      proposal.date_submitted,
      getLastDateFromArray(proposal.screeningHistory, ["date", "created_at", "reviewed_at"]),
      getNestedDate(proposal.deanReview, ["date", "created_at", "reviewed_at"]),
      getNestedDate(proposal.urdsReview, ["date", "created_at", "reviewed_at"]),
      getNestedDate(proposal.directorReview, ["date", "created_at", "reviewed_at"])
    ].filter(Boolean);

    if (!candidates.length) return "";

    return candidates
      .map((date) => safeDate(date))
      .filter(Boolean)
      .sort((a, b) => b.getTime() - a.getTime())[0];
  }

  function getLastDateFromArray(arrayValue, keys) {
    const array = parseMaybeJson(arrayValue);

    if (!Array.isArray(array) || !array.length) return "";

    const dates = array
      .map((item) => getNestedDate(item, keys))
      .filter(Boolean)
      .sort();

    return dates.at(-1) || "";
  }

  function getNestedDate(objectValue, keys) {
    const object = parseMaybeJson(objectValue);

    if (!object || typeof object !== "object") return "";

    for (const key of keys) {
      if (object[key]) return object[key];
    }

    return "";
  }

  function getLatestNestedReviewDate(proposal, reviewKeys, dateKeys) {
    const dates = [];

    reviewKeys.forEach((reviewKey) => {
      const directReviews = parseMaybeJson(proposal[reviewKey]);

      if (Array.isArray(directReviews)) {
        directReviews.forEach((review) => {
          const date = getNestedDate(review, dateKeys);
          if (date) dates.push(date);
        });
      }
    });

    const projects = parseMaybeJson(proposal.projects);

    if (Array.isArray(projects)) {
      projects.forEach((project) => {
        const studies = parseMaybeJson(project.studies);

        if (Array.isArray(studies)) {
          studies.forEach((study) => {
            reviewKeys.forEach((reviewKey) => {
              const reviews = parseMaybeJson(study[reviewKey]);

              if (Array.isArray(reviews)) {
                reviews.forEach((review) => {
                  const date = getNestedDate(review, dateKeys);
                  if (date) dates.push(date);
                });
              }
            });
          });
        }
      });
    }

    return dates.sort().at(-1) || "";
  }

  // =========================================================
  // Data helpers
  // =========================================================

  function getProposalId(proposal) {
    return (
      proposal.id ||
      proposal.proposal_id ||
      proposal.proposalId ||
      proposal.research_id ||
      proposal.researchId ||
      proposal.assignment_id ||
      proposal.assignmentId ||
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
      proposal.study_title ||
      proposal.activity_title ||
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
      proposal.proponents ||
      proposal.program_project_leaders ||
      "Unknown Leader"
    );
  }

  function getCollege(proposal) {
    return (
      proposal.college ||
      proposal.college_name ||
      proposal.implementing_college ||
      proposal.implementingCollege ||
      "Unknown College"
    );
  }

  function getCluster(proposal) {
    return (
      proposal.cluster ||
      proposal.commodity ||
      proposal.category ||
      proposal.research_category ||
      getEvaluationCategoryLabel(proposal) ||
      "Unspecified Cluster"
    );
  }

  function getStatus(proposal) {
    return (
      proposal.status ||
      proposal.proposal_status ||
      proposal.current_status ||
      proposal.currentStatus ||
      proposal.evaluation_status ||
      proposal.assignment_status ||
      "Submitted"
    );
  }

  function getDateSubmitted(proposal) {
    return (
      proposal.dateSubmitted ||
      proposal.date_submitted ||
      proposal.submitted_at ||
      proposal.created_at ||
      proposal.createdAt ||
      proposal.assigned_at ||
      proposal.assignedAt ||
      ""
    );
  }

  function getEvaluationCategory(proposal) {
    return normalizeCategory(
      proposal.evaluation_category ||
      proposal.category ||
      proposal.form_category ||
      proposal.review_type ||
      proposal.type ||
      ""
    );
  }

  function getEvaluationCategoryLabel(proposal) {
    const category = getEvaluationCategory(proposal);

    const labels = {
      new_proposal: "New Proposal",
      ongoing_natural_sciences: "On-going Natural Sciences",
      ongoing_social_sciences: "On-going Social Sciences",
      completed_natural_sciences: "Completed Natural Sciences",
      completed_social_sciences: "Completed Social Sciences"
    };

    return labels[category] || "New Proposal";
  }

  function normalizeCategory(value) {
    const raw = String(value || "");
    const text = normalizeText(raw);

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

    if (raw in EVALUATION_FORM_ROUTES) return raw;

    return "new_proposal";
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
  // Status helpers
  // =========================================================

  function normalizeRole(value) {
    const roleText = normalizeText(value);

    if (!roleText) return "";

    if (roleText.includes("administrator") || roleText === "admin") return "Administrator";
    if (roleText.includes("evaluator")) return "Evaluator";
    if (roleText.includes("faculty researcher") || roleText === "researcher") return "Faculty Researcher";
    if (roleText.includes("college research coordinator") || roleText === "crc" || roleText.includes("research coordinator")) return "College Research Coordinator";
    if (roleText.includes("college dean") || roleText.includes("dean")) return "Dean";
    if (roleText.includes("senior faculty") || roleText.includes("twg") || roleText.includes("technical working group")) return "TWG";
    if (roleText.includes("urec")) return "UREC";
    if (roleText.includes("director")) return "URDS Director";
    if (roleText.includes("staff")) return "URDS Staff";

    return value || "";
  }

  function getStatusGroup(status) {
    const s = normalizeText(status);

    if (!s) return "pending";

    if (s.includes("draft") || s.includes("not started") || s.includes("not yet")) {
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
      s.includes("evaluator") ||
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
      s.includes("received") ||
      s.includes("assigned")
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

  function makeReadableStatus(status) {
    const text = String(status || "Submitted")
      .replace(/_/g, " ")
      .replace(/-/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return text.replace(/\b\w/g, (letter) => letter.toUpperCase());
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

  function setSelectLoading(message) {
    if (proposalSelect) {
      proposalSelect.innerHTML = `<option value="">${escapeHtml(message)}</option>`;
    }
  }

  function setCountLine(message) {
    if (countLine) {
      countLine.textContent = message;
    }
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

  function formatDateTime(value) {
    const date = safeDate(value);

    if (!date) return "-";

    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
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
});