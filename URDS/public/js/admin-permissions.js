// admin-permissions.js
(async function () {
  // keys: settings.permissions -> { roleName: { permissionKey: true/false } }
  function loadSettings() { return JSON.parse(localStorage.getItem("settings") || "{}"); }
  function saveSettings(s) { localStorage.setItem("settings", JSON.stringify(s)); }
  function log(title, detail) {
    const logs = JSON.parse(localStorage.getItem("logs") || "[]");
    logs.push({ id: Date.now(), title, detail: detail || "", user: localStorage.getItem("userName") || "Admin", date: new Date().toLocaleString() });
    localStorage.setItem("logs", JSON.stringify(logs));
  }

  const container = document.getElementById("page-content");
  if (!container) return;

  container.innerHTML = `
    <div class="mb-4 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-semibold">Role-Based Permissions</h2>
        <p class="text-sm text-gray-500">Modify system access for each user role.</p>
      </div>
      <div>
        <select id="roleSelect" class="border px-3 py-2 rounded"></select>
        <button id="savePerm" class="ml-2 bg-urds-accent text-white px-3 py-2 rounded">Save</button>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-card p-4">
      <table class="w-full" id="permTable">
        <thead class="text-xs text-gray-600"><tr><th class="p-2">Permission</th><th class="p-2 text-center">Enable</th></tr></thead>
        <tbody id="permBody"></tbody>
      </table>
    </div>
  `;

  const roleSelect = document.getElementById("roleSelect");
  const permBody = document.getElementById("permBody");
  const saveBtn = document.getElementById("savePerm");

  const defaultPermissions = [
    "view_users","edit_users","delete_users","manage_colleges","view_proposals","edit_proposals","approve_proposals","view_logs","manage_settings"
  ];
  const roles = ["Administrator","URDS Director","URDS Staff","College Dean","College Research Coordinator","Faculty Researcher","Evaluator","UREC","Senior Faculty Researcher / TWG"];
  roles.forEach(r => roleSelect.innerHTML += `<option value="${r}">${r}</option>`);

  function renderPerms(role) {
    const s = loadSettings();
    const perms = (s.permissions && s.permissions[role]) || {};
    permBody.innerHTML = defaultPermissions.map(p => `
      <tr class="border-t"><td class="p-2">${p.replace(/_/g," ")}</td>
      <td class="p-2 text-center"><input data-perm="${p}" type="checkbox" ${perms[p] ? "checked" : ""} /></td></tr>
    `).join("");
  }

  roleSelect.addEventListener("change", (e) => renderPerms(e.target.value));
  saveBtn.addEventListener("click", () => {
    const role = roleSelect.value;
    const s = loadSettings();
    s.permissions = s.permissions || {};
    s.permissions[role] = {};
    permBody.querySelectorAll("input[type=checkbox]").forEach(cb => {
      s.permissions[role][cb.dataset.perm] = cb.checked;
    });
    saveSettings(s);
    log(`Permissions updated for ${role}`, JSON.stringify(s.permissions[role]));
    alert("Permissions saved.");
  });

  // init
  roleSelect.value = roles[0];
  renderPerms(roles[0]);
})();
