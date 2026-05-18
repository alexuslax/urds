// ===============================
// ELEMENTS
// ===============================
const reviewFormContainer = document.getElementById("reviewFormContainer");
const proposalSelectorEl = document.getElementById("proposalSelector");
const totalCountEl = document.getElementById("totalCount");

let proposals = [];
let selectedProposal = null;
let clusters = [];
let reviewData = {
  completeness: {
    capsule: true,
    workplan: true,
    budget: true,
    fullProposal: true,
    objectives: true,
    methodology: true,
    rationale: true
  },
  ethics: {
    involvesHumans: 'no',
    details: {
      survey: false,
      interviews: false,
      minors: false,
      personalData: false,
      sensitiveTopic: false,
      clinicalProcedures: false
    },
    informedConsent: 'yes',
    privacyMeasures: 'yes'
  },
  routing: {
    decision: '',
    notes: ''
  }
};

// ===============================
// FETCH PROPOSALS FROM DATABASE
// ===============================
async function fetchProposals() {
  try {
    reviewFormContainer.innerHTML = `
      <div class="bg-white rounded-lg shadow-sm border p-12 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-urds-accent mx-auto mb-4"></div>
        <div class="text-gray-500">Loading proposals...</div>
      </div>
    `;

    const response = await fetch('../../backend/get_all_proposals.php', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.status === 'success') {
      // Filter only proposals with "for URDS review" status
      proposals = (result.proposals || []).filter(p => 
        (p.status || '').toLowerCase() === 'for urds review'
      );
      
      // Fetch clusters
      await fetchClusters();
      
      populateProposalSelector();
      
      // If there are proposals, select the appropriate one
      if (proposals.length > 0) {
        // Check if there's an ID in the URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const proposalId = urlParams.get('id');
        
        if (proposalId) {
          // Try to find the proposal with this ID
          const foundProposal = proposals.find(p => p.id == proposalId);
          if (foundProposal) {
            proposalSelectorEl.value = foundProposal.id;
            // Fetch detailed proposal with history
            const detailedProposal = await fetchProposalDetails(foundProposal.id);
            selectedProposal = detailedProposal ? { ...foundProposal, ...detailedProposal } : foundProposal;
          } else {
            // ID not found in filtered proposals, select first one
            proposalSelectorEl.value = proposals[0].id;
            const detailedProposal = await fetchProposalDetails(proposals[0].id);
            selectedProposal = detailedProposal ? { ...proposals[0], ...detailedProposal } : proposals[0];
          }
        } else {
          // No ID parameter, select first proposal by default
          proposalSelectorEl.value = proposals[0].id;
          const detailedProposal = await fetchProposalDetails(proposals[0].id);
          selectedProposal = detailedProposal ? { ...proposals[0], ...detailedProposal } : proposals[0];
        }
        
        renderReviewForm();
      } else {
        renderNoProposals();
      }
    } else {
      throw new Error(result.message || 'Failed to load proposals');
    }
  } catch (error) {
    console.error('Error fetching proposals:', error);
    reviewFormContainer.innerHTML = `
      <div class="bg-white rounded-lg shadow-sm border p-12 text-center">
        <svg class="w-16 h-16 mx-auto text-red-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div class="text-red-600 text-lg font-medium">Error loading proposals</div>
        <div class="text-gray-500 text-sm mt-1">${escapeHtml(error.message)}</div>
        <button onclick="fetchProposals()" class="mt-4 px-4 py-2 bg-urds-accent text-white rounded-lg text-sm hover:bg-opacity-90">
          Retry
        </button>
      </div>
    `;
  }
}

// ===============================
// FETCH CLUSTERS
// ===============================
async function fetchClusters() {
  // Start with hardcoded cluster options
  const hardcodedClusters = [
    'Agriculture',
    'Business & Management',
    'ICT / Computer Science',
    'Humanities'
  ];
  
  try {
    const response = await fetch('../../backend/get_clusters.php', {
      method: 'GET',
      credentials: 'include'
    });
    const result = await response.json();
    if (result.status === 'success') {
      const dbClusters = result.clusters || [];
      // Combine hardcoded and database clusters, remove duplicates
      const allClusters = [...new Set([...hardcodedClusters, ...dbClusters])];
      clusters = allClusters.sort();
    } else {
      clusters = hardcodedClusters;
    }
  } catch (error) {
    console.error('Error fetching clusters:', error);
    clusters = hardcodedClusters;
  }
}

// ===============================
// POPULATE DROPDOWN
// ===============================
function populateProposalSelector() {
  proposalSelectorEl.innerHTML = '';
  
  if (proposals.length === 0) {
    proposalSelectorEl.innerHTML = '<option value="">No proposals for URDS review</option>';
    totalCountEl.textContent = '0';
    return;
  }

  totalCountEl.textContent = proposals.length;
  
  proposals.forEach(p => {
    const option = document.createElement('option');
    option.value = p.id;
    option.textContent = p.title || 'Untitled Proposal';
    proposalSelectorEl.appendChild(option);
  });
}

// ===============================
// RENDER REVIEW FORM
// ===============================
function renderReviewForm() {
  if (!selectedProposal) {
    renderNoProposals();
    return;
  }

  const p = selectedProposal;

  reviewFormContainer.innerHTML = `
    <!-- Page Header -->
    <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <a href="proposal_list.html" class="flex items-center gap-2 text-urds-800 hover:text-urds-accent transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          <span class="font-medium">Back to Proposals</span>
        </a>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600">Proposal Status:</span>
          <span class="px-3 py-1 bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-full text-xs font-semibold">
            For URDS Review
          </span>
        </div>
      </div>
      <div class="border-t pt-4">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">${escapeHtml(p.title || 'Untitled')}</h1>
        <div class="flex flex-wrap gap-4 text-sm text-gray-600">
          <span><strong>${escapeHtml(p.college || 'N/A')}</strong></span>
          <span>•</span>
          <span>${escapeHtml(p.leader || p.studyLeader || 'N/A')}</span>
          <span>•</span>
          <span>Submitted: ${escapeHtml(p.createdAt || 'N/A')}</span>
        </div>
      </div>
    </div>

    <!-- Section 1: Basic Proposal Information -->
    <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span class="bg-urds-accent text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">I</span>
        Proposal Information
      </h2>
      <div class="bg-gray-50 rounded-lg p-4 space-y-3">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-xs font-semibold text-gray-500 uppercase">Title</div>
            <div class="text-sm text-gray-900">${escapeHtml(p.title || 'N/A')}</div>
          </div>
          <div>
            <div class="text-xs font-semibold text-gray-500 uppercase">Leader</div>
            <div class="text-sm text-gray-900">${escapeHtml(p.leader || p.studyLeader || 'N/A')}</div>
          </div>
          <div>
            <div class="text-xs font-semibold text-gray-500 uppercase">College</div>
            <div class="text-sm text-gray-900">${escapeHtml(p.college || 'N/A')}</div>
          </div>
          <div>
            <div class="text-xs font-semibold text-gray-500 uppercase">Department</div>
            <div class="text-sm text-gray-900">${escapeHtml(p.department || 'N/A')}</div>
          </div>
          <div>
            <div class="text-xs font-semibold text-gray-500 uppercase">Nature</div>
            <div class="text-sm text-gray-900">${escapeHtml(p.nature || 'N/A')}</div>
          </div>
          <div>
            <div class="text-xs font-semibold text-gray-500 uppercase mb-1">Cluster</div>
            <select id="clusterSelect" class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-urds-accent focus:ring-2 focus:ring-urds-accent focus:ring-opacity-20 transition-all bg-white">
              <option value="">Select Cluster</option>
            </select>
          </div>
          <div>
            <div class="text-xs font-semibold text-gray-500 uppercase">Duration</div>
            <div class="text-sm text-gray-900">${escapeHtml(p.duration || 'N/A')}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 2: Document Completeness Checklist -->
    <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span class="bg-urds-accent text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">II</span>
        Completeness Check
      </h2>
      <div class="space-y-3">
        <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
          <input type="checkbox" class="w-5 h-5 text-urds-accent rounded" id="check_capsule" checked />
          <span class="text-sm text-gray-700">Research Capsule (FM-004)</span>
        </label>
        <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
          <input type="checkbox" class="w-5 h-5 text-urds-accent rounded" id="check_workplan" checked />
          <span class="text-sm text-gray-700">Workplan (FM-005)</span>
        </label>
        <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
          <input type="checkbox" class="w-5 h-5 text-urds-accent rounded" id="check_budget" checked />
          <span class="text-sm text-gray-700">Budget File (FM-005-A)</span>
        </label>
        <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
          <input type="checkbox" class="w-5 h-5 text-urds-accent rounded" id="check_fullProposal" checked />
          <span class="text-sm text-gray-700">Full Proposal PDF Attached</span>
        </label>
        <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
          <input type="checkbox" class="w-5 h-5 text-urds-accent rounded" id="check_objectives" checked />
          <span class="text-sm text-gray-700">Objectives included</span>
        </label>
        <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
          <input type="checkbox" class="w-5 h-5 text-urds-accent rounded" id="check_methodology" checked />
          <span class="text-sm text-gray-700">Methodology described</span>
        </label>
        <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
          <input type="checkbox" class="w-5 h-5 text-urds-accent rounded" id="check_rationale" checked />
          <span class="text-sm text-gray-700">Rationale provided</span>
        </label>
      </div>
      <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
        <svg class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <div>
          <div class="text-sm font-semibold text-yellow-800">Missing documents?</div>
          <div class="text-xs text-yellow-700 mt-1">If any documents are missing or incomplete, select "Return to Researcher for Revision" in the routing decision below.</div>
        </div>
      </div>
    </div>

    <!-- Section 3: Ethics Screening -->
    <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span class="bg-urds-accent text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">III</span>
        Ethics & Human Subject Screening
      </h2>
      
      <div class="space-y-4">
        <div>
          <div class="text-sm font-semibold text-gray-700 mb-2">Does the study involve human participants?</div>
          <div class="flex gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="involvesHumans" value="no" class="w-4 h-4 text-urds-accent" id="ethics_humans_no" checked />
              <span class="text-sm text-gray-700">No</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="involvesHumans" value="yes" class="w-4 h-4 text-urds-accent" id="ethics_humans_yes" />
              <span class="text-sm text-gray-700">Yes</span>
            </label>
          </div>
        </div>

        <div id="ethicsDetailsSection" class="hidden space-y-3 pl-4 border-l-4 border-urds-accent">
          <div class="text-sm font-semibold text-gray-700 mb-2">Select applicable items:</div>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" class="w-4 h-4 text-urds-accent rounded" id="ethics_survey" />
            <span class="text-sm text-gray-700">Survey or questionnaires</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" class="w-4 h-4 text-urds-accent rounded" id="ethics_interviews" />
            <span class="text-sm text-gray-700">Interviews / FGDs</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" class="w-4 h-4 text-urds-accent rounded" id="ethics_minors" />
            <span class="text-sm text-gray-700">Minors involved</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" class="w-4 h-4 text-urds-accent rounded" id="ethics_personalData" />
            <span class="text-sm text-gray-700">Personal data collected</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" class="w-4 h-4 text-urds-accent rounded" id="ethics_sensitiveTopic" />
            <span class="text-sm text-gray-700">Sensitive topics</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" class="w-4 h-4 text-urds-accent rounded" id="ethics_clinical" />
            <span class="text-sm text-gray-700">Clinical/medical procedures</span>
          </label>

          <div class="pt-3 space-y-3">
            <div>
              <div class="text-sm font-semibold text-gray-700 mb-2">Informed Consent Provided?</div>
              <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="informedConsent" value="yes" class="w-4 h-4 text-urds-accent" id="ethics_consent_yes" checked />
                  <span class="text-sm text-gray-700">Yes</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="informedConsent" value="no" class="w-4 h-4 text-urds-accent" id="ethics_consent_no" />
                  <span class="text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>

            <div>
              <div class="text-sm font-semibold text-gray-700 mb-2">Privacy Measures Clearly Stated?</div>
              <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="privacyMeasures" value="yes" class="w-4 h-4 text-urds-accent" id="ethics_privacy_yes" checked />
                  <span class="text-sm text-gray-700">Yes</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="privacyMeasures" value="no" class="w-4 h-4 text-urds-accent" id="ethics_privacy_no" />
                  <span class="text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
          <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div class="text-xs text-blue-700">
            If ethical details are missing or incomplete, select "Return to Researcher for Revision" in the routing decision below.
          </div>
        </div>
      </div>
    </div>

    <!-- Section 4: Budget Review Summary -->
    <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span class="bg-urds-accent text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">IV</span>
        Budget Verification
      </h2>
      <div class="bg-gray-50 rounded-lg p-4 space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Personal Services Total:</span>
          <span class="font-semibold text-gray-900">₱ ${formatCurrency(p.psTotal || 0)}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">MOOE Total:</span>
          <span class="font-semibold text-gray-900">₱ ${formatCurrency(p.mooeTotal || 0)}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Equipment Total:</span>
          <span class="font-semibold text-gray-900">₱ ${formatCurrency(p.equipmentTotal || 0)}</span>
        </div>
        <div class="border-t-2 border-gray-300 my-2"></div>
        <div class="flex justify-between text-base">
          <span class="font-bold text-gray-900">Grand Total:</span>
          <span class="font-bold text-urds-accent">₱ ${formatCurrency((p.psTotal || 0) + (p.mooeTotal || 0) + (p.equipmentTotal || 0))}</span>
        </div>
      </div>
      
      <div class="mt-4">
        <a href="budget_print.html?id=${p.id}" target="_blank" class="inline-flex items-center gap-2 px-4 py-2 bg-urds-800 text-white rounded-lg text-sm font-medium hover:bg-urds-900 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
          View Full Budget Details
        </a>
      </div>

      <div class="mt-4 space-y-2">
        <div class="text-sm font-semibold text-gray-700">Budget Consistency Checks:</div>
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>No empty cost fields</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>Workplan activities align with budget</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>Equipment requests match methodology</span>
        </div>
      </div>
    </div>

    <!-- Section 5: Endorsement Validation -->
    <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span class="bg-urds-accent text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">V</span>
        Required Endorsements
      </h2>
      <div class="space-y-4">
        ${renderEndorsementDetails(p)}
      </div>
      <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
        <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div class="text-xs text-blue-700">
          If endorsements are not complete, select "Return to Researcher for Revision" in the routing decision below.
        </div>
      </div>
    </div>

    <!-- Section 6: URDS Routing Decision -->
    <div class="bg-white rounded-lg shadow-sm border-2 border-urds-accent p-6 mb-6">
      <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span class="bg-urds-accent text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">VI</span>
        URDS Final Routing Decision
      </h2>
      
      <div class="text-sm text-gray-600 mb-4">Based on the admin screening, select the next step:</div>

      <div class="space-y-3 mb-6">
        <label class="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border-2 border-transparent has-[:checked]:border-urds-accent has-[:checked]:bg-urds-50">
          <input type="radio" name="routingDecision" value="twg" class="w-5 h-5 text-urds-accent mt-0.5 flex-shrink-0" id="route_twg" />
          <div>
            <div class="font-semibold text-gray-900">Send to TWG (Technical Working Group)</div>
            <div class="text-xs text-gray-600 mt-1">For evaluation of methodology, design, feasibility</div>
          </div>
        </label>

        <label class="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border-2 border-transparent has-[:checked]:border-yellow-500 has-[:checked]:bg-yellow-50">
          <input type="radio" name="routingDecision" value="revision" class="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" id="route_revision" />
          <div>
            <div class="font-semibold text-gray-900">Return to Researcher for Revision</div>
            <div class="text-xs text-gray-600 mt-1">Missing documents or incomplete information</div>
          </div>
        </label>
      </div>

      <div>
        <label for="routingNotes" class="block text-sm font-semibold text-gray-700 mb-2">Optional Notes:</label>
        <textarea 
          id="routingNotes" 
          rows="4" 
          class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:border-urds-accent focus:ring-2 focus:ring-urds-accent focus:ring-opacity-20 transition-all resize-none"
          placeholder="Add remarks for routing..."
        ></textarea>
      </div>

      <div class="flex items-center justify-between gap-4 mt-6 pt-6 border-t">
        <a href="proposal_list.html" class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors">
          Cancel
        </a>
        <button id="submitDecisionBtn" class="px-8 py-3 bg-gradient-to-r from-urds-900 to-urds-800 text-white rounded-lg text-sm font-bold hover:shadow-lg transition-all">
          Submit Decision
        </button>
      </div>
    </div>
  `;

  // Attach event listeners
  attachFormEventListeners();
  
  // Populate cluster dropdown
  populateClusterDropdown();
}

// ===============================
// POPULATE CLUSTER DROPDOWN
// ===============================
function populateClusterDropdown() {
  const clusterSelect = document.getElementById('clusterSelect');
  if (!clusterSelect) return;
  
  // Clear existing options except the first one
  clusterSelect.innerHTML = '<option value="">Select Cluster</option>';
  
  // Add cluster options
  clusters.forEach(cluster => {
    const option = document.createElement('option');
    option.value = cluster;
    option.textContent = cluster;
    // Set selected if it matches the proposal's cluster
    if (selectedProposal && cluster === selectedProposal.cluster) {
      option.selected = true;
    }
    clusterSelect.appendChild(option);
  });
}

// ===============================
// ATTACH FORM EVENT LISTENERS
// ===============================
function attachFormEventListeners() {
  // Ethics: Show/hide human subjects details
  const ethicsHumansYes = document.getElementById('ethics_humans_yes');
  const ethicsHumansNo = document.getElementById('ethics_humans_no');
  const ethicsDetailsSection = document.getElementById('ethicsDetailsSection');

  if (ethicsHumansYes && ethicsHumansNo && ethicsDetailsSection) {
    ethicsHumansYes.addEventListener('change', () => {
      if (ethicsHumansYes.checked) {
        ethicsDetailsSection.classList.remove('hidden');
      }
    });

    ethicsHumansNo.addEventListener('change', () => {
      if (ethicsHumansNo.checked) {
        ethicsDetailsSection.classList.add('hidden');
      }
    });
  }

  // Submit Decision Button
  const submitBtn = document.getElementById('submitDecisionBtn');
  if (submitBtn) {
    submitBtn.addEventListener('click', handleSubmitDecision);
  }
}

// ===============================
// HANDLE SUBMIT DECISION
// ===============================
async function handleSubmitDecision() {
  // Collect form data
  const routingDecision = document.querySelector('input[name="routingDecision"]:checked');
  const routingNotes = document.getElementById('routingNotes').value;
  const selectedCluster = document.getElementById('clusterSelect').value;

  if (!routingDecision) {
    alert('Please select a routing decision.');
    return;
  }
  
  if (!selectedCluster) {
    alert('Please select a research cluster.');
    return;
  }

  // Collect completeness checks
  reviewData.completeness.capsule = document.getElementById('check_capsule').checked;
  reviewData.completeness.workplan = document.getElementById('check_workplan').checked;
  reviewData.completeness.budget = document.getElementById('check_budget').checked;
  reviewData.completeness.fullProposal = document.getElementById('check_fullProposal').checked;
  reviewData.completeness.objectives = document.getElementById('check_objectives').checked;
  reviewData.completeness.methodology = document.getElementById('check_methodology').checked;
  reviewData.completeness.rationale = document.getElementById('check_rationale').checked;

  // Collect ethics data
  reviewData.ethics.involvesHumans = document.querySelector('input[name="involvesHumans"]:checked').value;
  if (reviewData.ethics.involvesHumans === 'yes') {
    reviewData.ethics.details.survey = document.getElementById('ethics_survey')?.checked || false;
    reviewData.ethics.details.interviews = document.getElementById('ethics_interviews')?.checked || false;
    reviewData.ethics.details.minors = document.getElementById('ethics_minors')?.checked || false;
    reviewData.ethics.details.personalData = document.getElementById('ethics_personalData')?.checked || false;
    reviewData.ethics.details.sensitiveTopic = document.getElementById('ethics_sensitiveTopic')?.checked || false;
    reviewData.ethics.details.clinicalProcedures = document.getElementById('ethics_clinical')?.checked || false;
    reviewData.ethics.informedConsent = document.querySelector('input[name="informedConsent"]:checked')?.value || 'no';
    reviewData.ethics.privacyMeasures = document.querySelector('input[name="privacyMeasures"]:checked')?.value || 'no';
  }

  // Collect routing decision
  reviewData.routing.decision = routingDecision.value;
  reviewData.routing.notes = routingNotes;

  // Map routing decision to status
  let newStatus = '';
  switch (reviewData.routing.decision) {
    case 'twg':
      newStatus = 'for TWG evaluation';
      break;
    case 'revision':
      newStatus = 'returned for revision';
      break;
    default:
      alert('Invalid routing decision');
      return;
  }

  // Confirm submission
  if (!confirm(`Are you sure you want to route this proposal to: ${newStatus}?`)) {
    return;
  }

  try {
    // Submit to backend
    const response = await fetch('../../backend/update_proposal_status.php', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        proposalId: selectedProposal.id,
        status: newStatus,
        cluster: selectedCluster,
        notes: routingNotes,
        reviewData: reviewData
      })
    });

    const result = await response.json();

    if (result.status === 'success') {
      alert('Proposal routing decision submitted successfully!');
      window.location.href = 'proposal_list.html';
    } else {
      throw new Error(result.message || 'Failed to submit decision');
    }
  } catch (error) {
    console.error('Error submitting decision:', error);
    alert('Error submitting decision: ' + error.message);
  }
}

// ===============================
// RENDER NO PROPOSALS
// ===============================
function renderNoProposals() {
  reviewFormContainer.innerHTML = `
    <div class="bg-white rounded-lg shadow-sm border p-12 text-center">
      <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
      <div class="text-gray-500 text-lg font-medium">No proposals for URDS review</div>
      <div class="text-gray-400 text-sm mt-1">There are currently no proposals with "For URDS Review" status</div>
    </div>
  `;
}

// ===============================
// FETCH DETAILED PROPOSAL WITH HISTORY
// ===============================
async function fetchProposalDetails(proposalId) {
  try {
    const response = await fetch(`../../backend/get_proposal.php?id=${proposalId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.status === 'success') {
      return result.proposal;
    } else {
      throw new Error(result.message || 'Failed to fetch proposal details');
    }
  } catch (error) {
    console.error('Error fetching proposal details:', error);
    return null;
  }
}

// Proposal selector change event
proposalSelectorEl.addEventListener("change", async (e) => {
  const proposalId = parseInt(e.target.value);
  const basicProposal = proposals.find(p => p.id === proposalId);
  if (basicProposal) {
    // Fetch detailed proposal with history
    const detailedProposal = await fetchProposalDetails(proposalId);
    if (detailedProposal) {
      // Merge basic proposal data with detailed data
      selectedProposal = { ...basicProposal, ...detailedProposal };
    } else {
      selectedProposal = basicProposal;
    }
    renderReviewForm();
  }
});

// ===============================
// RENDER ENDORSEMENT DETAILS
// ===============================
function renderEndorsementDetails(proposal) {
  const history = proposal.history || [];
  
  // Find dean and coordinator endorsements from history
  const deanEndorsement = history.find(h => h.role === 'College Dean');
  const coordinatorEndorsement = history.find(h => h.role === 'College Research Coordinator');
  
  let html = '';
  
  // Dean Endorsement
  if (deanEndorsement) {
    html += `
      <div class="border-2 border-green-200 bg-green-50 rounded-lg p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="text-sm font-semibold text-gray-900">Dean Endorsement</span>
          </div>
          <span class="px-2 py-1 bg-green-100 text-green-800 border border-green-300 rounded text-xs font-semibold">Completed</span>
        </div>
        <div class="space-y-2 pl-7">
          <div class="flex items-start gap-2">
            <span class="text-xs font-semibold text-gray-600 min-w-[60px]">Name:</span>
            <span class="text-xs text-gray-900">${escapeHtml(deanEndorsement.user || 'N/A')}</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-xs font-semibold text-gray-600 min-w-[60px]">Action:</span>
            <span class="text-xs text-gray-900">${escapeHtml(deanEndorsement.action || 'N/A')}</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-xs font-semibold text-gray-600 min-w-[60px]">Date:</span>
            <span class="text-xs text-gray-900">${escapeHtml(deanEndorsement.date || 'N/A')}</span>
          </div>
          ${deanEndorsement.comment ? `
            <div class="mt-2 pt-2 border-t border-green-200">
              <div class="text-xs font-semibold text-gray-600 mb-1">Comments:</div>
              <div class="text-xs text-gray-900 bg-white rounded p-2 border border-green-200">${escapeHtml(deanEndorsement.comment)}</div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  } else {
    html += `
      <div class="border-2 border-yellow-200 bg-yellow-50 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="text-sm font-semibold text-gray-900">Dean Endorsement</span>
          </div>
          <span class="px-2 py-1 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded text-xs font-semibold">Pending</span>
        </div>
      </div>
    `;
  }
  
  // College Research Coordinator Endorsement
  if (coordinatorEndorsement) {
    html += `
      <div class="border-2 border-green-200 bg-green-50 rounded-lg p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="text-sm font-semibold text-gray-900">College Research Coordinator Review</span>
          </div>
          <span class="px-2 py-1 bg-green-100 text-green-800 border border-green-300 rounded text-xs font-semibold">Completed</span>
        </div>
        <div class="space-y-2 pl-7">
          <div class="flex items-start gap-2">
            <span class="text-xs font-semibold text-gray-600 min-w-[60px]">Name:</span>
            <span class="text-xs text-gray-900">${escapeHtml(coordinatorEndorsement.user || 'N/A')}</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-xs font-semibold text-gray-600 min-w-[60px]">Action:</span>
            <span class="text-xs text-gray-900">${escapeHtml(coordinatorEndorsement.action || 'N/A')}</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-xs font-semibold text-gray-600 min-w-[60px]">Date:</span>
            <span class="text-xs text-gray-900">${escapeHtml(coordinatorEndorsement.date || 'N/A')}</span>
          </div>
          ${coordinatorEndorsement.comment ? `
            <div class="mt-2 pt-2 border-t border-green-200">
              <div class="text-xs font-semibold text-gray-600 mb-1">Comments:</div>
              <div class="text-xs text-gray-900 bg-white rounded p-2 border border-green-200">${escapeHtml(coordinatorEndorsement.comment)}</div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  } else {
    html += `
      <div class="border-2 border-yellow-200 bg-yellow-50 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="text-sm font-semibold text-gray-900">College Research Coordinator Review</span>
          </div>
          <span class="px-2 py-1 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded text-xs font-semibold">Pending</span>
        </div>
      </div>
    `;
  }
  
  return html;
}

// ===============================
// HELPER FUNCTIONS
// ===============================
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatCurrency(amount) {
  return parseFloat(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// ===============================
// INITIAL LOAD
// ===============================
fetchProposals();
