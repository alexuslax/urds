document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const STORAGE_KEY = "urds_announcements";

  let announcements = [];
  let editingId = null;

  const form = $("announcement-form");
  const list = $("announcement-list");
  const searchInput = $("announcement-search");
  const countLine = $("announcement-count");
  const toastContainer = $("toastContainer");

  init();

  function init() {
    announcements = loadAnnouncements();
    bindEvents();
    renderAnnouncements();
  }

  function bindEvents() {
    form?.addEventListener("submit", handleSubmit);
    $("clearAnnouncementBtn")?.addEventListener("click", clearForm);
    searchInput?.addEventListener("input", renderAnnouncements);
  }

  function loadAnnouncements() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveAnnouncements() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(announcements));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const title = getValue("announcement-title");
    const content = getValue("announcement-content");
    const audience = getValue("announcement-audience") || "All Users";
    const priority = getValue("announcement-priority") || "Normal";
    const date = getValue("announcement-date") || new Date().toISOString().slice(0, 10);
    const fileInput = $("announcement-file");
    const file = fileInput?.files?.[0];

    if (!title) return toast("Title is required", "error");
    if (!content) return toast("Content is required", "error");

    let fileData = null;

    if (file) {
      fileData = await fileToBase64(file);
    }

    if (editingId) {
      const item = announcements.find(a => a.id === editingId);

      item.title = title;
      item.content = content;
      item.audience = audience;
      item.priority = priority;
      item.date = date;

      if (fileData) {
        item.file = fileData;
      }

      toast("Announcement updated");
    } else {
      announcements.unshift({
        id: Date.now().toString(),
        title,
        content,
        audience,
        priority,
        date,
        file: fileData,
        createdAt: new Date().toISOString()
      });

      toast("Announcement published");
    }

    saveAnnouncements();
    clearForm();
    renderAnnouncements();
  }

  function renderAnnouncements() {
    const query = (searchInput?.value || "").toLowerCase();

    const filtered = announcements.filter(a =>
      (a.title + a.content + a.audience + a.priority)
        .toLowerCase()
        .includes(query)
    );

    countLine.textContent = `${filtered.length} announcement(s)`;

    if (!filtered.length) {
      list.innerHTML = `<div class="text-sm text-gray-500">No announcements found.</div>`;
      return;
    }

    list.innerHTML = filtered.map(a => `
      <div class="p-5 rounded-2xl border bg-white shadow-card">

        <div class="flex justify-between items-start gap-3">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="font-bold text-gray-900">${escapeHtml(a.title)}</h3>

              <span class="text-xs px-2 py-1 rounded-full ${
                a.priority === "Urgent" ? "bg-red-100 text-red-700" :
                a.priority === "Important" ? "bg-yellow-100 text-yellow-700" :
                "bg-gray-100 text-gray-700"
              }">
                ${a.priority}
              </span>

              <span class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                ${escapeHtml(a.audience)}
              </span>
            </div>

            <p class="text-sm text-gray-600 mt-2 whitespace-pre-line">
              ${escapeHtml(a.content)}
            </p>

            <div class="text-xs text-gray-400 mt-2">
              ${formatDate(a.date)}
            </div>
          </div>

          <div class="flex gap-2">
            <button class="editBtn px-3 py-1 text-xs bg-gray-100 rounded" data-id="${a.id}">
              Edit
            </button>
            <button class="deleteBtn px-3 py-1 text-xs bg-red-100 text-red-700 rounded" data-id="${a.id}">
              Delete
            </button>
          </div>
        </div>

        ${
          a.file
            ? `
            <div class="mt-3">
              <a href="${a.file}" target="_blank" class="text-sm text-blue-600 underline">
                View Attachment
              </a>
            </div>
            `
            : ""
        }

      </div>
    `).join("");

    bindListEvents();
  }

  function bindListEvents() {
    document.querySelectorAll(".editBtn").forEach(btn => {
      btn.addEventListener("click", () => editAnnouncement(btn.dataset.id));
    });

    document.querySelectorAll(".deleteBtn").forEach(btn => {
      btn.addEventListener("click", () => deleteAnnouncement(btn.dataset.id));
    });
  }

  function editAnnouncement(id) {
    const a = announcements.find(item => item.id === id);
    if (!a) return;

    editingId = id;

    setValue("announcement-title", a.title);
    setValue("announcement-content", a.content);
    setValue("announcement-audience", a.audience);
    setValue("announcement-priority", a.priority);
    setValue("announcement-date", a.date);

    toast("Editing announcement");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteAnnouncement(id) {
    if (!confirm("Delete this announcement?")) return;

    announcements = announcements.filter(a => a.id !== id);
    saveAnnouncements();
    renderAnnouncements();
    toast("Announcement deleted");
  }

  function clearForm() {
    form.reset();
    editingId = null;
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function formatDate(date) {
    if (!date) return "";
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  function getValue(id) {
    return $(id)?.value?.trim() || "";
  }

  function setValue(id, value) {
    const el = $(id);
    if (el) el.value = value || "";
  }

  function escapeHtml(str) {
    return String(str || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function toast(message, type = "success") {
    if (!toastContainer) {
      alert(message);
      return;
    }

    const el = document.createElement("div");

    el.className =
      type === "error"
        ? "bg-red-600 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-semibold"
        : "bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-semibold";

    el.textContent = message;
    toastContainer.appendChild(el);

    setTimeout(() => el.remove(), 3000);
  }
});