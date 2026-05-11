// =========================
// LOAD USER INFORMATION
// =========================
const userName = localStorage.getItem("userName") || "User";
const userRole = localStorage.getItem("userRole") || "Faculty Researcher";
const userInitials = (userName.split(" ").map(n => n[0]).join("") || "U").toUpperCase();

// UI elements
const nameEl = document.querySelector(".user-name");
const roleEl = document.querySelector(".user-role");
const initialsEl = document.querySelector(".user-initials");

// Apply user info
if (nameEl) nameEl.textContent = userName;
if (roleEl) roleEl.textContent = userRole;

// Show initials or image
if (initialsEl) {
  initialsEl.textContent = userInitials;
}

// Cleanup legacy key that could leak a previous user's avatar across sessions.
localStorage.removeItem("userLogo");



// =========================
// SIDEBAR MENU PER ROLE
// =========================
const menuByRole = {
  "Faculty Researcher": [
    { name: "Dashboard", link: "dashboard.html" },
    { name: "Announcements", link: "view_announcement.html" },
    { name: "Submit Proposal", link: "submit_proposal_wizard.html" },
    { name: "My Proposals", link: "my_proposals.html" },
    { name: "Revisions", link: "revisions.html" },
    { name: "Status Tracking", link: "status_tracking.html" }
  ],

  "College Research Coordinator": [
    { name: "Dashboard", link: "dashboard.html" },
    { name: "Announcements", link: "view_announcement.html" },
    { name: "College Proposals", link: "proposal_list.html" },
    { name: "Status Tracking", link: "status_tracking.html" }
  ],

  "College Dean": [
    { name: "Dashboard", link: "dashboard.html" },
    { name: "Announcements", link: "view_announcement.html" },
    { name: "College Proposals", link: "proposal_list.html" },
    { name: "Status Tracking", link: "status_tracking.html" }
  ],

  "URDS Director": [
    { name: "Dashboard", link: "dashboard.html" },
    { name: "Announcements", link: "create_announcement.html" },
    { name: "Proposals", link: "proposal_list.html" },
    { name: "Status Tracking", link: "status_tracking.html" }
  ],

  "URDS Staff": [
    { name: "Dashboard", link: "dashboard.html" },
    { name: "Announcements", link: "view_announcement.html" },
    { name: "Proposals", link: "proposal_list.html" },
    { name: "Status Tracking", link: "status_tracking.html" }
  ],

  "UREC": [
    { name: "Dashboard", link: "dashboard.html" },
    { name: "Announcements", link: "view_announcement.html" },
    { name: "Proposals", link: "proposal_list.html" },
    { name: "Status Tracking", link: "status_tracking.html" }
  ],

  "Senior Faculty Researcher / TWG": [
    { name: "Dashboard", link: "dashboard.html" },
    { name: "Announcements", link: "view_announcement.html" },
    { name: "TWG Review", link: "proposal_list.html" },
    { name: "Status Tracking", link: "status_tracking.html" }
  ],
  
    "Evaluator": [
    { name: "Dashboard", link: "dashboard.html" },
    { name: "Announcements", link: "view_announcement.html" },
    { name: "Assigned Evaluations", link: "evaluator-assigned.html" },
    { name: "Evaluation History", link: "evaluator-history.html" },
    { name: "Status Tracking", link: "status_tracking.html" }
  ],

  "Administrator": [
    { name: "Dashboard", link: "admin-dashboard.html" },
    { name: "Manage Colleges", link: "admin-colleges.html" },
    { name: "User Management", link: "admin-users.html" },
    { name: "System Logs", link: "admin-logs.html" },
    { name: "Settings", link: "admin-settings.html" }
  ]
};



// =========================
// GENERATE SIDEBAR HTML
// =========================
const sidebar = document.getElementById("sidebar");

let menuHTML = `
  <!-- SIDEBAR HEADER -->
  <div class="px-5 py-4 flex items-center gap-3 border-b border-white/10">
      <div class="w-10 h-10 rounded-lg bg-white overflow-hidden flex items-center justify-center">
          <img src="img/logo.jpg" class="w-full h-full object-cover" />
      </div>
      <div>
          <div class="text-sm font-semibold">UEP URDS</div>
          <div class="text-xs text-white/60">Research Management</div>
      </div>
  </div>

  <nav class="px-3 py-4 space-y-1">
`;

(menuByRole[userRole] || menuByRole["Faculty Researcher"]).forEach(item => {
  menuHTML += `
    <a href="${item.link}" class="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-md text-sm">
      <span>${item.name}</span>
    </a>
  `;
});

menuHTML += `</nav>`;
sidebar.innerHTML = menuHTML;

// Initialize responsive state immediately
function initializeSidebarState() {
  if (!sidebar) return;
  
  if (window.innerWidth < 1024) {
    sidebar.classList.add("fixed", "z-50", "-translate-x-full", "lg:static");
    sidebar.classList.remove("sticky");
  } else {
    sidebar.classList.remove("fixed", "z-50", "-translate-x-full");
    sidebar.classList.add("sticky");
  }
}

// Initialize immediately
initializeSidebarState();



// =========================
// MOBILE SIDEBAR TOGGLE
// =========================
function setupMobileMenu() {
  // Create hamburger button if it doesn't exist
  let hamburger = document.getElementById("hamburger");
  
  if (!hamburger) {
    // Create and insert hamburger button before the header content
    const header = document.querySelector("header");
    if (header) {
      hamburger = document.createElement("button");
      hamburger.id = "hamburger";
      hamburger.className = "lg:hidden p-2 hover:bg-gray-100 rounded-md";
      hamburger.innerHTML = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      `;
      header.insertBefore(hamburger, header.firstChild);
    }
  }

  if (hamburger && sidebar) {
    // Toggle sidebar
    hamburger.addEventListener("click", (e) => {
      e.stopPropagation();
      sidebar.classList.toggle("-translate-x-full");
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener("click", (e) => {
      if (window.innerWidth < 1024) {
        if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
          sidebar.classList.add("-translate-x-full");
        }
      }
    });
    
    // Handle window resize - update sidebar visibility
    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (window.innerWidth >= 1024) {
          // Desktop: remove mobile classes
          sidebar.classList.remove("-translate-x-full", "fixed", "z-50");
          sidebar.classList.add("sticky");
        } else {
          // Mobile: add mobile classes and hide sidebar
          sidebar.classList.add("fixed", "z-50", "-translate-x-full");
          sidebar.classList.remove("sticky");
        }
      }, 100);
    });
  }
}

// Run after DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupMobileMenu);
} else {
  setupMobileMenu();
}



// =========================
// SEARCH SHORTCUT (Ctrl+K)
// =========================
window.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    const searchBox = document.getElementById("search");
    if (searchBox) searchBox.focus();
  }
});



// =========================
// PROFILE LINK HANDLER
// =========================
const profileArea = document.getElementById("user-profile-link");

if (profileArea) {
  profileArea.addEventListener("click", () => {
    window.location.href = "profile.html";
  });
}
