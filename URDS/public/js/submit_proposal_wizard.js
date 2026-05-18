document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  let currentStep = 1;
  const stepOrder = [1, 2, 3, 4, 6];

  const formEl = document.getElementById("wizardForm");
  const steps = Array.from(document.querySelectorAll(".wizard-step"));
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");
  const finalSubmitBtn = document.getElementById("finalSubmitBtn");
  const progressLine = document.getElementById("progressLine");

  const collegeSelect = document.getElementById("collegeSelect");
  const departmentSelect = document.getElementById("departmentSelect");
  const workplanBody = document.getElementById("workplanBody");
  const addWorkplanActivityBtn = document.getElementById("addWorkplanRow") || document.getElementById("addWorkplanActivity");

  let collegesData = [];
  const INITIAL_WORKPLAN_ROWS = 1;

  const required = {
    1: [
      "input[name='title']",
      "select[name='research_type']",
      "select[name='nature']",
      "select[name='cluster']",
      "select[name='college']",
      "select[name='department']",
      "input[name='budgetYear']"
    ],
    2: [
      "textarea[name='rationale']",
      "textarea[name='objectives']",
      "textarea[name='literature']",
      "textarea[name='methodology']"
    ]
  };

  init();

  function init() {
    renderWorkplanTable();
    bindEvents();
    populateColleges();
    attachBudgetListeners();
    updateBudgetTotals();
    showStep(currentStep);
  }

  function bindEvents() {
    nextBtn?.addEventListener("click", handleNext);
    prevBtn?.addEventListener("click", handlePrevious);
    formEl?.addEventListener("submit", handleSubmit);

    collegeSelect?.addEventListener("change", populateDepartments);

    document.getElementById("saveDraftBtn")?.addEventListener("click", handleSaveDraft);

    document.getElementById("addTravel")?.addEventListener("click", () => addBudgetRow("travelRows", travelRowHtml));
    document.getElementById("addSupply")?.addEventListener("click", () => addBudgetRow("suppliesRows", suppliesRowHtml));
    document.getElementById("addComm")?.addEventListener("click", () => addBudgetRow("commRows", commRowHtml));
    document.getElementById("addLabor")?.addEventListener("click", () => addBudgetRow("laborRows", laborRowHtml));
    document.getElementById("addEquipmentRow")?.addEventListener("click", () => addBudgetRow("equipmentRows", equipmentRowHtml));
    addWorkplanActivityBtn?.addEventListener("click", () => addWorkplanRow());

    workplanBody?.addEventListener("change", (event) => {
      const checkbox = event.target.closest(".wp-quarter-toggle");
      if (!checkbox) return;

      const cell = checkbox.closest("td.wp-quarter-cell");
      if (!cell) return;

      cell.classList.toggle("bg-blue-600", checkbox.checked);
      cell.classList.toggle("bg-white", !checkbox.checked);
      cell.classList.toggle("hover:bg-gray-50", !checkbox.checked);
    });

    workplanBody?.addEventListener("click", (event) => {
      const removeBtn = event.target.closest(".removeWorkplanRow");
      if (!removeBtn) return;

      const row = removeBtn.closest("tr");
      if (!row) return;

      if (workplanBody.querySelectorAll("tr").length <= 1) {
        toast("At least one workplan activity row is required.");
        return;
      }

      row.remove();
    });

    workplanBody?.addEventListener("input", (event) => {
      const textarea = event.target.closest(".wp-activity");
      if (!textarea) return;
      autoResizeWorkplanActivity(textarea);
    });

    document.addEventListener("click", (event) => {
      const button = event.target.closest(".removeRow");
      if (!button) return;

      const row = button.closest("tr");
      if (!row) return;

      if (!confirm("Remove this row?")) return;

      row.remove();
      updateBudgetTotals();
    });
  }

  function toast(message) {
    alert(message);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;")
      .replaceAll("\n", "<br>");
  }

  function escapeAttr(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function money(value) {
    return Number(value || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function toNumber(value) {
    const number = Number(String(value || "").replace(/,/g, ""));
    return Number.isFinite(number) ? number : 0;
  }

  function showStep(stepNum) {
    currentStep = stepNum;

    steps.forEach((step) => {
      step.classList.toggle("hidden", Number(step.dataset.step) !== stepNum);
    });

    const index = stepOrder.indexOf(stepNum);
    const percentage = ((index + 1) / stepOrder.length) * 100;

    if (progressLine) {
      progressLine.style.width = `${percentage}%`;
    }

    document.querySelectorAll("[data-step-icon]").forEach((label) => {
      const labelStep = Number(label.getAttribute("data-step-icon"));
      const isActive = labelStep === stepNum;

      label.classList.toggle("text-urds-accent", isActive);
      label.classList.toggle("font-bold", isActive);
      label.classList.toggle("font-semibold", isActive);
    });

    if (prevBtn) {
      prevBtn.style.visibility = index === 0 ? "hidden" : "visible";
    }

    if (stepNum === 6) {
      nextBtn?.classList.add("hidden");
      finalSubmitBtn?.classList.remove("hidden");
      buildReviewSummary();
    } else {
      nextBtn?.classList.remove("hidden");
      finalSubmitBtn?.classList.add("hidden");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleNext() {
    if (!validateStep(currentStep)) return;

    const index = stepOrder.indexOf(currentStep);
    const nextStep = stepOrder[index + 1];

    if (nextStep) {
      showStep(nextStep);
    }
  }

  function handlePrevious() {
    const index = stepOrder.indexOf(currentStep);
    const previousStep = stepOrder[index - 1];

    if (previousStep) {
      showStep(previousStep);
    }
  }

  function validateStep(stepNum) {
    const fields = required[stepNum] || [];

    for (const selector of fields) {
      const element = formEl?.querySelector(selector);
      if (!element) continue;

      if (!String(element.value || "").trim()) {
        element.classList.add("border-red-500", "bg-red-50");
        element.focus();
        toast("Please complete all required fields.");
        return false;
      }

      element.classList.remove("border-red-500", "bg-red-50");
    }

    if (stepNum === 1) {
      const nature = formEl?.querySelector("select[name='nature']")?.value || "";

      if (!validateHierarchy(nature)) {
        return false;
      }
    }

    if (stepNum === 3) {
      const anySelected = getWorkplanItems().some((item) => {
        return Object.keys(item).some((key) => key.startsWith("y") && item[key]);
      });

      if (!anySelected) {
        toast("Please select at least one workplan quarter.");
        return false;
      }
    }

    return true;
  }

  function validateHierarchy(nature) {
    if (typeof window.getWizardHierarchySummary === "function") {
      const summary = window.getWizardHierarchySummary();

      if (nature === "Program") {
        if (!Array.isArray(summary.projects) || summary.projects.length < 2) {
          toast("Program proposals must have at least 2 projects.");
          return false;
        }
        return true;
      }

      if (nature === "Project") {
        if (!Array.isArray(summary.studies) || summary.studies.length < 2) {
          toast("Project proposals must have at least 2 studies.");
          return false;
        }
        return true;
      }
    }

    return true;
  }

  async function populateColleges() {
    if (!collegeSelect || !departmentSelect) return;

    try {
      const response = await fetch("../../backend/get_colleges.php");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();

      if (result.status !== "success") {
        throw new Error(result.message || "Unable to load colleges.");
      }

      collegesData = result.colleges || [];

      collegeSelect.innerHTML = `<option value="">Select college...</option>`;

      collegesData.forEach((college) => {
        const option = document.createElement("option");
        option.value = college.college_id;
        option.textContent = college.college_name;
        collegeSelect.appendChild(option);
      });

      autoPopulateUserInfo();
    } catch (error) {
      console.error("Error loading colleges:", error);
      toast("Failed to load colleges.");
    }
  }

  function populateDepartments() {
    if (!collegeSelect || !departmentSelect) return;

    const selectedCollegeId = collegeSelect.value;

    departmentSelect.innerHTML = `<option value="">Select department...</option>`;

    const college = collegesData.find((item) => String(item.college_id) === String(selectedCollegeId));

    if (!college || !Array.isArray(college.departments)) return;

    college.departments.forEach((department) => {
      const option = document.createElement("option");
      option.value = department.department_id;
      option.textContent = department.department_name;
      departmentSelect.appendChild(option);
    });
  }

  function autoPopulateUserInfo() {
    const userCollegeId = localStorage.getItem("college_id");
    const userDepartmentId = localStorage.getItem("department_id");

    if (userCollegeId && collegeSelect) {
      collegeSelect.value = userCollegeId;
      collegeSelect.dispatchEvent(new Event("change"));

      collegeSelect.disabled = true;
      collegeSelect.classList.add("bg-gray-100", "cursor-not-allowed");
    }

    if (userDepartmentId && departmentSelect) {
      setTimeout(() => {
        departmentSelect.value = userDepartmentId;
        departmentSelect.disabled = true;
        departmentSelect.classList.add("bg-gray-100", "cursor-not-allowed");
      }, 250);
    }
  }

  function quarterTileCell(className) {
    return `
      <td class="wp-quarter-cell border p-0 text-center align-middle bg-white hover:bg-gray-50 transition-colors">
        <label class="block w-full h-full cursor-pointer select-none">
          <input type="checkbox" class="wp-quarter-toggle wp-tile sr-only ${className}" aria-label="Quarter selection">
          <span class="block w-full h-full min-h-[44px]" aria-hidden="true"></span>
        </label>
      </td>
    `;
  }

  function autoResizeWorkplanActivity(textarea) {
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.max(44, textarea.scrollHeight)}px`;
  }

  function renderWorkplanTable() {
    if (!workplanBody) return;

    workplanBody.innerHTML = "";

    for (let i = 0; i < INITIAL_WORKPLAN_ROWS; i++) {
      addWorkplanRow();
    }
  }

  function addWorkplanRow(activity = "") {
    if (!workplanBody) return;

    const tr = document.createElement("tr");

    let quarterCells = "";

    for (let year = 1; year <= 3; year++) {
      for (let quarter = 1; quarter <= 4; quarter++) {
        quarterCells += quarterTileCell(`wp-y${year}_q${quarter}`);
      }
    }

    tr.innerHTML = `
      <td class="border px-3 py-2 align-top min-w-[18rem] w-[20rem]">
        <textarea
          rows="1"
          class="wp-activity w-full border-0 bg-transparent focus:outline-none focus:ring-2 focus:ring-urds-accent p-0 resize-none overflow-hidden leading-5"
          placeholder="Describe the activity..."
        >${escapeHtml(activity)}</textarea>
      </td>
      ${quarterCells}
      <td class="border text-center py-2">
        <button type="button" class="removeWorkplanRow trash-btn text-red-500 hover:text-red-700 text-xs leading-none w-6 h-6 rounded hover:bg-red-50" aria-label="Remove activity row">❌</button>
      </td>
    `;

    workplanBody.appendChild(tr);

    const textarea = tr.querySelector(".wp-activity");
    autoResizeWorkplanActivity(textarea);
  }

  function getWorkplanItems() {
    if (!workplanBody) return [];

    return Array.from(workplanBody.querySelectorAll("tr")).map((row) => {
      const item = {
        activity: row.querySelector(".wp-activity")?.value || ""
      };

      for (let year = 1; year <= 3; year++) {
        for (let quarter = 1; quarter <= 4; quarter++) {
          const key = `y${year}_q${quarter}`;
          item[key] = row.querySelector(`.wp-${key}`)?.checked || false;
        }
      }

      return item;
    });
  }

  function updateBudgetTotals() {
    const ps = sumSection("psRows", [".y1", ".y2", ".y3"]);
    const travel = sumSection("travelRows", [".y1", ".y2", ".y3"]);
    const supplies = sumSection("suppliesRows", [".y1", ".y2", ".y3"]);
    const comm = sumSection("commRows", [".y1", ".y2", ".y3"]);
    const labor = sumSection("laborRows", [".y1", ".y2", ".y3"]);
    const equipment = sumSection("equipmentRows", [".y1", ".y2", ".y3"]);

    setTotal("psTotalY1", ps[0]);
    setTotal("psTotalY2", ps[1]);
    setTotal("psTotalY3", ps[2]);

    setTotal("travelTotalY1", travel[0]);
    setTotal("travelTotalY2", travel[1]);
    setTotal("travelTotalY3", travel[2]);

    setTotal("suppliesTotalY1", supplies[0]);
    setTotal("suppliesTotalY2", supplies[1]);
    setTotal("suppliesTotalY3", supplies[2]);

    setTotal("commTotalY1", comm[0]);
    setTotal("commTotalY2", comm[1]);
    setTotal("commTotalY3", comm[2]);

    setTotal("laborTotalY1", labor[0]);
    setTotal("laborTotalY2", labor[1]);
    setTotal("laborTotalY3", labor[2]);

    setTotal("equipmentTotalY1", equipment[0]);
    setTotal("equipmentTotalY2", equipment[1]);
    setTotal("equipmentTotalY3", equipment[2]);

    const grandTotal =
      ps.reduce((a, b) => a + b, 0) +
      travel.reduce((a, b) => a + b, 0) +
      supplies.reduce((a, b) => a + b, 0) +
      comm.reduce((a, b) => a + b, 0) +
      labor.reduce((a, b) => a + b, 0) +
      equipment.reduce((a, b) => a + b, 0);

    const grandTotalEl = document.getElementById("grandTotal");
    if (grandTotalEl) {
      grandTotalEl.textContent = `₱${money(grandTotal)}`;
    }
  }

  function sumSection(sectionId, selectors) {
    const totals = [0, 0, 0];
    const section = document.getElementById(sectionId);

    section?.querySelectorAll("tr.entry").forEach((row) => {
      selectors.forEach((selector, index) => {
        totals[index] += toNumber(row.querySelector(selector)?.value);
      });
    });

    return totals;
  }

  function setTotal(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = `₱${money(value)}`;
  }

  function attachBudgetListeners() {
    document
      .querySelectorAll("#psRows input, #travelRows input, #suppliesRows input, #commRows input, #laborRows input, #equipmentRows input")
      .forEach((input) => {
        input.removeEventListener("input", updateBudgetTotals);
        input.addEventListener("input", updateBudgetTotals);
      });
  }

  function addBudgetRow(tbodyId, rowBuilder) {
    const tbody = document.getElementById(tbodyId);
    const totalRow = tbody?.querySelector(".bg-gray-50");

    if (!tbody || !totalRow) return;

    const row = document.createElement("tr");
    row.className = "entry";
    row.innerHTML = rowBuilder();

    tbody.insertBefore(row, totalRow);

    attachBudgetListeners();
    updateBudgetTotals();
  }

  function smallDeleteBtn() {
    return `
      <button type="button" class="removeRow text-red-600 hover:text-red-700 text-xs font-bold w-7 h-7 rounded-lg hover:bg-red-50">
        ✕
      </button>
    `;
  }

  function travelRowHtml() {
    return `
      <td class="border"><input class="table-input" placeholder="mm/dd/yyyy"></td>
      <td class="border"><input class="table-input"></td>
      <td class="border"><input class="table-input"></td>
      <td class="border"><input class="table-input"></td>
      <td class="border"><input type="number" class="table-input text-right"></td>
      <td class="border"><input type="number" class="y1 table-input text-right"></td>
      <td class="border"><input type="number" class="y2 table-input text-right"></td>
      <td class="border"><input type="number" class="y3 table-input text-right"></td>
      <td class="border text-center">${smallDeleteBtn()}</td>
    `;
  }

  function suppliesRowHtml() {
    return `
      <td class="border"><input class="table-input" placeholder="mm/dd/yyyy"></td>
      <td class="border"><input class="table-input"></td>
      <td class="border"><input class="table-input"></td>
      <td class="border"><input class="table-input"></td>
      <td class="border"><input type="number" class="table-input"></td>
      <td class="border"><input type="number" class="table-input text-right"></td>
      <td class="border"><input type="number" class="y1 table-input text-right"></td>
      <td class="border"><input type="number" class="y2 table-input text-right"></td>
      <td class="border"><input type="number" class="y3 table-input text-right"></td>
      <td class="border text-center">${smallDeleteBtn()}</td>
    `;
  }

  function commRowHtml() {
    return `
      <td class="border"><input class="table-input" placeholder="mm/dd/yyyy"></td>
      <td class="border"><input class="table-input"></td>
      <td class="border"><input class="table-input"></td>
      <td class="border"><input type="number" class="table-input"></td>
      <td class="border"><input type="number" class="table-input text-right"></td>
      <td class="border"><input type="number" class="y1 table-input text-right"></td>
      <td class="border"><input type="number" class="y2 table-input text-right"></td>
      <td class="border"><input type="number" class="y3 table-input text-right"></td>
      <td class="border text-center">${smallDeleteBtn()}</td>
    `;
  }

  function laborRowHtml() {
    return `
      <td class="border"><input class="table-input" placeholder="mm/dd/yyyy"></td>
      <td class="border"><input class="table-input"></td>
      <td class="border"><input class="table-input"></td>
      <td class="border"><input class="table-input"></td>
      <td class="border"><input type="number" class="table-input text-right"></td>
      <td class="border"><input type="number" class="y1 table-input text-right"></td>
      <td class="border"><input type="number" class="y2 table-input text-right"></td>
      <td class="border"><input type="number" class="y3 table-input text-right"></td>
      <td class="border text-center">${smallDeleteBtn()}</td>
    `;
  }

  function equipmentRowHtml() {
    return `
      <td class="border"><input class="table-input" placeholder="mm/dd/yyyy"></td>
      <td class="border"><input class="table-input"></td>
      <td class="border"><input class="table-input"></td>
      <td class="border"><input class="table-input"></td>
      <td class="border"><input class="table-input"></td>
      <td class="border"><input type="number" class="table-input text-right"></td>
      <td class="border"><input type="number" class="y1 table-input text-right"></td>
      <td class="border"><input type="number" class="y2 table-input text-right"></td>
      <td class="border"><input type="number" class="y3 table-input text-right"></td>
      <td class="border text-center">${smallDeleteBtn()}</td>
    `;
  }

  function buildReviewSummary() {
    const review = document.getElementById("reviewBox");
    if (!review || !formEl) return;

    const fd = new FormData(formEl);
    const workplan = getWorkplanItems();
    const proposalFileName = document.getElementById("fileProposal")?.files?.[0]?.name || "None";

    review.innerHTML = `
      <h3 class="text-lg font-semibold mb-3">Review Your Submission</h3>

      <div class="space-y-3">
        <div><strong>Title:</strong> ${escapeHtml(fd.get("title"))}</div>
        <div><strong>Research Type:</strong> ${escapeHtml(fd.get("research_type"))}</div>
        <div><strong>Nature:</strong> ${escapeHtml(fd.get("nature"))}</div>
        <div><strong>Cluster:</strong> ${escapeHtml(fd.get("cluster"))}</div>
        <div><strong>College:</strong> ${escapeHtml(fd.get("college"))}</div>
        <div><strong>Department:</strong> ${escapeHtml(fd.get("department"))}</div>
        <div><strong>Study Leader:</strong> ${escapeHtml(fd.get("leader"))}</div>
        <div><strong>Personnel:</strong> ${escapeHtml(fd.get("personnel"))}</div>
        <div><strong>Location:</strong> ${escapeHtml(fd.get("location"))}</div>
        <div><strong>Duration:</strong> ${escapeHtml(fd.get("duration"))} months</div>
        <div><strong>Estimated Budget:</strong> ₱${money(fd.get("budgetYear") || 0)}</div>

        <hr>

        <div><strong>Rationale:</strong><div class="pl-3">${escapeHtml(fd.get("rationale"))}</div></div>
        <div><strong>Objectives:</strong><div class="pl-3">${escapeHtml(fd.get("objectives"))}</div></div>
        <div><strong>Review of Literature:</strong><div class="pl-3">${escapeHtml(fd.get("literature"))}</div></div>
        <div><strong>Methodology:</strong><div class="pl-3">${escapeHtml(fd.get("methodology"))}</div></div>

        <hr>

        <h4 class="font-semibold">Workplan</h4>
        <div class="overflow-x-auto">
          <table class="w-full text-sm border">
            <thead class="bg-gray-100">
              <tr>
                <th class="border px-2">Activity</th>
                <th class="border">Y1 Q1</th>
                <th class="border">Y1 Q2</th>
                <th class="border">Y1 Q3</th>
                <th class="border">Y1 Q4</th>
                <th class="border">Y2 Q1</th>
                <th class="border">Y2 Q2</th>
                <th class="border">Y2 Q3</th>
                <th class="border">Y2 Q4</th>
                <th class="border">Y3 Q1</th>
                <th class="border">Y3 Q2</th>
                <th class="border">Y3 Q3</th>
                <th class="border">Y3 Q4</th>
              </tr>
            </thead>
            <tbody>
              ${workplan.map((item) => `
                <tr>
                  <td class="border px-2">${escapeHtml(item.activity)}</td>
                  ${["y1_q1","y1_q2","y1_q3","y1_q4","y2_q1","y2_q2","y2_q3","y2_q4","y3_q1","y3_q2","y3_q3","y3_q4"]
                    .map((key) => `<td class="border text-center">${item[key] ? "✔" : "—"}</td>`)
                    .join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <hr>

        <div><strong>Proposal File:</strong> ${escapeHtml(proposalFileName)}</div>
      </div>
    `;
  }

  function collectPersonalServices() {
    return Array.from(document.querySelectorAll("#psRows tr.entry")).map((row) => {
      const cells = row.querySelectorAll("td");

      return {
        item: (cells[0]?.textContent || "").trim(),
        q1: toNumber(cells[1]?.querySelector("input")?.value),
        q2: toNumber(cells[2]?.querySelector("input")?.value),
        q3: toNumber(cells[3]?.querySelector("input")?.value),
        q4: toNumber(cells[4]?.querySelector("input")?.value),
        year1: toNumber(cells[5]?.querySelector("input")?.value),
        year2: toNumber(cells[6]?.querySelector("input")?.value),
        year3: toNumber(cells[7]?.querySelector("input")?.value),
        total:
          toNumber(cells[5]?.querySelector("input")?.value) +
          toNumber(cells[6]?.querySelector("input")?.value) +
          toNumber(cells[7]?.querySelector("input")?.value)
      };
    });
  }

  function collectMooeRows() {
    const mooe = [];

    Array.from(document.querySelectorAll("#travelRows tr.entry")).forEach((row) => {
      const inputs = row.querySelectorAll("input");
      mooe.push({
        type: "Travel",
        date_field: inputs[0]?.value || "",
        places: inputs[1]?.value || "",
        purpose: inputs[2]?.value || "",
        mode_of_transport: inputs[3]?.value || "",
        unit: "",
        description: "",
        qty: 0,
        unit_cost: 0,
        year1: toNumber(inputs[5]?.value),
        year2: toNumber(inputs[6]?.value),
        year3: toNumber(inputs[7]?.value),
        estimated_cost: toNumber(inputs[4]?.value),
        total: toNumber(inputs[5]?.value) + toNumber(inputs[6]?.value) + toNumber(inputs[7]?.value)
      });
    });

    Array.from(document.querySelectorAll("#suppliesRows tr.entry")).forEach((row) => {
      const inputs = row.querySelectorAll("input");
      mooe.push({
        type: "Supplies",
        date_field: inputs[0]?.value || "",
        places: "",
        purpose: inputs[3]?.value || "",
        mode_of_transport: "",
        unit: inputs[1]?.value || "",
        description: inputs[2]?.value || "",
        qty: toNumber(inputs[4]?.value),
        unit_cost: toNumber(inputs[5]?.value),
        year1: toNumber(inputs[6]?.value),
        year2: toNumber(inputs[7]?.value),
        year3: toNumber(inputs[8]?.value),
        estimated_cost: toNumber(inputs[5]?.value),
        total: toNumber(inputs[6]?.value) + toNumber(inputs[7]?.value) + toNumber(inputs[8]?.value)
      });
    });

    Array.from(document.querySelectorAll("#commRows tr.entry")).forEach((row) => {
      const inputs = row.querySelectorAll("input");
      mooe.push({
        type: "Communications",
        date_field: inputs[0]?.value || "",
        places: "",
        purpose: inputs[2]?.value || "",
        mode_of_transport: "",
        unit: inputs[1]?.value || "",
        description: inputs[1]?.value || "",
        qty: toNumber(inputs[3]?.value),
        unit_cost: toNumber(inputs[4]?.value),
        year1: toNumber(inputs[5]?.value),
        year2: toNumber(inputs[6]?.value),
        year3: toNumber(inputs[7]?.value),
        estimated_cost: toNumber(inputs[4]?.value),
        total: toNumber(inputs[5]?.value) + toNumber(inputs[6]?.value) + toNumber(inputs[7]?.value)
      });
    });

    Array.from(document.querySelectorAll("#laborRows tr.entry")).forEach((row) => {
      const inputs = row.querySelectorAll("input");
      mooe.push({
        type: "Contract Labor",
        date_field: inputs[0]?.value || "",
        places: "",
        purpose: inputs[2]?.value || "",
        mode_of_transport: "",
        unit: "days",
        description: inputs[1]?.value || "",
        qty: toNumber(inputs[3]?.value),
        unit_cost: toNumber(inputs[4]?.value),
        year1: toNumber(inputs[5]?.value),
        year2: toNumber(inputs[6]?.value),
        year3: toNumber(inputs[7]?.value),
        estimated_cost: toNumber(inputs[4]?.value),
        total: toNumber(inputs[5]?.value) + toNumber(inputs[6]?.value) + toNumber(inputs[7]?.value)
      });
    });

    return mooe;
  }

  function collectEquipmentRows() {
    return Array.from(document.querySelectorAll("#equipmentRows tr.entry")).map((row) => {
      const inputs = row.querySelectorAll("input");

      return {
        date_field: inputs[0]?.value || "",
        unit: inputs[1]?.value || "",
        description: inputs[2]?.value || "",
        purpose: inputs[3]?.value || "",
        qty: toNumber(inputs[4]?.value),
        estimated_cost: toNumber(inputs[5]?.value),
        year1: toNumber(inputs[6]?.value),
        year2: toNumber(inputs[7]?.value),
        year3: toNumber(inputs[8]?.value),
        total: toNumber(inputs[6]?.value) + toNumber(inputs[7]?.value) + toNumber(inputs[8]?.value)
      };
    });
  }

  function buildHierarchyRows(nature, title) {
    if (typeof window.getWizardHierarchyRows === "function") {
      const rows = window.getWizardHierarchyRows();
      if (Array.isArray(rows) && rows.length) {
        return rows;
      }
    }

    const projectPicker = document.getElementById("projectPicker");
    const studyPicker = document.getElementById("studyPicker");

    const projects = Array.from(projectPicker?.options || [])
      .map((option) => option.textContent?.trim())
      .filter(Boolean);

    const studies = Array.from(studyPicker?.options || [])
      .map((option) => option.textContent?.trim())
      .filter(Boolean);

    if (nature === "Study") {
      return [{
        project_name: null,
        study_name: String(title || "Untitled Study").trim(),
        project_order: 1,
        study_order: 1
      }];
    }

    if (nature === "Project") {
      const projectName = String(title || "Untitled Project").trim();
      const finalStudies = studies.length ? studies : [projectName];
      return finalStudies.map((studyName, index) => ({
        project_name: projectName,
        study_name: studyName,
        project_order: 1,
        study_order: index + 1
      }));
    }

    if (nature === "Program") {
      const finalProjects = projects.length ? projects : [String(title || "Untitled Program").trim()];
      const finalStudies = studies.length ? studies : ["Study 1"];

      return finalProjects.flatMap((projectName, projectIndex) => {
        return finalStudies.map((studyName, studyIndex) => ({
          project_name: projectName,
          study_name: studyName,
          project_order: projectIndex + 1,
          study_order: studyIndex + 1
        }));
      });
    }

    return [];
  }

  function getComputedBudgetTotal() {
    const grandTotalEl = document.getElementById("grandTotal");
    if (!grandTotalEl) return 0;

    const numeric = grandTotalEl.textContent
      .replace(/[₱,\s]/g, "")
      .trim();

    return toNumber(numeric);
  }

  function buildPayload(status = "for screening") {
    const fd = new FormData(formEl);
    const disabled = unlockDisabledFields();

    const budget = {
      personalServices: collectPersonalServices(),
      mooe: collectMooeRows(),
      equipment: collectEquipmentRows()
    };

    const title = fd.get("title") || "";
    const nature = fd.get("nature") || "";
    const hierarchy = buildHierarchyRows(nature, title);

    const payload = {
      program_title: title,
      program_description: title,
      nature,
      research_cluster: fd.get("cluster"),
      research_type: fd.get("research_type"),
      research_type_other: fd.get("research_type_other"),
      college_id: fd.get("college"),
      department_id: fd.get("department"),
      study_leader: fd.get("leader"),
      other_personnel: fd.get("personnel"),
      project_location: fd.get("location"),
      duration_months: fd.get("duration"),
      estimated_budget: fd.get("budgetYear") || 0,
      rationale: fd.get("rationale"),
      objectives: fd.get("objectives"),
      literature: fd.get("literature"),
      methodology: fd.get("methodology"),
      expected_output: fd.get("output"),
      impact: fd.get("impact"),
      workplan: JSON.stringify(getWorkplanItems()),
      budget: JSON.stringify(budget),
      hierarchy: JSON.stringify(hierarchy),
      computed_budget_total: getComputedBudgetTotal(),
      status,
      user_id: parseInt(localStorage.getItem("userId"), 10) || 1
    };

    relockDisabledFields(disabled);

    return payload;
  }

  function unlockDisabledFields() {
    const fields = [collegeSelect, departmentSelect].filter(Boolean);

    const disabled = fields.filter((field) => field.disabled);

    disabled.forEach((field) => {
      field.disabled = false;
    });

    return disabled;
  }

  function relockDisabledFields(fields) {
    fields.forEach((field) => {
      field.disabled = true;
    });
  }

  async function handleSaveDraft() {
    const payload = buildPayload("draft");
    await sendProposal(payload, "Draft saved successfully!");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    for (const step of stepOrder) {
      if (step === 6) continue;

      if (!validateStep(step)) {
        showStep(step);
        return;
      }
    }

    const payload = buildPayload("for screening");
    await sendProposal(payload, "Proposal submitted successfully!");
  }

  async function sendProposal(payload, successMessage) {
    const proposalFile = document.getElementById("fileProposal")?.files?.[0] || null;

    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));

      if (proposalFile) {
        formData.append("proposal_file", proposalFile);
      }

      const response = await fetch("../../backend/submit_proposal.php", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Server returned error: ${response.status}`);
      }

      const result = await response.json();

      if (result.status !== "success") {
        throw new Error(result.message || "Request failed.");
      }

      toast(successMessage);

      setTimeout(() => {
        window.location.href = "my_proposals.html";
      }, 1000);
    } catch (error) {
      console.error(error);
      toast(error.message || "Something went wrong.");
    }
  }
});
