// agency_in_house_evaluation_newproposals_form.js
document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const params = new URLSearchParams(window.location.search);

  const proposalId =
    params.get("id") ||
    localStorage.getItem("viewProposalId") ||
    createId();

  localStorage.setItem("viewProposalId", proposalId);

  const STORAGE_KEYS = [
    "agency_in_house_review_draft_" + proposalId,
    "agencyReviewDraft:" + proposalId,
    "fm011_agency_review_draft_" + proposalId
  ];

  const PRINT_PAGE = "agency_in_house_evaluation_newproposals_print.html";

  const ratingFields = [
    "track_record_point",
    "research_relevance_point",
    "innovativeness_point",
    "methodology_point",
    "environmental_impact_point",
    "socio_economic_impact_point"
  ];

  init();

  function init() {
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

  function getFormData() {
    const form = qs("reviewForm");
    const formData = new FormData(form);
    const data = {};

    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    data.proposal_id = proposalId;
    data.total_point = qs("total_point")?.value || "";
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

    const totalField = qs("total_point");

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
});