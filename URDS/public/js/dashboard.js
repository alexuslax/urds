(() => {
  "use strict";

  // =========================================================
  // UEP-URDS Research Management System
  // Role-Aware Dashboard Script
  // Includes Evaluator role support
  // =========================================================

  const qs = (id) => document.getElementById(id);

  const STATUS_META = {
    draft: {
      label: "Draft / Not Started",
      badge: "bg-gray-100 text-gray-700",
      border: "border-gray-400",
      chart: "#6b7280"
    },
    pending: {
      label: "Submitted / Pending",
      badge: "bg-yellow-100 text-yellow-800",
      border: "border-yellow-400",
      chart: "#eab308"
    },
    review: {
      label: "Under Review / Evaluation",
      badge: "bg-blue-100 text-blue-800",
      border: "border-blue-500",
      chart: "#3b82f6"
    },
    returned: {
      label: "Returned for Revision",
      badge: "bg-orange-100 text-orange-800",
      border: "border-orange-500",
      chart: "#f97316"
    },
    approved: {
      label: "Approved / Completed",
      badge: "bg-green-100 text-green-800",
      border: "border-green-500",
      chart: "#22c55e"
    },
    ongoing: {
      label: "Ongoing / Implementation",
      badge: "bg-teal-100 text-teal-800",
      border: "border-teal-500",
      chart: "#14b8a6"
    },
    rejected: {
      label: "Rejected / Terminated",
      badge: "bg-red-100 text-red-800",
      border: "border-red-500",
      chart: "#ef4444"
    }
  };

  const CATEGORY_META = {
    new_proposal: {
      label: "New Proposal",
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
      form: "agency_in_house_completed_social_sciences_form.html",
      print: "agency_in_house_completed_social_sciences_print.html",
      draftKeys: [
        "completed_social_sciences_review_draft_",
        "agencyCompletedSocialReviewDraft:",
        "fm015_completed_social_sciences_draft_"
      ]
    }
  };

  const SAMPLE_EVALUATOR_ASSIGNMENTS = [
    {
      id: "P-2024-001",
      title: "Development of a Smart Irrigation Monitoring System",
      proponent: "Dr. Maria Santos",
      college: "College of Engineering",
      department: "Electrical Engineering",
      category: "completed_natural_sciences",
      status: "pending",
      deadline: "2026-05-10",
      assigned_at: "2026-04-25"
    },
    {
      id: "P-2024-002",
      title: "Community-Based Livelihood Assessment in Northern Samar",
      proponent: "Prof. Juan Dela Cruz",
      college: "College of Arts and Communication",
      department: "Social Sciences",
      category: "completed_social_sciences",
      status: "draft",
      deadline: "2026-05-12",
      assigned_at: "2026-04-24"
    },
    {
      id: "P-2024-003",
      title: "Biodiversity Mapping of Coastal Resources",
      proponent: "Dr. Ana Reyes",
      college: "College of Science",
      department: "Biology",
      category: "ongoing_natural_sciences",
      status: "returned",
      deadline: "2026-05-15",
      assigned_at: "2026-04-23"
    }
  ];

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

    if (!r) return "Faculty Researcher";

    if (r.includes("administrator") || r === "admin") return "Administrator";

    if (
      r.includes("college research coordinator") ||
      r === "crc" ||
      r.includes("research coordinator")
    ) {
      return "College Research Coordinator";
    }

    if (r.includes("college dean") || r.includes("dean")) return "Dean";

    if (r.includes("evaluator")) return "Evaluator";

    if (r.includes("senior faculty")) return "Senior Faculty Researcher";

    if (r.includes("twg") || r.includes("technical working group")) return "TWG";

    if (r.includes("urec")) return "UREC";

    if (r.includes("director")) return "URDS Director";

    if (r.includes("staff")) return "URDS Staff";

    if (r.includes("faculty researcher") || r === "researcher" || r.includes("researcher")) {
      return "Faculty Researcher";
    }

    return role || "Faculty Researcher";
  }

  function safeDate(value) {
    if (!value) return null;

    const dt = new Date(value);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }

  function fmtDate(value) {
    const dt = safeDate(value);

    if (!dt) return "-";

    return dt.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  function makeReadableStatus(status) {
    const s = String(status || "Draft")
      .replace(/_/g, " ")
      .replace(/-/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return s.replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function makeReadableCategory(category) {
    const key = normalizeCategory(category);

    if (CATEGORY_META[key]) {
      return CATEGORY_META[key].label;
    }

    return String(category || "General Evaluation")
      .replace(/_/g, " ")
      .replace(/-/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function getStatusGroup(status) {
    const s = normalizeText(status);

    if (!s) return "draft";

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
      s.includes("for revision") ||
      s.includes("needs revision") ||
      s.includes("revision needed") ||
      s.includes("revision required") ||
      s.includes("revise") ||
      s.includes("correction") ||
      s.includes("needs correction")
    ) {
      return "returned";
    }

    if (
      s.includes("draft") ||
      s.includes("not started") ||
      s.includes("not yet")
    ) {
      return "draft";
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
      s.startsWith("for ") ||
      s.includes("under review") ||
      s.includes("review") ||
      s.includes("evaluation") ||
      s.includes("evaluate") ||
      s.includes("screening") ||
      s.includes("screen") ||
      s.includes("dean endorsement") ||
      s.includes("dean") ||
      s.includes("twg") ||
      s.includes("urec") ||
      s.includes("urds") ||
      s.includes("director") ||
      s.includes("in house") ||
      s.includes("inhouse") ||
      s.includes("monitoring")
    ) {
      return "review";
    }

    if (
      s.includes("approved") ||
      s.includes("approve") ||
      s.includes("endorsed") ||
      s.includes("special order") ||
      s.includes("notice to proceed") ||
      s.includes("ntp") ||
      s.includes("issued") ||
      s.includes("completed") ||
      s.includes("submitted evaluation") ||
      s.includes("closed") ||
      s.includes("passed")
    ) {
      return "approved";
    }

    return "draft";
  }

  function statusBadgeHtml(status) {
    const group = getStatusGroup(status);
    const meta = STATUS_META[group] || STATUS_META.draft;

    return `
      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${meta.badge}">
        <span class="w-2 h-2 rounded-full inline-block" style="background-color: currentColor;"></span>
        ${escapeHtml(makeReadableStatus(status))}
      </span>
    `;
  }

  function getInitials(name) {
    const cleaned = String(name || "User").trim();

    if (!cleaned) return "U";

    const parts = cleaned.split(/\s+/).slice(0, 2);
    return parts.map((part) => part.charAt(0).toUpperCase()).join("") || "U";
  }

  function setText(id, value) {
    const el = qs(id);
    if (el) el.textContent = value;
  }

  function setProfileUI(name, role) {
    document.querySelectorAll(".user-name").forEach((el) => {
      el.textContent = name || "User";
    });

    document.querySelectorAll(".user-role").forEach((el) => {
      el.textContent = role || "Role";
    });

    document.querySelectorAll(".user-initials").forEach((el) => {
      el.textContent = getInitials(name);
    });
  }

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

  function getStatus(proposal) {
    return (
      proposal.status ||
      proposal.proposal_status ||
      proposal.current_status ||
      proposal.currentStatus ||
      proposal.evaluation_status ||
      proposal.assignment_status ||
      "Draft"
    );
  }

  function getCollege(proposal) {
    return (
      proposal.college ||
      proposal.college_name ||
      proposal.implementing_college ||
      proposal.department ||
      "Unknown College"
    );
  }

  function getCluster(proposal) {
    return (
      proposal.cluster ||
      proposal.commodity ||
      proposal.category ||
      proposal.evaluation_category ||
      "Unknown Cluster"
    );
  }

  function getResearcher(proposal) {
    return (
      proposal.researcher ||
      proposal.researcher_name ||
      proposal.proponent ||
      proposal.proponents ||
      proposal.program_project_leaders ||
      proposal.author ||
      proposal.leader ||
      proposal.studyLeader ||
      proposal.study_leader ||
      "Unknown Researcher"
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
      proposal.updated_at ||
      proposal.updatedAt ||
      ""
    );
  }

  function buildProposalUrl(proposal) {
    const id = getProposalId(proposal);

    if (!id) return "proposal_preview.html";

    return `proposal_preview.html?id=${encodeURIComponent(id)}`;
  }

  function normalizeCategory(value) {
    const raw = normalizeText(value);

    if (!raw) return "new_proposal";

    if (
      raw.includes("new proposal") ||
      raw.includes("new proposals") ||
      raw.includes("fm 011") ||
      raw.includes("fm011")
    ) {
      return "new_proposal";
    }

    if (
      raw.includes("ongoing natural") ||
      raw.includes("on going natural") ||
      raw.includes("on-going natural") ||
      raw.includes("fm 012") ||
      raw.includes("fm012")
    ) {
      return "ongoing_natural_sciences";
    }

    if (
      raw.includes("ongoing social") ||
      raw.includes("on going social") ||
      raw.includes("on-going social") ||
      raw.includes("fm 013") ||
      raw.includes("fm013")
    ) {
      return "ongoing_social_sciences";
    }

    if (
      raw.includes("completed natural") ||
      raw.includes("complete natural") ||
      raw.includes("fm 014") ||
      raw.includes("fm014")
    ) {
      return "completed_natural_sciences";
    }

    if (
      raw.includes("completed social") ||
      raw.includes("complete social") ||
      raw.includes("fm 015") ||
      raw.includes("fm015")
    ) {
      return "completed_social_sciences";
    }

    if (CATEGORY_META[value]) return value;

    return value || "new_proposal";
  }

  function getEvaluationCategory(item) {
    return normalizeCategory(
      item.category ||
      item.evaluation_category ||
      item.form_category ||
      item.review_type ||
      item.type ||
      item.research_category ||
      ""
    );
  }

  function hasDraftForAssignment(assignment) {
    const id = getProposalId(assignment);
    const category = getEvaluationCategory(assignment);
    const meta = CATEGORY_META[category];

    if (!id || !meta) return false;

    return meta.draftKeys.some((prefix) => {
      return localStorage.getItem(prefix + id);
    });
  }

  function getFormUrl(assignment) {
    const id = getProposalId(assignment);
    const category = getEvaluationCategory(assignment);
    const meta = CATEGORY_META[category] || CATEGORY_META.new_proposal;

    return `${meta.form}?id=${encodeURIComponent(id)}`;
  }

  function getPrintUrl(assignment) {
    const id = getProposalId(assignment);
    const category = getEvaluationCategory(assignment);
    const meta = CATEGORY_META[category] || CATEGORY_META.new_proposal;

    return `${meta.print}?id=${encodeURIComponent(id)}`;
  }

  function showToast(message, type = "success") {
    const container = qs("toastContainer");
    const toast = document.createElement("div");

    const colorClass =
      type === "error"
        ? "bg-red-600"
        : type === "warning"
        ? "bg-amber-600"
        : "bg-emerald-600";

    toast.className = `${colorClass} text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold translate-y-2 opacity-0 transition`;
    toast.textContent = message;

    if (container) {
      container.appendChild(toast);
    } else {
      toast.classList.add("fixed", "bottom-6", "right-6", "z-50");
      document.body.appendChild(toast);
    }

    requestAnimationFrame(() => {
      toast.classList.remove("translate-y-2", "opacity-0");
    });

    setTimeout(() => {
      toast.classList.add("translate-y-2", "opacity-0");

      setTimeout(() => {
        toast.remove();
      }, 200);
    }, 2500);
  }

  // =========================================================
  // Backend loading
  // =========================================================

  async function fetchJson(url, fallback = null) {
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

      let result;
      try {
        result = JSON.parse(text);
      } catch (error) {
        console.error("Invalid dashboard JSON response:", text);
        return fallback;
      }

      return result;
    } catch (error) {
      console.warn("Dashboard fetch failed:", url, error);
      return fallback;
    }
  }

  async function loadProposalsForRole(role) {
    if (role === "Evaluator") {
      return loadEvaluatorAssignments();
    }

    const endpoint =
      role === "Faculty Researcher"
        ? "../../backend/get_my_proposals.php"
        : "../../backend/get_all_proposals.php";

    const result = await fetchJson(endpoint, {
      status: "error",
      proposals: []
    });

    if (!result) return [];

    if (Array.isArray(result)) {
      return result;
    }

    if (result.status === "success" || result.success === true) {
      return result.proposals || result.data || [];
    }

    const message = result.message || result.error || "Failed to load proposals";
    console.error("Failed to load proposals:", message);

    if (String(message).toLowerCase().includes("not logged in")) {
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);
    }

    return [];
  }

  async function loadEvaluatorAssignments() {
    const result = await fetchJson("../../backend/get_evaluator_assignments.php", {
      status: "fallback",
      assignments: SAMPLE_EVALUATOR_ASSIGNMENTS
    });

    const assignments =
      Array.isArray(result)
        ? result
        : Array.isArray(result?.assignments)
        ? result.assignments
        : Array.isArray(result?.data)
        ? result.data
        : SAMPLE_EVALUATOR_ASSIGNMENTS;

    return assignments.map((item) => {
      const id = getProposalId(item);

      return {
        ...item,
        id,
        proposal_id: id,
        title: getTitle(item),
        researcher: getResearcher(item),
        college: getCollege(item),
        category: getEvaluationCategory(item),
        status: hasDraftForAssignment(item) && getStatusGroup(getStatus(item)) !== "approved"
          ? "draft"
          : getStatus(item),
        deadline:
          item.deadline ||
          item.due_date ||
          item.evaluation_deadline ||
          item.target_date ||
          "",
        date_submitted:
          item.date_submitted ||
          item.submitted_at ||
          item.assigned_at ||
          item.created_at ||
          ""
      };
    });
  }

  // =========================================================
  // Quick actions by role
  // =========================================================

  function actionsByRole(role) {
    const actions = {
      "Faculty Researcher": [
        { label: "+ New Submission", href: "submit_proposal_wizard.html" },
        { label: "My Proposals", href: "my_proposals.html" },
        { label: "Revisions", href: "revisions.html" },
        { label: "Status Tracking", href: "status_tracking.html" }
      ],

      "College Research Coordinator": [
        { label: "Initial Screening", href: "initial_screening.html" },
        { label: "College Proposals", href: "proposal_list.html" },
        { label: "Revisions", href: "revisions.html" },
        { label: "Status Tracking", href: "status_tracking.html" }
      ],

      "Dean": [
        { label: "Dean Endorsement", href: "dean_endorse.html" },
        { label: "College Proposals", href: "proposal_list.html" },
        { label: "Status Tracking", href: "status_tracking.html" }
      ],

      "Evaluator": [
        { label: "Assigned Evaluations", href: "#evaluatorPanel" },
        { label: "Evaluator Dashboard", href: "evaluator-dashboard.html" },
        { label: "Evaluation History", href: "evaluator-history.html" },
        { label: "Status Tracking", href: "status_tracking.html" }
      ],

      "TWG": [
        { label: "TWG Evaluation", href: "twg_evaluation.html" },
        { label: "Assigned Proposals", href: "proposal_list.html" },
        { label: "Status Tracking", href: "status_tracking.html" }
      ],

      "Senior Faculty Researcher": [
        { label: "Evaluate Proposals", href: "evaluation_evaluator.html" },
        { label: "Proposal List", href: "proposal_list.html" },
        { label: "Status Tracking", href: "status_tracking.html" }
      ],

      "UREC": [
        { label: "UREC Review", href: "urec_review.html" },
        { label: "Proposal List", href: "proposal_list.html" },
        { label: "Status Tracking", href: "status_tracking.html" }
      ],

      "URDS Staff": [
        { label: "In-House Review", href: "staff_inhousereview.html" },
        { label: "All Proposals", href: "proposal_list.html" },
        { label: "Special Orders", href: "special_order_repository.html" },
        { label: "Notice to Proceed", href: "notice_to_proceed.html" }
      ],

      "URDS Director": [
        { label: "Director Review", href: "director_inhousereview.html" },
        { label: "All Proposals", href: "proposal_list.html" },
        { label: "Notice to Proceed", href: "notice_to_proceed.html" },
        { label: "Status Tracking", href: "status_tracking.html" }
      ],

      "Administrator": [
        { label: "Admin Dashboard", href: "admin-dashboard.html" },
        { label: "Users", href: "admin-users.html" },
        { label: "Permissions", href: "admin-permissions.html" },
        { label: "All Proposals", href: "proposal_list.html" }
      ]
    };

    return actions[role] || [
      { label: "View Proposals", href: "proposal_list.html" },
      { label: "Status Tracking", href: "status_tracking.html" }
    ];
  }

  function buttonThemeByRole(role) {
    const themes = {
      "Faculty Researcher": {
        primary: "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 hover:shadow-md active:scale-95",
        secondary: "bg-white/15 text-white hover:bg-white/25 active:scale-95"
      },

      "College Research Coordinator": {
        primary: "bg-cyan-600 text-white hover:bg-cyan-700 active:bg-cyan-800 hover:shadow-md active:scale-95",
        secondary: "bg-white/15 text-white hover:bg-white/25 active:scale-95"
      },

      "Dean": {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 hover:shadow-md active:scale-95",
        secondary: "bg-white/15 text-white hover:bg-white/25 active:scale-95"
      },

      "Evaluator": {
        primary: "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 hover:shadow-md active:scale-95",
        secondary: "bg-white/15 text-white hover:bg-white/25 active:scale-95"
      },

      "TWG": {
        primary: "bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800 hover:shadow-md active:scale-95",
        secondary: "bg-white/15 text-white hover:bg-white/25 active:scale-95"
      },

      "Senior Faculty Researcher": {
        primary: "bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800 hover:shadow-md active:scale-95",
        secondary: "bg-white/15 text-white hover:bg-white/25 active:scale-95"
      },

      "UREC": {
        primary: "bg-emerald-700 text-white hover:bg-emerald-800 active:bg-emerald-900 hover:shadow-md active:scale-95",
        secondary: "bg-white/15 text-white hover:bg-white/25 active:scale-95"
      },

      "URDS Staff": {
        primary: "bg-slate-800 text-white hover:bg-slate-900 active:bg-black hover:shadow-md active:scale-95",
        secondary: "bg-white/15 text-white hover:bg-white/25 active:scale-95"
      },

      "URDS Director": {
        primary: "bg-amber-600 text-white hover:bg-amber-700 active:bg-amber-800 hover:shadow-md active:scale-95",
        secondary: "bg-white/15 text-white hover:bg-white/25 active:scale-95"
      },

      "Administrator": {
        primary: "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 hover:shadow-md active:scale-95",
        secondary: "bg-white/15 text-white hover:bg-white/25 active:scale-95"
      }
    };

    return themes[role] || themes["Faculty Researcher"];
  }

  function renderQuickActions(role) {
    const container = qs("quickActions");
    if (!container) return;

    const actions = actionsByRole(role);
    const theme = buttonThemeByRole(role);

    container.innerHTML = actions
      .map((action, index) => {
        const className = index === 0 ? theme.primary : theme.secondary;

        return `
          <a href="${escapeHtml(action.href)}"
             class="px-5 py-3 rounded-xl text-sm font-bold transition duration-150 ease-out shadow-sm hover:-translate-y-0.5 ${className}">
            ${escapeHtml(action.label)}
          </a>
        `;
      })
      .join("");
  }

  // =========================================================
  // Role text
  // =========================================================

  function subtitleByRole(role) {
    const map = {
      "Faculty Researcher": "Track your submissions, revisions, and research progress.",
      "College Research Coordinator": "Monitor initial screening, revisions, and college proposal routing.",
      "Dean": "Review and endorse proposals for URDS processing.",
      "Evaluator": "Review assigned proposals, encode ratings, save drafts, and generate official evaluation forms.",
      "TWG": "Evaluate proposals and provide technical recommendations.",
      "Senior Faculty Researcher": "Review assigned proposals and submit evaluation recommendations.",
      "UREC": "Review detailed proposals and budget-related approvals.",
      "URDS Staff": "Prepare proposals for in-house review, routing, and records management.",
      "URDS Director": "Monitor URDS review, approvals, notices, and implementation status.",
      "Administrator": "Monitor system-wide proposals, users, roles, and reports."
    };

    return map[role] || "Overview and recent activities.";
  }

  function quickTitleByRole(role, displayName) {
    if (role === "Faculty Researcher") {
      return `Welcome back${displayName && displayName !== "User" ? ", " + displayName : ""}`;
    }

    if (role === "Evaluator") {
      return "Evaluator Workspace";
    }

    return `${role} Overview`;
  }

  function quickDescriptionByRole(role) {
    if (role === "Evaluator") {
      return "Use this dashboard to open assigned evaluations, continue draft forms, submit recommendations, and generate printable UEP-URDS evaluation documents.";
    }

    return "Use this dashboard to check proposal status, review pending tasks, track evaluations, and monitor research implementation.";
  }

  function renderRoleNotice(role) {
    const notice = qs("roleNotice");
    if (!notice) return;

    if (role !== "Evaluator") {
      notice.classList.add("hidden");
      return;
    }

    notice.classList.remove("hidden");

    setText("roleNoticeTitle", "Evaluator Access");
    setText(
      "roleNoticeText",
      "You should only evaluate proposals assigned to you. Open the assigned item, complete the correct evaluation form, save your draft, then preview or print the official form."
    );

    const icon = qs("roleNoticeIcon");
    if (icon) {
      icon.textContent = "📝";
    }
  }

  // =========================================================
  // Counts
  // =========================================================

  function countStatusGroups(proposals) {
    const counts = {
      draft: 0,
      pending: 0,
      review: 0,
      returned: 0,
      approved: 0,
      ongoing: 0,
      rejected: 0
    };

    proposals.forEach((proposal) => {
      const group = getStatusGroup(getStatus(proposal));
      counts[group] = (counts[group] || 0) + 1;
    });

    return counts;
  }

  function countByCollege(proposals) {
    const output = {};

    proposals.forEach((proposal) => {
      const college = getCollege(proposal);
      output[college] = (output[college] || 0) + 1;
    });

    return output;
  }

  function countByMonth(proposals) {
    const now = new Date();
    const buckets = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString(undefined, { month: "short", year: "numeric" });

      buckets.push({
        key,
        label,
        value: 0
      });
    }

    const lookup = {};
    buckets.forEach((bucket) => {
      lookup[bucket.key] = bucket;
    });

    proposals.forEach((proposal) => {
      const dt = safeDate(getDateSubmitted(proposal));
      if (!dt) return;

      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      if (lookup[key]) lookup[key].value += 1;
    });

    return {
      labels: buckets.map((bucket) => bucket.label),
      values: buckets.map((bucket) => bucket.value)
    };
  }

  function countWhere(proposals, checker) {
    return proposals.filter((proposal) => checker(normalizeText(getStatus(proposal)), proposal)).length;
  }

  // =========================================================
  // Dashboard stat cards
  // =========================================================

  function renderStatCards(role, proposals) {
    const cardsEl = qs("dashboardCards");
    if (!cardsEl) return;

    const counts = countStatusGroups(proposals);

    let cards;

    if (role === "Evaluator") {
      cards = [
        {
          title: "Assigned",
          value: proposals.length,
          hint: "Total assigned evaluations",
          border: "border-gray-700"
        },
        {
          title: "Pending",
          value: counts.pending + counts.review,
          hint: "Need evaluation",
          border: STATUS_META.pending.border
        },
        {
          title: "Drafts",
          value: counts.draft,
          hint: "Saved locally",
          border: STATUS_META.draft.border
        },
        {
          title: "Submitted",
          value: counts.approved,
          hint: "Completed evaluations",
          border: STATUS_META.approved.border
        }
      ];
    } else {
      cards = [
        {
          title: "Total Proposals",
          value: proposals.length,
          hint: "All visible records",
          border: "border-gray-700"
        },
        {
          title: "Submitted / Pending",
          value: counts.pending,
          hint: "Waiting for action",
          border: STATUS_META.pending.border
        },
        {
          title: "Under Review",
          value: counts.review,
          hint: "Screening or evaluation",
          border: STATUS_META.review.border
        },
        {
          title: "Returned / Revision",
          value: counts.returned,
          hint: "Needs correction",
          border: STATUS_META.returned.border
        },
        {
          title: "Approved / Completed",
          value: counts.approved,
          hint: "Passed or finished",
          border: STATUS_META.approved.border
        },
        {
          title: "Ongoing Research",
          value: counts.ongoing,
          hint: "Implementation phase",
          border: STATUS_META.ongoing.border
        },
        {
          title: "Rejected / Terminated",
          value: counts.rejected,
          hint: "Not approved or stopped",
          border: STATUS_META.rejected.border
        }
      ];
    }

    cardsEl.innerHTML = cards
      .map((card) => {
        return `
          <div class="bg-white p-5 rounded-2xl shadow-card border-l-4 ${card.border}">
            <div class="text-sm text-gray-500">${escapeHtml(card.title)}</div>
            <div class="text-3xl font-extrabold mt-2">${Number(card.value || 0)}</div>
            <div class="text-xs text-gray-500 mt-1">${escapeHtml(card.hint)}</div>
          </div>
        `;
      })
      .join("");
  }

  // =========================================================
  // Workload
  // =========================================================

  function roleWorkload(role, proposals) {
    const counts = {
      submitted: countWhere(proposals, (s) => s.includes("submitted") || s.includes("pending") || s.includes("assigned")),
      forScreening: countWhere(proposals, (s) => s.includes("screen")),
      forDean: countWhere(proposals, (s) => s.includes("dean")),
      forTWG: countWhere(proposals, (s) => s.includes("twg") || s.includes("technical working")),
      forUREC: countWhere(proposals, (s) => s.includes("urec")),
      forURDS: countWhere(proposals, (s) => s.includes("urds") || s.includes("in house") || s.includes("inhouse")),
      forDirector: countWhere(proposals, (s) => s.includes("director")),
      forMonitoring: countWhere(proposals, (s) => s.includes("monitoring")),
      revisions: proposals.filter((p) => getStatusGroup(getStatus(p)) === "returned").length,
      drafts: proposals.filter((p) => getStatusGroup(getStatus(p)) === "draft").length,
      approved: proposals.filter((p) => getStatusGroup(getStatus(p)) === "approved").length,
      ongoing: proposals.filter((p) => getStatusGroup(getStatus(p)) === "ongoing").length,
      rejected: proposals.filter((p) => getStatusGroup(getStatus(p)) === "rejected").length
    };

    if (role === "Evaluator") {
      return [
        { label: "Assigned evaluations", value: proposals.length },
        { label: "Pending evaluation", value: counts.submitted + countWhere(proposals, (s) => s.includes("review")) },
        { label: "Saved drafts", value: counts.drafts },
        { label: "Submitted evaluations", value: counts.approved }
      ];
    }

    if (role === "College Research Coordinator") {
      return [
        { label: "For initial screening", value: counts.forScreening + counts.submitted },
        { label: "Returned / revisions", value: counts.revisions },
        { label: "For TWG routing", value: counts.forTWG }
      ];
    }

    if (role === "Dean") {
      return [
        { label: "Awaiting dean endorsement", value: counts.forDean },
        { label: "TWG-related reviews", value: counts.forTWG },
        { label: "Returned / revisions", value: counts.revisions }
      ];
    }

    if (role === "TWG" || role === "Senior Faculty Researcher") {
      return [
        { label: "For TWG evaluation", value: counts.forTWG },
        { label: "For in-house review", value: counts.forURDS },
        { label: "Returned / revisions", value: counts.revisions }
      ];
    }

    if (role === "UREC") {
      return [
        { label: "For UREC review", value: counts.forUREC },
        { label: "Approved after review", value: counts.approved },
        { label: "Returned / revisions", value: counts.revisions }
      ];
    }

    if (role === "URDS Staff") {
      return [
        { label: "For URDS / in-house processing", value: counts.forURDS },
        { label: "For TWG / UREC routing", value: counts.forTWG + counts.forUREC },
        { label: "For monitoring", value: counts.forMonitoring }
      ];
    }

    if (role === "URDS Director") {
      return [
        { label: "For director review", value: counts.forDirector },
        { label: "Approved / issued records", value: counts.approved },
        { label: "Escalations / returned", value: counts.revisions }
      ];
    }

    if (role === "Administrator") {
      return [
        { label: "Total proposals", value: proposals.length },
        {
          label: "Under review",
          value:
            counts.forScreening +
            counts.forDean +
            counts.forTWG +
            counts.forUREC +
            counts.forURDS +
            counts.forDirector
        },
        { label: "Rejected / terminated", value: counts.rejected }
      ];
    }

    return [
      { label: "My proposals", value: proposals.length },
      { label: "Revisions needed", value: counts.revisions },
      { label: "Ongoing research", value: counts.ongoing }
    ];
  }

  function renderWorkload(role, proposals) {
    const listEl = qs("workloadList");
    const hintEl = qs("workloadHint");
    const badge = qs("roleBadge");

    if (!listEl) return;

    if (badge) badge.textContent = role || "Role";

    if (hintEl) {
      hintEl.textContent =
        role === "Evaluator"
          ? "Evaluation assignments and drafts that need your attention."
          : "Tasks and records that need attention based on your role.";
    }

    const workload = roleWorkload(role, proposals);

    if (!workload.length) {
      listEl.innerHTML = `
        <div class="p-4 rounded-xl border border-dashed border-gray-200 text-sm text-gray-500">
          No workload items found.
        </div>
      `;
      return;
    }

    listEl.innerHTML = workload
      .map((item) => {
        return `
          <div class="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50">
            <div class="text-sm font-medium">${escapeHtml(item.label)}</div>
            <div class="min-w-9 h-8 px-2 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-sm font-bold">
              ${Number(item.value || 0)}
            </div>
          </div>
        `;
      })
      .join("");
  }

  // =========================================================
  // Recent activity
  // =========================================================

  function recentLinkByRole(role) {
    if (role === "Faculty Researcher") return "my_proposals.html";
    if (role === "College Research Coordinator") return "initial_screening.html";
    if (role === "Dean") return "dean_endorse.html";
    if (role === "Evaluator") return "evaluator-dashboard.html";
    if (role === "TWG") return "twg_evaluation.html";
    if (role === "UREC") return "urec_review.html";
    if (role === "URDS Staff") return "staff_inhousereview.html";
    if (role === "URDS Director") return "director_inhousereview.html";

    return "proposal_list.html";
  }

  function renderRecent(role, proposals) {
    const recentEl = qs("recentList");
    const hintEl = qs("recentHint");
    const cta = qs("recentCta");
    const titleEl = qs("recentTitle");

    if (!recentEl) return;

    if (cta) {
      cta.href = recentLinkByRole(role);
      cta.textContent = role === "Evaluator" ? "View evaluator dashboard" : "View list";
    }

    if (titleEl) {
      titleEl.textContent = role === "Evaluator" ? "Recent Assigned Evaluations" : "Recent Activity";
    }

    if (hintEl) {
      hintEl.textContent =
        role === "Evaluator"
          ? "Latest evaluations assigned to you."
          : "Latest proposal submissions and status updates.";
    }

    const sorted = [...proposals]
      .sort((a, b) => {
        const da = safeDate(getDateSubmitted(a))?.getTime() || 0;
        const db = safeDate(getDateSubmitted(b))?.getTime() || 0;
        return db - da;
      })
      .slice(0, 6);

    if (!sorted.length) {
      recentEl.innerHTML = `
        <div class="p-4 rounded-xl border border-dashed border-gray-200 text-sm text-gray-500">
          No recent activity yet.
        </div>
      `;
      return;
    }

    recentEl.innerHTML = sorted
      .map((proposal) => {
        const title = getTitle(proposal);
        const status = getStatus(proposal);
        const college = getCollege(proposal);
        const cluster = role === "Evaluator"
          ? makeReadableCategory(getEvaluationCategory(proposal))
          : getCluster(proposal);
        const researcher = getResearcher(proposal);
        const date = fmtDate(getDateSubmitted(proposal));
        const url = role === "Evaluator" ? getFormUrl(proposal) : buildProposalUrl(proposal);

        return `
          <div class="p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <a href="${escapeHtml(url)}" class="font-semibold text-gray-900 hover:text-urds-accent truncate block">
                  ${escapeHtml(title)}
                </a>
                <div class="text-xs text-gray-500 mt-1">
                  ${escapeHtml(researcher)} • ${escapeHtml(college)} • ${escapeHtml(cluster)} • ${escapeHtml(date)}
                </div>
              </div>

              <div class="shrink-0">
                ${statusBadgeHtml(status)}
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  // =========================================================
  // Evaluator panel
  // =========================================================

  function getFilteredEvaluations(assignments) {
    const search = normalizeText(qs("evaluationSearch")?.value || "");
    const category = qs("evaluationCategoryFilter")?.value || "";
    const status = qs("evaluationStatusFilter")?.value || "";

    return assignments.filter((item) => {
      const itemCategory = getEvaluationCategory(item);
      const itemStatusGroup = getStatusGroup(getStatus(item));

      if (category && itemCategory !== category) return false;
      if (status && itemStatusGroup !== status && normalizeText(getStatus(item)) !== status) return false;

      if (!search) return true;

      const haystack = normalizeText(
        [
          getTitle(item),
          getResearcher(item),
          getCollege(item),
          makeReadableCategory(itemCategory),
          getStatus(item)
        ].join(" ")
      );

      return haystack.includes(search);
    });
  }

  function renderEvaluatorPanel(role, assignments) {
    const panel = qs("evaluatorPanel");

    if (!panel) return;

    if (role !== "Evaluator") {
      panel.classList.add("hidden");
      return;
    }

    panel.classList.remove("hidden");

    const table = qs("evaluationTable");
    const empty = qs("emptyEvaluations");
    const resultCount = qs("evaluationResultCount");

    if (!table) return;

    const filtered = getFilteredEvaluations(assignments);

    if (resultCount) {
      resultCount.textContent = `${filtered.length.toLocaleString()} of ${assignments.length.toLocaleString()} assigned evaluations shown`;
    }

    if (!filtered.length) {
      table.innerHTML = "";
      empty?.classList.remove("hidden");
      return;
    }

    empty?.classList.add("hidden");

    table.innerHTML = filtered
      .map((item) => {
        const id = getProposalId(item);
        const title = getTitle(item);
        const researcher = getResearcher(item);
        const college = getCollege(item);
        const category = makeReadableCategory(getEvaluationCategory(item));
        const deadline = fmtDate(item.deadline || item.due_date || item.evaluation_deadline);
        const status = getStatus(item);
        const formUrl = getFormUrl(item);
        const printUrl = getPrintUrl(item);
        const hasDraft = hasDraftForAssignment(item);

        return `
          <tr class="hover:bg-gray-50 transition">
            <td class="px-5 py-4">
              <div class="font-semibold text-gray-900">${escapeHtml(title)}</div>
              <div class="text-xs text-gray-500 mt-1">
                ${escapeHtml(researcher)}
              </div>
            </td>

            <td class="px-5 py-4 text-sm text-gray-700">
              ${escapeHtml(category)}
            </td>

            <td class="px-5 py-4 text-sm text-gray-700">
              ${escapeHtml(college)}
            </td>

            <td class="px-5 py-4 text-sm text-gray-700">
              ${escapeHtml(deadline)}
            </td>

            <td class="px-5 py-4">
              ${statusBadgeHtml(hasDraft ? "Draft" : status)}
            </td>

            <td class="px-5 py-4">
              <div class="flex items-center justify-center gap-2">
                <a
                  href="${escapeHtml(formUrl)}"
                  class="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition"
                >
                  ${hasDraft ? "Continue" : "Evaluate"}
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
      })
      .join("");
  }

  function bindEvaluatorPanelEvents(assignments) {
    qs("evaluationSearch")?.addEventListener("input", () => {
      renderEvaluatorPanel("Evaluator", assignments);
    });

    qs("evaluationCategoryFilter")?.addEventListener("change", () => {
      renderEvaluatorPanel("Evaluator", assignments);
    });

    qs("evaluationStatusFilter")?.addEventListener("change", () => {
      renderEvaluatorPanel("Evaluator", assignments);
    });
  }

  // =========================================================
  // Analytics
  // =========================================================

  let statusChart = null;
  let monthChart = null;
  let collegeChart = null;

  function destroyCharts() {
    [statusChart, monthChart, collegeChart].forEach((chart) => {
      try {
        if (chart) chart.destroy();
      } catch (error) {
        console.warn("Unable to destroy chart:", error);
      }
    });

    statusChart = null;
    monthChart = null;
    collegeChart = null;
  }

  function renderAnalytics(role, proposals) {
    const analyticsSection = qs("analyticsSection");
    if (!analyticsSection) return;

    const showAnalytics = role !== "Faculty Researcher";
    analyticsSection.classList.toggle("hidden", !showAnalytics);

    if (!showAnalytics) {
      destroyCharts();
      return;
    }

    if (typeof Chart === "undefined") {
      console.warn("Chart.js is not loaded.");
      return;
    }

    const statusCanvas = qs("statusChart");
    const monthCanvas = qs("monthChart");
    const collegeCanvas = qs("collegeChart");

    if (!statusCanvas || !monthCanvas || !collegeCanvas) return;

    destroyCharts();

    const groupedCounts = countStatusGroups(proposals);
    const statusEntries = Object.entries(groupedCounts).filter(([, value]) => value > 0);

    const statusLabels = statusEntries.map(([group]) => STATUS_META[group].label);
    const statusValues = statusEntries.map(([, value]) => value);
    const statusColors = statusEntries.map(([group]) => STATUS_META[group].chart);

    const month = countByMonth(proposals);

    const collegeCounts = countByCollege(proposals);
    const topColleges = Object.entries(collegeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);

    const collegeLabels = topColleges.map(([college]) => college);
    const collegeValues = topColleges.map(([, value]) => value);

    setText("statusChartHint", `${proposals.length} total`);
    setText("monthChartHint", "Last 6 months");
    setText("collegeChartHint", topColleges.length > 10 ? "Top colleges" : "Distribution");

    statusChart = new Chart(statusCanvas, {
      type: "doughnut",
      data: {
        labels: statusLabels.length ? statusLabels : ["No data"],
        datasets: [
          {
            data: statusValues.length ? statusValues : [1],
            backgroundColor: statusColors.length ? statusColors : ["#e5e7eb"],
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom"
          }
        },
        cutout: "62%"
      }
    });

    monthChart = new Chart(monthCanvas, {
      type: "bar",
      data: {
        labels: month.labels,
        datasets: [
          {
            label: "Submissions",
            data: month.values,
            backgroundColor: "#3b82f6",
            borderRadius: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });

    collegeChart = new Chart(collegeCanvas, {
      type: "bar",
      data: {
        labels: collegeLabels.length ? collegeLabels : ["No data"],
        datasets: [
          {
            label: "Count",
            data: collegeValues.length ? collegeValues : [0],
            backgroundColor: "#14b8a6",
            borderRadius: 8
          }
        ]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });
  }

  // =========================================================
  // Initialization
  // =========================================================

  document.addEventListener("DOMContentLoaded", async () => {
    let rawRole = localStorage.getItem("userRole") || "Faculty Researcher";
    let role = normalizeRole(rawRole);
    let displayName = localStorage.getItem("userName") || "User";

    try {
      await window.Auth?.ensureInit?.();

      const profile = window.Auth?.getProfile?.() || null;

      if (profile) {
        rawRole = profile.role || rawRole;
        role = normalizeRole(rawRole);

        displayName =
          profile.fullName ||
          profile.full_name ||
          profile.name ||
          profile.username ||
          profile.email ||
          displayName;

        localStorage.setItem("userName", displayName);

        if (profile.role) {
          localStorage.setItem("userRole", profile.role);
        }
      }
    } catch (error) {
      console.warn("Auth init failed for dashboard:", error);
    }

    setProfileUI(displayName, role);

    setText("dashboardBreadcrumb", role === "Evaluator" ? "UEP-URDS / Evaluation" : "UEP-URDS / Dashboard");
    setText("dashboardTitle", role === "Evaluator" ? "Evaluator Dashboard" : "Dashboard");
    setText("dashboardSubtitle", subtitleByRole(role));
    setText("roleBadge", role);
    setText("quickTitle", quickTitleByRole(role, displayName));
    setText("quickDescription", quickDescriptionByRole(role));
    setText("cardsTitle", role === "Evaluator" ? "Evaluation Status Overview" : "Research Status Overview");
    setText(
      "cardsSubtitle",
      role === "Evaluator"
        ? "Summary of evaluation assignments based on your evaluator account."
        : "Summary of proposal and research progress based on your role."
    );

    renderRoleNotice(role);
    renderQuickActions(role);

    const dashboardCards = qs("dashboardCards");
    if (dashboardCards) {
      dashboardCards.innerHTML = `
        <div class="col-span-full text-center text-gray-500 py-8">
          Loading dashboard data...
        </div>
      `;
    }

    const workloadList = qs("workloadList");
    if (workloadList) {
      workloadList.innerHTML = `
        <div class="p-4 rounded-xl border border-dashed border-gray-200 text-sm text-gray-500">
          Loading workload...
        </div>
      `;
    }

    const recentList = qs("recentList");
    if (recentList) {
      recentList.innerHTML = `
        <div class="p-4 rounded-xl border border-dashed border-gray-200 text-sm text-gray-500">
          Loading recent activity...
        </div>
      `;
    }

    const proposals = await loadProposalsForRole(role);

    renderStatCards(role, proposals);
    renderWorkload(role, proposals);
    renderRecent(role, proposals);
    renderAnalytics(role, proposals);
    renderEvaluatorPanel(role, proposals);

    if (role === "Evaluator") {
      bindEvaluatorPanelEvents(proposals);
    }
  });
})();