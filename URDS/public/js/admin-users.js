// admin-users.js
(() => {
  "use strict";

  const API = {
    users: "../../backend/get_users.php",
    colleges: "../../backend/get_colleges.php",
    saveUser: "../../backend/save_user.php"
  };

  let usersCache = [];
  let collegesCache = [];
  let editingUserId = null;

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

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function showToast(message, type = "success") {
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

  async function fetchJson(url, fallback = {}) {
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

      return await response.json();
    } catch (error) {
      console.error(`Error loading ${url}:`, error);
      return fallback;
    }
  }

  async function loadUsers() {
    const result = await fetchJson(API.users, {
      status: "error",
      users: []
    });

    usersCache =
      result.status === "success" && Array.isArray(result.users)
        ? result.users
        : [];

    return usersCache;
  }

  async function loadColleges() {
    const result = await fetchJson(API.colleges, {
      status: "error",
      colleges: []
    });

    collegesCache =
      result.status === "success" && Array.isArray(result.colleges)
        ? result.colleges
        : [];

    return collegesCache;
  }

  async function saveUser(action, data) {
    try {
      const response = await fetch(API.saveUser, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          action,
          ...data
        })
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error saving user:", error);

      return {
        status: "error",
        message: "Unable to connect to the server."
      };
    }
  }

  function getUserFullName(user) {
    const fullName =
      user.full_name ||
      user.name ||
      `${user.first_name || ""} ${user.last_name || ""}`.trim();

    return fullName || "Unnamed User";
  }

  function getUserCollege(user) {
    return user.college_name || user.college || "-";
  }

  function getUserDepartment(user) {
    return user.department_name || user.department || "-";
  }

  function getUserId(user) {
    return user.user_id || user.id;
  }

  function splitFullName(fullName) {
    const parts = String(fullName || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    return {
      first_name: parts[0] || "",
      last_name: parts.slice(1).join(" ") || ""
    };
  }

  function getFilteredUsers() {
    const searchInput = qs("userSearch");
    const roleFilter = qs("roleFilter");

    const query = normalizeText(searchInput?.value || "");
    const selectedRole = roleFilter?.value || "";

    return usersCache.filter((user) => {
      const role = user.role || "";

      if (selectedRole && role !== selectedRole) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableText = normalizeText(
        [
          getUserFullName(user),
          user.username,
          user.email,
          user.role,
          getUserCollege(user),
          getUserDepartment(user)
        ].join(" ")
      );

      return searchableText.includes(query);
    });
  }

  function roleBadgeHtml(role) {
    const roleText = role || "No Role";

    const badgeClass = roleText.toLowerCase().includes("admin")
      ? "bg-red-50 text-red-700"
      : roleText.toLowerCase().includes("director")
      ? "bg-purple-50 text-purple-700"
      : roleText.toLowerCase().includes("dean")
      ? "bg-blue-50 text-blue-700"
      : roleText.toLowerCase().includes("evaluator")
      ? "bg-orange-50 text-orange-700"
      : "bg-emerald-50 text-emerald-700";

    return `
      <span class="inline-flex w-fit items-center px-3 py-1 rounded-full text-xs font-bold ${badgeClass}">
        ${escapeHtml(roleText)}
      </span>
    `;
  }

  function createUserRow(user) {
    const id = getUserId(user);
    const fullName = getUserFullName(user);
    const username = user.username || "-";
    const email = user.email || "-";

    return `
      <tr class="hover:bg-gray-50 transition">
        <td class="px-5 py-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-urds-accent text-white flex items-center justify-center font-bold shrink-0">
              ${escapeHtml(fullName.charAt(0).toUpperCase() || "U")}
            </div>

            <div class="min-w-0">
              <div class="font-semibold text-gray-900 truncate">
                ${escapeHtml(fullName)}
              </div>

              <div class="text-xs text-gray-500 truncate">
                ${escapeHtml(username)}
              </div>

              <div class="text-xs text-gray-400 truncate">
                ${escapeHtml(email)}
              </div>
            </div>
          </div>
        </td>

        <td class="px-5 py-4">
          ${roleBadgeHtml(user.role)}
        </td>

        <td class="px-5 py-4 text-sm text-gray-700">
          ${escapeHtml(getUserCollege(user))}
        </td>

        <td class="px-5 py-4 text-sm text-gray-700">
          ${escapeHtml(getUserDepartment(user))}
        </td>

        <td class="px-5 py-4">
          <div class="flex items-center justify-center gap-2">
            <button
              type="button"
              class="editUser px-3 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition"
              data-id="${escapeHtml(id)}"
            >
              Edit
            </button>

            <button
              type="button"
              class="deleteUser px-3 py-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold transition"
              data-id="${escapeHtml(id)}"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  function renderUsers() {
    const table = qs("userTable");
    const emptyUsers = qs("emptyUsers");
    const userResultCount = qs("userResultCount");
    const totalUsersCount = qs("totalUsersCount");

    if (!table) return;

    const filteredUsers = getFilteredUsers();

    if (totalUsersCount) {
      totalUsersCount.textContent = usersCache.length.toLocaleString();
    }

    if (userResultCount) {
      userResultCount.textContent = `${filteredUsers.length.toLocaleString()} of ${usersCache.length.toLocaleString()} users shown`;
    }

    if (!filteredUsers.length) {
      table.innerHTML = "";

      if (emptyUsers) {
        emptyUsers.classList.remove("hidden");
      } else {
        table.innerHTML = `
          <tr>
            <td colspan="5" class="px-5 py-8 text-center text-sm text-gray-500">
              No users found.
            </td>
          </tr>
        `;
      }

      return;
    }

    if (emptyUsers) {
      emptyUsers.classList.add("hidden");
    }

    table.innerHTML = filteredUsers.map(createUserRow).join("");
  }

  function ensureAccountFields() {
    const userName = qs("userName");

    if (!userName || qs("userUsername")) return;

    userName.parentElement.insertAdjacentHTML(
      "afterend",
      `
        <div>
          <label for="userUsername" class="block text-sm font-semibold text-gray-700">
            Username
          </label>

          <input
            id="userUsername"
            type="text"
            class="form-input mt-1"
            placeholder="Enter username"
          />
        </div>

        <div>
          <label for="userEmail" class="block text-sm font-semibold text-gray-700">
            Email
          </label>

          <input
            id="userEmail"
            type="email"
            class="form-input mt-1"
            placeholder="Enter email address"
          />
        </div>
      `
    );
  }

  function collegeOptionsHtml(selectedValue = "") {
    return `
      <option value="">-- None --</option>
      ${collegesCache
        .map((college) => {
          const id = college.college_id || college.id;
          const name = college.college_name || college.name || "Unnamed College";
          const selected = String(id) === String(selectedValue) ? "selected" : "";

          return `
            <option value="${escapeHtml(id)}" ${selected}>
              ${escapeHtml(name)}
            </option>
          `;
        })
        .join("")}
    `;
  }

  function departmentOptionsHtml(collegeId, selectedValue = "") {
    const selectedCollege = collegesCache.find((college) => {
      const id = college.college_id || college.id;
      return String(id) === String(collegeId);
    });

    const departments = Array.isArray(selectedCollege?.departments)
      ? selectedCollege.departments
      : [];

    return `
      <option value="">-- None --</option>
      ${departments
        .map((department) => {
          const id = department.department_id || department.id;
          const name =
            department.department_name ||
            department.name ||
            department.department ||
            "Unnamed Department";

          const selected = String(id) === String(selectedValue) ? "selected" : "";

          return `
            <option value="${escapeHtml(id)}" ${selected}>
              ${escapeHtml(name)}
            </option>
          `;
        })
        .join("")}
    `;
  }

  function replaceCollegeInput(selectedValue = "") {
    const current = qs("userCollege");
    if (!current) return;

    const wrapper = current.parentElement;

    wrapper.innerHTML = `
      <label for="userCollege" class="block text-sm font-semibold text-gray-700">
        College
      </label>

      <select id="userCollege" class="form-input mt-1">
        ${collegeOptionsHtml(selectedValue)}
      </select>
    `;
  }

  function replaceDepartmentInput(collegeId = "", selectedValue = "") {
    const current = qs("userDepartment");
    if (!current) return;

    const wrapper = current.parentElement;

    wrapper.innerHTML = `
      <label for="userDepartment" class="block text-sm font-semibold text-gray-700">
        Department
      </label>

      <select id="userDepartment" class="form-input mt-1">
        ${departmentOptionsHtml(collegeId, selectedValue)}
      </select>
    `;
  }

  function openModal() {
    const modal = qs("userModal");

    if (!modal) return;

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.classList.add("overflow-hidden");

    setTimeout(() => {
      qs("userName")?.focus();
    }, 50);
  }

  function closeModal() {
    const modal = qs("userModal");

    if (!modal) return;

    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.body.classList.remove("overflow-hidden");
    editingUserId = null;
  }

  async function openAddUserModal() {
    editingUserId = null;

    ensureAccountFields();

    if (!collegesCache.length) {
      await loadColleges();
    }

    qs("modalTitle").textContent = "Add User";
    qs("userName").value = "";
    qs("userRole").value = "Faculty Researcher";
    qs("userPassword").value = "";
    qs("userPassword").placeholder = "Enter password";
    qs("userUsername").value = "";
    qs("userEmail").value = "";

    replaceCollegeInput("");
    replaceDepartmentInput("", "");

    openModal();
  }

  async function openEditUserModal(userId) {
    const user = usersCache.find((item) => String(getUserId(item)) === String(userId));

    if (!user) {
      showToast("User not found.", "error");
      return;
    }

    editingUserId = userId;

    ensureAccountFields();

    if (!collegesCache.length) {
      await loadColleges();
    }

    qs("modalTitle").textContent = "Edit User";
    qs("userName").value = getUserFullName(user);
    qs("userRole").value = user.role || "Faculty Researcher";
    qs("userPassword").value = "";
    qs("userPassword").placeholder = "Leave blank to keep current password";
    qs("userUsername").value = user.username || "";
    qs("userEmail").value = user.email || "";

    replaceCollegeInput(user.college_id || "");
    replaceDepartmentInput(user.college_id || "", user.department_id || "");

    openModal();
  }

  function getFormData() {
    const fullName = qs("userName")?.value.trim() || "";
    const username = qs("userUsername")?.value.trim() || "";
    const email = qs("userEmail")?.value.trim() || "";
    const role = qs("userRole")?.value || "Faculty Researcher";
    const collegeId = qs("userCollege")?.value || null;
    const departmentId = qs("userDepartment")?.value || null;
    const password = qs("userPassword")?.value.trim() || "";

    const nameParts = splitFullName(fullName);

    return {
      fullName,
      username,
      email,
      role,
      college_id: collegeId,
      department_id: departmentId,
      password,
      first_name: nameParts.first_name,
      last_name: nameParts.last_name,
      campus: "MAIN"
    };
  }

  function validateUserForm(data) {
    if (!data.fullName) {
      return "Full name is required.";
    }

    if (!data.username) {
      return "Username is required.";
    }

    if (!data.email) {
      return "Email is required.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return "Please enter a valid email address.";
    }

    if (!editingUserId && !data.password) {
      return "Password is required when adding a new user.";
    }

    return "";
  }

  function setSaveButtonLoading(isLoading) {
    const button = qs("saveUserBtn");
    if (!button) return;

    if (isLoading) {
      button.dataset.originalText = button.textContent;
      button.textContent = "Saving...";
      button.disabled = true;
      button.classList.add("opacity-70", "cursor-not-allowed");
    } else {
      button.textContent = button.dataset.originalText || "Save User";
      button.disabled = false;
      button.classList.remove("opacity-70", "cursor-not-allowed");
    }
  }

  async function handleSaveUser() {
    const formData = getFormData();
    const error = validateUserForm(formData);

    if (error) {
      showToast(error, "error");
      return;
    }

    const action = editingUserId ? "edit" : "add";

    const payload = {
      username: formData.username,
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      role: formData.role,
      college_id: formData.college_id,
      department_id: formData.department_id,
      campus: formData.campus
    };

    if (editingUserId) {
      payload.user_id = editingUserId;
    }

    if (formData.password) {
      payload.password = formData.password;
    }

    setSaveButtonLoading(true);

    const result = await saveUser(action, payload);

    setSaveButtonLoading(false);

    if (result?.status === "success" || result?.success === true) {
      await loadUsers();
      renderUsers();
      closeModal();

      showToast(
        editingUserId ? "User updated successfully." : "User added successfully.",
        "success"
      );

      if (window.URDSLogs && typeof window.URDSLogs.add === "function") {
        window.URDSLogs.add({
          title: editingUserId ? "User account updated" : "New user account added",
          detail: `${formData.fullName} was ${editingUserId ? "updated" : "added"}.`,
          user: "Administrator",
          type: "User Accounts"
        });
      }

      return;
    }

    showToast(result?.message || "Error saving user.", "error");
  }

  async function handleDeleteUser(userId) {
    const user = usersCache.find((item) => String(getUserId(item)) === String(userId));
    const fullName = user ? getUserFullName(user) : "this user";

    const confirmed = confirm(`Delete ${fullName}? This action cannot be undone.`);

    if (!confirmed) return;

    const result = await saveUser("delete", {
      user_id: userId
    });

    if (result?.status === "success" || result?.success === true) {
      await loadUsers();
      renderUsers();

      showToast("User deleted successfully.", "success");

      if (window.URDSLogs && typeof window.URDSLogs.add === "function") {
        window.URDSLogs.add({
          title: "User account deleted",
          detail: `${fullName} was deleted.`,
          user: "Administrator",
          type: "User Accounts"
        });
      }

      return;
    }

    showToast(result?.message || "Error deleting user.", "error");
  }

  function clearFilters() {
    const searchInput = qs("userSearch");
    const roleFilter = qs("roleFilter");

    if (searchInput) searchInput.value = "";
    if (roleFilter) roleFilter.value = "";

    renderUsers();
  }

  function bindEvents() {
    qs("addUserBtn")?.addEventListener("click", openAddUserModal);
    qs("saveUserBtn")?.addEventListener("click", handleSaveUser);
    qs("closeModal")?.addEventListener("click", closeModal);
    qs("cancelUserBtn")?.addEventListener("click", closeModal);
    qs("clearUserFilters")?.addEventListener("click", clearFilters);

    qs("userSearch")?.addEventListener("input", renderUsers);
    qs("roleFilter")?.addEventListener("change", renderUsers);

    qs("userTable")?.addEventListener("click", (event) => {
      const editButton = event.target.closest(".editUser");
      const deleteButton = event.target.closest(".deleteUser");

      if (editButton) {
        openEditUserModal(editButton.dataset.id);
        return;
      }

      if (deleteButton) {
        handleDeleteUser(deleteButton.dataset.id);
      }
    });

    document.addEventListener("change", (event) => {
      if (event.target && event.target.id === "userCollege") {
        replaceDepartmentInput(event.target.value, "");
      }
    });

    qs("userModal")?.addEventListener("click", (event) => {
      if (event.target.id === "userModal") {
        closeModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      const modal = qs("userModal");

      if (
        event.key === "Escape" &&
        modal &&
        !modal.classList.contains("hidden")
      ) {
        closeModal();
      }
    });
  }

  async function init() {
    const table = qs("userTable");

    if (!table) return;

    table.innerHTML = `
      <tr>
        <td colspan="5" class="px-5 py-8 text-center text-sm text-gray-500">
          Loading users...
        </td>
      </tr>
    `;

    bindEvents();

    await Promise.all([loadUsers(), loadColleges()]);
    renderUsers();
  }

  document.addEventListener("DOMContentLoaded", init);
})();