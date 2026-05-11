(async function () {

  let allUsers = []; // Store all users for filtering
  let allRejectedUsers = []; // Store rejected users

  async function loadPendingUsers() {
    try {
      const response = await fetch("../../backend/get_pending_users.php");
      const result = await response.json();
      return result.status === "success" ? result.users : [];
    } catch (error) {
      console.error("Error loading pending users:", error);
      return [];
    }
  }

  async function loadRejectedUsers() {
    try {
      const response = await fetch("../../backend/get_rejected_users.php");
      const result = await response.json();
      return result.status === "success" ? result.users : [];
    } catch (error) {
      console.error("Error loading rejected users:", error);
      return [];
    }
  }

  async function updateApproval(action, user_id) {
    try {
      const response = await fetch("../../backend/update_approval.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, user_id })
      });
      return await response.json();
    } catch (error) {
      console.error("Approval error:", error);
      return null;
    }
  }

  const table = document.getElementById("pendingUsersTable");
  const rejectedTable = document.getElementById("rejectedUsersTable");
  const emptyState = document.getElementById("emptyState");
  const searchInput = document.getElementById("searchInput");
  const roleFilter = document.getElementById("roleFilter");
  const collegeFilter = document.getElementById("collegeFilter");
  const departmentFilter = document.getElementById("departmentFilter");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");

  // Load colleges and departments for filters
  async function loadFilters() {
    try {
      const response = await fetch("../../backend/get_colleges.php");
      const data = await response.json();
      
      if (data.status === "success" && data.colleges) {
        // Populate college filter
        data.colleges.forEach(college => {
          const option = document.createElement("option");
          option.value = college.college_name;
          option.textContent = college.college_name;
          collegeFilter.appendChild(option);
        });

        // Populate department filter with all departments
        const allDepartments = [];
        data.colleges.forEach(college => {
          if (college.departments) {
            college.departments.forEach(dept => {
              allDepartments.push(dept);
            });
          }
        });
        
        allDepartments.forEach(dept => {
          const option = document.createElement("option");
          option.value = dept.department_name;
          option.textContent = dept.department_name;
          departmentFilter.appendChild(option);
        });
      }
    } catch (error) {
      console.error("Error loading filters:", error);
    }
  }

  function filterUsers() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedRole = roleFilter.value.trim();
    const selectedCollege = collegeFilter.value.trim();
    const selectedDepartment = departmentFilter.value.trim();

    const filtered = allUsers.filter(user => {
      // Search filter
      const matchesSearch = !searchTerm || 
        (user.first_name && user.first_name.toLowerCase().includes(searchTerm)) ||
        (user.last_name && user.last_name.toLowerCase().includes(searchTerm)) ||
        (user.email && user.email.toLowerCase().includes(searchTerm));

      // Role filter - trim both sides to handle whitespace issues
      const matchesRole = !selectedRole || (user.role && user.role.trim() === selectedRole);

      // College filter
      const matchesCollege = !selectedCollege || (user.college_name && user.college_name === selectedCollege);

      // Department filter
      const matchesDepartment = !selectedDepartment || (user.department_name && user.department_name === selectedDepartment);

      return matchesSearch && matchesRole && matchesCollege && matchesDepartment;
    });

    renderTable(filtered);
  }

  function filterRejectedUsers() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedRole = roleFilter.value.trim();
    const selectedCollege = collegeFilter.value.trim();
    const selectedDepartment = departmentFilter.value.trim();

    const filtered = allRejectedUsers.filter(user => {
      // Search filter
      const matchesSearch = !searchTerm || 
        (user.first_name && user.first_name.toLowerCase().includes(searchTerm)) ||
        (user.last_name && user.last_name.toLowerCase().includes(searchTerm)) ||
        (user.email && user.email.toLowerCase().includes(searchTerm));

      // Role filter
      const matchesRole = !selectedRole || (user.role && user.role.trim() === selectedRole);

      // College filter
      const matchesCollege = !selectedCollege || (user.college_name && user.college_name === selectedCollege);

      // Department filter
      const matchesDepartment = !selectedDepartment || (user.department_name && user.department_name === selectedDepartment);

      return matchesSearch && matchesRole && matchesCollege && matchesDepartment;
    });

    renderRejectedFiltered(filtered);
  }

  function renderRejectedFiltered(users) {
    const emptyStateRejected = document.getElementById("emptyStateRejected");

    if (!users.length) {
      rejectedTable.innerHTML = "";
      emptyStateRejected.classList.remove("hidden");
      return;
    }

    emptyStateRejected.classList.add("hidden");

    rejectedTable.innerHTML = users.map(u => {
      const rejectedDate = u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A';
      const collegeDept = [u.college_name, u.department_name].filter(Boolean).join(' / ') || '-';

      return `
      <tr class="border-b hover:bg-gray-50 transition">
        <td class="py-4">
          <div class="font-semibold text-urds-900 text-sm">${u.first_name} ${u.last_name}</div>
        </td>
        <td class="py-4 text-sm text-gray-700">${u.email}</td>
        <td class="py-4 text-sm text-gray-700">${u.role}</td>
        <td class="py-4 text-sm text-gray-700">${collegeDept}</td>
        <td class="py-4 text-sm text-gray-600">${rejectedDate}</td>
        <td class="py-4 text-center">
          <button 
            class="restoreBtn px-4 py-2 bg-urds-accent hover:bg-urds-800 text-white rounded-lg text-sm transition"
            data-id="${u.user_id}">
            Restore
          </button>
        </td>
      </tr>
      `;
    }).join("");
  }

  function renderTable(users) {
    if (!users.length) {
      table.innerHTML = "";
      emptyState.classList.remove("hidden");
      return;
    }

    emptyState.classList.add("hidden");

table.innerHTML = users.map(u => `
  <tr class="border-b hover:bg-gray-50 transition">
    
    <!-- USER COLUMN -->
    <td class="py-4">
      <div class="font-semibold text-urds-900 text-sm">${u.first_name} ${u.last_name}</div>
      <div class="text-xs text-gray-500">${u.email}</div>
      <div class="text-xs text-gray-400">${u.username}</div>
    </td>

    <!-- ROLE -->
    <td class="py-4 text-sm text-gray-700">${u.role}</td>

    <!-- COLLEGE -->
    <td class="py-4 text-sm text-gray-700">${u.college_name || "-"}</td>

    <!-- DEPARTMENT -->
    <td class="py-4 text-sm text-gray-700">${u.department_name || "-"}</td>

    <!-- ACTION BUTTONS -->
    <td class="py-4 text-center flex items-center justify-center gap-3">

      <!-- APPROVE -->
      <button 
        class="approveBtn p-2 bg-green-500 hover:bg-green-600 text-white rounded-full shadow transition"
        title="Approve"
        data-id="${u.user_id}">
        
        <svg xmlns="http://www.w3.org/2000/svg" 
             fill="none" viewBox="0 0 24 24" stroke="currentColor" 
             class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M5 13l4 4L19 7" />
        </svg>

      </button>

      <!-- REJECT -->
      <button 
        class="rejectBtn p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow transition"
        title="Reject"
        data-id="${u.user_id}">
        
        <svg xmlns="http://www.w3.org/2000/svg" 
             fill="none" viewBox="0 0 24 24" stroke="currentColor" 
             class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M6 18L18 6M6 6l12 12" />
        </svg>

      </button>

    </td>

  </tr>
`).join("");
  }

  async function renderPending() {
    allUsers = await loadPendingUsers();
    renderTable(allUsers);
  }

  // Event listeners for filters - with safety checks
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const isPendingActive = !pendingSection.classList.contains("hidden");
      if (isPendingActive) {
        filterUsers();
      } else {
        filterRejectedUsers();
      }
    });
  }
  
  if (roleFilter) {
    roleFilter.addEventListener("change", () => {
      const isPendingActive = !pendingSection.classList.contains("hidden");
      if (isPendingActive) {
        filterUsers();
      } else {
        filterRejectedUsers();
      }
    });
  }
  
  if (collegeFilter) {
    collegeFilter.addEventListener("change", () => {
      const isPendingActive = !pendingSection.classList.contains("hidden");
      if (isPendingActive) {
        filterUsers();
      } else {
        filterRejectedUsers();
      }
    });
  }
  
  if (departmentFilter) {
    departmentFilter.addEventListener("change", () => {
      const isPendingActive = !pendingSection.classList.contains("hidden");
      if (isPendingActive) {
        filterUsers();
      } else {
        filterRejectedUsers();
      }
    });
  }

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", () => {
      searchInput.value = "";
      roleFilter.value = "";
      collegeFilter.value = "";
      departmentFilter.value = "";
      
      const isPendingActive = !pendingSection.classList.contains("hidden");
      if (isPendingActive) {
        renderTable(allUsers);
      } else {
        renderRejectedFiltered(allRejectedUsers);
      }
    });
  }

  // Render rejected users
  async function renderRejected() {
    allRejectedUsers = await loadRejectedUsers();
    renderRejectedFiltered(allRejectedUsers);
  }

  // Tab switching
  const pendingTab = document.getElementById("pendingTab");
  const rejectedTab = document.getElementById("rejectedTab");
  const pendingSection = document.getElementById("pendingSection");
  const rejectedSection = document.getElementById("rejectedSection");

  pendingTab.addEventListener("click", () => {
    pendingTab.classList.add("border-urds-accent", "text-urds-accent");
    pendingTab.classList.remove("border-transparent", "text-gray-500");
    rejectedTab.classList.remove("border-urds-accent", "text-urds-accent");
    rejectedTab.classList.add("border-transparent", "text-gray-500");
    
    pendingSection.classList.remove("hidden");
    rejectedSection.classList.add("hidden");
    
    // Re-render pending table to show any restored users
    renderTable(allUsers);
  });

  rejectedTab.addEventListener("click", async () => {
    rejectedTab.classList.add("border-urds-accent", "text-urds-accent");
    rejectedTab.classList.remove("border-transparent", "text-gray-500");
    pendingTab.classList.remove("border-urds-accent", "text-urds-accent");
    pendingTab.classList.add("border-transparent", "text-gray-500");
    
    pendingSection.classList.add("hidden");
    rejectedSection.classList.remove("hidden");
    
    await renderRejected();
  });

  // Handle Approve / Reject / Restore actions
  document.addEventListener("click", async (e) => {
    const id = e.target.dataset.id || e.target.closest('button')?.dataset.id;
    if (!id) return;

    if (e.target.closest('.approveBtn')) {
      const res = await updateApproval("approve", id);
      if (res?.status === "success") {
        await renderPending();
        filterUsers(); // Reapply filters
      } else {
        alert(res?.message || "Error approving user.");
      }
    }

    if (e.target.closest('.rejectBtn')) {
      const res = await updateApproval("reject", id);
      if (res?.status === "success") {
        await renderPending();
        filterUsers(); // Reapply filters
      } else {
        alert(res?.message || "Error rejecting user.");
      }
    }

    if (e.target.closest('.restoreBtn')) {
      const res = await updateApproval("restore", id);
      if (res?.status === "success") {
        await renderRejected();
        filterRejectedUsers(); // Reapply filters
        // Refresh pending users data in background
        allUsers = await loadPendingUsers();
      } else {
        alert(res?.message || "Error restoring user.");
      }
    }
  });

  // Initial load
  await loadFilters();
  await renderPending();

})();
