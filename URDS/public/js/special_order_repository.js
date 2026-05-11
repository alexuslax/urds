document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const STORAGE_KEY = "urds_special_order_documents";
  const FOLDER_KEY = "urds_special_order_folders";

  const defaultFolders = [
    "Special Orders",
    "Notice to Proceed",
    "Board / UREC Approval",
    "Completed Research",
    "Archived Documents"
  ];

  let documents = [];
  let folders = [];
  let editingId = null;

  const uploadPanel = $("uploadPanel");
  const uploadForm = $("uploadForm");
  const toastContainer = $("toastContainer");

  init();

  function init() {
    folders = loadFolders();
    documents = loadDocuments();

    bindEvents();
    renderFolders();
    renderFolderOptions();
    renderDocuments();
  }

  function bindEvents() {
    $("openUploadPanelBtn")?.addEventListener("click", openUploadPanel);
    $("closeUploadPanelBtn")?.addEventListener("click", closeUploadPanel);
    $("clearUploadBtn")?.addEventListener("click", clearForm);
    $("addFolderBtn")?.addEventListener("click", addFolder);

    $("searchInput")?.addEventListener("input", renderDocuments);
    $("folderFilter")?.addEventListener("change", renderDocuments);

    uploadForm?.addEventListener("submit", saveDocument);
  }

  function loadFolders() {
    try {
      const saved = JSON.parse(localStorage.getItem(FOLDER_KEY) || "null");
      return Array.isArray(saved) && saved.length ? saved : defaultFolders;
    } catch {
      return defaultFolders;
    }
  }

  function saveFolders() {
    localStorage.setItem(FOLDER_KEY, JSON.stringify(folders));
  }

  function loadDocuments() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  }

  function saveDocuments() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  }

  function openUploadPanel() {
    uploadPanel?.classList.remove("hidden");
    $("docTitle")?.focus();
  }

  function closeUploadPanel() {
    uploadPanel?.classList.add("hidden");
    editingId = null;
    clearForm();
  }

  function clearForm() {
    uploadForm?.reset();
    editingId = null;

    const submitBtn = uploadForm?.querySelector("button[type='submit']");
    if (submitBtn) submitBtn.textContent = "Save Document";
  }

  async function saveDocument(event) {
    event.preventDefault();

    const title = getValue("docTitle");
    const reference = getValue("docReference");
    const date = getValue("docDate");
    const folder = getValue("docFolder");
    const tags = getValue("docTags");
    const description = getValue("docDescription");
    const fileInput = $("docFile");
    const file = fileInput?.files?.[0] || null;

    if (!title) return toast("Please enter a document title.", "error");
    if (!reference) return toast("Please enter a reference number.", "error");
    if (!date) return toast("Please select a document date.", "error");
    if (!folder) return toast("Please select a folder.", "error");

    let fileData = null;

    if (file) {
      const maxSize = 3 * 1024 * 1024;

      if (file.size > maxSize) {
        return toast("File is too large. Maximum size is 3 MB for demo storage.", "error");
      }

      fileData = await fileToDataUrl(file);
    }

    if (editingId) {
      const existing = documents.find((item) => item.id === editingId);

      if (!existing) {
        toast("Document not found.", "error");
        return;
      }

      existing.title = title;
      existing.reference = reference;
      existing.date = date;
      existing.folder = folder;
      existing.tags = tags;
      existing.description = description;
      existing.updatedAt = new Date().toISOString();

      if (fileData) {
        existing.file = {
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size,
          dataUrl: fileData
        };
      }

      toast("Document updated.");
    } else {
      if (!file) {
        return toast("Please attach a PDF, JPG, JPEG, or PNG file.", "error");
      }

      documents.unshift({
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        title,
        reference,
        date,
        folder,
        tags,
        description,
        file: {
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size,
          dataUrl: fileData
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      toast("Document saved.");
    }

    saveDocuments();
    clearForm();
    closeUploadPanel();
    renderDocuments();
  }

  function addFolder() {
    const name = prompt("Enter folder name:");

    if (!name) return;

    const cleanName = name.trim();

    if (!cleanName) return;

    const exists = folders.some((folder) => folder.toLowerCase() === cleanName.toLowerCase());

    if (exists) {
      toast("Folder already exists.", "error");
      return;
    }

    folders.push(cleanName);
    saveFolders();
    renderFolders();
    renderFolderOptions();
    toast("Folder added.");
  }

  function deleteFolder(folderName) {
    const used = documents.some((doc) => doc.folder === folderName);

    if (used) {
      toast("This folder has documents. Move or delete them first.", "error");
      return;
    }

    if (!confirm(`Delete folder "${folderName}"?`)) return;

    folders = folders.filter((folder) => folder !== folderName);
    saveFolders();
    renderFolders();
    renderFolderOptions();
    toast("Folder deleted.");
  }

  function renderFolders() {
    const folderList = $("folderList");
    if (!folderList) return;

    if (!folders.length) {
      folderList.innerHTML = `<div class="text-sm text-gray-500">No folders yet.</div>`;
      return;
    }

    folderList.innerHTML = folders
      .map((folder) => {
        const count = documents.filter((doc) => doc.folder === folder).length;

        return `
          <div class="flex items-center justify-between gap-2 p-3 rounded-xl border border-gray-100 bg-gray-50">
            <button
              type="button"
              class="folderQuickFilter text-left min-w-0 flex-1"
              data-folder="${escapeAttr(folder)}"
            >
              <div class="text-sm font-semibold text-gray-900 truncate">${escapeHtml(folder)}</div>
              <div class="text-xs text-gray-500">${count} document(s)</div>
            </button>

            <button
              type="button"
              class="deleteFolder text-xs text-red-600 hover:bg-red-50 rounded-lg px-2 py-1"
              data-folder="${escapeAttr(folder)}"
            >
              Delete
            </button>
          </div>
        `;
      })
      .join("");

    folderList.querySelectorAll(".folderQuickFilter").forEach((btn) => {
      btn.addEventListener("click", () => {
        $("folderFilter").value = btn.dataset.folder || "";
        renderDocuments();
      });
    });

    folderList.querySelectorAll(".deleteFolder").forEach((btn) => {
      btn.addEventListener("click", () => deleteFolder(btn.dataset.folder || ""));
    });
  }

  function renderFolderOptions() {
    const folderFilter = $("folderFilter");
    const docFolder = $("docFolder");

    if (folderFilter) {
      const current = folderFilter.value;

      folderFilter.innerHTML = `
        <option value="">All folders</option>
        ${folders.map((folder) => `<option value="${escapeAttr(folder)}">${escapeHtml(folder)}</option>`).join("")}
      `;

      folderFilter.value = current;
    }

    if (docFolder) {
      const current = docFolder.value;

      docFolder.innerHTML = `
        <option value="">Select folder</option>
        ${folders.map((folder) => `<option value="${escapeAttr(folder)}">${escapeHtml(folder)}</option>`).join("")}
      `;

      docFolder.value = current;
    }
  }

  function renderDocuments() {
    const fileList = $("fileList");
    const countLine = $("countLine");

    if (!fileList) return;

    const query = getValue("searchInput").toLowerCase();
    const folder = getValue("folderFilter");

    const filtered = documents.filter((doc) => {
      const matchesFolder = !folder || doc.folder === folder;

      const haystack = [
        doc.title,
        doc.reference,
        doc.date,
        doc.folder,
        doc.tags,
        doc.description,
        doc.file?.name
      ]
        .join(" ")
        .toLowerCase();

      return matchesFolder && haystack.includes(query);
    });

    if (countLine) {
      countLine.textContent = `${filtered.length} document(s) found`;
    }

    if (!filtered.length) {
      fileList.innerHTML = `
        <div class="p-6 rounded-2xl border border-dashed border-gray-300 text-center text-sm text-gray-500">
          No documents found.
        </div>
      `;
      return;
    }

    fileList.innerHTML = filtered
      .map((doc) => {
        const fileType = doc.file?.type || "";
        const isImage = fileType.startsWith("image/");

        return `
          <article class="p-5 rounded-2xl border border-gray-100 bg-white shadow-card">
            <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="text-base font-bold text-gray-900">${escapeHtml(doc.title)}</h3>
                  <span class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-semibold">
                    ${escapeHtml(doc.folder)}
                  </span>
                </div>

                <div class="text-sm text-gray-600 mt-2">
                  <strong>Reference:</strong> ${escapeHtml(doc.reference)}
                  <span class="mx-1">•</span>
                  <strong>Date:</strong> ${formatDate(doc.date)}
                </div>

                ${
                  doc.description
                    ? `<p class="text-sm text-gray-600 mt-2">${escapeHtml(doc.description)}</p>`
                    : ""
                }

                ${
                  doc.tags
                    ? `<div class="text-xs text-gray-500 mt-2">Tags: ${escapeHtml(doc.tags)}</div>`
                    : ""
                }

                <div class="text-xs text-gray-400 mt-2">
                  File: ${escapeHtml(doc.file?.name || "No file")} 
                  ${doc.file?.size ? `• ${formatBytes(doc.file.size)}` : ""}
                </div>
              </div>

              <div class="flex flex-wrap gap-2 shrink-0">
                <button
                  type="button"
                  class="viewDoc px-3 py-2 rounded-xl bg-urds-900 text-white text-xs font-bold hover:bg-urds-800"
                  data-id="${escapeAttr(doc.id)}"
                >
                  View
                </button>

                <button
                  type="button"
                  class="editDoc px-3 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200"
                  data-id="${escapeAttr(doc.id)}"
                >
                  Edit
                </button>

                <button
                  type="button"
                  class="deleteDoc px-3 py-2 rounded-xl bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100"
                  data-id="${escapeAttr(doc.id)}"
                >
                  Delete
                </button>
              </div>
            </div>

            ${
              isImage
                ? `<img src="${doc.file.dataUrl}" alt="${escapeAttr(doc.title)}" class="mt-4 max-h-56 rounded-xl border object-contain">`
                : ""
            }
          </article>
        `;
      })
      .join("");

    fileList.querySelectorAll(".viewDoc").forEach((btn) => {
      btn.addEventListener("click", () => viewDocument(btn.dataset.id));
    });

    fileList.querySelectorAll(".editDoc").forEach((btn) => {
      btn.addEventListener("click", () => editDocument(btn.dataset.id));
    });

    fileList.querySelectorAll(".deleteDoc").forEach((btn) => {
      btn.addEventListener("click", () => deleteDocument(btn.dataset.id));
    });
  }

  function viewDocument(id) {
    const doc = documents.find((item) => item.id === id);

    if (!doc || !doc.file?.dataUrl) {
      toast("File not found.", "error");
      return;
    }

    const win = window.open("", "_blank");

    if (!win) {
      toast("Popup blocked. Please allow popups to view files.", "error");
      return;
    }

    win.document.write(`
      <!doctype html>
      <html>
      <head>
        <title>${escapeHtml(doc.title)}</title>
        <style>
          body { margin: 0; font-family: Arial, sans-serif; background: #f3f4f6; }
          header { background: white; padding: 12px 16px; border-bottom: 1px solid #ddd; }
          iframe, img { width: 100%; height: calc(100vh - 58px); border: 0; object-fit: contain; background: white; }
        </style>
      </head>
      <body>
        <header>
          <strong>${escapeHtml(doc.title)}</strong>
          <span style="color:#666;font-size:12px;"> ${escapeHtml(doc.reference)}</span>
        </header>
        ${
          String(doc.file.type || "").startsWith("image/")
            ? `<img src="${doc.file.dataUrl}" alt="${escapeAttr(doc.title)}">`
            : `<iframe src="${doc.file.dataUrl}"></iframe>`
        }
      </body>
      </html>
    `);

    win.document.close();
  }

  function editDocument(id) {
    const doc = documents.find((item) => item.id === id);

    if (!doc) {
      toast("Document not found.", "error");
      return;
    }

    editingId = id;

    setValue("docTitle", doc.title);
    setValue("docReference", doc.reference);
    setValue("docDate", doc.date);
    setValue("docFolder", doc.folder);
    setValue("docTags", doc.tags);
    setValue("docDescription", doc.description);

    const submitBtn = uploadForm?.querySelector("button[type='submit']");
    if (submitBtn) submitBtn.textContent = "Update Document";

    openUploadPanel();
    toast("Editing document. Attach a new file only if you want to replace it.");
  }

  function deleteDocument(id) {
    const doc = documents.find((item) => item.id === id);

    if (!doc) {
      toast("Document not found.", "error");
      return;
    }

    if (!confirm(`Delete "${doc.title}"?`)) return;

    documents = documents.filter((item) => item.id !== id);
    saveDocuments();
    renderFolders();
    renderDocuments();
    toast("Document deleted.");
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);

      reader.readAsDataURL(file);
    });
  }

  function getValue(id) {
    return $(id)?.value?.trim() || "";
  }

  function setValue(id, value) {
    const el = $(id);
    if (!el) return;
    el.value = value || "";
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

  function formatBytes(bytes) {
    const size = Number(bytes || 0);

    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replaceAll('"', "&quot;");
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