// agency_in_house_completed_social_sciences_form.js
document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const params = new URLSearchParams(window.location.search);

  const proposalId =
    params.get("id") ||
    localStorage.getItem("viewProposalId") ||
    createId();

  localStorage.setItem("viewProposalId", proposalId);

  const STORAGE_KEYS = [
    "completed_social_sciences_review_draft_" + proposalId,
    "agencyCompletedSocialReviewDraft:" + proposalId,
    "fm015_completed_social_sciences_draft_" + proposalId
  ];

  const PRINT_PAGE = "agency_in_house_completed_social_sciences_print.html";

  const technologyRows = [
    {
      letter: "a.",
      label: "Policy Recommendations",
      prefix: "policy_recommendations"
    },
    {
      letter: "b.",
      label: "Potential Technology (PT)",
      prefix: "pt"
    },
    {
      letter: "c.",
      label: "Technology for Adaptation (TA)",
      prefix: "ta"
    },
    {
      letter: "d.",
      label: "Technology for Verification (TV)",
      prefix: "tv"
    },
    {
      letter: "e.",
      label: "Technology for Piloting (TP)",
      prefix: "tp"
    },
    {
      letter: "f.",
      label: "Technology for Dissemination (TD)",
      prefix: "td"
    },
    {
      letter: "g.",
      label: "Information for Dissemination (ID)",
      prefix: "id"
    },
    {
      letter: "h.",
      label: "Technology for Protection",
      prefix: "protection"
    },
    {
      letter: "i.",
      label: "Technology/Info for Publication in referred journal",
      prefix: "publication"
    }
  ];

  const ratingFields = [
    "relevance_rating",
    "new_technology_rating",
    "methodology_rating",
    "potential_impacts_rating",
    "written_presentation_rating",
    "oral_presentation_rating"
  ];

  init();

  function init() {
    renderTechnologyRows();
    loadDraftToForm();
    bindEvents();
    calculateTotal();
  }

  function createId() {
    return "proposal_" + Date.now();
  }

  function qs(id) {
    return document.getElementById(id);
  }

  function showToast(message, type = "success") {
    const container = qs("toastContainer") || createToastContainer();
    const toast = document.createElement("div");

    const colorClass =
      type === "error"
        ? "bg-red-600"
        : type === "warning"
        ? "bg-amber-600"
        : "bg-emerald-600";

    toast.className =
      `${colorClass} text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold ` +
      "translate-y-2 opacity-0 transition";

    toast.textContent = message;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove("translate-y-2", "opacity-0");
    });

    setTimeout(() => {
      toast.classList.add("translate-y-2", "opacity-0");

      setTimeout(() => {
        toast.remove();
      }, 200);
    }, 2300);
  }

  function createToastContainer() {
    const container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "fixed bottom-6 right-6 space-y-2 z-50";
    document.body.appendChild(container);
    return container;
  }

  function renderTechnologyRows() {
    const tbody = qs("technologyRows");
    if (!tbody) return;

    tbody.innerHTML = technologyRows
      .map((row) => {
        return `
          <tr>
            <td class="px-4 py-3 border-b align-top">
              <span class="font-semibold">${escapeHtml(row.letter)}</span>
              ${escapeHtml(row.label)}
            </td>

            <td class="px-4 py-3 border-b">
              <input
                id="${row.prefix}_name"
                name="${row.prefix}_name"
                type="text"
                class="form-input"
              />
            </td>

            <td class="px-4 py-3 border-b">
              <input
                id="${row.prefix}_reported"
                name="${row.prefix}_reported"
                type="text"
                class="form-input text-center"
              />
            </td>

            <td class="px-4 py-3 border-b">
              <input
                id="${row.prefix}_evaluated"
                name="${row.prefix}_evaluated"
                type="text"
                class="form-input text-center"
              />
            </td>
          </tr>
        `;
      })
      .join("");
  }

  function getFormData() {
    const form = qs("reviewForm");
    const formData = new FormData(form);
    const data = {};

    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    data.proposal_id = proposalId;

    data.recommend_presentation = qs("recommend_presentation")?.checked || false;
    data.presentation_as_paper = qs("presentation_as_paper")?.checked || false;
    data.presentation_as_poster = qs("presentation_as_poster")?.checked || false;
    data.recommend_terminal_report = qs("recommend_terminal_report")?.checked || false;

    data.paper_line = data.presentation_as_paper ? "✓" : "";
    data.poster_line = data.presentation_as_poster ? "✓" : "";

    data.total_rating = qs("total_rating")?.value || "";
    data.updated_at = new Date().toISOString();

    return data;
  }

  function saveDraft() {
    const data = getFormData();

    STORAGE_KEYS.forEach((key) => {
      localStorage.setItem(key, JSON.stringify(data));
    });

    showToast("Draft saved successfully.");
    return data;
  }

  function loadDraft() {
    for (const key of STORAGE_KEYS) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;

        return JSON.parse(raw);
      } catch (error) {
        console.warn("Unable to load draft:", key, error);
      }
    }

    return null;
  }

  function loadDraftToForm() {
    const data = loadDraft();
    if (!data) return;

    Object.keys(data).forEach((key) => {
      const field = qs(key);

      if (!field) return;

      if (field.type === "checkbox") {
        field.checked = !!data[key];
      } else {
        field.value = data[key] ?? "";
      }
    });
  }

  function calculateTotal() {
    let total = 0;

    ratingFields.forEach((id) => {
      const field = qs(id);
      const value = Number(field?.value || 0);

      if (Number.isFinite(value)) {
        total += value;
      }
    });

    const totalField = qs("total_rating");

    if (totalField) {
      totalField.value = total || "";
    }
  }

  function clearForm() {
    const confirmed = confirm("Clear all entries in this form?");
    if (!confirmed) return;

    qs("reviewForm")?.reset();
    calculateTotal();

    STORAGE_KEYS.forEach((key) => {
      localStorage.removeItem(key);
    });

    showToast("Form cleared.", "warning");
  }

  function previewPrint() {
    saveDraft();

    window.location.href =
      PRINT_PAGE + "?id=" + encodeURIComponent(proposalId);
  }

  function goBack() {
    const returnTo = params.get("returnTo");

    if (returnTo) {
      window.location.href = returnTo;
      return;
    }

    const role = String(localStorage.getItem("userRole") || "").toLowerCase();

    if (role.includes("evaluator")) {
      window.location.href = "evaluator-assigned.html";
      return;
    }

    if (role.includes("admin")) {
      window.location.href = "dashboard.html";
      return;
    }

    window.location.href = "dashboard.html";
  }

  function bindEvents() {
    qs("backBtn")?.addEventListener("click", goBack);

    qs("saveDraftBtn")?.addEventListener("click", saveDraft);
    qs("saveDraftBtnBottom")?.addEventListener("click", saveDraft);

    qs("previewBtn")?.addEventListener("click", previewPrint);
    qs("previewBtnBottom")?.addEventListener("click", previewPrint);

    qs("clearBtn")?.addEventListener("click", clearForm);

    ratingFields.forEach((id) => {
      qs(id)?.addEventListener("input", calculateTotal);
    });

    qs("reviewForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      previewPrint();
    });
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});