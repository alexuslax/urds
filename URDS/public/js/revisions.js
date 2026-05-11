document.addEventListener("DOMContentLoaded", async () => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const revisionList = $("revisionList");
  const countLine = $("countLine");
  const searchInput = $("search");
  const filterInput = $("revisionFilter");
  const toastContainer = $("toastContainer");

  const STORAGE_KEY = "urds_revision_records";

  let revisions = [];

  await init();

  async function init() {
    revisions = loadLocalRevisions();

    if (!revisions.length) {
      revisions = await loadProposalRevisions();
    }

    bindEvents();
    renderRevisions();
  }

  function bindEvents() {
    searchInput?.addEventListener("input", renderRevisions);
    filterInput?.addEventListener("change", renderRevisions);
  }

  function loadLocalRevisions() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  }

  async function loadProposalRevisions() {
    const possibleKeys = [
      "urds_proposals",
      "proposals",
      "submittedProposals",
      "research_proposals"
    ];

    let proposalRecords = [];

    for (const key of possibleKeys) {
      try {
        const saved = JSON.parse(localStorage.getItem(key) || "[]");
        if (Array.isArray(saved) && saved.length) {
          proposalRecords = saved;
          break;
        }
      } catch {
        // continue checking next key
      }
    }

    const revisionItems = [];

    proposalRecords.forEach((proposal) => {
      const status = normalizeText(
        proposal.status ||
        proposal.proposal_status ||
        proposal.current_status ||
        ""
      );

      const history = getHistoryItems(proposal);

      const returnedHistory = history.filter((item) => {
        const actionText = normalizeText(
          item.action ||
          item.status ||
          item.decision ||
          item.action_label ||
          ""
        );

        const commentText = normalizeText(
          item.comment ||
          item.comments ||
          item.remarks ||
          item.notes ||
          ""
        );

        return (
          actionText.includes("return") ||
          actionText.includes("revision") ||
          commentText.includes("revision") ||
          commentText.includes("revise") ||
          commentText.includes("correct")
        );
      });

      if (
        status.includes("return") ||
        status.includes("revision") ||
        returnedHistory.length
      ) {
        if (returnedHistory.length) {
          returnedHistory.forEach((item, index) => {
            revisionItems.push(makeRevisionItem(proposal, item, index));
          });
        } else {
          revisionItems.push(makeRevisionItem(proposal, null, 0));
        }
      }
    });

    return revisionItems;
  }

  function makeRevisionItem(proposal, historyItem, index) {
    const proposalId = getProposalId(proposal);
    const title = getTitle(proposal);
    const status = getStatus(proposal);

    return {
      id: `${proposalId || "proposal"}-${index}-${Date.now()}`,
      proposal_id: proposalId,
      title,
      researcher: getLeader(proposal),
      college: proposal.college || proposal.college_name || "",
      status,
      stage:
        historyItem?.role ||
        historyItem?.reviewer ||
        historyItem?.user_role ||
        historyItem?.stage ||
        getRevisionStage(status),
      comment:
        historyItem?.comment ||
        historyItem?.comments ||
        historyItem?.remarks ||
        historyItem?.notes ||
        proposal.revision_comments ||
        proposal.comments ||
        "No specific revision comment provided.",
      date:
        historyItem?.date ||
        historyItem?.created_at ||
        historyItem?.reviewed_at ||
        proposal.updated_at ||
        proposal.created_at ||
        "",
      state: getRevisionState(status)
    };
  }

  function renderRevisions() {
    if (!revisionList) return;

    const query = normalizeText(searchInput?.value || "");
    const filter = normalizeText(filterInput?.value || "");

    const filtered = revisions.filter((item) => {
      const haystack = normalizeText([
        item.title,
        item.researcher,
        item.college,
        item.status,
        item.stage,
        item.comment,
        item.date
      ].join(" "));

      const matchesSearch = !query || haystack.includes(query);
      const matchesFilter = !filter || item.state === filter;

      return matchesSearch && matchesFilter;
    });

    if (countLine) {
      countLine.textContent = `${filtered.length} revision item(s) found`;
    }

    if (!filtered.length) {
      revisionList.innerHTML = `
        <div class="p-6 rounded-2xl border border-dashed border-gray-300 text-center text-sm text-gray-500">
          No revision items found.
        </div>
      `;
      return;
    }

    revisionList.innerHTML = filtered
      .map((item) => {
        const badge = getStatusBadge(item.state || item.status);

        return `
          <article class="p-5 rounded-2xl border border-gray-100 bg-white shadow-card">
            <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="text-base font-bold text-gray-900">
                    ${escapeHtml(item.title)}
                  </h3>

                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${badge.className}">
                    <span class="w-2 h-2 rounded-full" style="background-color: currentColor;"></span>
                    ${escapeHtml(badge.label)}
                  </span>
                </div>

                <div class="text-sm text-gray-600 mt-2">
                  <strong>Researcher:</strong> ${escapeHtml(item.researcher || "—")}
                  ${
                    item.college
                      ? `<span class="mx-1">•</span><strong>College:</strong> ${escapeHtml(item.college)}`
                      : ""
                  }
                </div>

                <div class="text-sm text-gray-600 mt-1">
                  <strong>Returned by / Stage:</strong> ${escapeHtml(item.stage || "—")}
                  <span class="mx-1">•</span>
                  <strong>Date:</strong> ${escapeHtml(formatDate(item.date))}
                </div>

                <div class="mt-4 p-4 rounded-xl bg-orange-50 border border-orange-200 text-sm text-orange-900 whitespace-pre-line">
                  ${escapeHtml(item.comment)}
                </div>
              </div>

              <div class="flex flex-wrap gap-2 shrink-0">
                <a
                  href="proposal_preview.html?id=${encodeURIComponent(item.proposal_id || "")}"
                  class="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 active:scale-95 transition"
                >
                  View
                </a>

                <a
                  href="submit_proposal_wizard.html?id=${encodeURIComponent(item.proposal_id || "")}&mode=revision"
                  class="px-3 py-2 rounded-xl bg-urds-900 text-white text-xs font-bold hover:bg-urds-800 active:scale-95 transition"
                >
                  Revise
                </a>

                <button
                  type="button"
                  class="markResolved px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 active:scale-95 transition"
                  data-id="${escapeAttr(item.id)}"
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join("");

    revisionList.querySelectorAll(".markResolved").forEach((button) => {
      button.addEventListener("click", () => markResolved(button.dataset.id));
    });
  }

  function markResolved(id) {
    const item = revisions.find((revision) => revision.id === id);

    if (!item) {
      toast("Revision item not found.", "error");
      return;
    }

    item.state = "accepted";
    item.status = "Revision Resolved";
    item.resolved_at = new Date().toISOString();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(revisions));

    toast("Revision marked as resolved.");
    renderRevisions();
  }

  function getStatusBadge(value) {
    const state = getRevisionState(value);

    if (state === "accepted") {
      return {
        label: "Accepted / Resolved",
        className: "bg-green-100 text-green-700"
      };
    }

    if (state === "resubmitted") {
      return {
        label: "Resubmitted / Under Review",
        className: "bg-blue-100 text-blue-700"
      };
    }

    return {
      label: "Returned / Needs Revision",
      className: "bg-orange-100 text-orange-700"
    };
  }

  function getRevisionState(status) {
    const text = normalizeText(status);

    if (
      text.includes("accepted") ||
      text.includes("resolved") ||
      text.includes("approved") ||
      text.includes("cleared")
    ) {
      return "accepted";
    }

    if (
      text.includes("resubmitted") ||
      text.includes("under review") ||
      text.includes("for review") ||
      text.includes("review")
    ) {
      return "resubmitted";
    }

    return "returned";
  }

  function getRevisionStage(status) {
    const text = normalizeText(status);

    if (text.includes("crc")) return "College Research Coordinator";
    if (text.includes("dean")) return "Dean";
    if (text.includes("twg")) return "TWG";
    if (text.includes("urec")) return "UREC";
    if (text.includes("director")) return "URDS Director";
    if (text.includes("staff")) return "URDS Staff";

    return "Review Committee";
  }

  function getHistoryItems(proposal) {
    const fields = [
      proposal.history,
      proposal.reviewHistory,
      proposal.review_history,
      proposal.screeningHistory,
      proposal.screening_history,
      proposal.logs
    ];

    const output = [];

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

  function getProposalId(proposal) {
    return (
      proposal.id ||
      proposal.proposal_id ||
      proposal.proposalId ||
      proposal.research_id ||
      ""
    );
  }

  function getTitle(proposal) {
    return (
      proposal.title ||
      proposal.program_title ||
      proposal.proposal_title ||
      proposal.research_title ||
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
      "Unknown Researcher"
    );
  }

  function getStatus(proposal) {
    return (
      proposal.status ||
      proposal.proposal_status ||
      proposal.current_status ||
      proposal.currentStatus ||
      "Returned for Revision"
    );
  }

  function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replaceAll('"', "&quot;");
  }

  function toast(message, type = "success") {
    if (!toastContainer) {
      alert(message);
      return;
    }

    const el = document.createElement("div");

    el.className =
      type === "error"
        ? "bg-red-600 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-semibold"
        : "bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-semibold";

    el.textContent = message;
    toastContainer.appendChild(el);

    setTimeout(() => el.remove(), 3000);
  }
});