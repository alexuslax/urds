// =========================
// LOAD USER INFORMATION
// =========================
const userName = localStorage.getItem("userName") || "User";
const userRole = normalizeSidebarRole(localStorage.getItem("userRole") || "Faculty Researcher");
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
    { name: "Announcements", link: "view_announcement.html", badge: "announcementAttention" },
    { name: "Submit Proposal", link: "submit_proposal_wizard.html" },
    { name: "My Proposals", link: "my_proposals.html", badge: "proposalAttention" },
    { name: "Revisions", link: "revisions.html" },
    { name: "Status Tracking", link: "status_tracking.html" }
  ],

  "College Research Coordinator": [
    { name: "Dashboard", link: "dashboard.html" },
    { name: "Announcements", link: "view_announcement.html", badge: "announcementAttention" },
    { name: "College Proposals", link: "proposal_list.html", badge: "proposalAttention" },
    { name: "TWG Evaluation", link: "twg_evaluation.html" },
    { name: "Status Tracking", link: "status_tracking.html" }

  ],

  "College Dean": [
    { name: "Dashboard", link: "dashboard.html" },
    { name: "Announcements", link: "view_announcement.html", badge: "announcementAttention" },
    { name: "College Proposals", link: "proposal_list.html", badge: "proposalAttention" },
    { name: "Status Tracking", link: "status_tracking.html" }
  ],

  "URDS Director": [
    { name: "Dashboard", link: "dashboard.html" },
    { name: "Announcements", link: "view_announcement.html", badge: "announcementAttention" },
    { name: "Proposals", link: "proposal_list.html", badge: "proposalAttention" },
    { name: "TWG Evaluation", link: "twg_evaluation.html" },
    { name: "Status Tracking", link: "status_tracking.html" }
  ],

  "URDS Staff": [
    { name: "Dashboard", link: "dashboard.html" },
    { name: "Announcements", link: "view_announcement.html", badge: "announcementAttention" },
    { name: "Proposals", link: "proposal_list.html", badge: "proposalAttention" },
    { name: "Status Tracking", link: "status_tracking.html" },
    { name: "Special Orders", link: "special_order_repository.html" },
    { name: "Completed Research", link: "completed_research_form.html" },
    { name: "Publication Incentive", link: "publication_incentive.html" },
    { name: "Completed Research Incentive", link: "completed-research-incentive.html" }
  ],

  "UREC": [
    { name: "Dashboard", link: "dashboard.html" },
    { name: "Announcements", link: "view_announcement.html", badge: "announcementAttention" },
    { name: "Proposals", link: "proposal_list.html", badge: "proposalAttention" },
    { name: "Status Tracking", link: "status_tracking.html" }
  ],

  "Senior Faculty Researcher / TWG": [
    { name: "Dashboard", link: "dashboard.html" },
    { name: "Announcements", link: "view_announcement.html", badge: "announcementAttention" },
    { name: "TWG Review", link: "proposal_list.html", badge: "proposalAttention" },
    { name: "Status Tracking", link: "status_tracking.html" }
  ],
  
    "Evaluator": [
    { name: "Dashboard", link: "dashboard.html" },
    { name: "Announcements", link: "view_announcement.html", badge: "announcementAttention" },
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

  <nav class="px-3 pt-4 pb-24 space-y-1">
`;

(menuByRole[userRole] || menuByRole["Faculty Researcher"]).forEach(item => {
  menuHTML += `
    <a href="${item.link}" class="sidebar-link flex items-center justify-between gap-3 px-3 py-2 hover:bg-white/10 rounded-md text-sm" data-badge-key="${item.badge || ""}">
      <span>${item.name}</span>
      ${
        item.badge
          ? `<span class="sidebar-badge hidden min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] leading-5 text-center font-bold" data-badge="${item.badge}"></span>`
          : ""
      }
    </a>
  `;
});

menuHTML += `</nav>`;
sidebar.innerHTML = menuHTML;
setupSidebarNotificationClicks();
updateAnnouncementNotifications();
updateSidebarNotifications();

// Initialize responsive state immediately
function initializeSidebarState() {
  if (!sidebar) return;

  sidebar.classList.add("h-screen", "overflow-y-auto", "transition-transform", "duration-300");
  
  if (window.innerWidth < 1024) {
    sidebar.classList.add("fixed", "top-0", "left-0", "bottom-0", "z-50", "-translate-x-full", "lg:static");
    sidebar.classList.remove("sticky");
  } else {
    sidebar.classList.remove("fixed", "top-0", "left-0", "bottom-0", "z-50", "-translate-x-full");
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
          sidebar.classList.remove("-translate-x-full", "fixed", "top-0", "left-0", "bottom-0", "z-50");
          sidebar.classList.add("sticky");
        } else {
          // Mobile: add mobile classes and hide sidebar
          sidebar.classList.add("fixed", "top-0", "left-0", "bottom-0", "z-50", "-translate-x-full", "h-screen", "overflow-y-auto");
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

function normalizeSidebarText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSidebarRole(role) {
  const r = normalizeSidebarText(role);

  if (r.includes("administrator") || r === "admin") return "Administrator";
  if (r.includes("college research coordinator") || r === "crc" || r.includes("research coordinator")) return "College Research Coordinator";
  if (r.includes("college dean") || r.includes("dean")) return "College Dean";
  if (r.includes("senior faculty") || r.includes("twg") || r.includes("technical working group")) return "Senior Faculty Researcher / TWG";
  if (r.includes("urec")) return "UREC";
  if (r.includes("director")) return "URDS Director";
  if (r.includes("staff")) return "URDS Staff";
  if (r.includes("evaluator")) return "Evaluator";
  if (r.includes("faculty researcher") || r === "researcher") return "Faculty Researcher";

  return role || "Faculty Researcher";
}

function getSidebarProposalStatus(proposal) {
  return normalizeSidebarText(
    proposal?.status ||
    proposal?.proposal_status ||
    proposal?.current_status ||
    proposal?.currentStatus ||
    ""
  );
}

function getSidebarProposalId(proposal) {
  return String(
    proposal?.id ||
    proposal?.proposal_id ||
    proposal?.proposalId ||
    proposal?.research_id ||
    proposal?.researchId ||
    ""
  );
}

function sidebarProposalNeedsAttention(proposal, role) {
  const status = getSidebarProposalStatus(proposal);

  if (!status) return false;

  if (role === "Faculty Researcher") {
    return status.includes("returned") || status.includes("revision") || status.includes("revise");
  }

  const statusByRole = {
    "College Research Coordinator": ["for screening"],
    "College Dean": ["for dean endorsement"],
    "URDS Staff": ["for urds review"],
    "Senior Faculty Researcher / TWG": ["for twg evaluation"],
    "Evaluator": ["for evaluator review"],
    "UREC": ["for evaluator review"],
    "URDS Director": ["for director review"]
  };

  return (statusByRole[role] || []).some((needle) => status.includes(needle));
}

function sidebarSeenStorageKey(role) {
  return `urds_seen_sidebar_notifications_${normalizeSidebarRole(role).replace(/\W+/g, "_").toLowerCase()}`;
}

function announcementSeenStorageKey(role) {
  return `urds_seen_announcement_notifications_${normalizeSidebarRole(role).replace(/\W+/g, "_").toLowerCase()}`;
}

function getSeenSidebarNotifications(role) {
  try {
    const saved = JSON.parse(localStorage.getItem(sidebarSeenStorageKey(role)) || "[]");
    return new Set(Array.isArray(saved) ? saved.map(String) : []);
  } catch {
    return new Set();
  }
}

function saveSeenSidebarNotifications(role, ids) {
  localStorage.setItem(sidebarSeenStorageKey(role), JSON.stringify([...ids]));
}

function getSeenAnnouncementNotifications(role) {
  try {
    const saved = JSON.parse(localStorage.getItem(announcementSeenStorageKey(role)) || "[]");
    return new Set(Array.isArray(saved) ? saved.map(String) : []);
  } catch {
    return new Set();
  }
}

function saveSeenAnnouncementNotifications(role, ids) {
  localStorage.setItem(announcementSeenStorageKey(role), JSON.stringify([...ids]));
}

function getAnnouncementId(announcement) {
  return String(announcement?.id || announcement?.createdAt || announcement?.date || announcement?.title || "");
}

function announcementVisibleToRole(announcement, role) {
  if (normalizeSidebarText(role).includes("director")) return true;

  const audience = normalizeSidebarText(announcement?.audience || "All Users");
  const normalizedRole = normalizeSidebarText(role);

  if (!audience || audience === "all users") return true;
  if (audience === normalizedRole) return true;

  if (normalizedRole === "college dean" && audience === "dean") return true;
  if (normalizedRole === "senior faculty researcher / twg" && audience === "twg") return true;

  return false;
}

function loadSidebarAnnouncements() {
  try {
    const saved = JSON.parse(localStorage.getItem("urds_announcements") || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

async function fetchSidebarJson(url) {
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    cache: "no-store"
  });

  if (!response.ok) return null;

  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch (error) {
    console.warn("Sidebar notification response was not JSON:", url, text.slice(0, 200));
    return null;
  }
}

function extractSidebarProposals(result) {
  if (Array.isArray(result)) return result;

  if (!result || typeof result !== "object") return [];

  return result.proposals || result.data || [];
}

function setSidebarBadge(name, count) {
  document.querySelectorAll(`[data-badge="${name}"]`).forEach((badge) => {
    if (!count) {
      badge.classList.add("hidden");
      badge.textContent = "";
      return;
    }

    badge.textContent = count > 99 ? "99+" : String(count);
    badge.classList.remove("hidden");
    badge.setAttribute("aria-label", `${count} notification${count === 1 ? "" : "s"}`);
  });
}

async function updateSidebarNotifications() {
  const hasBadge = document.querySelector('[data-badge="proposalAttention"]');

  if (!hasBadge || userRole === "Administrator" || userRole === "Evaluator") return;

  try {
    const endpoint =
      userRole === "Faculty Researcher"
        ? "../../backend/get_my_proposals.php"
        : "../../backend/get_all_proposals.php";

    const result = await fetchSidebarJson(endpoint);
    const proposals = extractSidebarProposals(result);
    const seenIds = getSeenSidebarNotifications(userRole);
    const count = proposals.filter((proposal) => {
      const id = getSidebarProposalId(proposal);
      return id && sidebarProposalNeedsAttention(proposal, userRole) && !seenIds.has(id);
    }).length;

    setSidebarBadge("proposalAttention", count);
  } catch (error) {
    console.warn("Unable to update sidebar notifications:", error);
  }
}

function updateAnnouncementNotifications() {
  const hasBadge = document.querySelector('[data-badge="announcementAttention"]');

  if (!hasBadge) return;

  const announcements = loadSidebarAnnouncements();
  const seenIds = getSeenAnnouncementNotifications(userRole);
  const count = announcements.filter((announcement) => {
    const id = getAnnouncementId(announcement);
    return id && announcementVisibleToRole(announcement, userRole) && !seenIds.has(id);
  }).length;

  setSidebarBadge("announcementAttention", count);
}

async function markSidebarNotificationsSeen() {
  if (userRole === "Administrator" || userRole === "Evaluator") return;

  try {
    const endpoint =
      userRole === "Faculty Researcher"
        ? "../../backend/get_my_proposals.php"
        : "../../backend/get_all_proposals.php";

    const result = await fetchSidebarJson(endpoint);
    const proposals = extractSidebarProposals(result);
    const seenIds = getSeenSidebarNotifications(userRole);

    proposals.forEach((proposal) => {
      const id = getSidebarProposalId(proposal);

      if (id && sidebarProposalNeedsAttention(proposal, userRole)) {
        seenIds.add(id);
      }
    });

    saveSeenSidebarNotifications(userRole, seenIds);
    setSidebarBadge("proposalAttention", 0);
  } catch (error) {
    console.warn("Unable to mark sidebar notifications as seen:", error);
  }
}

function setupSidebarNotificationClicks() {
  document.querySelectorAll('.sidebar-link[data-badge-key="proposalAttention"]').forEach((link) => {
    link.addEventListener("click", () => {
      markSidebarNotificationsSeen();
    });
  });

  document.querySelectorAll('.sidebar-link[data-badge-key="announcementAttention"]').forEach((link) => {
    link.addEventListener("click", () => {
      markAnnouncementNotificationsSeen();
    });
  });
}

function markAnnouncementNotificationsSeen() {
  const seenIds = getSeenAnnouncementNotifications(userRole);

  loadSidebarAnnouncements().forEach((announcement) => {
    const id = getAnnouncementId(announcement);

    if (id && announcementVisibleToRole(announcement, userRole)) {
      seenIds.add(id);
    }
  });

  saveSeenAnnouncementNotifications(userRole, seenIds);
  setSidebarBadge("announcementAttention", 0);
}
