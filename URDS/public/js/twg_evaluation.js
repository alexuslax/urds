// js/twg_evaluation.js
// FM-010 Technical Working Group Review Evaluation Form
// Copy-paste ready

document.addEventListener("DOMContentLoaded", () => {
  const toastContainer = document.getElementById("toastContainer");

  const byId = (id) => document.getElementById(id);

  const escapeHTML = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const toast = (msg, type = "info") => {
    if (!toastContainer) {
      alert(msg);
      return;
    }

    const el = document.createElement("div");
    el.className =
      "px-4 py-3 rounded-xl shadow bg-white border text-sm flex items-start gap-2";
    el.innerHTML = `
      <div class="mt-[2px] ${type === "error" ? "text-red-600" : "text-urds-accent"}">●</div>
      <div class="text-gray-800">${escapeHTML(msg)}</div>
    `;
    toastContainer.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  };

  const formatDate = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    if (!Number.isFinite(d.getTime())) return value;
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit"
    });
  };

  const getQueryId = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("id") || params.get("proposal_id") || "";
  };

  const proposalId = getQueryId();
  const draftStorageKey = `twg_fm010_draft_${proposalId}`;

  if (!proposalId) {
    toast("No proposal ID found in URL.", "error");
  }

  // =========================================================
  // RADIO HELPERS
  // =========================================================
  const getRadioVal = (name) =>
    document.querySelector(`input[name="${name}"]:checked`)?.value || "";

  const setRadioVal = (name, value) => {
    const target = document.querySelector(
      `input[name="${name}"][value="${CSS.escape(value)}"]`
    );
    if (target) target.checked = true;
  };

  // =========================================================
  // CRITERIA MAP
  // =========================================================
  const criteriaMap = [
    {
      key: "relevance",
      radio: "rate_relevance",
      comments: ["c1_eval1", "c1_eval2", "c1_eval3"]
    },
    {
      key: "innovativeness",
      radio: "rate_innov",
      comments: ["c2_eval1", "c2_eval2", "c2_eval3"]
    },
    {
      key: "adoption",
      radio: "rate_adopt",
      comments: ["c3_eval1", "c3_eval2", "c3_eval3"]
    },
    {
      key: "methodology",
      radio: "rate_method",
      comments: ["c4_eval1", "c4_eval2", "c4_eval3"]
    },
    {
      key: "environmental",
      radio: "rate_env",
      comments: ["c5_eval1", "c5_eval2", "c5_eval3"]
    },
    {
      key: "socioeconomic",
      radio: "rate_soc",
      comments: ["c6_eval1", "c6_eval2", "c6_eval3"]
    },
    {
      key: "duration_budget",
      radio: "rate_budget",
      comments: ["c7_eval1", "c7_eval2", "c7_eval3"]
    }
  ];

  // =========================================================
  // BUILD PAYLOAD
  // =========================================================
  function collectFM010() {
    const header = {
      title: byId("fm_title")?.value.trim() || "",
      college_campus: byId("fm_college")?.value.trim() || "",
      proponents: byId("fm_proponents")?.value.trim() || "",
      category: getRadioVal("fm_category")
    };

    const criteria = {};
    criteriaMap.forEach((item) => {
      criteria[item.key] = {
        rating: getRadioVal(item.radio),
        comments: {
          evaluator1: byId(item.comments[0])?.value.trim() || "",
          evaluator2: byId(item.comments[1])?.value.trim() || "",
          evaluator3: byId(item.comments[2])?.value.trim() || ""
        }
      };
    });

    const overall = {
      evaluator1: byId("overall_eval1")?.value.trim() || "",
      evaluator2: byId("overall_eval2")?.value.trim() || "",
      evaluator3: byId("overall_eval3")?.value.trim() || ""
    };

    const recommendation = getRadioVal("fm_reco");

    const signoff = {
      rated_by: byId("rated_by")?.value.trim() || "",
      rated_date: byId("rated_date")?.value || "",
      noted_by: byId("noted_by")?.value.trim() || "",
      noted_date: byId("noted_date")?.value || ""
    };

    return {
      proposal_id: proposalId,
      form_code: "UEP-URDS-FM-010",
      review_type: "TWG Evaluation",
      header,
      criteria,
      overall,
      recommendation,
      signoff
    };
  }

  // =========================================================
  // DRAFT SAVE / LOAD
  // =========================================================
  function saveDraft() {
    try {
      const payload = collectFM010();
      localStorage.setItem(draftStorageKey, JSON.stringify(payload));
      toast("Draft saved locally.");
    } catch (err) {
      console.error(err);
      toast("Failed to save draft.", "error");
    }
  }

  function loadDraft() {
    const raw = localStorage.getItem(draftStorageKey);
    if (!raw) return false;

    try {
      const d = JSON.parse(raw);

      if (byId("fm_title")) byId("fm_title").value = d.header?.title || "";
      if (byId("fm_college")) byId("fm_college").value = d.header?.college_campus || "";
      if (byId("fm_proponents")) byId("fm_proponents").value = d.header?.proponents || "";
      if (d.header?.category) setRadioVal("fm_category", d.header.category);

      criteriaMap.forEach((item) => {
        const crit = d.criteria?.[item.key];
        if (crit?.rating) setRadioVal(item.radio, crit.rating);
        if (byId(item.comments[0])) byId(item.comments[0]).value = crit?.comments?.evaluator1 || "";
        if (byId(item.comments[1])) byId(item.comments[1]).value = crit?.comments?.evaluator2 || "";
        if (byId(item.comments[2])) byId(item.comments[2]).value = crit?.comments?.evaluator3 || "";
      });

      if (byId("overall_eval1")) byId("overall_eval1").value = d.overall?.evaluator1 || "";
      if (byId("overall_eval2")) byId("overall_eval2").value = d.overall?.evaluator2 || "";
      if (byId("overall_eval3")) byId("overall_eval3").value = d.overall?.evaluator3 || "";

      if (d.recommendation) setRadioVal("fm_reco", d.recommendation);

      if (byId("rated_by")) byId("rated_by").value = d.signoff?.rated_by || "";
      if (byId("rated_date")) byId("rated_date").value = d.signoff?.rated_date || "";
      if (byId("noted_by")) byId("noted_by").value = d.signoff?.noted_by || "";
      if (byId("noted_date")) byId("noted_date").value = d.signoff?.noted_date || "";

      toast("Draft loaded.");
      return true;
    } catch (err) {
      console.warn("Failed to load draft:", err);
      return false;
    }
  }

  // =========================================================
  // VALIDATION
  // =========================================================
  function validateBeforeSubmit() {
    if (!byId("fm_title")?.value.trim()) {
      toast("Research Title is required.", "error");
      byId("fm_title")?.focus();
      return false;
    }

    if (!byId("fm_proponents")?.value.trim()) {
      toast("Proponent(s) is required.", "error");
      byId("fm_proponents")?.focus();
      return false;
    }

    if (!getRadioVal("fm_category")) {
      toast("Please select a category.", "error");
      return false;
    }

    for (const item of criteriaMap) {
      if (!getRadioVal(item.radio)) {
        toast("Please complete all criterion ratings.", "error");
        return false;
      }
    }

    if (!getRadioVal("fm_reco")) {
      toast("Please select a recommendation.", "error");
      return false;
    }

    if (!byId("rated_by")?.value.trim()) {
      toast("Please enter Rated by.", "error");
      byId("rated_by")?.focus();
      return false;
    }

    if (!byId("rated_date")?.value) {
      toast("Please select Rated date.", "error");
      byId("rated_date")?.focus();
      return false;
    }

    return true;
  }

  // =========================================================
  // PROPOSAL INFO + HISTORY
  // =========================================================
  function renderProposalInfo(proposal) {
    const box = byId("proposalInfo");
    if (!box) return;

    const leader = proposal.leader || proposal.studyLeader || "—";
    const college = proposal.collegeName || proposal.college || "—";
    const department = proposal.departmentName || proposal.department || "";
    const status = proposal.status || "—";

    box.innerHTML = `
      <div class="bg-white p-5 rounded-2xl shadow-card border space-y-3">
        <div>
          <div class="text-lg font-semibold">Proposal Information</div>
          <div class="text-xs text-gray-500">Reference details for FM-010 evaluation</div>
        </div>

        <div class="space-y-2 text-sm">
          <div><strong>Title:</strong> ${escapeHTML(proposal.title || "—")}</div>
          <div><strong>Nature:</strong> ${escapeHTML(proposal.nature || "—")}</div>
          <div><strong>Leader:</strong> ${escapeHTML(leader)}</div>
          <div><strong>College:</strong> ${escapeHTML(college)}${department ? ` / ${escapeHTML(department)}` : ""}</div>
          <div><strong>Status:</strong> ${escapeHTML(status)}</div>
          <div><strong>Submitted:</strong> ${escapeHTML(formatDate(proposal.dateSubmitted))}</div>
        </div>

        <div class="pt-2 flex flex-wrap gap-2">
          <a href="proposal_preview.html?id=${encodeURIComponent(proposalId)}"
             class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">
            Preview
          </a>
          <a href="twg_evaluation_print.html?id=${encodeURIComponent(proposalId)}"
             class="px-3 py-2 bg-urds-900 text-white hover:bg-urds-800 rounded-lg text-sm">
            Print FM-010
          </a>
        </div>
      </div>
    `;
  }

  function renderProposalHistory(proposal) {
    const box = byId("proposalHistory");
    if (!box) return;

    const history = Array.isArray(proposal.history) ? proposal.history : [];

    if (!history.length) {
      box.innerHTML = `
        <div class="bg-white p-5 rounded-2xl shadow-card border">
          <div class="text-lg font-semibold">Proposal History</div>
          <div class="text-sm text-gray-500 mt-2">No history available.</div>
        </div>
      `;
      return;
    }

    box.innerHTML = `
      <div class="bg-white p-5 rounded-2xl shadow-card border">
        <div class="text-lg font-semibold">Proposal History</div>
        <div class="mt-4 space-y-3">
          ${history.map(item => `
            <div class="border rounded-lg p-3 bg-gray-50">
              <div class="text-sm font-medium">${escapeHTML(item.status || item.action || "Update")}</div>
              <div class="text-xs text-gray-500 mt-1">${escapeHTML(formatDate(item.date || item.createdAt))}</div>
              ${item.note || item.comments || item.remarks
                ? `<div class="text-sm text-gray-700 mt-2 whitespace-pre-wrap">${escapeHTML(item.note || item.comments || item.remarks)}</div>`
                : ""
              }
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  // =========================================================
  // AUTO-FILL FROM PROPOSAL
  // =========================================================
  async function loadProposal() {
    if (!proposalId) return;

    try {
      const resp = await fetch(`../../backend/get_proposal.php?id=${encodeURIComponent(proposalId)}`, {
        method: "GET",
        credentials: "include"
      });

      if (!resp.ok) {
        throw new Error(`Failed to load proposal (HTTP ${resp.status})`);
      }

      const result = await resp.json();
      if (result.status !== "success" || !result.proposal) {
        throw new Error(result.message || "Failed to load proposal.");
      }

      const p = result.proposal;

      renderProposalInfo(p);
      renderProposalHistory(p);

      // Header autofill
      if (byId("fm_title") && !byId("fm_title").value.trim()) {
        byId("fm_title").value = p.title || "";
      }

      if (byId("fm_college") && !byId("fm_college").value.trim()) {
        const college = p.collegeName || p.college || "";
        const campus = p.campus || "";
        byId("fm_college").value = [college, campus].filter(Boolean).join(" / ");
      }

      if (byId("fm_proponents") && !byId("fm_proponents").value.trim()) {
        const leader = p.leader || p.studyLeader || "";
        const personnel = p.otherPersonnel || "";
        byId("fm_proponents").value = [leader, personnel].filter(Boolean).join(", ");
      }

      if (!getRadioVal("fm_category") && p.nature) {
        setRadioVal("fm_category", p.nature);
      }

      // Auto-fill rated by with logged-in user if empty
      const localName =
        localStorage.getItem("userName") ||
        localStorage.getItem("full_name") ||
        localStorage.getItem("name") ||
        "";

      if (byId("rated_by") && !byId("rated_by").value.trim() && localName) {
        byId("rated_by").value = localName;
      }

      // Default rated date today if empty
      if (byId("rated_date") && !byId("rated_date").value) {
        byId("rated_date").value = new Date().toISOString().slice(0, 10);
      }

    } catch (err) {
      console.error(err);
      toast(err.message || "Failed to load proposal.", "error");
    }
  }

  // =========================================================
  // SUBMIT TO BACKEND
  // =========================================================
  async function submitReview() {
    if (!validateBeforeSubmit()) return;

    const payload = collectFM010();

    try {
      const resp = await fetch("../../backend/submit_twg_evaluation.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      const raw = await resp.text();
      let result = null;

      try {
        result = JSON.parse(raw);
      } catch {
        // keep raw fallback
      }

      if (!resp.ok) {
        throw new Error(result?.message || raw || `HTTP ${resp.status}`);
      }

      if (result?.status === "success" || result === null) {
        localStorage.removeItem(draftStorageKey);
        toast("TWG evaluation submitted successfully!");

        setTimeout(() => {
          window.location.href = `proposal_preview.html?id=${encodeURIComponent(proposalId)}`;
        }, 1200);
      } else {
        throw new Error(result?.message || "Submit failed.");
      }
    } catch (err) {
      console.error(err);
      toast(`Submit failed: ${err.message}`, "error");
    }
  }

  // =========================================================
  // BUTTONS
  // =========================================================
  byId("twgSave")?.addEventListener("click", saveDraft);
  byId("twgSubmit")?.addEventListener("click", submitReview);

  // =========================================================
  // INIT
  // =========================================================
  loadProposal().then(() => {
    loadDraft();
  });
});