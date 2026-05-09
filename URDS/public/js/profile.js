// profile.js
document.addEventListener("DOMContentLoaded", async () => {
  "use strict";

  const ENDPOINTS = {
    getProfile: "../../backend/get_profile.php",
    updateProfile: "../../backend/update_profile.php",
    logout: "../../backend/logout.php"
  };

  let userData = null;

  const qs = (id) => document.getElementById(id);
  const qsa = (selector) => document.querySelectorAll(selector);

  const elements = {
    modal: qs("editProfileModal"),
    profileForm: qs("profileForm"),

    editProfileBtn: qs("editProfileBtn"),
    editProfileBtnSecondary: qs("editProfileBtnSecondary"),
    cancelEdit: qs("cancelEdit"),
    closeEditModal: qs("closeEditModal"),

    logoutBtn: qs("logoutBtn"),
    logoutBtnSecondary: qs("logoutBtnSecondary"),

    editFirstName: qs("editFirstName"),
    editLastName: qs("editLastName"),
    editEmail: qs("editEmail"),
    editCampus: qs("editCampus"),

    displayCollege: qs("displayCollege"),
    displayDepartment: qs("displayDepartment"),

    evaluatorAccessSection: qs("evaluatorAccessSection"),
    toastContainer: qs("toastContainer")
  };

  await loadUserProfile();
  bindEvents();

  // =========================================================
  // Profile loading
  // =========================================================

  async function loadUserProfile() {
    try {
      const userId = getStoredUserId();

      if (!userId) {
        handleExpiredSession();
        return;
      }

      const url = `${ENDPOINTS.getProfile}?userId=${encodeURIComponent(userId)}`;

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json"
        }
      });

      const result = await safeJson(response);

      if (!response.ok) {
        throw new Error(result?.message || `HTTP error: ${response.status}`);
      }

      if (result.status === "success" && result.user) {
        userData = normalizeUser(result.user);
        persistUserLocally(userData);
        renderUserProfile();
        return;
      }

      throw new Error(result.message || "Unable to load profile.");
    } catch (error) {
      console.error("Error loading profile:", error);
      showToast(error.message || "Failed to load profile.", "error");
    }
  }

  function getStoredUserId() {
    const directId = localStorage.getItem("userId");

    if (directId) {
      return directId;
    }

    try {
      const activeUser = JSON.parse(localStorage.getItem("activeUser") || "{}");

      return (
        activeUser.userId ||
        activeUser.user_id ||
        activeUser.id ||
        ""
      );
    } catch (error) {
      return "";
    }
  }

  function normalizeUser(raw) {
    const firstName = raw.firstName || raw.first_name || "";
    const lastName = raw.lastName || raw.last_name || "";

    const fullName =
      raw.fullName ||
      raw.full_name ||
      `${firstName} ${lastName}`.trim() ||
      raw.name ||
      raw.username ||
      "User";

    return {
      id: raw.id || raw.userId || raw.user_id || getStoredUserId(),
      firstName,
      lastName,
      fullName,
      email: raw.email || "user@example.com",
      role: normalizeRole(raw.role || "Role"),
      college: raw.collegeName || raw.college_name || raw.college || "N/A",
      department: raw.departmentName || raw.department_name || raw.department || "N/A",
      campus: raw.campus || "N/A"
    };
  }

  function normalizeRole(role) {
    const value = String(role || "").toLowerCase().trim();

    if (value.includes("admin")) return "Administrator";
    if (value.includes("evaluator")) return "Evaluator";
    if (value.includes("coordinator") || value === "crc") return "College Research Coordinator";
    if (value.includes("dean")) return "College Dean";
    if (value.includes("director")) return "URDS Director";
    if (value.includes("staff")) return "URDS Staff";
    if (value.includes("twg") || value.includes("senior faculty")) return "Senior Faculty Researcher / TWG";
    if (value.includes("urec")) return "UREC";
    if (value.includes("faculty") || value.includes("researcher")) return "Faculty Researcher";

    return role || "Role";
  }

  function persistUserLocally(user) {
    if (!user) return;

    if (user.id) localStorage.setItem("userId", user.id);
    localStorage.setItem("userName", user.fullName);
    localStorage.setItem("userRole", user.role);
    localStorage.setItem("userEmail", user.email);

    localStorage.setItem(
      "activeUser",
      JSON.stringify({
        id: user.id,
        userId: user.id,
        fullName: user.fullName,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        college: user.college,
        department: user.department,
        campus: user.campus
      })
    );
  }

  // =========================================================
  // Rendering
  // =========================================================

  function renderUserProfile() {
    if (!userData) return;

    const initials = getInitials(userData.fullName);

    qsa(".user-name").forEach((el) => {
      el.textContent = userData.fullName;
    });

    qsa(".user-role").forEach((el) => {
      el.textContent = userData.role;
    });

    qsa(".user-email").forEach((el) => {
      el.textContent = userData.email;
    });

    qsa(".user-college").forEach((el) => {
      el.textContent = userData.college;
    });

    qsa(".user-department").forEach((el) => {
      el.textContent = userData.department;
    });

    qsa(".user-campus").forEach((el) => {
      el.textContent = userData.campus;
    });

    qsa(".user-initials").forEach((el) => {
      el.textContent = initials;
    });

    if (elements.editFirstName) {
      elements.editFirstName.value = userData.firstName || getFirstName(userData.fullName);
    }

    if (elements.editLastName) {
      elements.editLastName.value = userData.lastName || getLastName(userData.fullName);
    }

    if (elements.editEmail) {
      elements.editEmail.value = userData.email;
    }

    if (elements.editCampus) {
      elements.editCampus.value = userData.campus === "N/A" ? "" : userData.campus;
    }

    if (elements.displayCollege) {
      elements.displayCollege.textContent = userData.college;
    }

    if (elements.displayDepartment) {
      elements.displayDepartment.textContent = userData.department;
    }

    renderEvaluatorAccess();
  }

  function renderEvaluatorAccess() {
    const section = elements.evaluatorAccessSection;

    if (!section) return;

    const isEvaluator = userData?.role === "Evaluator";

    if (isEvaluator) {
      section.classList.remove("hidden");
    } else {
      section.classList.add("hidden");
    }
  }

  function getInitials(name) {
    const parts = String(name || "User")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);

    return parts.map((part) => part.charAt(0).toUpperCase()).join("") || "U";
  }

  function getFirstName(fullName) {
    return String(fullName || "").trim().split(/\s+/)[0] || "";
  }

  function getLastName(fullName) {
    const parts = String(fullName || "").trim().split(/\s+/);
    return parts.length > 1 ? parts.slice(1).join(" ") : "";
  }

  // =========================================================
  // Modal
  // =========================================================

  function openEditModal() {
    if (!elements.modal) return;

    elements.modal.classList.remove("hidden");
    elements.modal.classList.add("flex");
    elements.modal.setAttribute("aria-hidden", "false");
  }

  function closeEditModal() {
    if (!elements.modal) return;

    elements.modal.classList.add("hidden");
    elements.modal.classList.remove("flex");
    elements.modal.setAttribute("aria-hidden", "true");
  }

  // =========================================================
  // Update profile
  // =========================================================

  async function handleProfileSubmit(event) {
    event.preventDefault();

    const firstName = elements.editFirstName?.value.trim() || "";
    const lastName = elements.editLastName?.value.trim() || "";
    const email = elements.editEmail?.value.trim() || "";
    const campus = elements.editCampus?.value.trim() || "";

    if (!firstName || !lastName || !email) {
      showToast("First name, last name, and email are required.", "warning");
      return;
    }

    try {
      setFormLoading(true);

      const response = await fetch(ENDPOINTS.updateProfile, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          campus
        })
      });

      const result = await safeJson(response);

      if (!response.ok) {
        throw new Error(result?.message || `HTTP error: ${response.status}`);
      }

      if (result.status !== "success") {
        throw new Error(result.message || "Unable to update profile.");
      }

      showToast("Profile updated successfully.");
      closeEditModal();

      await loadUserProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast(error.message || "Failed to update profile.", "error");
    } finally {
      setFormLoading(false);
    }
  }

  function setFormLoading(isLoading) {
    const submitBtn = elements.profileForm?.querySelector('button[type="submit"]');

    if (!submitBtn) return;

    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? "Saving..." : "Save Changes";
    submitBtn.classList.toggle("opacity-70", isLoading);
    submitBtn.classList.toggle("cursor-not-allowed", isLoading);
  }

  // =========================================================
  // Logout
  // =========================================================

  async function logout() {
    const confirmed = confirm("Are you sure you want to logout?");

    if (!confirmed) return;

    try {
      const response = await fetch(ENDPOINTS.logout, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json"
        }
      });

      const result = await safeJson(response);

      if (response.ok && result.status === "success") {
        clearSessionAndRedirect();
        return;
      }

      throw new Error(result.message || "Logout failed.");
    } catch (error) {
      console.warn("Logout request failed. Clearing local session anyway.", error);
      clearSessionAndRedirect();
    }
  }

  function clearSessionAndRedirect() {
    localStorage.removeItem("activeUser");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");

    window.location.href = "login.html";
  }

  function handleExpiredSession() {
    showToast("Session expired. Please log in again.", "warning");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 900);
  }

  // =========================================================
  // Utilities
  // =========================================================

  async function safeJson(response) {
    const text = await response.text();

    if (!text) return {};

    try {
      return JSON.parse(text);
    } catch (error) {
      console.error("Invalid JSON response:", text.slice(0, 500));
      throw new Error("Server returned an invalid JSON response.");
    }
  }

  function showToast(message, type = "success") {
    const container = elements.toastContainer || createToastContainer();
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
    }, 2400);
  }

  function createToastContainer() {
    let container = qs("toastContainer");

    if (container) return container;

    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "fixed bottom-6 right-6 space-y-2 z-50";
    document.body.appendChild(container);

    return container;
  }

  // =========================================================
  // Events
  // =========================================================

  function bindEvents() {
    elements.editProfileBtn?.addEventListener("click", openEditModal);
    elements.editProfileBtnSecondary?.addEventListener("click", openEditModal);

    elements.cancelEdit?.addEventListener("click", closeEditModal);
    elements.closeEditModal?.addEventListener("click", closeEditModal);

    elements.profileForm?.addEventListener("submit", handleProfileSubmit);

    elements.logoutBtn?.addEventListener("click", logout);
    elements.logoutBtnSecondary?.addEventListener("click", logout);

    elements.modal?.addEventListener("click", (event) => {
      if (event.target === elements.modal) {
        closeEditModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeEditModal();
      }
    });
  }
});