document.addEventListener("DOMContentLoaded", async () => {
  let proposal = null;

  // Elements - Initialize early
  const proposalInfo = document.getElementById("proposalInfo");
  const forwardBtn = document.getElementById("forwardBtn");
  const returnBtn = document.getElementById("returnBtn");
  const chkFormat = document.getElementById("chkFormat");
  const chkCompleteness = document.getElementById("chkCompleteness");
  const chkAgenda = document.getElementById("chkAgenda");
  const remarks = document.getElementById("remarks");

  const proposalId =
    new URLSearchParams(location.search).get("id") ||
    localStorage.getItem("viewProposalId") ||
    "";

  // Fetch proposal from database
  if (proposalId) {
    await fetchProposal(proposalId);
  } else {
    // Render proposal header + required viewing buttons
    renderProposalInfo();
  }
document.addEventListener("DOMContentLoaded", async () => {
  "use strict";

  // =========================================================
  // UEP-URDS Research Management System
  // Initial Screening Script
  // For: College Research Coordinator
  // =========================================================

  let proposal = null;
  let isSaving = false;

  const proposalInfo = document.getElementById("proposalInfo");
  const forwardBtn = document.getElementById("forwardBtn");
  const returnBtn = document.getElementById("returnBtn");
  const chkFormat = document.getElementById("chkFormat");
  const chkCompleteness = document.getElementById("chkCompleteness");
  const chkAgenda = document.getElementById("chkAgenda");
  const remarks = document.getElementById("remarks");

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
  // Initialize
  // =========================================================

  if (!proposalId) {
    renderNoProposal();
    updateForwardState();
    return;
  }

  localStorage.setItem("viewProposalId", proposalId);

  setLoadingState("Loading proposal information...");
  await fetchProposal(proposalId);
  updateForwardState();

  // =========================================================
  // Events
  // =========================================================

  chkFormat?.addEventListener("change", updateForwardState);
  chkCompleteness?.addEventListener("change", updateForwardState);

  returnBtn?.addEventListener("click", async () => {
    if (!proposal || isSaving) return;

    const comment = String(remarks?.value || "").trim();

    if (!comment) {
      alert("Please enter coordinator remarks before returning the proposal.");
      remarks?.focus();
      return;
    }

    const confirmed = confirm(
      "Return this proposal to the researcher for revision?"
    );

    if (!confirmed) return;

    const saved = await saveScreening(
      "returned for revision",
      "Returned by Coordinator"
    );

    if (saved) {
      alert("Proposal returned to the researcher.");
      window.location.href = "proposal_list.html";
    }
  });

  forwardBtn?.addEventListener("click", async () => {
    if (!proposal || isSaving) return;

    if (!chkFormat?.checked || !chkCompleteness?.checked) {
      alert("Please check both required items before forwarding.");
      return;
    }

    const confirmed = confirm(
      "Forward this proposal to the Dean for endorsement?"
    );

    if (!confirmed) return;

    const saved = await saveScreening(
      "for dean endorsement",
      "Forwarded to Dean"
    );

    if (saved) {
      alert("Proposal forwarded to the Dean.");
      window.location.href = "proposal_list.html";
    }
  });

  // =========================================================
  // Proposal loading
  // =========================================================

  async function fetchProposal(id) {
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

        renderProposalInfo();
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
      console.error("Error fetching proposal:", error);
      renderError(`Error loading proposal: ${error.message}`);
    }
  }

  // =========================================================
  // Render proposal information
  // =========================================================

  function renderProposalInfo() {
    if (!proposalInfo || !proposal) return;

    const id = getProposalId(proposal);
    const submitted = formatDate(getDateSubmitted(proposal));
    const title = getTitle(proposal);
    const leader = getLeader(proposal);
    const college = getCollege(proposal);
    const department = getDepartment(proposal);
    const cluster = getCluster(proposal);
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
                Review the proposal preview and generated forms before submitting the screening action.
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

          <div class="mt-3 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800">
            Workplan and budget should match the entries submitted through the proposal wizard.
          </div>
        </div>
      </div>
    `;
  }

  function renderNoProposal() {
    if (!proposalInfo) return;

    proposalInfo.innerHTML = `
      <div class="bg-white p-6 rounded-2xl border border-red-200 text-center">
        <div class="text-red-700 font-bold">No proposal selected</div>
        <p class="text-sm text-gray-600 mt-1">
          Please go back to the proposal list and select a proposal for initial screening.
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
    if (!proposalInfo) return;

    proposalInfo.innerHTML = `
      <div class="bg-white p-6 rounded-2xl border border-red-200 text-red-700">
        ${escapeHtml(message)}
      </div>
    `;
  }

  function setLoadingState(message) {
    if (!proposalInfo) return;

    proposalInfo.innerHTML = `
      <div class="bg-white p-5 rounded-2xl border border-gray-100 text-sm text-gray-500">
        ${escapeHtml(message)}
      </div>
    `;
  }

  // =========================================================
  // Button state
  // =========================================================

  function updateForwardState() {
    if (!forwardBtn) return;

    const canForward = Boolean(chkFormat?.checked && chkCompleteness?.checked && proposal);

    forwardBtn.disabled = !canForward;

    forwardBtn.classList.toggle("bg-gray-400", !canForward);
    forwardBtn.classList.toggle("cursor-not-allowed", !canForward);
    forwardBtn.classList.toggle("opacity-70", !canForward);

    forwardBtn.classList.toggle("bg-emerald-600", canForward);
    forwardBtn.classList.toggle("hover:bg-emerald-700", canForward);
    forwardBtn.classList.toggle("active:bg-emerald-800", canForward);
    forwardBtn.classList.toggle("hover:shadow-md", canForward);
    forwardBtn.classList.toggle("active:scale-95", canForward);
  }

  function setSavingState(saving) {
    isSaving = saving;

    if (forwardBtn) {
      forwardBtn.disabled = saving || !(chkFormat?.checked && chkCompleteness?.checked);
      forwardBtn.textContent = saving ? "Saving..." : "Forward to Dean";
    }

    if (returnBtn) {
      returnBtn.disabled = saving;
      returnBtn.textContent = saving ? "Saving..." : "Return to Researcher";
    }
  }

  // =========================================================
  // Save screening action
  // =========================================================

  async function saveScreening(newStatus, actionLabel) {
    if (!proposal) return false;

    setSavingState(true);

    try {
      const payload = {
        proposal_id: getProposalId(proposal),
        status: newStatus,
        action_label: actionLabel,
        checklist: {
          formatOk: Boolean(chkFormat?.checked),
          completenessOk: Boolean(chkCompleteness?.checked),
          agendaOk: Boolean(chkAgenda?.checked)
        },
        comment: String(remarks?.value || "").trim()
      };

      const response = await fetch("../../backend/update_proposal_status.php", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
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
        throw new Error(result.message || result.error || "Failed to update proposal status.");
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

      proposal.status = newStatus;

      return true;
    } catch (error) {
      console.error("Error saving screening:", error);
      alert(`Error: ${error.message}`);
      return false;
    } finally {
      setSavingState(false);
      updateForwardState();
    }
  }

  // =========================================================
  // Data helpers
  // =========================================================

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

  function getStatus(item) {
    return (
      item.status ||
      item.proposal_status ||
      item.current_status ||
      item.currentStatus ||
      "For Screening"
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

  // =========================================================
  // Status helpers
  // =========================================================

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
    const text = String(status || "For Screening")
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

  function formatDate(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }
});
  // Forward button enabled only if required checks ok
  function updateForwardState() {
    const ok = chkFormat.checked && chkCompleteness.checked;
    forwardBtn.disabled = !ok;
    forwardBtn.classList.toggle("bg-gray-400", !ok);
    forwardBtn.classList.toggle("bg-green-700", ok);
  }
  chkFormat.addEventListener("change", updateForwardState);
  chkCompleteness.addEventListener("change", updateForwardState);
  updateForwardState();

  // Actions
  returnBtn.addEventListener("click", async () => {
    if (!proposal) return;
    await saveScreening("returned for revision", "Returned by Coordinator");
    alert("Proposal returned to researcher.");
    window.location.href = "proposal_list.html";
  });

  forwardBtn.addEventListener("click", async () => {
    if (!proposal) return;
    await saveScreening("for dean endorsement", "Forwarded to Dean");
    alert("Proposal forwarded to the Dean.");
    window.location.href = "proposal_list.html";
  });

  // -------------------------
  // Helpers
  // -------------------------
  async function fetchProposal(id) {
    try {
      const response = await fetch(`../../backend/get_proposal.php?id=${encodeURIComponent(id)}`, {
        method: "GET",
        credentials: "include"
      });

      const result = await response.json();

      if (result.status === "success") {
        proposal = result.proposal;
        renderProposalInfo();
      } else {
        document.getElementById("proposalInfo").innerHTML = 
          `<div class="bg-white p-4 rounded-xl border text-red-600">${escapeHtml(result.message || "Failed to load proposal")}</div>`;
        if (result.message === "User not logged in") {
          setTimeout(() => window.location.href = "login.html", 2000);
        }
      }
    } catch (error) {
      console.error("Error fetching proposal:", error);
      document.getElementById("proposalInfo").innerHTML = 
        `<div class="bg-white p-4 rounded-xl border text-red-600">Error loading proposal: ${escapeHtml(error.message)}</div>`;
    }
  }
  function renderProposalInfo() {
    if (!proposal) {
      proposalInfo.innerHTML = `<div class="bg-white p-4 rounded-xl border">Proposal not found.</div>`;
      return;
    }

    const submitted = formatDate(proposal.dateSubmitted);
    const title = escapeHtml(proposal.title || "Untitled");
    const leader = escapeHtml(proposal.leader || proposal.studyLeader || "");
    const college = escapeHtml(proposal.college || "");
    const dept = escapeHtml(proposal.department || "");
    const cluster = escapeHtml(proposal.cluster || "");
    const status = escapeHtml(proposal.status || "Submitted");

    proposalInfo.innerHTML = `
      <div class="bg-white border p-5 rounded-2xl shadow-card space-y-3">
        <div>
          <div class="text-xs text-gray-500">Submitted: ${escapeHtml(submitted)}</div>
          <h2 class="text-xl font-semibold mt-1">${title}</h2>
          <div class="text-sm text-gray-700 mt-1">
            Leader: ${leader} • ${college}${dept ? " / " + dept : ""}<br>
            Cluster: ${cluster} • Status: <strong>${status}</strong>
          </div>
        </div>

        <div class="border-t pt-4">
          <div class="text-sm font-semibold mb-2">Required Viewing (Coordinator)</div>
          <div class="flex flex-wrap gap-2">
            <a class="px-3 py-2 bg-urds-900 text-white rounded-lg text-sm"
               href="proposal_preview.html?id=${encodeURIComponent(proposal.id)}">
              View Proposal Preview
            </a>
            <a class="px-3 py-2 bg-white border rounded-lg text-sm"
               href="ongoing_research_frm.html?id=${encodeURIComponent(proposal.id)}">
              View Capsule (FM-003)
            </a>
            <a class="px-3 py-2 bg-white border rounded-lg text-sm"
               href="workplan_print.html?id=${encodeURIComponent(proposal.id)}">
              View Workplan (FM-004)
            </a>
            <a class="px-3 py-2 bg-white border rounded-lg text-sm"
               href="budget_print.html?id=${encodeURIComponent(proposal.id)}">
              View Budget (FM-005)
            </a>
          </div>

          <div class="mt-2 text-xs text-gray-500">
            Note: Workplan (FM-004) and Budget (FM-005) should be generated from the wizard entries.
          </div>
        </div>
      </div>
    `;
  }

  async function saveScreening(newStatus, actionLabel) {
    try {
      const response = await fetch("../../backend/update_proposal_status.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposal_id: proposal.id,
          status: newStatus,
          action_label: actionLabel,
          checklist: {
            formatOk: !!chkFormat.checked,
            completenessOk: !!chkCompleteness.checked,
            agendaOk: !!chkAgenda.checked
          },
          comment: (remarks.value || "").trim()
        })
      });

      const result = await response.json();

      if (result.status !== "success") {
        throw new Error(result.message || "Failed to update proposal status");
      }

      return true;
    } catch (error) {
      console.error("Error saving screening:", error);
      alert("Error: " + error.message);
      return false;
    }
  }

  // Old localStorage version kept below for reference
  // function saveScreening(newStatus, actionLabel) {
    // Status update
    // proposal.status = newStatus;

    // Unified history trail (important for Director aggregated page later)
    // if (!Array.isArray(proposal.history)) proposal.history = [];

    // proposal.history.push({
    //   role: "Coordinator",
    //   action: actionLabel,
    //   date: new Date().toISOString(),
    //   checklist: {
    //     formatOk: !!chkFormat.checked,
    //     completenessOk: !!chkCompleteness.checked,
    //     agendaOk: !!chkAgenda.checked
    //   },
    //   comment: (remarks.value || "").trim()
    // });

    // Persist
    // const idx = proposals.findIndex(p => String(p.id) === String(proposal.id));
    // if (idx >= 0) proposals[idx] = proposal;

    // Keep both keys in sync (so other pages don't "miss" updates)
    // localStorage.setItem("allProposals", JSON.stringify(proposals));
    // localStorage.setItem("proposals", JSON.stringify(proposals));
  // }

  function escapeHtml(s) {
    if (s === null || s === undefined) return "";
    return String(s)
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  function formatDate(d) {
    if (!d) return "";
    try { return new Date(d).toLocaleString(); }
    catch { return String(d); }
  }
});
