// admin-settings.js
(() => {
  "use strict";

  const STORAGE_KEY = "siteSettings";

  const API = {
    get: "../../backend/get_settings.php",
    save: "../../backend/save_settings.php"
  };

  const DEFAULT_SETTINGS = {
    academicYear: "",
    semester: "1st Semester",
    announcementDuration: "7 Days",
    announcementAllowComments: false,
    maintenanceMode: false,
    autoArchive: false
  };

  let currentSettings = { ...DEFAULT_SETTINGS };
  let serverAvailable = true;

  function qs(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function showToast(message, type = "success", timeout = 2500) {
    const toastContainer = qs("toastContainer");

    const toast = document.createElement("div");

    const colorClass =
      type === "error"
        ? "bg-red-600"
        : type === "warning"
        ? "bg-amber-600"
        : "bg-emerald-600";

    toast.className = `${colorClass} text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold translate-y-2 opacity-0 transition`;
    toast.textContent = message;

    if (toastContainer) {
      toastContainer.appendChild(toast);
    } else {
      toast.className += " fixed bottom-6 right-6 z-50";
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
    }, timeout);
  }

  function setStatus(message, type = "info") {
    const statusBox = qs("settingsStatus");
    if (!statusBox) return;

    const styleMap = {
      success: "bg-emerald-50 border-emerald-200 text-emerald-800",
      error: "bg-red-50 border-red-200 text-red-800",
      warning: "bg-amber-50 border-amber-200 text-amber-800",
      info: "bg-blue-50 border-blue-200 text-blue-800"
    };

    statusBox.className = `rounded-2xl border px-5 py-4 text-sm font-medium ${
      styleMap[type] || styleMap.info
    }`;

    statusBox.innerHTML = escapeHtml(message);
    statusBox.classList.remove("hidden");
  }

  function hideStatus() {
    const statusBox = qs("settingsStatus");
    if (statusBox) {
      statusBox.classList.add("hidden");
    }
  }

  function loadLocalSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};

      return {
        ...DEFAULT_SETTINGS,
        ...parsed
      };
    } catch (error) {
      console.error("Failed to load local settings:", error);
      return { ...DEFAULT_SETTINGS };
    }
  }

  function saveLocalSettings(settings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  async function getServerSettings() {
    try {
      const response = await fetch(API.get, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === "success" && result.settings) {
        return {
          ...DEFAULT_SETTINGS,
          ...result.settings
        };
      }

      throw new Error(result.message || "Invalid server response");
    } catch (error) {
      console.warn("Server settings unavailable. Using localStorage fallback.", error);
      return null;
    }
  }

  async function saveServerSettings(settings) {
    try {
      const response = await fetch(API.save, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          settings
        })
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const result = await response.json();

      return result.status === "success" || result.success === true;
    } catch (error) {
      console.warn("Unable to save to server. Saving locally instead.", error);
      return false;
    }
  }

  function getFormSettings() {
    return {
      ...currentSettings,
      academicYear: qs("academicYearInput")?.value.trim() || "",
      semester: qs("semesterSelect")?.value || "1st Semester",
      announcementDuration: qs("announcementDuration")?.value || "7 Days",
      announcementAllowComments: !!qs("announcementAllowComments")?.checked,
      maintenanceMode: !!qs("maintenanceMode")?.checked,
      autoArchive: !!qs("autoArchive")?.checked
    };
  }

  function populateForm(settings) {
    const academicYearInput = qs("academicYearInput");
    const semesterSelect = qs("semesterSelect");
    const announcementDuration = qs("announcementDuration");
    const announcementAllowComments = qs("announcementAllowComments");
    const maintenanceMode = qs("maintenanceMode");
    const autoArchive = qs("autoArchive");

    if (academicYearInput) {
      academicYearInput.value = settings.academicYear || "";
    }

    if (semesterSelect) {
      semesterSelect.value = settings.semester || "1st Semester";
    }

    if (announcementDuration) {
      announcementDuration.value = settings.announcementDuration || "7 Days";
    }

    if (announcementAllowComments) {
      announcementAllowComments.checked = !!settings.announcementAllowComments;
    }

    if (maintenanceMode) {
      maintenanceMode.checked = !!settings.maintenanceMode;
    }

    if (autoArchive) {
      autoArchive.checked = !!settings.autoArchive;
    }

    updateHeroLabels(settings);
  }

  function updateHeroLabels(settings = currentSettings) {
    const academicYearLabel = qs("currentAcademicYearLabel");
    const semesterLabel = qs("currentSemesterLabel");

    if (academicYearLabel) {
      academicYearLabel.textContent = settings.academicYear || "Not Set";
    }

    if (semesterLabel) {
      semesterLabel.textContent = settings.semester || "Not Set";
    }
  }

  function validateAcademicYear(value) {
    const academicYear = String(value || "").trim();

    if (!academicYear) {
      return "Please enter the current academic year.";
    }

    const normalized = academicYear.replace(/[–—]/g, "-");

    if (!/^\d{4}\s*-\s*\d{4}$/.test(normalized)) {
      return "Use this format for academic year: 2024-2025.";
    }

    const [startYear, endYear] = normalized
      .split("-")
      .map((year) => Number(year.trim()));

    if (endYear !== startYear + 1) {
      return "The academic year should be consecutive, like 2024-2025.";
    }

    return "";
  }

  function setButtonLoading(button, isLoading, loadingText = "Saving...") {
    if (!button) return;

    if (isLoading) {
      button.dataset.originalText = button.textContent;
      button.textContent = loadingText;
      button.disabled = true;
      button.classList.add("opacity-70", "cursor-not-allowed");
    } else {
      button.textContent = button.dataset.originalText || button.textContent;
      button.disabled = false;
      button.classList.remove("opacity-70", "cursor-not-allowed");
    }
  }

  async function persistSettings(nextSettings, successMessage, logTitle) {
    currentSettings = {
      ...DEFAULT_SETTINGS,
      ...currentSettings,
      ...nextSettings
    };

    let savedToServer = false;

    if (serverAvailable) {
      savedToServer = await saveServerSettings(currentSettings);
    }

    if (!savedToServer) {
      serverAvailable = false;
      saveLocalSettings(currentSettings);
      setStatus(
        "Settings were saved locally because the server settings endpoint is unavailable.",
        "warning"
      );
    } else {
      saveLocalSettings(currentSettings);
      setStatus("Settings saved successfully.", "success");
    }

    updateHeroLabels(currentSettings);
    showToast(successMessage, "success");

    if (window.URDSLogs && typeof window.URDSLogs.add === "function") {
      window.URDSLogs.add({
        title: logTitle,
        detail: successMessage,
        user: "Administrator",
        type: "System Changes"
      });
    }
  }

  async function saveAcademicYear() {
    const button = qs("saveAcademicYearBtn");
    const academicYear = qs("academicYearInput")?.value.trim() || "";
    const error = validateAcademicYear(academicYear);

    if (error) {
      showToast(error, "error");
      setStatus(error, "error");
      return;
    }

    setButtonLoading(button, true);

    await persistSettings(
      {
        academicYear,
        semester: qs("semesterSelect")?.value || "1st Semester"
      },
      "Academic year saved.",
      "Academic year settings updated"
    );

    setButtonLoading(button, false);
  }

  async function saveAnnouncementSettings() {
    const button = qs("updateAnnouncementSettingsBtn");

    setButtonLoading(button, true);

    await persistSettings(
      {
        announcementDuration: qs("announcementDuration")?.value || "7 Days",
        announcementAllowComments: !!qs("announcementAllowComments")?.checked
      },
      "Announcement settings updated.",
      "Announcement settings updated"
    );

    setButtonLoading(button, false);
  }

  async function saveSystemSettings() {
    const button = qs("saveSystemSettingsBtn");

    setButtonLoading(button, true);

    await persistSettings(
      {
        maintenanceMode: !!qs("maintenanceMode")?.checked,
        autoArchive: !!qs("autoArchive")?.checked
      },
      "System settings saved.",
      "System preferences updated"
    );

    setButtonLoading(button, false);
  }

  function bindEvents() {
    const saveAcademicYearBtn = qs("saveAcademicYearBtn");
    const updateAnnouncementSettingsBtn = qs("updateAnnouncementSettingsBtn");
    const saveSystemSettingsBtn = qs("saveSystemSettingsBtn");

    const academicYearInput = qs("academicYearInput");
    const semesterSelect = qs("semesterSelect");

    if (saveAcademicYearBtn) {
      saveAcademicYearBtn.addEventListener("click", saveAcademicYear);
    }

    if (updateAnnouncementSettingsBtn) {
      updateAnnouncementSettingsBtn.addEventListener("click", saveAnnouncementSettings);
    }

    if (saveSystemSettingsBtn) {
      saveSystemSettingsBtn.addEventListener("click", saveSystemSettings);
    }

    if (academicYearInput) {
      academicYearInput.addEventListener("input", () => {
        hideStatus();
        updateHeroLabels(getFormSettings());
      });
    }

    if (semesterSelect) {
      semesterSelect.addEventListener("change", () => {
        hideStatus();
        updateHeroLabels(getFormSettings());
      });
    }
  }

  async function init() {
    const academicYearInput = qs("academicYearInput");

    if (!academicYearInput) {
      return;
    }

    setStatus("Loading settings...", "info");

    const serverSettings = await getServerSettings();

    if (serverSettings) {
      currentSettings = {
        ...DEFAULT_SETTINGS,
        ...loadLocalSettings(),
        ...serverSettings
      };

      serverAvailable = true;
      saveLocalSettings(currentSettings);
      hideStatus();
    } else {
      currentSettings = {
        ...DEFAULT_SETTINGS,
        ...loadLocalSettings()
      };

      serverAvailable = false;
      setStatus(
        "Server settings could not be loaded. Local saved settings are being used.",
        "warning"
      );
    }

    populateForm(currentSettings);
    bindEvents();
  }

  document.addEventListener("DOMContentLoaded", init);

  window.URDSSettings = {
    get() {
      return { ...currentSettings };
    },

    save(settings) {
      currentSettings = {
        ...DEFAULT_SETTINGS,
        ...currentSettings,
        ...settings
      };

      saveLocalSettings(currentSettings);
      populateForm(currentSettings);

      return { ...currentSettings };
    },

    reset() {
      currentSettings = { ...DEFAULT_SETTINGS };
      saveLocalSettings(currentSettings);
      populateForm(currentSettings);

      return { ...currentSettings };
    }
  };
})();