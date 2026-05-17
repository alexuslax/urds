document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const STORAGE_KEY = "urds_announcements";

  const list = document.getElementById("announcement-list");
  const searchInput = document.getElementById("announcement-search");
  const filterInput = document.getElementById("announcement-filter");
  const countLine = document.getElementById("announcement-count");
  const manageLink = document.getElementById("manageAnnouncementsLink");

  let announcements = loadAnnouncements();

  if (manageLink && isDirector(localStorage.getItem("userRole"))) {
    manageLink.hidden = false;
  }

  renderAnnouncements();

  searchInput?.addEventListener("input", renderAnnouncements);
  filterInput?.addEventListener("change", renderAnnouncements);

  function loadAnnouncements() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  }

  function renderAnnouncements() {
    if (!list) return;

    const query = String(searchInput?.value || "").toLowerCase().trim();
    const priority = String(filterInput?.value || "").trim();
    const userRole = localStorage.getItem("userRole") || "All Users";

    const filtered = announcements
      .filter((item) => {
        return announcementVisibleToRole(item, userRole);
      })
      .filter((item) => {
        return !priority || item.priority === priority;
      })
      .filter((item) => {
        const haystack = [
          item.title,
          item.content,
          item.audience,
          item.priority,
          item.date
        ].join(" ").toLowerCase();

        return haystack.includes(query);
      })
      .sort((a, b) => {
        return new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0);
      });

    if (countLine) {
      countLine.textContent = `${filtered.length} announcement(s) visible to your role`;
    }

    if (!filtered.length) {
      list.innerHTML = `
        <div class="bg-white p-6 rounded-2xl shadow-card border border-dashed border-gray-300 text-center text-sm text-gray-500">
          No announcements found.
        </div>
      `;
      return;
    }

    list.innerHTML = filtered
      .map((item) => {
        const priorityClass =
          item.priority === "Urgent"
            ? "bg-red-100 text-red-700"
            : item.priority === "Important"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-100 text-gray-700";

        return `
          <article class="bg-white p-6 rounded-2xl shadow-card border border-gray-100">
            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h2 class="text-lg font-bold text-gray-900">${escapeHtml(item.title)}</h2>

                  <span class="text-xs px-2.5 py-1 rounded-full font-bold ${priorityClass}">
                    ${escapeHtml(item.priority || "Normal")}
                  </span>

                  <span class="text-xs px-2.5 py-1 rounded-full font-bold bg-blue-100 text-blue-700">
                    ${escapeHtml(item.audience || "All Users")}
                  </span>
                </div>

                <div class="text-xs text-gray-500 mt-2">
                  Published: ${escapeHtml(formatDate(item.date || item.createdAt))}
                </div>
              </div>
            </div>

            <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-line mt-4">
              ${escapeHtml(item.content)}
            </p>

            ${
              item.file
                ? `
                  <div class="mt-4 pt-4 border-t border-gray-100">
                    <a
                      href="${item.file}"
                      target="_blank"
                      class="inline-flex px-4 py-2 rounded-xl bg-urds-900 text-white text-sm font-bold hover:bg-urds-800"
                    >
                      View Attachment
                    </a>
                  </div>
                `
                : ""
            }
          </article>
        `;
      })
      .join("");
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

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function isDirector(role) {
    return String(role || "").toLowerCase().includes("director");
  }

  function normalizeRoleText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function announcementVisibleToRole(announcement, role) {
    if (isDirector(role)) return true;

    const audience = normalizeRoleText(announcement?.audience || "All Users");
    const normalizedRole = normalizeRoleText(role);

    if (!audience || audience === "all users") return true;
    if (audience === normalizedRole) return true;

    if (normalizedRole.includes("dean") && audience === "dean") return true;
    if (normalizedRole.includes("twg") && audience === "twg") return true;

    return false;
  }
});
