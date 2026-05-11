document.addEventListener("DOMContentLoaded", async () => {
  "use strict";

  // =========================================================
  // UEP-URDS Research Management System
  // Dean Endorsement Script
  // =========================================================

  let proposal = null;
  let isSubmitting = false;

  const proposalInfo = document.getElementById("proposalInfo");
  const crcSummary = document.getElementById("crcSummary");
  const deanComments = document.getElementById("deanComments");
  const deanDecision = document.getElementById("deanDecision");
  const submitDean = document.getElementById("submitDean");
  const previewLink = document.getElementById("previewLink");

  const proposalId =
    new URLSearchParams(window.location.search).get("id") ||
    localStorage.getItem("viewProposalId") ||
    "";

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
  // Role guard
  // =========================================================

  let userRole = normalizeRole(localStorage.getItem("userRole") || "");

  try {
    await window.Auth?.ensureInit?.();

    const profile = window.Auth?.getProfile?.();

    if (profile) {
      userRole = normalizeRole(profile.role || userRole);

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

  const allowedRoles = ["Dean", "College Dean", "Administrator"];

  if (!allowedRoles.includes(userRole)) {
    document.body.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div class="bg-white border border-red-200 rounded-2xl shadow-card p-8 max-w-md text-center">
          <div class="text-red-600 text-xl font-bold">Access Denied</div>
          <p class="text-sm text-gray-600 mt-2">
            Only the Dean can access this endorsement page.
          </p>
          <a href="dashboard.html" class="inline-flex mt-5 px-4 py-2 rounded-xl bg-urds-900 text-white text-sm font-bold">
            Back to Dashboard
          </a>
        </div>
      </div>
    `;
    return;
  }

  // =========================================================
  // Initialize
  // =========================================================

  if (!proposalId) {
    renderNoProposal();
    return;
  }

  localStorage.setItem("viewProposalId", proposalId);

  if (previewLink) {
    previewLink.href = `proposal_preview.html?id=${encodeURIComponent(proposalId)}`;
  }

  setLoadingState();
  await loadProposal(proposalId);

  submitDean?.addEventListener("click", submitDeanEndorsement);

  // =========================================================
  // Load proposal
  // =========================================================

  async function loadProposal(id) {
    try {
      const response = await fetch(
        `../../backend/get_proposal.php?id=${encodeURIComponent(id)}`,
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

      if (result.status === "success" || result.success === true) {
        proposal = result.proposal || result.data || null;

        if (!proposal) {
          renderError("Proposal data was not found.");
          return;
        }

        proposal.history = getHistoryItems(proposal);
        renderProposalHeader();
        renderCRCSummary();
        updatePreviewLink();

        return;
      }

      const message = result.message || result.error || "Failed to load proposal.";
      renderError(message);

      if (String(message).toLowerCase().includes("not logged in")) {
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1200);
      }
    } catch (error) {
      console.error("Error loading proposal:", error);
      renderError(`Error loading proposal: ${error.message}`);
    }
  }

  // =========================================================
  // Submit Dean endorsement
  // =========================================================

  async function submitDeanEndorsement() {
    if (isSubmitting) return;

    if (!proposal) {
      alert("Proposal data is not loaded. Please refresh the page.");
      return;
    }

    const comments = String(deanComments?.value || "").trim();
    const decision = String(deanDecision?.value || "endorse").trim();

    if (!comments) {
      alert("Please enter Dean comments before submitting.");
      deanComments?.focus();
      return;
    }

    const decisionText =
      decision === "return"
        ? "return this proposal for revision"
        : "endorse this proposal to URDS";

    const confirmed = confirm(`Are you sure you want to ${decisionText}?`);

    if (!confirmed) return;

    setSubmittingState(true);

    try {
      const newStatus =
        decision === "return"
          ? "returned for revision"
          : "for urds review";

      const actionLabel =
        decision === "return"
          ? "Returned by Dean"
          : "Endorsed by Dean";

      const response = await fetch("../../backend/submit_dean_endorsement.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          proposal_id: getProposalId(proposal),
          comments,
          decision,
          status: newStatus,
          action_label: actionLabel
        })
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

      if (!(result.status === "success" || result.success === true)) {
        throw new Error(result.message || result.error || "Failed to submit endorsement.");
      }

      localStorage.setItem(
        "recentlyUpdatedProposal",
        JSON.stringify({
          id: getProposalId(proposal),
          status: newStatus,
          action: actionLabel,
          updatedAt: new Date().toISOString()
        })
      );

      alert("Dean endorsement submitted successfully.");
      window.location.href = "proposal_list.html";
    } catch (error) {
      console.error("Error submitting Dean endorsement:", error);
      alert(`Error: ${error.message}`);
      setSubmittingState(false);
    }
  }

  function setSubmittingState(submitting) {
    isSubmitting = submitting;

    if (!submitDean) return;

    submitDean.disabled = submitting;
    submitDean.textContent = submitting ? "Submitting..." : "Submit Endorsement";

    submitDean.classList.toggle("opacity-70", submitting);
    submitDean.classList.toggle("cursor-not-allowed", submitting);
  }

  // =========================================================
  // Render proposal header
  // =========================================================

  function renderProposalHeader() {
    if (!proposalInfo || !proposal) return;

    const id = getProposalId(proposal);
    const submitted = formatDate(getDateSubmitted(proposal));
    const title = getTitle(proposal);
    const leader = getLeader(proposal);
    const college = getCollege(proposal);
    const department = getDepartment(proposal);
    const cluster = getCluster(proposal);
    const nature = getNature(proposal);
    const status = getStatus(proposal);

    proposalInfo.innerHTML = `
      <div class="space-y-5">
        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div class="min-w-0">
            <div class="text-xs text-gray-500">
              Submitted: ${escapeHtml(submitted || "-")}
            </div>

            <h2 class="text-xl font-bold text-gray-900 mt-1">
              ${escapeHtml(title)}
            </h2>

            <div class="text-sm text-gray-700 mt-2">
              Leader:
              <span class="font-semibold">${escapeHtml(leader)}</span>
              ${
                college || department
                  ? ` • ${escapeHtml(college)}${department ? " / " + escapeHtml(department) : ""}`
                  : ""
              }
            </div>

            <div class="text-sm text-gray-700 mt-1">
              Cluster:
              <span class="font-semibold">${escapeHtml(cluster || "-")}</span>
              ${nature ? ` • Nature: ${escapeHtml(nature)}` : ""}
            </div>
          </div>

          <div class="shrink-0">
            ${statusBadgeHtml(status)}
          </div>
        </div>

        <div class="border-t border-gray-200 pt-4">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
            <div>
              <div class="text-sm font-bold text-gray-900">Required Viewing</div>
              <p class="text-xs text-gray-500 mt-0.5">
                Review the proposal preview and generated forms before submitting the Dean decision.
              </p>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <a
              class="px-3 py-2 bg-urds-900 text-white rounded-lg text-sm font-bold hover:bg-urds-800 active:scale-95 transition"
              href="proposal_preview.html?id=${encodeURIComponent(id)}"
            >
              View Proposal Preview
            </a>

            <a
              class="px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-100 active:scale-95 transition"
              href="capsule_print.html?id=${encodeURIComponent(id)}"
            >
              View Capsule FM-003
            </a>

            <a
              class="px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-100 active:scale-95 transition"
              href="workplan_print.html?id=${encodeURIComponent(id)}"
            >
              View Workplan FM-004
            </a>

            <a
              class="px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-100 active:scale-95 transition"
              href="budget_print.html?id=${encodeURIComponent(id)}"
            >
              View Budget FM-005
            </a>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================
  // Render CRC summary
  // =========================================================

  function renderCRCSummary() {
    if (!crcSummary || !proposal) return;

    const crcRecord = getLatestCRCRecord(proposal);

    if (!crcRecord) {
      crcSummary.innerHTML = `
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">CRC Screening Summary</h2>
            <p class="text-xs text-gray-500 mt-0.5">
              No College Research Coordinator screening record was found.
            </p>
          </div>
          <span class="status-badge status-review">No Record</span>
        </div>

        <div class="mt-4 p-4 rounded-xl bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
          The Dean may still review the proposal, but the CRC checklist is not available in the proposal history.
        </div>
      `;
      return;
    }

    const checklist = parseMaybeJson(crcRecord.checklist) || {};
    const action = crcRecord.action || crcRecord.action_label || crcRecord.decision || "Coordinator Screening";
    const date = crcRecord.date || crcRecord.created_at || crcRecord.reviewed_at || "";
    const comment = crcRecord.comment || crcRecord.comments || crcRecord.remarks || "";

    crcSummary.innerHTML = `
      <div class="space-y-4">
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">CRC Screening Summary</h2>
            <p class="text-xs text-gray-500 mt-0.5">
              Latest CRC action: ${escapeHtml(makeReadableStatus(action))}
            </p>
          </div>

          <div class="flex flex-col items-start md:items-end gap-1">
            ${statusBadgeHtml(action)}
            <div class="text-xs text-gray-500">${escapeHtml(formatDate(date) || "-")}</div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          ${checklistItemHtml("Format", checklist.formatOk || checklist.format_ok, "Passed", "Not checked")}
          ${checklistItemHtml("Completeness", checklist.completenessOk || checklist.completeness_ok, "Passed", "Not checked")}
          ${checklistItemHtml("Agenda", checklist.agendaOk || checklist.agenda_ok, "Aligned", "Not marked")}
        </div>

        ${
          comment
            ? `
              <div class="text-sm">
                <div class="font-bold text-gray-900">CRC Remarks</div>
                <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-2 whitespace-pre-wrap text-gray-700">
                  ${escapeHtml(comment)}
                </div>
              </div>
            `
            : `
              <div class="text-sm text-gray-500">
                No CRC remarks recorded.
              </div>
            `
        }
      </div>
    `;
  }

  function checklistItemHtml(label, passed, passText, failText) {
    const isPassed = Boolean(passed);

    return `
      <div class="${isPassed ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"} border rounded-xl p-4">
        <div class="font-bold text-gray-900">${escapeHtml(label)}</div>
        <div class="${isPassed ? "text-green-700" : "text-gray-500"} mt-1">
          ${isPassed ? "✓ " + escapeHtml(passText) : "— " + escapeHtml(failText)}
        </div>
      </div>
    `;
  }

  // =========================================================
  // States
  // =========================================================

  function setLoadingState() {
    if (proposalInfo) {
      proposalInfo.innerHTML = `
        <div class="bg-white p-5 rounded-2xl shadow-card border border-gray-100 text-sm text-gray-500">
          Loading proposal information...
        </div>
      `;
    }

    if (crcSummary) {
      crcSummary.innerHTML = `
        <div class="bg-white p-5 rounded-2xl shadow-card border border-gray-100 text-sm text-gray-500">
          Loading CRC screening summary...
        </div>
      `;
    }
  }

  function renderNoProposal() {
    if (!proposalInfo) return;

    proposalInfo.innerHTML = `
      <div class="bg-white border border-red-200 p-6 rounded-2xl shadow-card text-center">
        <div class="text-red-700 font-bold">No proposal selected</div>
        <p class="text-sm text-gray-600 mt-1">
          Please go back to the proposal list and select a proposal for Dean endorsement.
        </p>
        <a
          href="proposal_list.html"
          class="inline-flex mt-4 px-4 py-2 rounded-xl bg-urds-900 text-white text-sm font-bold hover:bg-urds-800 transition"
        >
          Back to Proposal List
        </a>
      </div>
    `;

    if (crcSummary) {
      crcSummary.innerHTML = "";
    }
  }

  function renderError(message) {
    if (proposalInfo) {
      proposalInfo.innerHTML = `
        <div class="bg-white border border-red-200 p-6 rounded-2xl shadow-card text-red-700">
          ${escapeHtml(message)}
        </div>
      `;
    }

    if (crcSummary) {
      crcSummary.innerHTML = "";
    }
  }

  // =========================================================
  // Data helpers
  // =========================================================

  function updatePreviewLink() {
    if (!previewLink || !proposal) return;

    previewLink.href = `proposal_preview.html?id=${encodeURIComponent(getProposalId(proposal))}`;
  }

  function getProposalId(item) {
    return (
      item.id ||
      item.proposal_id ||
      item.proposalId ||
      item.research_id ||
      item.researchId ||
      ""
    );
  }

  function getTitle(item) {
    return (
      item.title ||
      item.program_title ||
      item.proposal_title ||
      item.research_title ||
      item.project_title ||
      "Untitled Proposal"
    );
  }

  function getLeader(item) {
    return (
      item.leader ||
      item.studyLeader ||
      item.study_leader ||
      item.researcher ||
      item.researcher_name ||
      item.proponent ||
      "Unknown Leader"
    );
  }

  function getCollege(item) {
    return (
      item.college ||
      item.college_name ||
      "Unknown College"
    );
  }

  function getDepartment(item) {
    return (
      item.department ||
      item.department_name ||
      item.dept ||
      ""
    );
  }

  function getCluster(item) {
    return (
      item.cluster ||
      item.commodity ||
      item.category ||
      "Unspecified Cluster"
    );
  }

  function getNature(item) {
    return (
      item.nature ||
      item.research_nature ||
      ""
    );
  }

  function getStatus(item) {
    return (
      item.status ||
      item.proposal_status ||
      item.current_status ||
      item.currentStatus ||
      "For Dean Endorsement"
    );
  }

  function getDateSubmitted(item) {
    return (
      item.dateSubmitted ||
      item.date_submitted ||
      item.submitted_at ||
      item.created_at ||
      item.createdAt ||
      ""
    );
  }

  function getHistoryItems(item) {
    const history = parseMaybeJson(item.history);
    const screeningHistory = parseMaybeJson(item.screeningHistory || item.screening_history);

    const output = [];

    if (Array.isArray(history)) output.push(...history);
    if (Array.isArray(screeningHistory)) output.push(...screeningHistory);

    return output;
  }

  function getLatestCRCRecord(item) {
    const history = getHistoryItems(item);

    const crcRecords = history.filter((entry) => {
      const role = normalizeText(entry.role || entry.user_role || entry.reviewer || "");
      const action = normalizeText(entry.action || entry.action_label || entry.decision || "");

      return (
        role.includes("coordinator") ||
        role.includes("crc") ||
        action.includes("coordinator") ||
        action.includes("screening")
      );
    });

    if (!crcRecords.length) return null;

    return crcRecords.sort((a, b) => {
      const dateA = safeDate(a.date || a.created_at || a.reviewed_at)?.getTime() || 0;
      const dateB = safeDate(b.date || b.created_at || b.reviewed_at)?.getTime() || 0;
      return dateB - dateA;
    })[0];
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
    const text = normalizeText(value);

    if (!text) return "";

    if (text.includes("administrator") || text === "admin") return "Administrator";
    if (text.includes("college dean")) return "College Dean";
    if (text.includes("dean")) return "Dean";

    return value || "";
  }

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function getStatusGroup(status) {
    const s = normalizeText(status);

    if (!s) return "review";

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
      s.includes("correction")
    ) {
      return "returned";
    }

    if (
      s.includes("approved") ||
      s.includes("approve") ||
      s.includes("endorsed") ||
      s.includes("endorsement") ||
      s.includes("forwarded")
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

    return "review";
  }

  function statusBadgeHtml(status) {
    const group = getStatusGroup(status);
    const meta = STATUS_META[group] || STATUS_META.review;

    return `
      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${meta.badge}">
        <span class="w-2 h-2 rounded-full inline-block" style="background-color: currentColor;"></span>
        ${escapeHtml(makeReadableStatus(status))}
      </span>
    `;
  }

  function makeReadableStatus(status) {
    const text = String(status || "For Dean Endorsement")
      .replace(/_/g, " ")
      .replace(/-/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return text.replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  // =========================================================
  // General helpers
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

  function safeDate(value) {
    if (!value) return null;

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function formatDate(value) {
    const date = safeDate(value);

    if (!date) return "";

    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }
});