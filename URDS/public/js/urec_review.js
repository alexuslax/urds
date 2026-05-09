document.addEventListener("DOMContentLoaded", async () => {
  "use strict";

  // =========================================================
  // UEP-URDS Research Management System
  // UREC Review Script
  // =========================================================

  const form = document.getElementById("urecForm");
  const proposalInfo = document.getElementById("proposalInfo");
  const proposalHistory = document.getElementById("proposalHistory");
  const historyList = document.getElementById("historyList");

  const riskLevel = document.getElementById("riskLevel");
  const participants = document.getElementById("participants");
  const privacy = document.getElementById("privacy");
  const ethicsClearanceType = document.getElementById("ethicsClearanceType");

  const chkConsent = document.getElementById("chkConsent");
  const chkPrivacy = document.getElementById("chkPrivacy");
  const chkRisk = document.getElementById("chkRisk");
  const chkVulnerable = document.getElementById("chkVulnerable");

  const notesEl = document.getElementById("urec_notes") || document.getElementById("comments");
  const decisionEl = document.getElementById("decision");

  const saveBtn = document.getElementById("urecSave");
  const submitBtn =
    document.getElementById("urecSubmit") ||
    document.getElementById("submitBtn");

  let statusBox = document.getElementById("statusBox");
  let currentProposal = null;
  let currentUser = null;
  let isSubmitting = false;

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
  // Status box
  // =========================================================

  if (!statusBox) {
    statusBox = document.createElement("div");
    statusBox.id = "statusBox";
    statusBox.className =
      "mb-4 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600";

    if (form && form.parentNode) {
      form.parentNode.insertBefore(statusBox, form);
    } else {
      document.body.insertBefore(statusBox, document.body.firstChild);
    }
  }

  // =========================================================
  // Initialization
  // =========================================================

  setStatus("Checking user session...");

  const profile = await loadUserProfile();

  if (!profile) {
    alert("Session expired. Please log in again.");
    window.location.href = "login.html";
    return;
  }

  currentUser = profile;

  const role = normalizeRole(profile.role || "");

  if (!isAllowedRole(role)) {
    alert("Access denied. UREC members only.");
    window.location.href = "dashboard.html";
    return;
  }

  setStatus(`Logged in as ${profile.fullName || profile.full_name || profile.name || "UREC Member"} (${profile.role || role})`);

  if (!proposalId) {
    renderNoProposal();
    if (form) form.classList.add("hidden");
    return;
  }

  localStorage.setItem("viewProposalId", proposalId);

  if (form) form.classList.remove("hidden");

  setLoadingState();
  await loadProposal(proposalId);
  restoreDraft();

  saveBtn?.addEventListener("click", saveDraft);
  submitBtn?.addEventListener("click", submitURECReview);

  // =========================================================
  // Auth
  // =========================================================

  async function loadUserProfile() {
    try {
      if (!window.Auth) {
        console.warn("Auth system not found.");
        setStatus("Auth system not loaded.", "error");
        return null;
      }

      await window.Auth.ensureInit?.();

      const profile =
        window.Auth.getProfile?.() ||
        window.Auth.profile ||
        null;

      if (profile) {
        saveProfileToLocalStorage(profile);
        return profile;
      }

      const fallbackProfile = await window.Auth.ensureInit?.();

      if (fallbackProfile) {
        saveProfileToLocalStorage(fallbackProfile);
        return fallbackProfile;
      }

      return null;
    } catch (error) {
      console.error("Auth initialization failed:", error);
      setStatus("Unable to verify user session.", "error");
      return null;
    }
  }

  function saveProfileToLocalStorage(profile) {
    const name =
      profile.fullName ||
      profile.full_name ||
      profile.name ||
      profile.username ||
      profile.email ||
      "User";

    if (name) localStorage.setItem("userName", name);
    if (profile.role) localStorage.setItem("userRole", profile.role);
  }

  function isAllowedRole(role) {
    return role === "UREC" || role === "Administrator";
  }

  function normalizeRole(value) {
    const text = normalizeText(value);

    if (!text) return "";

    if (text.includes("administrator") || text === "admin") return "Administrator";
    if (text.includes("urec")) return "UREC";

    return value || "";
  }

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
        currentProposal = result.proposal || result.data || null;

        if (!currentProposal) {
          renderError("Proposal data was not found.");
          return;
        }

        localStorage.setItem("viewProposalId", getProposalId(currentProposal));

        renderProposalInfo(currentProposal);
        renderHistory(getHistoryItems(currentProposal));

        setStatus("Proposal loaded. Complete the UREC review form.");
        return;
      }

      const message = result.message || result.error || "Unable to load proposal.";
      renderError(message);
      setStatus(message, "error");

      if (String(message).toLowerCase().includes("not logged in")) {
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1200);
      }
    } catch (error) {
      console.error("Error fetching proposal:", error);
      renderError(`Error loading proposal: ${error.message}`);
      setStatus("Error fetching proposal.", "error");
    }
  }

  // =========================================================
  // Render proposal
  // =========================================================

  function renderProposalInfo(proposal) {
    if (!proposalInfo) return;

    const id = getProposalId(proposal);
    const title = getTitle(proposal);
    const leader = getLeader(proposal);
    const college = getCollege(proposal);
    const department = getDepartment(proposal);
    const cluster = getCluster(proposal);
    const status = getStatus(proposal);
    const submitted = formatDate(getDateSubmitted(proposal));
    const methodology = proposal.methodology || proposal.methods || proposal.description || "";
    const budgetTotal = getBudgetTotal(proposal);
    const workplan = getWorkplan(proposal);

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

        <div class="border-t border-gray-200 pt-4 space-y-4">
          <div>
            <h3 class="text-sm font-bold text-gray-900">Methodology / Ethical Context</h3>
            <div class="mt-2 text-sm text-gray-700 p-4 bg-gray-50 rounded-xl border border-gray-100 leading-relaxed">
              ${paragraphHtml(methodology || "No methodology provided.")}
            </div>
          </div>

          <div>
            <h3 class="text-sm font-bold text-gray-900">Budget Summary</h3>
            <div class="mt-2 text-sm text-gray-700 p-4 bg-gray-50 rounded-xl border border-gray-100">
              Estimated Budget:
              <span class="font-semibold">${escapeHtml(budgetTotal)}</span>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-bold text-gray-900">Workplan Summary</h3>
            <div class="mt-2 text-sm text-gray-700 p-4 bg-gray-50 rounded-xl border border-gray-100">
              ${
                workplan.length
                  ? `
                    <ul class="list-disc pl-5 space-y-1">
                      ${workplan
                        .slice(0, 5)
                        .map((item) => `<li>${escapeHtml(item.activity || item.task || item.description || "Untitled activity")}</li>`)
                        .join("")}
                    </ul>
                  `
                  : "No workplan items."
              }
            </div>
          </div>
        </div>

        <div class="border-t border-gray-200 pt-4">
          <div class="text-sm font-bold text-gray-900 mb-2">Required Viewing</div>

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

  function renderHistory(history) {
    const list = historyList || document.getElementById("historyList");
    if (!list) return;

    if (!Array.isArray(history) || history.length === 0) {
      list.innerHTML = `
        <div class="text-sm text-gray-500">
          No history yet.
        </div>
      `;
      return;
    }

    const sorted = [...history].sort((a, b) => {
      const da = safeDate(a.date || a.created_at || a.reviewed_at)?.getTime() || 0;
      const db = safeDate(b.date || b.created_at || b.reviewed_at)?.getTime() || 0;
      return db - da;
    });

    list.innerHTML = sorted
      .map((item) => {
        const role =
          item.role ||
          item.user_role ||
          item.reviewer ||
          item.user ||
          "Unknown";

        const action =
          item.action ||
          item.action_label ||
          item.decision ||
          item.status ||
          "Updated";

        const comment =
          item.comment ||
          item.comments ||
          item.remarks ||
          item.notes ||
          "";

        const date =
          item.date ||
          item.created_at ||
          item.reviewed_at ||
          "";

        return `
          <div class="border border-gray-200 rounded-xl p-4 bg-white">
            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
              <div>
                <div class="text-sm font-bold text-gray-900">
                  ${escapeHtml(role)}
                </div>
                <div class="text-xs text-gray-500 mt-0.5">
                  ${escapeHtml(formatDate(date) || "-")}
                </div>
              </div>

              ${statusBadgeHtml(action)}
            </div>

            ${
              comment
                ? `
                  <div class="mt-3 text-sm text-gray-700 leading-relaxed">
                    ${paragraphHtml(comment)}
                  </div>
                `
                : ""
            }
          </div>
        `;
      })
      .join("");
  }

  function renderNoProposal() {
    if (proposalInfo) {
      proposalInfo.innerHTML = `
        <div class="bg-white border border-red-200 p-6 rounded-2xl shadow-card text-center">
          <div class="text-red-700 font-bold">No proposal selected</div>
          <p class="text-sm text-gray-600 mt-1">
            Please open a proposal from the proposal list before accessing UREC review.
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

    if (proposalHistory) {
      proposalHistory.classList.add("hidden");
    }

    setStatus("Open a proposal from the list to continue.", "error");
  }

  function renderError(message) {
    if (proposalInfo) {
      proposalInfo.innerHTML = `
        <div class="bg-white border border-red-200 p-6 rounded-2xl shadow-card text-red-700">
          ${escapeHtml(message)}
        </div>
      `;
    }
  }

  function setLoadingState() {
    if (proposalInfo) {
      proposalInfo.innerHTML = `
        <div class="text-sm text-gray-500">
          Loading proposal information...
        </div>
      `;
    }

    if (historyList) {
      historyList.innerHTML = `
        <div class="text-sm text-gray-500">
          Loading proposal history...
        </div>
      `;
    }
  }

  // =========================================================
  // Draft
  // =========================================================

  function getDraftKey() {
    return `urecReviewDraft:${proposalId}`;
  }

  function saveDraft() {
    if (!proposalId) {
      alert("No proposal selected.");
      return;
    }

    const draft = collectFormData(false);

    localStorage.setItem(getDraftKey(), JSON.stringify(draft));

    showToast("UREC draft saved locally.", "success");
    setStatus("Draft saved locally.");
  }

  function restoreDraft() {
    if (!proposalId) return;

    try {
      const saved = JSON.parse(localStorage.getItem(getDraftKey()) || "null");
      if (!saved) return;

      if (riskLevel) riskLevel.value = saved.criteria?.riskLevel || "";
      if (participants) participants.value = saved.criteria?.participants || "";
      if (privacy) privacy.value = saved.criteria?.privacy || "";
      if (ethicsClearanceType) ethicsClearanceType.value = saved.criteria?.ethicsClearanceType || "";

      if (chkConsent) chkConsent.checked = Boolean(saved.checklist?.informedConsent);
      if (chkPrivacy) chkPrivacy.checked = Boolean(saved.checklist?.privacySafeguards);
      if (chkRisk) chkRisk.checked = Boolean(saved.checklist?.riskManagement);
      if (chkVulnerable) chkVulnerable.checked = Boolean(saved.checklist?.vulnerableGroups);

      if (notesEl) notesEl.value = saved.notes || "";
      if (decisionEl) decisionEl.value = saved.decision || "";

      setStatus("Draft restored from this browser.");
    } catch (error) {
      console.warn("Unable to restore UREC draft:", error);
    }
  }

  // =========================================================
  // Submit
  // =========================================================

  async function submitURECReview() {
    if (isSubmitting) return;

    if (!currentProposal) {
      alert("Proposal data is not loaded. Please refresh the page.");
      return;
    }

    const validationMessage = validateForm();

    if (validationMessage) {
      alert(validationMessage);
      return;
    }

    const payload = collectFormData(true);

    const decisionLabel = makeReadableStatus(payload.decision);
    const confirmed = confirm(`Submit UREC decision: ${decisionLabel}?`);

    if (!confirmed) return;

    setSubmittingState(true);

    try {
      const response = await fetch("../../backend/submit_urec_review.php", {
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
        throw new Error(result.message || result.error || "Failed to submit UREC decision.");
      }

      const updatedStatus = result.updatedStatus || result.updated_status || payload.status || payload.decision;

      localStorage.setItem(
        "recentlyUpdatedProposal",
        JSON.stringify({
          id: payload.proposal_id,
          status: updatedStatus,
          action: payload.action_label,
          updatedAt: new Date().toISOString()
        })
      );

      localStorage.removeItem(getDraftKey());

      showToast("UREC decision submitted.", "success");
      alert("UREC decision submitted successfully.");
      window.location.href = "proposal_list.html";
    } catch (error) {
      console.error("Error submitting UREC review:", error);
      alert(`Error: ${error.message}`);
      setStatus(`Error: ${error.message}`, "error");
      setSubmittingState(false);
    }
  }

  function validateForm() {
    const risk = String(riskLevel?.value || "").trim();
    const participantValue = String(participants?.value || "").trim();
    const privacyValue = String(privacy?.value || "").trim();
    const decision = String(decisionEl?.value || "").trim();
    const notes = String(notesEl?.value || "").trim();

    if (!risk) return "Please select a risk level.";
    if (!participantValue) return "Please select the participants or subject type.";
    if (!privacyValue) return "Please select privacy and confidentiality status.";
    if (!decision) return "Please select a UREC decision.";

    if ((decision === "returned for revision" || decision === "rejected") && !notes) {
      return "Please enter UREC comments before returning or rejecting the proposal.";
    }

    if (risk === "High" && decision === "for director review" && !notes) {
      return "Please add justification in UREC comments before forwarding a high-risk proposal.";
    }

    return "";
  }

  function collectFormData(isSubmit) {
    const proposal_id = Number(getProposalId(currentProposal) || proposalId);
    const decision = String(decisionEl?.value || "").trim();
    const notes = String(notesEl?.value || "").trim();

    const actionLabel = getActionLabel(decision);

    return {
      proposal_id,
      status: decision,
      decision,
      action_label: actionLabel,
      comments: notes,

      review: {
        decision,
        notes,
        reviewer: getReviewerName(),
        reviewed_at: new Date().toISOString(),
        criteria: {
          riskLevel: String(riskLevel?.value || "").trim(),
          participants: String(participants?.value || "").trim(),
          privacy: String(privacy?.value || "").trim(),
          ethicsClearanceType: String(ethicsClearanceType?.value || "").trim()
        },
        checklist: {
          informedConsent: Boolean(chkConsent?.checked),
          privacySafeguards: Boolean(chkPrivacy?.checked),
          riskManagement: Boolean(chkRisk?.checked),
          vulnerableGroups: Boolean(chkVulnerable?.checked)
        }
      },

      checklist: {
        informedConsent: Boolean(chkConsent?.checked),
        privacySafeguards: Boolean(chkPrivacy?.checked),
        riskManagement: Boolean(chkRisk?.checked),
        vulnerableGroups: Boolean(chkVulnerable?.checked)
      },

      submit: Boolean(isSubmit)
    };
  }

  function getActionLabel(decision) {
    if (decision === "for director review") return "Cleared by UREC";
    if (decision === "returned for revision") return "Returned by UREC";
    if (decision === "rejected") return "Rejected by UREC";

    return "UREC Review";
  }

  function getReviewerName() {
    return (
      currentUser?.fullName ||
      currentUser?.full_name ||
      currentUser?.name ||
      currentUser?.username ||
      currentUser?.email ||
      "UREC Member"
    );
  }

  function setSubmittingState(submitting) {
    isSubmitting = submitting;

    if (submitBtn) {
      submitBtn.disabled = submitting;
      submitBtn.textContent = submitting ? "Submitting..." : "Submit Decision";
      submitBtn.classList.toggle("opacity-70", submitting);
      submitBtn.classList.toggle("cursor-not-allowed", submitting);
    }

    if (saveBtn) {
      saveBtn.disabled = submitting;
      saveBtn.classList.toggle("opacity-70", submitting);
      saveBtn.classList.toggle("cursor-not-allowed", submitting);
    }
  }

  // =========================================================
  // Data helpers
  // =========================================================

  function getProposalId(proposal) {
    return (
      proposal?.id ||
      proposal?.proposal_id ||
      proposal?.proposalId ||
      proposal?.research_id ||
      proposal?.researchId ||
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

  function getLeader(proposal) {
    return (
      proposal?.leader ||
      proposal?.studyLeader ||
      proposal?.study_leader ||
      proposal?.researcher ||
      proposal?.researcher_name ||
      proposal?.proponent ||
      "Unknown Leader"
    );
  }

  function getCollege(proposal) {
    return (
      proposal?.college ||
      proposal?.college_name ||
      "Unknown College"
    );
  }

  function getDepartment(proposal) {
    return (
      proposal?.department ||
      proposal?.department_name ||
      proposal?.dept ||
      ""
    );
  }

  function getCluster(proposal) {
    return (
      proposal?.cluster ||
      proposal?.commodity ||
      proposal?.category ||
      "Unspecified Cluster"
    );
  }

  function getStatus(proposal) {
    return (
      proposal?.status ||
      proposal?.proposal_status ||
      proposal?.current_status ||
      proposal?.currentStatus ||
      "For UREC Review"
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

  function getBudgetTotal(proposal) {
    const direct =
      proposal?.budgetTotal ||
      proposal?.budget_total ||
      proposal?.estimatedBudget ||
      proposal?.estimated_budget ||
      "";

    if (direct) return `₱ ${money(direct)}`;

    const budget = parseMaybeJson(proposal?.budget);

    if (!budget || typeof budget !== "object") return "N/A";

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

    return total > 0 ? `₱ ${money(total)}` : "N/A";
  }

  function getWorkplan(proposal) {
    const workplan = parseMaybeJson(proposal?.workplan);

    return Array.isArray(workplan) ? workplan : [];
  }

  function getHistoryItems(proposal) {
    const output = [];

    const fields = [
      proposal?.history,
      proposal?.screeningHistory,
      proposal?.screening_history,
      proposal?.reviewHistory,
      proposal?.review_history,
      proposal?.logs
    ];

    fields.forEach((field) => {
      const parsed = parseMaybeJson(field);
      if (Array.isArray(parsed)) output.push(...parsed);
    });

    return output;
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
      s.includes("ongoing") ||
      s.includes("implementation") ||
      s.includes("monitoring")
    ) {
      return "ongoing";
    }

    if (
      s.includes("approved") ||
      s.includes("approve") ||
      s.includes("cleared") ||
      s.includes("forwarded") ||
      s.includes("director review") ||
      s.includes("special order") ||
      s.includes("notice to proceed") ||
      s.includes("completed")
    ) {
      return "approved";
    }

    if (
      s.includes("review") ||
      s.includes("evaluation") ||
      s.includes("screening") ||
      s.includes("urec") ||
      s.includes("director") ||
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
    const text = String(status || "For UREC Review")
      .replace(/_/g, " ")
      .replace(/-/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return text.replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  // =========================================================
  // UI helpers
  // =========================================================

  function setStatus(message, type = "info") {
    if (!statusBox) return;

    const className =
      type === "error"
        ? "mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        : "mb-4 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600";

    statusBox.className = className;
    statusBox.textContent = message;
  }

  function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");

    if (!container) {
      setStatus(message, type === "error" ? "error" : "info");
      return;
    }

    const toast = document.createElement("div");

    const className =
      type === "success"
        ? "bg-green-600 text-white"
        : type === "error"
          ? "bg-red-600 text-white"
          : "bg-gray-900 text-white";

    toast.className = `${className} px-4 py-3 rounded-xl shadow-lg text-sm font-semibold`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
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

  function paragraphHtml(value) {
    const text = escapeHtml(value || "");

    if (!text.trim()) {
      return `<span class="text-gray-400">No information provided.</span>`;
    }

    return text.replace(/\n/g, "<br>");
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

    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function toNumber(value) {
    const number = Number(value || 0);
    return Number.isFinite(number) ? number : 0;
  }

  function money(value) {
    return toNumber(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
});document.addEventListener("DOMContentLoaded", async () => {
  "use strict";

  // =========================================================
  // UEP-URDS Research Management System
  // UREC Review Script
  // =========================================================

  const form = document.getElementById("urecForm");
  const proposalInfo = document.getElementById("proposalInfo");
  const proposalHistory = document.getElementById("proposalHistory");
  const historyList = document.getElementById("historyList");

  const riskLevel = document.getElementById("riskLevel");
  const participants = document.getElementById("participants");
  const privacy = document.getElementById("privacy");
  const ethicsClearanceType = document.getElementById("ethicsClearanceType");

  const chkConsent = document.getElementById("chkConsent");
  const chkPrivacy = document.getElementById("chkPrivacy");
  const chkRisk = document.getElementById("chkRisk");
  const chkVulnerable = document.getElementById("chkVulnerable");

  const notesEl = document.getElementById("urec_notes") || document.getElementById("comments");
  const decisionEl = document.getElementById("decision");

  const saveBtn = document.getElementById("urecSave");
  const submitBtn =
    document.getElementById("urecSubmit") ||
    document.getElementById("submitBtn");

  let statusBox = document.getElementById("statusBox");
  let currentProposal = null;
  let currentUser = null;
  let isSubmitting = false;

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
  // Status box
  // =========================================================

  if (!statusBox) {
    statusBox = document.createElement("div");
    statusBox.id = "statusBox";
    statusBox.className =
      "mb-4 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600";

    if (form && form.parentNode) {
      form.parentNode.insertBefore(statusBox, form);
    } else {
      document.body.insertBefore(statusBox, document.body.firstChild);
    }
  }

  // =========================================================
  // Initialization
  // =========================================================

  setStatus("Checking user session...");

  const profile = await loadUserProfile();

  if (!profile) {
    alert("Session expired. Please log in again.");
    window.location.href = "login.html";
    return;
  }

  currentUser = profile;

  const role = normalizeRole(profile.role || "");

  if (!isAllowedRole(role)) {
    alert("Access denied. UREC members only.");
    window.location.href = "dashboard.html";
    return;
  }

  setStatus(`Logged in as ${profile.fullName || profile.full_name || profile.name || "UREC Member"} (${profile.role || role})`);

  if (!proposalId) {
    renderNoProposal();
    if (form) form.classList.add("hidden");
    return;
  }

  localStorage.setItem("viewProposalId", proposalId);

  if (form) form.classList.remove("hidden");

  setLoadingState();
  await loadProposal(proposalId);
  restoreDraft();

  saveBtn?.addEventListener("click", saveDraft);
  submitBtn?.addEventListener("click", submitURECReview);

  // =========================================================
  // Auth
  // =========================================================

  async function loadUserProfile() {
    try {
      if (!window.Auth) {
        console.warn("Auth system not found.");
        setStatus("Auth system not loaded.", "error");
        return null;
      }

      await window.Auth.ensureInit?.();

      const profile =
        window.Auth.getProfile?.() ||
        window.Auth.profile ||
        null;

      if (profile) {
        saveProfileToLocalStorage(profile);
        return profile;
      }

      const fallbackProfile = await window.Auth.ensureInit?.();

      if (fallbackProfile) {
        saveProfileToLocalStorage(fallbackProfile);
        return fallbackProfile;
      }

      return null;
    } catch (error) {
      console.error("Auth initialization failed:", error);
      setStatus("Unable to verify user session.", "error");
      return null;
    }
  }

  function saveProfileToLocalStorage(profile) {
    const name =
      profile.fullName ||
      profile.full_name ||
      profile.name ||
      profile.username ||
      profile.email ||
      "User";

    if (name) localStorage.setItem("userName", name);
    if (profile.role) localStorage.setItem("userRole", profile.role);
  }

  function isAllowedRole(role) {
    return role === "UREC" || role === "Administrator";
  }

  function normalizeRole(value) {
    const text = normalizeText(value);

    if (!text) return "";

    if (text.includes("administrator") || text === "admin") return "Administrator";
    if (text.includes("urec")) return "UREC";

    return value || "";
  }

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
        currentProposal = result.proposal || result.data || null;

        if (!currentProposal) {
          renderError("Proposal data was not found.");
          return;
        }

        localStorage.setItem("viewProposalId", getProposalId(currentProposal));

        renderProposalInfo(currentProposal);
        renderHistory(getHistoryItems(currentProposal));

        setStatus("Proposal loaded. Complete the UREC review form.");
        return;
      }

      const message = result.message || result.error || "Unable to load proposal.";
      renderError(message);
      setStatus(message, "error");

      if (String(message).toLowerCase().includes("not logged in")) {
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1200);
      }
    } catch (error) {
      console.error("Error fetching proposal:", error);
      renderError(`Error loading proposal: ${error.message}`);
      setStatus("Error fetching proposal.", "error");
    }
  }

  // =========================================================
  // Render proposal
  // =========================================================

  function renderProposalInfo(proposal) {
    if (!proposalInfo) return;

    const id = getProposalId(proposal);
    const title = getTitle(proposal);
    const leader = getLeader(proposal);
    const college = getCollege(proposal);
    const department = getDepartment(proposal);
    const cluster = getCluster(proposal);
    const status = getStatus(proposal);
    const submitted = formatDate(getDateSubmitted(proposal));
    const methodology = proposal.methodology || proposal.methods || proposal.description || "";
    const budgetTotal = getBudgetTotal(proposal);
    const workplan = getWorkplan(proposal);

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

        <div class="border-t border-gray-200 pt-4 space-y-4">
          <div>
            <h3 class="text-sm font-bold text-gray-900">Methodology / Ethical Context</h3>
            <div class="mt-2 text-sm text-gray-700 p-4 bg-gray-50 rounded-xl border border-gray-100 leading-relaxed">
              ${paragraphHtml(methodology || "No methodology provided.")}
            </div>
          </div>

          <div>
            <h3 class="text-sm font-bold text-gray-900">Budget Summary</h3>
            <div class="mt-2 text-sm text-gray-700 p-4 bg-gray-50 rounded-xl border border-gray-100">
              Estimated Budget:
              <span class="font-semibold">${escapeHtml(budgetTotal)}</span>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-bold text-gray-900">Workplan Summary</h3>
            <div class="mt-2 text-sm text-gray-700 p-4 bg-gray-50 rounded-xl border border-gray-100">
              ${
                workplan.length
                  ? `
                    <ul class="list-disc pl-5 space-y-1">
                      ${workplan
                        .slice(0, 5)
                        .map((item) => `<li>${escapeHtml(item.activity || item.task || item.description || "Untitled activity")}</li>`)
                        .join("")}
                    </ul>
                  `
                  : "No workplan items."
              }
            </div>
          </div>
        </div>

        <div class="border-t border-gray-200 pt-4">
          <div class="text-sm font-bold text-gray-900 mb-2">Required Viewing</div>

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

  function renderHistory(history) {
    const list = historyList || document.getElementById("historyList");
    if (!list) return;

    if (!Array.isArray(history) || history.length === 0) {
      list.innerHTML = `
        <div class="text-sm text-gray-500">
          No history yet.
        </div>
      `;
      return;
    }

    const sorted = [...history].sort((a, b) => {
      const da = safeDate(a.date || a.created_at || a.reviewed_at)?.getTime() || 0;
      const db = safeDate(b.date || b.created_at || b.reviewed_at)?.getTime() || 0;
      return db - da;
    });

    list.innerHTML = sorted
      .map((item) => {
        const role =
          item.role ||
          item.user_role ||
          item.reviewer ||
          item.user ||
          "Unknown";

        const action =
          item.action ||
          item.action_label ||
          item.decision ||
          item.status ||
          "Updated";

        const comment =
          item.comment ||
          item.comments ||
          item.remarks ||
          item.notes ||
          "";

        const date =
          item.date ||
          item.created_at ||
          item.reviewed_at ||
          "";

        return `
          <div class="border border-gray-200 rounded-xl p-4 bg-white">
            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
              <div>
                <div class="text-sm font-bold text-gray-900">
                  ${escapeHtml(role)}
                </div>
                <div class="text-xs text-gray-500 mt-0.5">
                  ${escapeHtml(formatDate(date) || "-")}
                </div>
              </div>

              ${statusBadgeHtml(action)}
            </div>

            ${
              comment
                ? `
                  <div class="mt-3 text-sm text-gray-700 leading-relaxed">
                    ${paragraphHtml(comment)}
                  </div>
                `
                : ""
            }
          </div>
        `;
      })
      .join("");
  }

  function renderNoProposal() {
    if (proposalInfo) {
      proposalInfo.innerHTML = `
        <div class="bg-white border border-red-200 p-6 rounded-2xl shadow-card text-center">
          <div class="text-red-700 font-bold">No proposal selected</div>
          <p class="text-sm text-gray-600 mt-1">
            Please open a proposal from the proposal list before accessing UREC review.
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

    if (proposalHistory) {
      proposalHistory.classList.add("hidden");
    }

    setStatus("Open a proposal from the list to continue.", "error");
  }

  function renderError(message) {
    if (proposalInfo) {
      proposalInfo.innerHTML = `
        <div class="bg-white border border-red-200 p-6 rounded-2xl shadow-card text-red-700">
          ${escapeHtml(message)}
        </div>
      `;
    }
  }

  function setLoadingState() {
    if (proposalInfo) {
      proposalInfo.innerHTML = `
        <div class="text-sm text-gray-500">
          Loading proposal information...
        </div>
      `;
    }

    if (historyList) {
      historyList.innerHTML = `
        <div class="text-sm text-gray-500">
          Loading proposal history...
        </div>
      `;
    }
  }

  // =========================================================
  // Draft
  // =========================================================

  function getDraftKey() {
    return `urecReviewDraft:${proposalId}`;
  }

  function saveDraft() {
    if (!proposalId) {
      alert("No proposal selected.");
      return;
    }

    const draft = collectFormData(false);

    localStorage.setItem(getDraftKey(), JSON.stringify(draft));

    showToast("UREC draft saved locally.", "success");
    setStatus("Draft saved locally.");
  }

  function restoreDraft() {
    if (!proposalId) return;

    try {
      const saved = JSON.parse(localStorage.getItem(getDraftKey()) || "null");
      if (!saved) return;

      if (riskLevel) riskLevel.value = saved.criteria?.riskLevel || "";
      if (participants) participants.value = saved.criteria?.participants || "";
      if (privacy) privacy.value = saved.criteria?.privacy || "";
      if (ethicsClearanceType) ethicsClearanceType.value = saved.criteria?.ethicsClearanceType || "";

      if (chkConsent) chkConsent.checked = Boolean(saved.checklist?.informedConsent);
      if (chkPrivacy) chkPrivacy.checked = Boolean(saved.checklist?.privacySafeguards);
      if (chkRisk) chkRisk.checked = Boolean(saved.checklist?.riskManagement);
      if (chkVulnerable) chkVulnerable.checked = Boolean(saved.checklist?.vulnerableGroups);

      if (notesEl) notesEl.value = saved.notes || "";
      if (decisionEl) decisionEl.value = saved.decision || "";

      setStatus("Draft restored from this browser.");
    } catch (error) {
      console.warn("Unable to restore UREC draft:", error);
    }
  }

  // =========================================================
  // Submit
  // =========================================================

  async function submitURECReview() {
    if (isSubmitting) return;

    if (!currentProposal) {
      alert("Proposal data is not loaded. Please refresh the page.");
      return;
    }

    const validationMessage = validateForm();

    if (validationMessage) {
      alert(validationMessage);
      return;
    }

    const payload = collectFormData(true);

    const decisionLabel = makeReadableStatus(payload.decision);
    const confirmed = confirm(`Submit UREC decision: ${decisionLabel}?`);

    if (!confirmed) return;

    setSubmittingState(true);

    try {
      const response = await fetch("../../backend/submit_urec_review.php", {
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
        throw new Error(result.message || result.error || "Failed to submit UREC decision.");
      }

      const updatedStatus = result.updatedStatus || result.updated_status || payload.status || payload.decision;

      localStorage.setItem(
        "recentlyUpdatedProposal",
        JSON.stringify({
          id: payload.proposal_id,
          status: updatedStatus,
          action: payload.action_label,
          updatedAt: new Date().toISOString()
        })
      );

      localStorage.removeItem(getDraftKey());

      showToast("UREC decision submitted.", "success");
      alert("UREC decision submitted successfully.");
      window.location.href = "proposal_list.html";
    } catch (error) {
      console.error("Error submitting UREC review:", error);
      alert(`Error: ${error.message}`);
      setStatus(`Error: ${error.message}`, "error");
      setSubmittingState(false);
    }
  }

  function validateForm() {
    const risk = String(riskLevel?.value || "").trim();
    const participantValue = String(participants?.value || "").trim();
    const privacyValue = String(privacy?.value || "").trim();
    const decision = String(decisionEl?.value || "").trim();
    const notes = String(notesEl?.value || "").trim();

    if (!risk) return "Please select a risk level.";
    if (!participantValue) return "Please select the participants or subject type.";
    if (!privacyValue) return "Please select privacy and confidentiality status.";
    if (!decision) return "Please select a UREC decision.";

    if ((decision === "returned for revision" || decision === "rejected") && !notes) {
      return "Please enter UREC comments before returning or rejecting the proposal.";
    }

    if (risk === "High" && decision === "for director review" && !notes) {
      return "Please add justification in UREC comments before forwarding a high-risk proposal.";
    }

    return "";
  }

  function collectFormData(isSubmit) {
    const proposal_id = Number(getProposalId(currentProposal) || proposalId);
    const decision = String(decisionEl?.value || "").trim();
    const notes = String(notesEl?.value || "").trim();

    const actionLabel = getActionLabel(decision);

    return {
      proposal_id,
      status: decision,
      decision,
      action_label: actionLabel,
      comments: notes,

      review: {
        decision,
        notes,
        reviewer: getReviewerName(),
        reviewed_at: new Date().toISOString(),
        criteria: {
          riskLevel: String(riskLevel?.value || "").trim(),
          participants: String(participants?.value || "").trim(),
          privacy: String(privacy?.value || "").trim(),
          ethicsClearanceType: String(ethicsClearanceType?.value || "").trim()
        },
        checklist: {
          informedConsent: Boolean(chkConsent?.checked),
          privacySafeguards: Boolean(chkPrivacy?.checked),
          riskManagement: Boolean(chkRisk?.checked),
          vulnerableGroups: Boolean(chkVulnerable?.checked)
        }
      },

      checklist: {
        informedConsent: Boolean(chkConsent?.checked),
        privacySafeguards: Boolean(chkPrivacy?.checked),
        riskManagement: Boolean(chkRisk?.checked),
        vulnerableGroups: Boolean(chkVulnerable?.checked)
      },

      submit: Boolean(isSubmit)
    };
  }

  function getActionLabel(decision) {
    if (decision === "for director review") return "Cleared by UREC";
    if (decision === "returned for revision") return "Returned by UREC";
    if (decision === "rejected") return "Rejected by UREC";

    return "UREC Review";
  }

  function getReviewerName() {
    return (
      currentUser?.fullName ||
      currentUser?.full_name ||
      currentUser?.name ||
      currentUser?.username ||
      currentUser?.email ||
      "UREC Member"
    );
  }

  function setSubmittingState(submitting) {
    isSubmitting = submitting;

    if (submitBtn) {
      submitBtn.disabled = submitting;
      submitBtn.textContent = submitting ? "Submitting..." : "Submit Decision";
      submitBtn.classList.toggle("opacity-70", submitting);
      submitBtn.classList.toggle("cursor-not-allowed", submitting);
    }

    if (saveBtn) {
      saveBtn.disabled = submitting;
      saveBtn.classList.toggle("opacity-70", submitting);
      saveBtn.classList.toggle("cursor-not-allowed", submitting);
    }
  }

  // =========================================================
  // Data helpers
  // =========================================================

  function getProposalId(proposal) {
    return (
      proposal?.id ||
      proposal?.proposal_id ||
      proposal?.proposalId ||
      proposal?.research_id ||
      proposal?.researchId ||
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

  function getLeader(proposal) {
    return (
      proposal?.leader ||
      proposal?.studyLeader ||
      proposal?.study_leader ||
      proposal?.researcher ||
      proposal?.researcher_name ||
      proposal?.proponent ||
      "Unknown Leader"
    );
  }

  function getCollege(proposal) {
    return (
      proposal?.college ||
      proposal?.college_name ||
      "Unknown College"
    );
  }

  function getDepartment(proposal) {
    return (
      proposal?.department ||
      proposal?.department_name ||
      proposal?.dept ||
      ""
    );
  }

  function getCluster(proposal) {
    return (
      proposal?.cluster ||
      proposal?.commodity ||
      proposal?.category ||
      "Unspecified Cluster"
    );
  }

  function getStatus(proposal) {
    return (
      proposal?.status ||
      proposal?.proposal_status ||
      proposal?.current_status ||
      proposal?.currentStatus ||
      "For UREC Review"
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

  function getBudgetTotal(proposal) {
    const direct =
      proposal?.budgetTotal ||
      proposal?.budget_total ||
      proposal?.estimatedBudget ||
      proposal?.estimated_budget ||
      "";

    if (direct) return `₱ ${money(direct)}`;

    const budget = parseMaybeJson(proposal?.budget);

    if (!budget || typeof budget !== "object") return "N/A";

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

    return total > 0 ? `₱ ${money(total)}` : "N/A";
  }

  function getWorkplan(proposal) {
    const workplan = parseMaybeJson(proposal?.workplan);

    return Array.isArray(workplan) ? workplan : [];
  }

  function getHistoryItems(proposal) {
    const output = [];

    const fields = [
      proposal?.history,
      proposal?.screeningHistory,
      proposal?.screening_history,
      proposal?.reviewHistory,
      proposal?.review_history,
      proposal?.logs
    ];

    fields.forEach((field) => {
      const parsed = parseMaybeJson(field);
      if (Array.isArray(parsed)) output.push(...parsed);
    });

    return output;
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
      s.includes("ongoing") ||
      s.includes("implementation") ||
      s.includes("monitoring")
    ) {
      return "ongoing";
    }

    if (
      s.includes("approved") ||
      s.includes("approve") ||
      s.includes("cleared") ||
      s.includes("forwarded") ||
      s.includes("director review") ||
      s.includes("special order") ||
      s.includes("notice to proceed") ||
      s.includes("completed")
    ) {
      return "approved";
    }

    if (
      s.includes("review") ||
      s.includes("evaluation") ||
      s.includes("screening") ||
      s.includes("urec") ||
      s.includes("director") ||
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
    const text = String(status || "For UREC Review")
      .replace(/_/g, " ")
      .replace(/-/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return text.replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  // =========================================================
  // UI helpers
  // =========================================================

  function setStatus(message, type = "info") {
    if (!statusBox) return;

    const className =
      type === "error"
        ? "mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        : "mb-4 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600";

    statusBox.className = className;
    statusBox.textContent = message;
  }

  function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");

    if (!container) {
      setStatus(message, type === "error" ? "error" : "info");
      return;
    }

    const toast = document.createElement("div");

    const className =
      type === "success"
        ? "bg-green-600 text-white"
        : type === "error"
          ? "bg-red-600 text-white"
          : "bg-gray-900 text-white";

    toast.className = `${className} px-4 py-3 rounded-xl shadow-lg text-sm font-semibold`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
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

  function paragraphHtml(value) {
    const text = escapeHtml(value || "");

    if (!text.trim()) {
      return `<span class="text-gray-400">No information provided.</span>`;
    }

    return text.replace(/\n/g, "<br>");
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

    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function toNumber(value) {
    const number = Number(value || 0);
    return Number.isFinite(number) ? number : 0;
  }

  function money(value) {
    return toNumber(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
});