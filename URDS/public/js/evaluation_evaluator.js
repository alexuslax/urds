// =========================
// ACCESS CONTROL
// =========================
const role = localStorage.getItem("userRole") || "";
if (role !== "Evaluator") {
  document.body.innerHTML = `
    <div class="p-10 text-center text-red-600 font-semibold">
      Access Denied — Evaluators Only
    </div>`;
  throw new Error("Unauthorized Access");
}

// =========================
// STORAGE HELPERS
// =========================
function getPrimaryStorageKey() {
  // prefer master list so other roles can see evaluator output
  if (localStorage.getItem("allProposals")) return "allProposals";
  if (localStorage.getItem("proposals")) return "proposals";
  if (localStorage.getItem("myProposals")) return "myProposals";
  return "allProposals";
}

function loadProposals() {
  const key = getPrimaryStorageKey();
  return {
    key,
    data: JSON.parse(localStorage.getItem(key) || "[]")
  };
}

function saveProposals(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// =========================
// DOM
// =========================
const noticeBox = document.getElementById("noticeBox");
const proposalInfo = document.getElementById("proposalInfo");
const studySelect = document.getElementById("studySelect");

const evaluatorNameEl = document.getElementById("evaluatorName");
const commentsEl = document.getElementById("comments");

const critEls = [
  document.getElementById("crit1"),
  document.getElementById("crit2"),
  document.getElementById("crit3"),
  document.getElementById("crit4"),
  document.getElementById("crit5"),
];

const scoreLine = document.getElementById("scoreLine");
const scoreHint = document.getElementById("scoreHint");

// =========================
// LOAD USER + PROPOSAL
// =========================
const userName = localStorage.getItem("userName") || "Evaluator";
evaluatorNameEl.value = userName;

const proposalId = localStorage.getItem("viewProposalId");
const { key: storageKey, data: proposals } = loadProposals();

if (!proposalId) {
  showNotice("No proposal selected. Please open a proposal from your assigned list.", "warn");
  proposalInfo.innerHTML = emptyBox("No proposal selected.");
  studySelect.innerHTML = `<option value="">—</option>`;
  disableForm(true);
  throw new Error("Missing viewProposalId");
}

const proposalIndex = proposals.findIndex(p => String(p.id) === String(proposalId));
const proposal = proposalIndex >= 0 ? proposals[proposalIndex] : null;

if (!proposal) {
  showNotice("Proposal not found in storage. Check if it exists in allProposals/proposals.", "error");
  proposalInfo.innerHTML = emptyBox("Proposal not found.");
  studySelect.innerHTML = `<option value="">—</option>`;
  disableForm(true);
  throw new Error("Proposal not found");
}

// =========================
// RENDER PROPOSAL HEADER
// =========================
proposalInfo.innerHTML = `
  <div class="bg-white p-5 rounded-2xl border shadow-sm">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h2 class="font-semibold text-lg truncate">${escapeHtml(proposal.title || "Untitled")}</h2>
        <p class="text-xs text-gray-500 mt-1">
          Submitted: ${escapeHtml(formatDate(proposal.dateSubmitted) || "-")}
        </p>
      </div>
      <span class="shrink-0 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
        ${escapeHtml(proposal.status || "—")}
      </span>
    </div>
  </div>
`;

// =========================
// STUDIES: populate + assignment filter
// =========================
const studiesFlat = flattenStudies(proposal);

// If your data supports assigned evaluators, filter here.
// Expected optional shapes:
//  - study.assignedEvaluators: ["Juan Dela Cruz", ...]
//  - study.assignedEvaluator: "Juan Dela Cruz"
//  - study.assignedTo: ["Evaluator", ...] (less ideal)
const assignedStudies = studiesFlat.filter(x => isAssignedToUser(x.study, userName));

let visibleStudies = assignedStudies;
if (assignedStudies.length === 0) {
  // fallback: if no assignments exist in data, show all studies
  visibleStudies = studiesFlat;
  showNotice("No evaluator assignments found in data. Showing all studies in this proposal.", "info");
}

if (!visibleStudies.length) {
  proposalInfo.insertAdjacentHTML("afterend", `<div class="mt-4">${emptyBox("No studies found in this proposal.")}</div>`);
  studySelect.innerHTML = `<option value="">—</option>`;
  disableForm(true);
  throw new Error("No studies");
}

studySelect.innerHTML = visibleStudies.map((x, idx) => {
  const projTitle = x.projectTitle;
  const studyTitle = x.studyTitle;
  const leader = x.leader ? ` (Leader: ${x.leader})` : "";
  return `<option value="${idx}">${escapeHtml(`${projTitle} — ${studyTitle}${leader}`)}</option>`;
}).join("");

// load first study
loadExistingDraftToForm(visibleStudies[0]);

// =========================
// EVENTS
// =========================
studySelect.addEventListener("change", () => {
  const idx = Number(studySelect.value);
  loadExistingDraftToForm(visibleStudies[idx]);
});

critEls.forEach(el => el.addEventListener("input", computeScore));
document.getElementById("saveEvalBtn").addEventListener("click", () => saveEvaluation(false));
document.getElementById("submitEvalBtn").addEventListener("click", () => saveEvaluation(true));

// =========================
// CORE: save draft / submit
// =========================
function saveEvaluation(submit = false) {
  const idx = Number(studySelect.value);
  const selected = visibleStudies[idx];
  if (!selected) return alert("Please select a study.");

  const evalObj = buildEvaluationObject(submit);

  if (submit) {
    const err = validateForSubmit(evalObj);
    if (err) return alert(err);
  }

  // Attach to study inside proposal using real references
  const realStudy = proposal.projects?.[selected.projectIndex]?.studies?.[selected.studyIndex];
  if (!realStudy) return alert("Study reference not found in proposal structure.");

  // Ensure array exists
  realStudy.evaluations = Array.isArray(realStudy.evaluations) ? realStudy.evaluations : [];

  // Update existing draft if present (same evaluator + not submitted)
  const existingDraftIndex = realStudy.evaluations.findIndex(r =>
    (r.evaluator || "") === evalObj.evaluator && !r.submittedAt
  );

  if (!submit) {
    if (existingDraftIndex >= 0) realStudy.evaluations[existingDraftIndex] = evalObj;
    else realStudy.evaluations.push(evalObj);
  } else {
    // On submit: replace draft if it exists, otherwise push a new submitted entry
    if (existingDraftIndex >= 0) realStudy.evaluations[existingDraftIndex] = evalObj;
    else realStudy.evaluations.push(evalObj);

    // Optional: update status
    realStudy.status = "Evaluator Completed";
    // Optional: update proposal status if you want (only if all studies done, etc.)
  }

  // Save back to storage
  proposals[proposalIndex] = proposal;
  saveProposals(storageKey, proposals);

  alert(submit ? "Evaluation submitted successfully." : "Draft saved.");
}

// =========================
// FORM BUILD / LOAD
// =========================
function buildEvaluationObject(submit) {
  const criteria = {
    significance: toNum(critEls[0].value),
    technical: toNum(critEls[1].value),
    methodology: toNum(critEls[2].value),
    ethics: toNum(critEls[3].value),
    budget: toNum(critEls[4].value),
  };

  return {
    evaluator: (evaluatorNameEl.value || "").trim() || userName,
    criteria,
    comments: (commentsEl.value || "").trim(),
    submittedAt: submit ? new Date().toISOString() : null,
    updatedAt: new Date().toISOString()
  };
}

function loadExistingDraftToForm(selected) {
  // reset
  critEls.forEach(el => (el.value = ""));
  commentsEl.value = "";
  computeScore();

  const realStudy = proposal.projects?.[selected.projectIndex]?.studies?.[selected.studyIndex];
  const drafts = Array.isArray(realStudy?.evaluations) ? realStudy.evaluations : [];

  // Prefer draft (not submitted) by this evaluator; fallback to last submitted by this evaluator
  const myDraft = drafts.find(r => (r.evaluator || "") === (evaluatorNameEl.value || userName) && !r.submittedAt);
  const myLastSubmitted = [...drafts].reverse().find(r => (r.evaluator || "") === (evaluatorNameEl.value || userName) && !!r.submittedAt);

  const use = myDraft || myLastSubmitted;
  if (!use) return;

  critEls[0].value = use.criteria?.significance ?? "";
  critEls[1].value = use.criteria?.technical ?? "";
  critEls[2].value = use.criteria?.methodology ?? "";
  critEls[3].value = use.criteria?.ethics ?? "";
  critEls[4].value = use.criteria?.budget ?? "";
  commentsEl.value = use.comments || "";
  computeScore();
}

// =========================
// VALIDATION + SCORE
// =========================
function validateForSubmit(e) {
  if (!e.evaluator) return "Please enter your name.";
  const vals = Object.values(e.criteria || {});
  if (vals.some(v => !(v >= 1 && v <= 5))) return "All criteria must be rated from 1 to 5 before submitting.";
  if (!e.comments) return "Please enter overall comments before submitting.";
  return "";
}

function computeScore() {
  const nums = critEls.map(el => toNum(el.value)).filter(n => n > 0);
  if (!nums.length) {
    scoreLine.textContent = "0.0 / 5.0";
    scoreHint.textContent = "Enter ratings to compute.";
    return;
  }
  const avg = nums.reduce((a,b) => a + b, 0) / nums.length;
  scoreLine.textContent = `${avg.toFixed(1)} / 5.0`;
  scoreHint.textContent = `Average of ${nums.length} criteria entered.`;
}

// =========================
// HELPERS
// =========================
function flattenStudies(prop) {
  const out = [];
  const projects = Array.isArray(prop.projects) ? prop.projects : [];

  projects.forEach((proj, pi) => {
    const pTitle = proj.title || proj.projectTitle || `Project ${pi + 1}`;
    const studies = Array.isArray(proj.studies) ? proj.studies : [];

    studies.forEach((s, si) => {
      out.push({
        projectIndex: pi,
        studyIndex: si,
        projectTitle: pTitle,
        studyTitle: s.title || s.studyTitle || `Study ${si + 1}`,
        leader: s.leader || s.studyLeader || "",
        study: s
      });
    });
  });

  return out;
}

function isAssignedToUser(study, userName) {
  const list = study?.assignedEvaluators;
  const one = study?.assignedEvaluator;

  if (Array.isArray(list) && list.length) {
    return list.some(x => String(x).toLowerCase() === String(userName).toLowerCase());
  }
  if (one) {
    return String(one).toLowerCase() === String(userName).toLowerCase();
  }

  // No assignment fields = treat as "no assignment system"
  return false;
}

function disableForm(disabled) {
  document.querySelectorAll("#evalForm input, #evalForm textarea, #evalForm select, #evalForm button")
    .forEach(el => el.disabled = disabled);
}

function showNotice(msg, type="info") {
  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warn: "bg-yellow-50 border-yellow-200 text-yellow-800",
    error: "bg-red-50 border-red-200 text-red-800",
  };
  noticeBox.className = `mb-4 p-4 rounded-xl border text-sm ${styles[type] || styles.info}`;
  noticeBox.textContent = msg;
  noticeBox.classList.remove("hidden");
}

function emptyBox(msg) {
  return `<div class="bg-white p-4 rounded-xl border text-gray-600 text-sm">${escapeHtml(msg)}</div>`;
}

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function formatDate(d) {
  if (!d) return "";
  try { return new Date(d).toLocaleString(); } catch { return String(d); }
}

function escapeHtml(s) {
  if (s === null || s === undefined) return "";
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
