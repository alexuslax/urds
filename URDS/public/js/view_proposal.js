(() => {
  // ------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------
  const $ = (id) => document.getElementById(id);

  const esc = (s) =>
    String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");

  const toText = (v, fallback = "—") => {
    const s = String(v ?? "").trim();
    return s ? s : fallback;
  };

  const fmtDate = (d) => {
    if (!d) return "—";
    // Accept "2026-01-01", ISO, or already formatted
    const dt = new Date(d);
    if (!Number.isFinite(dt.getTime())) return String(d);
    return dt.toLocaleString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  };

  const getNature = (proposal) => {
    const n = (proposal?.nature || proposal?.category || proposal?.type || "").toString().trim().toLowerCase();
    if (n.includes("program")) return "Program";
    if (n.includes("project")) return "Project";
    if (n.includes("study")) return "Study";
    return proposal?.projects ? "Program" : "Study"; // fallback guess
  };

  const buildBadge = (status) => {
    const s = (status || "").toString().toLowerCase();

    if (s.includes("approved")) return "bg-green-100 text-green-700";
    if (s.includes("returned") || s.includes("revision")) return "bg-yellow-100 text-yellow-700";
    if (s.includes("rejected") || s.includes("denied")) return "bg-red-100 text-red-700";
    if (s.includes("pending") || s.includes("review")) return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-700";
  };

  // ------------------------------------------------------------
  // Load proposal (still using localStorage like your current code)
  // ------------------------------------------------------------
  const proposals = JSON.parse(localStorage.getItem("myProposals") || "[]");
  const pid = localStorage.getItem("viewProposalId");

  const proposal = proposals.find((p) => String(p.id) === String(pid));

  if (!proposal) {
    document.body.innerHTML = "<div class='p-10 text-red-600'>Proposal not found.</div>";
    throw new Error("Missing proposal");
  }

  // Targets
  const header = $("proposalHeader");
  const actions = $("proposalActions"); // (you added this in the improved HTML; if not present, we just skip)
  const structure = $("proposalStructure");
  const files = $("proposalFiles");
  const reviews = $("proposalReviews");
  const timeline = $("proposalTimeline");

  // ------------------------------------------------------------
  // HEADER
  // ------------------------------------------------------------
  const leader =
    proposal.leader ||
    proposal.researcher ||
    proposal.studyLeader ||
    proposal.proponent ||
    "—";

  const status = proposal.status || "—";
  const nature = getNature(proposal);

  header.innerHTML = `
    <div class="bg-white p-6 rounded-xl shadow-card border">
      <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div class="min-w-0">
          <h2 class="text-2xl font-semibold break-words">${esc(toText(proposal.title, "Untitled Proposal"))}</h2>
          <div class="text-gray-700 mt-2 text-sm space-y-1">
            <div><strong>Nature:</strong> ${esc(nature)}</div>
            <div><strong>Leader:</strong> ${esc(leader)}</div>
            <div><strong>College:</strong> ${esc(toText(proposal.college))}${proposal.department ? ` / ${esc(proposal.department)}` : ""}</div>
            <div><strong>Submitted:</strong> ${esc(toText(proposal.dateSubmitted ? fmtDate(proposal.dateSubmitted) : "—"))}</div>
          </div>
        </div>

        <div class="shrink-0">
          <span class="inline-flex items-center mt-1 px-3 py-1 text-xs rounded-full ${buildBadge(status)}">
            ${esc(status)}
          </span>
        </div>
      </div>
    </div>
  `;

  // ------------------------------------------------------------
  // ACTIONS TOOLBAR (print + edit links)
  // Only renders if #proposalActions exists in your HTML.
  // ------------------------------------------------------------
  if (actions) {
    const id = proposal.id;

    // Status logic
    const statusLower = String(status).toLowerCase();
    const canEdit =
      statusLower.includes("revision") ||
      statusLower.includes("returned") ||
      statusLower.includes("draft");

    actions.innerHTML = `
      <div class="bg-white p-4 rounded-xl shadow-card border flex flex-wrap gap-2">
        <a class="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm"
           href="proposal_preview.html?id=${encodeURIComponent(id)}">
          👁️ Preview
        </a>

        <a class="px-3 py-2 rounded-lg bg-white border hover:bg-gray-50 text-sm"
           href="capsule_print.html?id=${encodeURIComponent(id)}">
          🖨️ Print Capsule (FM-002)
        </a>

        <a class="px-3 py-2 rounded-lg bg-white border hover:bg-gray-50 text-sm"
           href="workplan_print.html?id=${encodeURIComponent(id)}">
          🖨️ Print Workplan (FM-004)
        </a>

        <a class="px-3 py-2 rounded-lg bg-white border hover:bg-gray-50 text-sm"
           href="budget_print.html?id=${encodeURIComponent(id)}">
          🖨️ Print Budget (FM-005)
        </a>

        <a class="px-3 py-2 rounded-lg bg-white border hover:bg-gray-50 text-sm"
           href="detailed_print.html?id=${encodeURIComponent(id)}">
          🖨️ Print Detailed (FM-003)
        </a>

        <a class="px-3 py-2 rounded-lg bg-white border hover:bg-gray-50 text-sm"
           href="twg_evaluation_print.html?id=${encodeURIComponent(id)}">
          🖨️ TWG Form (FM-010)
        </a>

        ${
          canEdit
            ? `<a class="px-3 py-2 rounded-lg bg-urds-900 hover:bg-urds-800 text-white text-sm"
                 href="submit_proposal_wizard.html?edit=${encodeURIComponent(id)}">
                 ✏️ Edit & Resubmit
               </a>`
            : ""
        }
      </div>
    `;
  }

  // ------------------------------------------------------------
  // STRUCTURE (Program → Projects → Studies)
  // Handles Program/Project/Study safely
  // ------------------------------------------------------------
  function renderStructure() {
    const projects = Array.isArray(proposal.projects) ? proposal.projects : null;

    // If no projects, treat as single study view
    if (!projects || projects.length === 0) {
      structure.innerHTML = `
        <div class="bg-white p-6 rounded-xl shadow-card border">
          <h3 class="text-xl font-semibold mb-4">Study Details</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><strong>Title:</strong> ${esc(toText(proposal.title))}</div>
            <div><strong>Leader:</strong> ${esc(leader)}</div>
            <div><strong>Location:</strong> ${esc(toText(proposal.location))}</div>
            <div><strong>Duration:</strong> ${esc(proposal.durationMonths ? `${proposal.durationMonths} months` : toText(proposal.duration))}</div>
          </div>

          <div class="mt-4 text-sm text-gray-600">
            No Program/Project hierarchy data found. (This is fine for single-study submissions.)
          </div>
        </div>
      `;
      return;
    }

    // Program mode
    let html = `
      <div class="bg-white p-6 rounded-xl shadow-card border">
        <h3 class="text-xl font-semibold mb-4">Program, Projects & Studies</h3>
        <div class="space-y-4">
    `;

    projects.forEach((proj, pi) => {
      const projTitle = proj?.title || `Project ${pi + 1}`;
      const projDesc = proj?.description || "";

      html += `
        <div class="border rounded-xl p-4 bg-gray-50">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="font-semibold break-words">Project: ${esc(toText(projTitle))}</div>
              ${projDesc ? `<div class="text-sm text-gray-600 mt-1">${esc(projDesc)}</div>` : ""}
            </div>
          </div>

          <div class="mt-4 space-y-3">
      `;

      const studies = Array.isArray(proj?.studies) ? proj.studies : [];

      if (!studies.length) {
        html += `<div class="text-sm text-gray-600">No studies found under this project.</div>`;
      } else {
        studies.forEach((s, si) => {
          const members = Array.isArray(s?.members) ? s.members : [];
          const memberText = members.length
            ? members
                .map((m) => `${toText(m?.name)} (${toText(m?.role, "Member")}${m?.mps ? `, MPS: ${m.mps}` : ""})`)
                .join("; ")
            : "None";

          const tf = s?.timeFrame || {};
          const tfText =
            tf?.start || tf?.end ? `${toText(tf.start)} — ${toText(tf.end)}` : "—";

          html += `
            <div class="bg-white border rounded-lg p-4">
              <div class="font-medium text-gray-800 break-words">${esc(toText(s?.title, `Study ${si + 1}`))}</div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-xs text-gray-700">
                <div><strong>Leader:</strong> ${esc(toText(s?.leader))}</div>
                <div><strong>Cluster:</strong> ${esc(toText(s?.researchCluster))}</div>
                <div class="md:col-span-2"><strong>Members:</strong> ${esc(memberText)}</div>
                <div><strong>Commodity:</strong> ${esc(toText(s?.commodity))}</div>
                <div><strong>Timeframe:</strong> ${esc(tfText)}</div>
                <div class="md:col-span-2"><strong>Search Area:</strong> ${esc(toText(s?.searchArea, "N/A"))}</div>
              </div>
            </div>
          `;
        });
      }

      html += `</div></div>`;
    });

    html += `</div></div>`;
    structure.innerHTML = html;
  }

  renderStructure();

  // ------------------------------------------------------------
  // ATTACHMENTS
  // ------------------------------------------------------------
  function renderFiles() {
    const list = Array.isArray(proposal.files) ? proposal.files : [];

    files.innerHTML = `
      <div class="bg-white p-6 rounded-xl shadow-card border">
        <h3 class="text-xl font-semibold mb-4">Attached Files</h3>

        ${
          list.length
            ? list
                .map((f) => {
                  const name = toText(f?.name, "Unnamed file");
                  const url = f?.url || "#";
                  return `
                    <div class="flex items-center justify-between gap-3 bg-gray-50 p-3 rounded border mb-2">
                      <div class="min-w-0">
                        <div class="text-sm font-medium break-words">${esc(name)}</div>
                        <div class="text-xs text-gray-500 break-words">${esc(toText(f?.type, ""))}</div>
                      </div>
                      <a href="${esc(url)}" ${url !== "#" ? "download" : ""}
                         class="shrink-0 px-3 py-1 bg-urds-900 hover:bg-urds-800 text-white text-xs rounded">
                        Download
                      </a>
                    </div>
                  `;
                })
                .join("")
            : `<p class="text-gray-600 text-sm">No files uploaded.</p>`
        }
      </div>
    `;
  }

  renderFiles();

  // ------------------------------------------------------------
  // REVIEWS (grouped + supports arrays)
  // ------------------------------------------------------------
  function reviewBlock(title, items) {
    const arr = Array.isArray(items) ? items : items ? [items] : [];
    if (!arr.length) return "";

    return `
      <div class="border rounded-xl p-4 bg-gray-50">
        <div class="font-semibold mb-2">${esc(title)}</div>
        <div class="space-y-3">
          ${arr
            .map((it) => {
              const who = it?.reviewer || it?.name || it?.evaluator || "";
              const rec = it?.recommendation || it?.decision || "";
              const date = it?.date || it?.createdAt || it?.timestamp || "";
              const text = it?.remarks || it?.comments || it?.note || "No remarks.";

              // Optional score display
              const score = it?.score || it?.rating || "";

              return `
                <div class="bg-white border rounded-lg p-3">
                  <div class="flex items-start justify-between gap-3">
                    <div class="text-sm font-medium">
                      ${who ? esc(who) : "Review"}
                      ${rec ? `<span class="text-xs text-gray-500"> • ${esc(rec)}</span>` : ""}
                      ${score ? `<span class="text-xs text-gray-500"> • Score: ${esc(score)}</span>` : ""}
                    </div>
                    <div class="text-xs text-gray-500 shrink-0">${esc(date ? fmtDate(date) : "")}</div>
                  </div>
                  <div class="text-sm text-gray-700 mt-2 whitespace-pre-wrap break-words">${esc(text)}</div>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    `;
  }

  function renderReviews() {
    // Your existing fields:
    // proposal.screening, proposal.deanNotes, proposal.twgEvaluation, proposal.evaluations,
    // proposal.urecReview, proposal.directorReview
    const html = `
      <div class="bg-white p-6 rounded-xl shadow-card border">
        <h3 class="text-xl font-semibold">Reviews & Feedback</h3>
        <div class="mt-4 space-y-4">
          ${reviewBlock("Initial Screening (Coordinator)", proposal.screening)}
          ${reviewBlock("Dean Decision", proposal.deanNotes)}
          ${reviewBlock("TWG Evaluation", proposal.twgEvaluation)}
          ${reviewBlock("Evaluators (In-house Review)", proposal.evaluations)}
          ${reviewBlock("UREC Review", proposal.urecReview)}
          ${reviewBlock("Director Final Review", proposal.directorReview)}
          ${
            !proposal.screening &&
            !proposal.deanNotes &&
            !proposal.twgEvaluation &&
            !proposal.evaluations &&
            !proposal.urecReview &&
            !proposal.directorReview
              ? `<div class="text-sm text-gray-600">No reviews recorded yet.</div>`
              : ""
          }
        </div>
      </div>
    `;

    reviews.innerHTML = html;
  }

  renderReviews();

  // ------------------------------------------------------------
  // TIMELINE (if you have proposal.history, render it)
  // Fallback to "submitted + current status"
  // ------------------------------------------------------------
  function renderTimeline() {
    const history = Array.isArray(proposal.history) ? proposal.history : [];

    if (!history.length) {
      timeline.innerHTML = `
        <div class="bg-white p-6 rounded-xl shadow-card border">
          <h3 class="text-xl font-semibold mb-4">Status Timeline</h3>
          <div class="text-sm text-gray-700">
            <div><strong>Submitted:</strong> ${esc(toText(proposal.dateSubmitted ? fmtDate(proposal.dateSubmitted) : "—"))}</div>
            <div class="mt-2"><strong>Current Status:</strong> ${esc(toText(status))}</div>
          </div>
          <p class="text-xs text-gray-500 mt-3">
            Tip: Add a <code class="px-1 bg-gray-100 rounded">proposal.history[]</code> array to show full workflow steps.
          </p>
        </div>
      `;
      return;
    }

    // Normalize history items: { status, date, note, actor }
    const items = history
      .map((h) => ({
        status: h?.status || h?.stage || h?.action || "Update",
        date: h?.date || h?.timestamp || h?.createdAt || "",
        note: h?.note || h?.remarks || h?.comments || "",
        actor: h?.actor || h?.by || h?.user || ""
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    timeline.innerHTML = `
      <div class="bg-white p-6 rounded-xl shadow-card border">
        <h3 class="text-xl font-semibold mb-4">Status Timeline</h3>

        <div class="space-y-3">
          ${items
            .map((it) => {
              return `
                <div class="flex gap-3">
                  <div class="mt-1 w-2 h-2 rounded-full bg-urds-accent shrink-0"></div>
                  <div class="min-w-0">
                    <div class="text-sm font-medium break-words">${esc(toText(it.status))}</div>
                    <div class="text-xs text-gray-500 mt-0.5">
                      ${esc(it.date ? fmtDate(it.date) : "")}${it.actor ? ` • ${esc(it.actor)}` : ""}
                    </div>
                    ${it.note ? `<div class="text-sm text-gray-700 mt-1 whitespace-pre-wrap break-words">${esc(it.note)}</div>` : ""}
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    `;
  }

  renderTimeline();
})();