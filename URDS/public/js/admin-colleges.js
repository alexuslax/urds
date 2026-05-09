(function () {
  "use strict";

  const STORAGE_KEY = "urds_colleges";

  const collegeContainer = document.getElementById("collegeContainer");
  const collegeFormWrap = document.getElementById("collegeFormWrap");
  const collegeForm = document.getElementById("collegeForm");
  const addCollegeBtn = document.getElementById("addCollege");
  const cancelCollegeBtn = document.getElementById("cancelCollege");
  const cancelCollegeBottomBtn = document.getElementById("cancelCollegeBottom");
  const deleteCollegeBtn = document.getElementById("deleteCollege");
  const modalTitle = document.getElementById("modalTitle");
  const collegeSearch = document.getElementById("collegeSearch");
  const sortColleges = document.getElementById("sortColleges");
  const collegeCount = document.getElementById("collegeCount");
  const toastContainer = document.getElementById("toastContainer");

  let colleges = loadColleges();
  let editingCollegeId = null;

  function loadColleges() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load colleges:", error);
      return [];
    }
  }

  function saveColleges() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(colleges));
  }

  function createId() {
    if (window.crypto && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    return "college-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  }

  function escapeHTML(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getInitials(name) {
    return String(name || "College")
      .split(" ")
      .filter(Boolean)
      .slice(0, 3)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }

  function parseDepartments(value) {
    return String(value || "")
      .split(/,|\n|;/)
      .map((department) => department.trim())
      .filter(Boolean);
  }

  function normalizeCollege(college) {
    return {
      id: college.id || createId(),
      name: college.name || "",
      college_code: String(college.college_code || "").toUpperCase(),
      dean_name: college.dean_name || "",
      college_logo: college.college_logo || "",
      departments: Array.isArray(college.departments)
        ? college.departments
        : parseDepartments(college.departments)
    };
  }

  function getFilteredColleges() {
    const keyword = collegeSearch.value.trim().toLowerCase();
    const sortValue = sortColleges.value;

    let filtered = colleges.map(normalizeCollege);

    if (keyword) {
      filtered = filtered.filter((college) => {
        const searchableText = [
          college.name,
          college.college_code,
          college.dean_name,
          college.departments.join(" ")
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(keyword);
      });
    }

    filtered.sort((a, b) => {
      if (sortValue === "code") {
        return a.college_code.localeCompare(b.college_code);
      }

      if (sortValue === "departments") {
        return b.departments.length - a.departments.length;
      }

      return a.name.localeCompare(b.name);
    });

    return filtered;
  }

  function renderColleges() {
    const filtered = getFilteredColleges();

    collegeCount.textContent = `${filtered.length} ${
      filtered.length === 1 ? "college" : "colleges"
    } shown`;

    if (!filtered.length) {
      const hasSearch = collegeSearch.value.trim();

      collegeContainer.innerHTML = `
        <div class="col-span-full bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center shadow-card">
          <div class="mx-auto w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl mb-4">
            🏫
          </div>

          <h3 class="text-lg font-bold text-gray-900">
            ${hasSearch ? "No matching colleges found" : "No colleges added yet"}
          </h3>

          <p class="text-sm text-gray-500 mt-2 max-w-md mx-auto">
            ${
              hasSearch
                ? "Try using a different keyword or clear your search."
                : "Start by adding a college, dean, logo, and its departments."
            }
          </p>

          ${
            hasSearch
              ? ""
              : `
                <button
                  type="button"
                  data-action="add"
                  class="mt-5 px-5 py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 active:scale-95 transition"
                >
                  + Add College
                </button>
              `
          }
        </div>
      `;

      return;
    }

    collegeContainer.innerHTML = filtered.map(createCollegeCard).join("");
  }

  function createCollegeCard(college) {
    const departments = college.departments || [];
    const shownDepartments = departments.slice(0, 4);
    const extraCount = departments.length - shownDepartments.length;
    const initials = getInitials(college.college_code || college.name);

    return `
      <article class="bg-white border border-gray-100 rounded-2xl shadow-card hover:shadow-soft transition overflow-hidden">
        <div class="p-5">
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                ${
                  college.college_logo
                    ? `
                      <img
                        src="${escapeHTML(college.college_logo)}"
                        alt="${escapeHTML(college.name)} logo"
                        class="w-full h-full object-cover"
                        onerror="this.classList.add('hidden'); this.nextElementSibling.classList.remove('hidden');"
                      />
                      <div class="hidden w-full h-full bg-urds-accent text-white font-bold items-center justify-center">
                        ${escapeHTML(initials)}
                      </div>
                    `
                    : `
                      <div class="w-full h-full bg-urds-accent text-white font-bold flex items-center justify-center">
                        ${escapeHTML(initials)}
                      </div>
                    `
                }
              </div>

              <div class="min-w-0">
                <h3 class="font-bold text-gray-900 leading-tight truncate">
                  ${escapeHTML(college.name)}
                </h3>

                <div class="mt-1 flex flex-wrap items-center gap-2">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full bg-urds-accent/10 text-urds-accent text-xs font-bold">
                    ${escapeHTML(college.college_code)}
                  </span>

                  <span class="text-xs text-gray-500">
                    ${departments.length} ${
      departments.length === 1 ? "department" : "departments"
    }
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              data-action="edit"
              data-id="${escapeHTML(college.id)}"
              class="shrink-0 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition"
            >
              Edit
            </button>
          </div>

          <div class="mt-5 rounded-xl bg-gray-50 border border-gray-100 p-4">
            <div class="text-xs uppercase tracking-wide text-gray-400 font-bold">
              Dean
            </div>

            <div class="text-sm font-semibold text-gray-800 mt-1">
              ${escapeHTML(college.dean_name || "No dean assigned")}
            </div>
          </div>

          <div class="mt-4">
            <div class="text-xs uppercase tracking-wide text-gray-400 font-bold mb-2">
              Departments
            </div>

            ${
              departments.length
                ? `
                  <div class="flex flex-wrap gap-2">
                    ${shownDepartments
                      .map(
                        (department) => `
                          <span class="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                            ${escapeHTML(department)}
                          </span>
                        `
                      )
                      .join("")}

                    ${
                      extraCount > 0
                        ? `
                          <span class="px-3 py-1.5 rounded-full bg-gray-900 text-white text-xs font-bold">
                            +${extraCount} more
                          </span>
                        `
                        : ""
                    }
                  </div>
                `
                : `
                  <p class="text-sm text-gray-500">
                    No departments listed.
                  </p>
                `
            }
          </div>
        </div>
      </article>
    `;
  }

  function openCollegeModal(college = null) {
    collegeForm.reset();

    if (college) {
      const normalized = normalizeCollege(college);

      editingCollegeId = normalized.id;
      modalTitle.textContent = "Edit College";
      deleteCollegeBtn.classList.remove("hidden");

      collegeForm.elements.id.value = normalized.id;
      collegeForm.elements.name.value = normalized.name;
      collegeForm.elements.college_code.value = normalized.college_code;
      collegeForm.elements.dean_name.value = normalized.dean_name;
      collegeForm.elements.college_logo.value = normalized.college_logo;
      collegeForm.elements.departments.value = normalized.departments.join(", ");
    } else {
      editingCollegeId = null;
      modalTitle.textContent = "Add College";
      deleteCollegeBtn.classList.add("hidden");
    }

    collegeFormWrap.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");

    setTimeout(() => {
      collegeForm.elements.name.focus();
    }, 50);
  }

  function closeCollegeModal() {
    collegeFormWrap.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
    collegeForm.reset();
    editingCollegeId = null;
  }

  function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(collegeForm);

    const college = normalizeCollege({
      id: editingCollegeId || createId(),
      name: formData.get("name").trim(),
      college_code: formData.get("college_code").trim().toUpperCase(),
      dean_name: formData.get("dean_name").trim(),
      college_logo: formData.get("college_logo").trim(),
      departments: parseDepartments(formData.get("departments"))
    });

    if (!college.name || !college.college_code) {
      showToast("Please enter the college name and code.", "error");
      return;
    }

    const codeAlreadyExists = colleges.some((item) => {
      return (
        item.id !== college.id &&
        String(item.college_code).toUpperCase() === college.college_code
      );
    });

    if (codeAlreadyExists) {
      showToast("A college with this code already exists.", "error");
      return;
    }

    if (editingCollegeId) {
      colleges = colleges.map((item) => {
        return item.id === editingCollegeId ? college : item;
      });

      showToast("College updated successfully.", "success");
    } else {
      colleges.push(college);
      showToast("College added successfully.", "success");
    }

    saveColleges();
    renderColleges();
    closeCollegeModal();
  }

  function handleDelete() {
    if (!editingCollegeId) return;

    const college = colleges.find((item) => item.id === editingCollegeId);
    const collegeName = college ? college.name : "this college";

    const confirmed = confirm(
      `Delete ${collegeName}? This action cannot be undone.`
    );

    if (!confirmed) return;

    colleges = colleges.filter((item) => item.id !== editingCollegeId);

    saveColleges();
    renderColleges();
    closeCollegeModal();

    showToast("College deleted successfully.", "success");
  }

  function showToast(message, type = "success") {
    const toast = document.createElement("div");

    const typeClass =
      type === "error"
        ? "bg-red-600"
        : type === "warning"
        ? "bg-amber-600"
        : "bg-emerald-600";

    toast.className = `${typeClass} text-white px-5 py-3 rounded-xl shadow-soft text-sm font-semibold translate-y-2 opacity-0 transition`;

    toast.textContent = message;

    toastContainer.appendChild(toast);

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

  function bindEvents() {
    addCollegeBtn.addEventListener("click", () => openCollegeModal());

    cancelCollegeBtn.addEventListener("click", closeCollegeModal);
    cancelCollegeBottomBtn.addEventListener("click", closeCollegeModal);

    collegeForm.addEventListener("submit", handleSubmit);
    deleteCollegeBtn.addEventListener("click", handleDelete);

    collegeSearch.addEventListener("input", renderColleges);
    sortColleges.addEventListener("change", renderColleges);

    collegeForm.elements.college_code.addEventListener("input", (event) => {
      event.target.value = event.target.value.toUpperCase();
    });

    collegeContainer.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;

      const action = button.dataset.action;

      if (action === "add") {
        openCollegeModal();
      }

      if (action === "edit") {
        const collegeId = button.dataset.id;
        const college = colleges.find((item) => item.id === collegeId);

        if (college) {
          openCollegeModal(college);
        }
      }
    });

    collegeFormWrap.addEventListener("click", (event) => {
      if (event.target === collegeFormWrap) {
        closeCollegeModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        !collegeFormWrap.classList.contains("hidden")
      ) {
        closeCollegeModal();
      }
    });
  }

  function init() {
    colleges = colleges.map(normalizeCollege);
    saveColleges();
    bindEvents();
    renderColleges();
  }

  init();
})();