document.addEventListener("DOMContentLoaded", async () => {
  "use strict";

  // =========================================================
  // UEP-URDS Research Management System
  // Proposal Preview Script
  // =========================================================

  const previewContent = document.getElementById("previewContent");
  const backBtn = document.getElementById("backBtn");
  const printBtn = document.getElementById("printBtn");

  const historyToggle = document.getElementById("historyToggle");
  const historyPanel = document.getElementById("historyPanel");
  const historyChevron = document.getElementById("historyChevron");

  const urlParams = new URLSearchParams(window.location.search);
  const proposalId = urlParams.get("id") || localStorage.getItem("viewProposalId");

  const STATUS_META = {
    draft: {
      label: "Draft",
      badge: "bg-gray-100 text-gray-700"
    },
    pending: {
      label: "Submitted / Pending",
      badge: "bg-yellow-100 text-yellow-800"
    },
    review: {
      label: "Under Review",
      badge: "bg-blue-100 text-blue-800"
    },
    returned: {
      label: "Returned for Revision",
      badge: "bg-orange-100 text-orange-800"
    },
    approved: {
      label: "Approved / Completed",
      badge: "bg-green-100 text-green-800"
    },
    ongoing: {
      label: "Ongoing / Implementation",
      badge: "bg-teal-100 text-teal-800"
    },
    rejected: {
      label: "Rejected / Terminated",
      badge: "bg-red-100 text-red-800"
    }
  };

  // =========================================================
  // Events
  // =========================================================

  backBtn?.addEventListener("click", () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "proposal_list.html";
    }
  });

  printBtn?.addEventListener("click", () => {
    window.print();
  });

  historyToggle?.addEventListener("click", () => {
    if (!historyPanel || !historyChevron) return;

    const isHidden = historyPanel.classList.toggle("hidden");
    historyChevron.textContent = isHidden ? "▾" : "▴";
  });

  if (!proposalId) {
    if (previewContent) {
      previewContent.innerHTML = emptyState(
        "No proposal selected. Please go back and click View Full from the proposal list."
      );
    }
    return;
  }

  localStorage.setItem("viewProposalId", proposalId);

  if (previewContent) {
    previewContent.innerHTML = loadingState("Loading proposal preview...");
  }

  await loadProposal(proposalId);

  // =========================================================
  // Load proposal
  // =========================================================

  async function loadProposal(id) {
    try {
      const response = await fetch(`../../backend/get_proposal.php?id=${encodeURIComponent(id)}`, {
        method: "GET",
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const text = await response.text();

      let result;
      try {
        result = JSON.parse(text);
      } catch (error) {
        console.error("Invalid JSON response:", text);
        throw new Error("Server returned an invalid JSON response.");
      }

      if (result.status === "success" || result.success === true) {
        const proposal = result.proposal || result.data || {};

        renderProposal(proposal);
        renderHistory(
          proposal.history ||
          proposal.screeningHistory ||
          proposal.reviewHistory ||
          proposal.logs ||
          []
        );

        return;
      }

      const message = result.message || result.error || "Proposal not found.";

      if (previewContent) {
        previewContent.innerHTML = emptyState(message);
      }

      if (String(message).toLowerCase().includes("not logged in")) {
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1200);
      }
    } catch (error) {
      console.error("Error fetching proposal:", error);

      if (previewContent) {
        previewContent.innerHTML = emptyState(`Failed to load proposal. ${error.message}`);
      }
    }
  }

  // =========================================================
  // Render proposal
  // =========================================================

  function renderProposal(proposal) {
    const container = document.getElementById("previewContent");
    if (!container) return;

    const p = normalizeProposal(proposal);

    const submitted = safeDateTime(p.dateSubmitted);
    const status = p.status || "Submitted";

    const workplan = getArrayValue(p.workplan);
    const budget = parseMaybeJson(p.budget) || {};

    const personalServices = getArrayFromKeys(budget, [
      "personalServices",
      "personal_services",
      "ps",
      "personalService"
    ]);

    const mooe = getArrayFromKeys(budget, [
      "mooe",
      "MOOE",
      "mooe_items",
      "mooeItems"
    ]);

    const equipment = getArrayFromKeys(budget, [
      "equipment",
      "equipment_items",
      "equipmentItems",
      "eq"
    ]);

    const workplanRows = renderWorkplanRows(workplan);

    const psTotals = calculatePersonalServiceTotals(personalServices);
    const mooeTotals = calculateYearTotals(mooe);
    const equipmentTotals = calculateYearTotals(equipment);

    const psTotal = psTotals.year1 + psTotals.year2 + psTotals.year3;
    const mooeTotal = mooeTotals.year1 + mooeTotals.year2 + mooeTotals.year3;
    const equipmentTotal = equipmentTotals.year1 + equipmentTotals.year2 + equipmentTotals.year3;
    const grandTotal = psTotal + mooeTotal + equipmentTotal;

    container.innerHTML = `
      <div class="space-y-6">

        <!-- Proposal header -->
        <section class="border-b border-gray-200 pb-5">
          <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div class="min-w-0">
              <div class="text-xs text-gray-500">
                Submitted: ${escapeHtml(submitted || "-")}
              </div>

              <h2 class="text-2xl font-bold text-gray-900 mt-2">
                ${escapeHtml(p.title || "Untitled Proposal")}
              </h2>

              <div class="text-sm text-gray-700 mt-2">
                Leader:
                <span class="font-semibold">${escapeHtml(p.leader || "")}</span>
                ${
                  p.college || p.department
                    ? ` • ${escapeHtml(p.college || "")}${p.department ? " / " + escapeHtml(p.department) : ""}`
                    : ""
                }
              </div>

              <div class="text-sm text-gray-700 mt-1">
                Cluster:
                <span class="font-semibold">${escapeHtml(p.cluster || "-")}</span>
                ${p.nature ? ` • Nature: ${escapeHtml(p.nature)}` : ""}
                ${p.duration ? ` • Duration: ${escapeHtml(p.duration)} month(s)` : ""}
              </div>
            </div>

            <div class="shrink-0">
              ${statusBadgeHtml(status)}
            </div>
          </div>
        </section>

        <!-- Summary cards -->
        <section class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div class="text-xs text-gray-500">Current Status</div>
            <div class="mt-2">${statusBadgeHtml(status)}</div>
          </div>

          <div class="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div class="text-xs text-gray-500">Total Budget</div>
            <div class="text-xl font-bold text-gray-900 mt-1">₱ ${money(grandTotal)}</div>
          </div>

          <div class="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div class="text-xs text-gray-500">Duration</div>
            <div class="text-xl font-bold text-gray-900 mt-1">
              ${escapeHtml(p.duration || "-")} ${p.duration ? "month(s)" : ""}
            </div>
          </div>
        </section>

        <!-- Rationale -->
        <section>
          <h3 class="text-lg font-bold text-gray-900">Rationale / Significance</h3>
          <div class="text-sm text-gray-700 mt-2 leading-relaxed">
            ${paragraphHtml(p.rationale || p.description || p.program || "")}
          </div>
        </section>

        <!-- Objectives -->
        <section>
          <h3 class="text-lg font-bold text-gray-900">Objectives</h3>
          <div class="text-sm text-gray-700 mt-2 leading-relaxed">
            ${paragraphHtml(Array.isArray(p.objectives) ? p.objectives.join("\n") : p.objectives || "")}
          </div>
        </section>

        <!-- Review of Literature -->
        <section>
          <h3 class="text-lg font-bold text-gray-900">Review of Literature</h3>
          <div class="text-sm text-gray-700 mt-2 leading-relaxed">
            ${paragraphHtml(p.literature || "")}
          </div>
        </section>

        <!-- Methodology -->
        <section>
          <h3 class="text-lg font-bold text-gray-900">Methodology</h3>
          <div class="text-sm text-gray-700 mt-2 leading-relaxed">
            ${paragraphHtml(p.methodology || "")}
          </div>
        </section>

        <!-- Workplan -->
        <section>
          <h3 class="text-lg font-bold text-gray-900">Workplan - 3-Year Timeline</h3>

          <div class="overflow-x-auto mt-3">
            <table class="w-full table-auto border-collapse text-sm">
              <thead class="bg-gray-100">
                <tr>
                  <th class="border px-2 py-2 text-left" rowspan="2">Activity</th>
                  <th class="border px-2 py-2 text-center" colspan="4">Year 1</th>
                  <th class="border px-2 py-2 text-center" colspan="4">Year 2</th>
                  <th class="border px-2 py-2 text-center" colspan="4">Year 3</th>
                </tr>
                <tr>
                  <th class="border px-2 py-1 text-center text-xs">Q1</th>
                  <th class="border px-2 py-1 text-center text-xs">Q2</th>
                  <th class="border px-2 py-1 text-center text-xs">Q3</th>
                  <th class="border px-2 py-1 text-center text-xs">Q4</th>
                  <th class="border px-2 py-1 text-center text-xs">Q1</th>
                  <th class="border px-2 py-1 text-center text-xs">Q2</th>
                  <th class="border px-2 py-1 text-center text-xs">Q3</th>
                  <th class="border px-2 py-1 text-center text-xs">Q4</th>
                  <th class="border px-2 py-1 text-center text-xs">Q1</th>
                  <th class="border px-2 py-1 text-center text-xs">Q2</th>
                  <th class="border px-2 py-1 text-center text-xs">Q3</th>
                  <th class="border px-2 py-1 text-center text-xs">Q4</th>
                </tr>
              </thead>
              <tbody>
                ${workplanRows}
              </tbody>
            </table>
          </div>
        </section>

        <!-- Budget -->
        <section>
          <h3 class="text-lg font-bold text-gray-900">Financial Components - FM-005</h3>

          <div class="mt-4">
            <div class="text-sm font-bold mb-2">I. Personal Services</div>

            <div class="overflow-x-auto">
              <table class="w-full table-auto border-collapse text-sm">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="border px-2 py-2 text-left">Item</th>
                    <th class="border px-2 py-2 text-center">Q1</th>
                    <th class="border px-2 py-2 text-center">Q2</th>
                    <th class="border px-2 py-2 text-center">Q3</th>
                    <th class="border px-2 py-2 text-center">Q4</th>
                    <th class="border px-2 py-2 text-center">Year 1</th>
                    <th class="border px-2 py-2 text-center">Year 2</th>
                    <th class="border px-2 py-2 text-center">Year 3</th>
                  </tr>
                </thead>

                <tbody>
                  ${renderPersonalServicesRows(personalServices)}
                </tbody>

                ${
                  personalServices.length
                    ? `
                      <tfoot class="bg-gray-50 font-bold">
                        <tr>
                          <td class="border px-2 py-2 text-right">Total</td>
                          <td class="border px-2 py-2 text-right">₱${money(psTotals.q1)}</td>
                          <td class="border px-2 py-2 text-right">₱${money(psTotals.q2)}</td>
                          <td class="border px-2 py-2 text-right">₱${money(psTotals.q3)}</td>
                          <td class="border px-2 py-2 text-right">₱${money(psTotals.q4)}</td>
                          <td class="border px-2 py-2 text-right">₱${money(psTotals.year1)}</td>
                          <td class="border px-2 py-2 text-right">₱${money(psTotals.year2)}</td>
                          <td class="border px-2 py-2 text-right">₱${money(psTotals.year3)}</td>
                        </tr>
                      </tfoot>
                    `
                    : ""
                }
              </table>
            </div>
          </div>

          <div class="mt-5">
            <div class="text-sm font-bold mb-2">II. MOOE - Maintenance and Other Operating Expenses</div>

            <div class="overflow-x-auto">
              <table class="w-full table-auto border-collapse text-sm">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="border px-2 py-2">Date</th>
                    <th class="border px-2 py-2">Description</th>
                    <th class="border px-2 py-2">Purpose</th>
                    <th class="border px-2 py-2">Qty</th>
                    <th class="border px-2 py-2">Unit Cost</th>
                    <th class="border px-2 py-2 text-center">Year 1</th>
                    <th class="border px-2 py-2 text-center">Year 2</th>
                    <th class="border px-2 py-2 text-center">Year 3</th>
                  </tr>
                </thead>

                <tbody>
                  ${renderMooeRows(mooe)}
                </tbody>

                ${
                  mooe.length
                    ? `
                      <tfoot class="bg-gray-50 font-bold">
                        <tr>
                          <td colspan="5" class="border px-2 py-2 text-right">Total</td>
                          <td class="border px-2 py-2 text-right">₱${money(mooeTotals.year1)}</td>
                          <td class="border px-2 py-2 text-right">₱${money(mooeTotals.year2)}</td>
                          <td class="border px-2 py-2 text-right">₱${money(mooeTotals.year3)}</td>
                        </tr>
                      </tfoot>
                    `
                    : ""
                }
              </table>
            </div>
          </div>

          <div class="mt-5">
            <div class="text-sm font-bold mb-2">III. Equipment Outlay</div>

            <div class="overflow-x-auto">
              <table class="w-full table-auto border-collapse text-sm">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="border px-2 py-2">Date</th>
                    <th class="border px-2 py-2">Unit</th>
                    <th class="border px-2 py-2">Item Description</th>
                    <th class="border px-2 py-2">Purpose</th>
                    <th class="border px-2 py-2">Qty</th>
                    <th class="border px-2 py-2">Estimated Cost</th>
                    <th class="border px-2 py-2 text-center">Year 1</th>
                    <th class="border px-2 py-2 text-center">Year 2</th>
                    <th class="border px-2 py-2 text-center">Year 3</th>
                  </tr>
                </thead>

                <tbody>
                  ${renderEquipmentRows(equipment)}
                </tbody>

                ${
                  equipment.length
                    ? `
                      <tfoot class="bg-gray-50 font-bold">
                        <tr>
                          <td colspan="6" class="border px-2 py-2 text-right">Total</td>
                          <td class="border px-2 py-2 text-right">₱${money(equipmentTotals.year1)}</td>
                          <td class="border px-2 py-2 text-right">₱${money(equipmentTotals.year2)}</td>
                          <td class="border px-2 py-2 text-right">₱${money(equipmentTotals.year3)}</td>
                        </tr>
                      </tfoot>
                    `
                    : ""
                }
              </table>
            </div>
          </div>

          <div class="mt-5 p-4 bg-urds-900 text-white rounded-xl">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span class="font-bold text-lg">Grand Total Budget</span>
              <span class="font-extrabold text-2xl">₱ ${money(grandTotal)}</span>
            </div>
          </div>
        </section>

        <!-- Attached files -->
        <section>
          <h3 class="text-lg font-bold text-gray-900">Attached Files</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
            ${p.proposalFile ? createFilePreview(p.proposalFile, "Research Proposal") : ""}
            ${p.workplanFile ? createFilePreview(p.workplanFile, "Workplan Document") : ""}
            ${p.budgetFile ? createFilePreview(p.budgetFile, "Budget Document") : ""}
          </div>

          ${
            !p.proposalFile && !p.workplanFile && !p.budgetFile
              ? `
                <div class="text-center py-6 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200 mt-3">
                  No files uploaded.
                </div>
              `
              : ""
          }
        </section>

        <!-- Final status -->
        <section class="border-t border-gray-200 pt-5">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div class="text-sm text-gray-500">Final Displayed Status</div>
              <div class="mt-1">${statusBadgeHtml(status)}</div>
            </div>
          </div>
        </section>

      </div>
    `;
  }

  // =========================================================
  // Render history
  // =========================================================

  function renderHistory(historyArr) {
    const panel = document.getElementById("historyPanel");
    if (!panel) return;

    if (!Array.isArray(historyArr) || historyArr.length === 0) {
      panel.innerHTML = `
        <div class="text-gray-500">
          No review history yet.
        </div>
      `;
      return;
    }

    const sorted = [...historyArr].sort((a, b) => {
      const da = safeDate(a.date || a.created_at || a.reviewed_at)?.getTime() || 0;
      const db = safeDate(b.date || b.created_at || b.reviewed_at)?.getTime() || 0;
      return da - db;
    });

    panel.innerHTML = sorted
      .map((history) => {
        const role =
          history.role ||
          history.coordinator ||
          history.reviewer ||
          history.user ||
          "Unknown";

        const date =
          history.date ||
          history.created_at ||
          history.reviewed_at ||
          "";

        const action =
          history.action ||
          history.decision ||
          history.status ||
          "Updated";

        const comment =
          history.comment ||
          history.remarks ||
          history.comments ||
          "";

        return `
          <div class="border border-gray-200 rounded-xl p-4">
            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
              <div>
                <div class="font-semibold text-gray-900">
                  ${escapeHtml(role)}
                </div>
                <div class="text-xs text-gray-500 mt-0.5">
                  ${escapeHtml(safeDateTime(date) || "-")}
                </div>
              </div>

              <div>
                ${statusBadgeHtml(action)}
              </div>
            </div>

            ${
              comment
                ? `
                  <div class="mt-3 text-sm text-gray-700">
                    <strong>Comment:</strong>
                    <div class="mt-1 leading-relaxed">
                      ${paragraphHtml(comment)}
                    </div>
                  </div>
                `
                : ""
            }
          </div>
        `;
      })
      .join("");
  }

  // =========================================================
  // Row renderers
  // =========================================================

  function renderWorkplanRows(workplan) {
    if (!Array.isArray(workplan) || workplan.length === 0) {
      return `
        <tr>
          <td class="border px-2 py-3 text-gray-500 text-center" colspan="13">
            No workplan provided.
          </td>
        </tr>
      `;
    }

    return workplan
      .map((item) => {
        return `
          <tr>
            <td class="border px-2 py-2">
              ${escapeHtml(item.activity || item.task || item.description || "")}
            </td>

            ${quarterCell(item.y1_q1)}
            ${quarterCell(item.y1_q2)}
            ${quarterCell(item.y1_q3)}
            ${quarterCell(item.y1_q4)}

            ${quarterCell(item.y2_q1)}
            ${quarterCell(item.y2_q2)}
            ${quarterCell(item.y2_q3)}
            ${quarterCell(item.y2_q4)}

            ${quarterCell(item.y3_q1)}
            ${quarterCell(item.y3_q2)}
            ${quarterCell(item.y3_q3)}
            ${quarterCell(item.y3_q4)}
          </tr>
        `;
      })
      .join("");
  }

  function quarterCell(value) {
    return `<td class="border px-2 py-2 ${isTruthyValue(value) ? "q-fill" : ""}"></td>`;
  }

  function renderPersonalServicesRows(items) {
    if (!Array.isArray(items) || items.length === 0) {
      return `
        <tr>
          <td class="border px-2 py-3 text-gray-500 text-center" colspan="8">
            No personal services items.
          </td>
        </tr>
      `;
    }

    return items
      .map((item) => {
        return `
          <tr>
            <td class="border px-2 py-2">${escapeHtml(item.item || item.name || item.description || "")}</td>
            <td class="border px-2 py-2 text-right">₱${money(item.q1)}</td>
            <td class="border px-2 py-2 text-right">₱${money(item.q2)}</td>
            <td class="border px-2 py-2 text-right">₱${money(item.q3)}</td>
            <td class="border px-2 py-2 text-right">₱${money(item.q4)}</td>
            <td class="border px-2 py-2 text-right">₱${money(item.year1)}</td>
            <td class="border px-2 py-2 text-right">₱${money(item.year2)}</td>
            <td class="border px-2 py-2 text-right">₱${money(item.year3)}</td>
          </tr>
        `;
      })
      .join("");
  }

  function renderMooeRows(items) {
    if (!Array.isArray(items) || items.length === 0) {
      return `
        <tr>
          <td class="border px-2 py-3 text-gray-500 text-center" colspan="8">
            No MOOE items.
          </td>
        </tr>
      `;
    }

    const groups = {
      TRAVEL: [],
      SUPPLIES: [],
      COMMUNICATIONS: [],
      OTHER: []
    };

    items.forEach((item) => {
      const type = String(item.type || "OTHER").toUpperCase();
      if (!groups[type]) groups[type] = [];
      groups[type].push(item);
    });

    return Object.keys(groups)
      .filter((type) => groups[type].length > 0)
      .map((type) => {
        const rows = groups[type]
          .map((item) => {
            return `
              <tr>
                <td class="border px-2 py-2 text-xs">${escapeHtml(item.date_field || item.date || "")}</td>
                <td class="border px-2 py-2 text-xs">${escapeHtml(item.description || item.places || item.item || "")}</td>
                <td class="border px-2 py-2 text-xs">${escapeHtml(item.purpose || "")}</td>
                <td class="border px-2 py-2 text-right text-xs">${escapeHtml(item.qty || item.quantity || "")}</td>
                <td class="border px-2 py-2 text-right text-xs">₱${money(item.unit_cost || item.estimated_cost)}</td>
                <td class="border px-2 py-2 text-right text-xs">₱${money(item.year1)}</td>
                <td class="border px-2 py-2 text-right text-xs">₱${money(item.year2)}</td>
                <td class="border px-2 py-2 text-right text-xs">₱${money(item.year3)}</td>
              </tr>
            `;
          })
          .join("");

        return `
          <tr class="bg-gray-100">
            <td colspan="8" class="border px-2 py-2 font-bold text-sm">
              ${escapeHtml(type)}
            </td>
          </tr>
          ${rows}
        `;
      })
      .join("");
  }

  function renderEquipmentRows(items) {
    if (!Array.isArray(items) || items.length === 0) {
      return `
        <tr>
          <td class="border px-2 py-3 text-gray-500 text-center" colspan="9">
            No equipment items.
          </td>
        </tr>
      `;
    }

    return items
      .map((item) => {
        return `
          <tr>
            <td class="border px-2 py-2 text-xs">${escapeHtml(item.date_field || item.date || "")}</td>
            <td class="border px-2 py-2 text-xs">${escapeHtml(item.unit || "")}</td>
            <td class="border px-2 py-2 text-xs">${escapeHtml(item.description || item.item || "")}</td>
            <td class="border px-2 py-2 text-xs">${escapeHtml(item.purpose || "")}</td>
            <td class="border px-2 py-2 text-right text-xs">${escapeHtml(item.qty || item.quantity || "")}</td>
            <td class="border px-2 py-2 text-right text-xs">₱${money(item.estimated_cost || item.unit_cost)}</td>
            <td class="border px-2 py-2 text-right text-xs">₱${money(item.year1)}</td>
            <td class="border px-2 py-2 text-right text-xs">₱${money(item.year2)}</td>
            <td class="border px-2 py-2 text-right text-xs">₱${money(item.year3)}</td>
          </tr>
        `;
      })
      .join("");
  }

  // =========================================================
  // File preview
  // =========================================================

  function createFilePreview(filePath, fileName) {
    if (!filePath) return "";

    const rawPath = String(filePath);
    const extension = rawPath.split(".").pop().toLowerCase();
    const displayName = fileName || rawPath.split("/").pop() || "Attached File";
    const fileUrl = encodeURI(`../../${rawPath}`);

    let icon = "📄";
    let bgColor = "bg-gray-50";
    let fileType = "File";

    if (extension === "pdf") {
      icon = "📕";
      bgColor = "bg-red-50";
      fileType = "PDF File";
    } else if (["doc", "docx"].includes(extension)) {
      icon = "📘";
      bgColor = "bg-blue-50";
      fileType = "Word Document";
    } else if (["xls", "xlsx"].includes(extension)) {
      icon = "📗";
      bgColor = "bg-green-50";
      fileType = "Spreadsheet";
    }

    return `
      <div class="border border-gray-200 rounded-xl p-4 ${bgColor} hover:shadow-md transition">
        <div class="flex items-start gap-3">
          <div class="text-3xl">${icon}</div>

          <div class="flex-1 min-w-0">
            <div class="font-semibold text-sm truncate">
              ${escapeHtml(displayName)}
            </div>

            <div class="text-xs text-gray-500 mt-1">
              ${escapeHtml(fileType)}
            </div>

            <div class="mt-3 flex flex-wrap gap-2">
              <a
                href="${escapeHtml(fileUrl)}"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1 text-xs px-3 py-2 bg-urds-900 text-white rounded-lg hover:bg-urds-800 active:scale-95 transition"
              >
                View
              </a>

              <a
                href="${escapeHtml(fileUrl)}"
                download
                class="inline-flex items-center gap-1 text-xs px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 active:scale-95 transition"
              >
                Download
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================
  // Calculations
  // =========================================================

  function calculatePersonalServiceTotals(items) {
    return {
      q1: sumByKey(items, "q1"),
      q2: sumByKey(items, "q2"),
      q3: sumByKey(items, "q3"),
      q4: sumByKey(items, "q4"),
      year1: sumByKey(items, "year1"),
      year2: sumByKey(items, "year2"),
      year3: sumByKey(items, "year3")
    };
  }

  function calculateYearTotals(items) {
    return {
      year1: sumByKey(items, "year1"),
      year2: sumByKey(items, "year2"),
      year3: sumByKey(items, "year3")
    };
  }

  function sumByKey(items, key) {
    if (!Array.isArray(items)) return 0;

    return items.reduce((total, item) => {
      return total + toNumber(item[key]);
    }, 0);
  }

  // =========================================================
  // Data normalization
  // =========================================================

  function normalizeProposal(proposal) {
    const p = proposal || {};

    return {
      ...p,
      title: p.title || p.program_title || p.proposal_title || p.research_title || "Untitled Proposal",
      leader: p.leader || p.studyLeader || p.study_leader || p.researcher || p.researcher_name || p.proponent || "",
      college: p.college || p.college_name || "",
      department: p.department || p.department_name || p.dept || "",
      cluster: p.cluster || p.commodity || p.category || "",
      nature: p.nature || p.research_nature || "",
      duration: p.duration || p.durationMonths || p.duration_months || "",
      dateSubmitted: p.dateSubmitted || p.date_submitted || p.submitted_at || p.created_at || p.createdAt || "",
      rationale: p.rationale || p.description || p.program || "",
      literature: p.literature || p.review_of_literature || p.rol || "",
      methodology: p.methodology || p.methods || "",
      status: p.status || p.proposal_status || p.current_status || "Submitted",
      proposalFile: p.proposalFile || p.proposal_file || p.file_path || "",
      workplanFile: p.workplanFile || p.workplan_file || "",
      budgetFile: p.budgetFile || p.budget_file || "",
      workplan: parseMaybeJson(p.workplan),
      budget: parseMaybeJson(p.budget)
    };
  }

  function parseMaybeJson(value) {
    if (!value) return value;

    if (typeof value !== "string") return value;

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  function getArrayValue(value) {
    const parsed = parseMaybeJson(value);
    return Array.isArray(parsed) ? parsed : [];
  }

  function getArrayFromKeys(object, keys) {
    if (!object || typeof object !== "object") return [];

    for (const key of keys) {
      const value = parseMaybeJson(object[key]);
      if (Array.isArray(value)) return value;
    }

    return [];
  }

  // =========================================================
  // Status helpers
  // =========================================================

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function getStatusGroup(status) {
    const s = normalizeText(status);

    if (!s) return "pending";

    if (
      s.includes("draft") ||
      s.includes("not started") ||
      s.includes("not yet")
    ) {
      return "draft";
    }

    if (
      s.includes("reject") ||
      s.includes("terminated") ||
      s.includes("terminate") ||
      s.includes("disapproved") ||
      s.includes("declined")
    ) {
      return "rejected";
    }

    if (
      s.includes("returned") ||
      s.includes("return") ||
      s.includes("revision") ||
      s.includes("revise") ||
      s.includes("correction") ||
      s.includes("needs correction")
    ) {
      return "returned";
    }

    if (
      s.includes("ongoing") ||
      s.includes("on going") ||
      s.includes("implementation") ||
      s.includes("implement") ||
      s.includes("conduct of research")
    ) {
      return "ongoing";
    }

    if (
      s.includes("approved") ||
      s.includes("approve") ||
      s.includes("endorsed") ||
      s.includes("endorsement") ||
      s.includes("special order") ||
      s.includes("notice to proceed") ||
      s.includes("ntp") ||
      s.includes("issued") ||
      s.includes("completed") ||
      s.includes("closed") ||
      s.includes("passed")
    ) {
      return "approved";
    }

    if (
      s.includes("review") ||
      s.includes("evaluation") ||
      s.includes("evaluate") ||
      s.includes("screening") ||
      s.includes("screen") ||
      s.includes("dean") ||
      s.includes("twg") ||
      s.includes("urec") ||
      s.includes("urds") ||
      s.includes("director") ||
      s.includes("in house") ||
      s.includes("inhouse") ||
      s.includes("monitoring") ||
      s.startsWith("for ")
    ) {
      return "review";
    }

    if (
      s.includes("submitted") ||
      s.includes("pending") ||
      s.includes("waiting") ||
      s.includes("received")
    ) {
      return "pending";
    }

    return "pending";
  }

  function makeReadableStatus(status) {
    const text = String(status || "Submitted")
      .replace(/_/g, " ")
      .replace(/-/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return text.replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function statusBadgeHtml(status) {
    const group = getStatusGroup(status);
    const meta = STATUS_META[group] || STATUS_META.pending;

    return `
      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${meta.badge}">
        <span class="w-2 h-2 rounded-full inline-block" style="background-color: currentColor;"></span>
        ${escapeHtml(makeReadableStatus(status || meta.label))}
      </span>
    `;
  }

  // =========================================================
  // General helpers
  // =========================================================

  function loadingState(message) {
    return `
      <div class="text-center py-10 text-gray-500">
        ${escapeHtml(message)}
      </div>
    `;
  }

  function emptyState(message) {
    return `
      <div class="text-center p-6 text-gray-600">
        ${escapeHtml(message)}
      </div>
    `;
  }

  function paragraphHtml(value) {
    const text = escapeHtml(value || "");

    if (!text.trim()) {
      return `<span class="text-gray-400">No information provided.</span>`;
    }

    return text.replace(/\n/g, "<br>");
  }

  function escapeHtml(value) {
    if (value === null || value === undefined) return "";

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function safeDate(value) {
    if (!value) return null;

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function safeDateTime(value) {
    const date = safeDate(value);

    if (!date) return "";

    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function toNumber(value) {
    const number = Number(value || 0);
    return Number.isFinite(number) ? number : 0;
  }

  function money(value) {
    return toNumber(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function isTruthyValue(value) {
    return value === true || value === 1 || value === "1" || value === "true" || value === "yes" || value === "on";
  }
});