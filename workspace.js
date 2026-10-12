/**
 * ContextBridge Master Workspace Controller
 * Orchestrates conversation library, structured brief editor, milestone timeline,
 * state diffing, prompt preview, evidence drawer, and multi-format export.
 */

import { BriefModes, DiffKinds, ReviewStatuses, FactCategories } from './src/domain/types.js';
import { normalizeMessages, parseRawTranscript, generateId, estimateTokens } from './src/domain/normalize.js';
import { buildContinuationBrief } from './src/domain/build-brief.js';
import { buildContinuationPrompt } from './src/domain/build-prompt.js';
import { computeStateDiff } from './src/domain/state-diff.js';
import { runQualityChecks } from './src/domain/quality-checks.js';
import {
  saveConversation,
  getConversation,
  listConversations,
  deleteConversation,
  clearAllConversationData
} from './src/storage/conversation-repository.js';
import {
  saveBrief,
  getBrief,
  getBriefByConversationId
} from './src/storage/brief-repository.js';
import { searchLocal, SearchFilters } from './src/search/local-search.js';
import { exportBriefToMarkdown } from './src/export/markdown.js';
import { exportToJSON, validateAndParseJSON } from './src/export/json.js';

// DOM Elements
const conversationsListEl = document.getElementById('conversations-list');
const libraryCountEl = document.getElementById('library-count');
const globalSearchInput = document.getElementById('global-search');
const btnClearSearch = document.getElementById('btn-clear-search');
const filterChips = document.querySelectorAll('.filter-chip');

const briefTitleInput = document.getElementById('brief-title-input');
const briefProviderBadge = document.getElementById('brief-provider-badge');
const briefSourceCount = document.getElementById('brief-source-count');
const briefTokenBadge = document.getElementById('brief-token-badge');
const modeButtons = document.querySelectorAll('.mode-btn');
const btnRegenerateDraft = document.getElementById('btn-regenerate-draft');
const qualityChecksBanner = document.getElementById('quality-checks-banner');

const studioTabs = document.querySelectorAll('.studio-tab');
const viewSections = document.getElementById('view-sections');
const viewTimeline = document.getElementById('view-timeline');
const viewDiff = document.getElementById('view-diff');
const briefSectionsContainer = document.getElementById('brief-sections-container');
const timelineNodesList = document.getElementById('timeline-nodes-list');
const diffCardsList = document.getElementById('diff-cards-list');
const timelineCountBadge = document.getElementById('timeline-count-badge');
const diffCountBadge = document.getElementById('diff-count-badge');
const btnAddMilestone = document.getElementById('btn-add-milestone');

const targetLlmSelect = document.getElementById('target-llm-select');
const btnCopyPrompt = document.getElementById('btn-copy-prompt');
const copyBtnText = document.getElementById('copy-btn-text');
const btnBridgeTab = document.getElementById('btn-bridge-tab');
const btnExportMarkdown = document.getElementById('btn-export-markdown');
const btnExportJSON = document.getElementById('btn-export-json');
const btnDeleteConv = document.getElementById('btn-delete-conv');
const promptPreviewText = document.getElementById('prompt-preview-text');
const promptPreviewChars = document.getElementById('prompt-preview-chars');

const evidenceInspectorCard = document.getElementById('evidence-inspector-card');
const evidenceContent = document.getElementById('evidence-content');
const btnCloseEvidence = document.getElementById('btn-close-evidence');

// Modals
const importModal = document.getElementById('import-modal');
const btnNewChat = document.getElementById('btn-new-chat');
const btnCloseImport = document.getElementById('btn-close-import');
const btnCancelImport = document.getElementById('btn-cancel-import');
const btnSubmitImport = document.getElementById('btn-submit-import');
const importModalTabs = document.querySelectorAll('.modal-tab');
const tabPasteContent = document.getElementById('tab-paste-content');
const tabFileContent = document.getElementById('tab-file-content');
const importTitleInput = document.getElementById('import-title');
const importPasteArea = document.getElementById('import-paste-area');
const importParseStats = document.getElementById('import-parse-stats');
const fileInput = document.getElementById('file-input');
const btnBrowseFile = document.getElementById('btn-browse-file');
const selectedFileName = document.getElementById('selected-file-name');

const settingsModal = document.getElementById('settings-modal');
const btnOpenSettings = document.getElementById('btn-open-settings');
const btnCloseSettings = document.getElementById('btn-close-settings');
const btnSaveSettings = document.getElementById('btn-save-settings');
const btnClearAllData = document.getElementById('btn-clear-all-data');

const toastEl = document.getElementById('workspace-toast');

// Workspace Application State
let currentConversation = null;
let currentBrief = null;
let currentMode = BriefModes.BALANCED;
let conversations = [];
let activeSearchFilter = SearchFilters.ALL;
let currentDiffItems = [];

// =========================================================
// INITIALIZATION
// =========================================================
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await loadConversationsLibrary();

  // Parse URL search params
  const params = new URLSearchParams(window.location.search);
  const convId = params.get('convId');
  const briefId = params.get('briefId');
  const modalParam = params.get('modal');

  if (convId) {
    await selectConversation(convId);
  } else if (conversations.length > 0) {
    await selectConversation(conversations[0].id);
  } else {
    // Seed an initial demo project so workspace is never empty
    await seedInitialDemoProject();
  }

  if (modalParam === 'paste' || modalParam === 'import') {
    openImportModal(modalParam === 'file' ? 'file' : 'paste');
  } else if (params.get('tab') === 'settings') {
    openSettingsModal();
  }
});

// Seed an initial rich demonstration conversation
async function seedInitialDemoProject() {
  const demoTranscript = `
User: I want to build a privacy-first browser extension for AI conversation continuity called ContextBridge.
Assistant: That is a great project. What technical stack and browser environment are you planning to use?
User: We decided to use Chromium Manifest V3 with vanilla modern web components and client-side IndexedDB. The system must never send user conversation transcripts to remote servers without explicit opt-in.
Assistant: Excellent choice. What architectural decisions have you finalized?
User: We decided to use a deterministic local rule engine as our baseline summarizer, with a signature Project State Timeline and State Diff engine.
Assistant: What is the current status and blocking errors?
User: Status: Storage and parsing layers are implemented. Error encountered: TypeError: Cannot read properties of undefined in parseRawTranscript during single prompt fallback, which we just resolved.
Assistant: Next steps: 
1. Finalize the 3-column editorial Continuity Workspace.
2. Implement live Prompt Builder and multi-format export.
3. Test end-to-end conversation continuity across ChatGPT and Claude.
`;

  const parsed = parseRawTranscript(demoTranscript);
  const convRecord = {
    id: 'demo_conv_1',
    title: 'ContextBridge Architecture & Engineering',
    provider: 'ChatGPT',
    sourceUrl: 'https://chatgpt.com/',
    captureMethod: 'paste',
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now(),
    messages: parsed.messages
  };

  await saveConversation(convRecord);
  const brief = buildContinuationBrief(convRecord, { mode: BriefModes.BALANCED });
  await saveBrief(brief);

  await loadConversationsLibrary();
  await selectConversation(convRecord.id);
}

// =========================================================
// CONVERSATION LIBRARY & SEARCH
// =========================================================
async function loadConversationsLibrary() {
  const query = globalSearchInput.value.trim();
  
  if (query || activeSearchFilter !== SearchFilters.ALL) {
    const results = await searchLocal(query, activeSearchFilter);
    renderSearchResults(results);
    libraryCountEl.textContent = `${results.length}`;
  } else {
    conversations = await listConversations();
    renderConversationsList(conversations);
    libraryCountEl.textContent = `${conversations.length}`;
  }
}

function renderConversationsList(list) {
  conversationsListEl.innerHTML = '';
  if (list.length === 0) {
    conversationsListEl.innerHTML = `
      <div class="empty-state text-center text-xs text-muted" style="padding: 24px 12px;">
        No saved conversations yet.<br>Click "Import" to paste a chat.
      </div>
    `;
    return;
  }

  list.forEach(conv => {
    const item = document.createElement('div');
    item.className = `conv-item ${currentConversation?.id === conv.id ? 'active' : ''}`;
    item.setAttribute('role', 'listitem');
    item.innerHTML = `
      <div class="conv-title-row">
        <span class="conv-title">${escapeHtml(conv.title || 'Untitled Chat')}</span>
      </div>
      <div class="conv-meta-row">
        <div class="conv-meta-left">
          <span class="badge badge-provider" style="font-size: 10px; padding: 1px 6px;">${escapeHtml(conv.provider || 'AI')}</span>
          <span>${conv.messages?.length || 0} msgs</span>
        </div>
        <span>${formatRelativeTime(conv.updatedAt)}</span>
      </div>
    `;
    item.addEventListener('click', () => selectConversation(conv.id));
    conversationsListEl.appendChild(item);
  });
}

function renderSearchResults(results) {
  conversationsListEl.innerHTML = '';
  if (results.length === 0) {
    conversationsListEl.innerHTML = `
      <div class="empty-state text-center text-xs text-muted" style="padding: 24px 12px;">
        No matches found for your filter.
      </div>
    `;
    return;
  }

  results.forEach(res => {
    const item = document.createElement('div');
    item.className = 'conv-item';
    item.innerHTML = `
      <div class="conv-title-row">
        <span class="conv-title">${escapeHtml(res.conversationTitle)}</span>
        <span class="badge" style="font-size: 9.5px; text-transform: uppercase;">${res.type}</span>
      </div>
      <div class="text-xs text-muted" style="line-height: 1.4; margin-top: 3px;">
        ${escapeHtml(res.snippet)}
      </div>
    `;
    item.addEventListener('click', () => selectConversation(res.conversationId));
    conversationsListEl.appendChild(item);
  });
}

async function selectConversation(id) {
  const conv = await getConversation(id);
  if (!conv) return;

  currentConversation = conv;

  // Fetch or generate brief
  let brief = await getBriefByConversationId(conv.id);
  if (!brief) {
    brief = buildContinuationBrief(conv, { mode: currentMode });
    await saveBrief(brief);
  }

  currentBrief = brief;
  currentMode = brief.mode || BriefModes.BALANCED;

  // Run State Diff against baseline facts
  computeAndRenderDiff();

  // Render UI
  renderBriefStudio();
  renderPromptPreview();
  loadConversationsLibrary();
}

// =========================================================
// STUDIO RENDERING
// =========================================================
function renderBriefStudio() {
  if (!currentBrief) return;

  briefTitleInput.value = currentBrief.title || currentConversation?.title || 'Continuation Brief';
  briefProviderBadge.textContent = currentConversation?.provider || 'AI Assistant';
  briefSourceCount.textContent = `${currentConversation?.messages?.length || 0} messages`;
  briefTokenBadge.textContent = `~${currentBrief.sizeEstimate || 0} est. tokens`;

  // Update mode selector buttons
  modeButtons.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-mode') === currentMode);
  });

  // Render Quality Checks
  renderQualityChecks();

  // Render Tab 1: Sections
  renderSectionsList();

  // Render Tab 2: Milestone Timeline
  renderMilestoneTimeline();

  // Render Tab 3: State Diff
  renderDiffCards();
}

function renderQualityChecks() {
  const issues = runQualityChecks(currentBrief, currentConversation);
  if (issues.length === 0) {
    qualityChecksBanner.style.display = 'none';
    qualityChecksBanner.innerHTML = '';
    return;
  }

  qualityChecksBanner.style.display = 'flex';
  qualityChecksBanner.innerHTML = issues.map(iss => `
    <div class="quality-issue ${iss.severity}">
      <span>${iss.severity === 'danger' ? '⚠️' : 'ℹ️'}</span>
      <strong>${escapeHtml(iss.title)}:</strong>
      <span>${escapeHtml(iss.message)}</span>
    </div>
  `).join('');
}

function renderSectionsList() {
  briefSectionsContainer.innerHTML = '';

  (currentBrief.sections || []).forEach((sec, index) => {
    const card = document.createElement('div');
    card.className = 'section-card';
    card.innerHTML = `
      <div class="section-card-header">
        <div class="section-card-title-group">
          <label class="toggle-switch">
            <input type="checkbox" class="section-include-toggle" ${sec.included ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
          <span class="section-card-title">${escapeHtml(sec.title)}</span>
          ${sec.needsReview ? '<span class="badge" style="color: var(--warning); border-color: var(--warning); font-size: 10px;">Review Needed</span>' : ''}
          ${sec.editedByUser ? '<span class="badge" style="color: var(--accent); font-size: 10px;">Edited</span>' : ''}
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          ${sec.sourceMessageIds && sec.sourceMessageIds.length > 0 ? `
            <button class="btn btn-outline btn-sm btn-inspect-source" style="padding: 2px 8px; font-size: 11px;">
              🔍 Source (${sec.sourceMessageIds.length})
            </button>
          ` : ''}
          <span class="text-xs text-muted">~${estimateTokens(sec.content)} tok</span>
        </div>
      </div>
      <div class="section-card-body" style="${sec.included ? '' : 'opacity: 0.5;'}">
        <textarea class="section-textarea" aria-label="${sec.title}">${escapeHtml(sec.content || '')}</textarea>
        <div class="section-footer">
          <span>Click to edit directly. Edits are preserved across regeneration.</span>
          <span>${sec.content ? sec.content.length : 0} characters</span>
        </div>
      </div>
    `;

    // Toggle include/exclude
    const toggle = card.querySelector('.section-include-toggle');
    const textarea = card.querySelector('.section-textarea');
    const body = card.querySelector('.section-card-body');

    toggle.addEventListener('change', async (e) => {
      sec.included = e.target.checked;
      body.style.opacity = sec.included ? '1' : '0.5';
      await saveCurrentBrief();
      renderPromptPreview();
    });

    // Content edit
    textarea.addEventListener('input', async (e) => {
      sec.content = e.target.value;
      sec.editedByUser = true;
      card.querySelector('.section-footer span:last-child').textContent = `${sec.content.length} characters`;
      await saveCurrentBrief();
      renderPromptPreview();
    });

    // Inspect source
    const btnInspect = card.querySelector('.btn-inspect-source');
    btnInspect?.addEventListener('click', () => {
      openEvidenceDrawer(sec.title, sec.sourceMessageIds);
    });

    briefSectionsContainer.appendChild(card);
  });
}

function renderMilestoneTimeline() {
  const milestones = currentBrief.milestones || [];
  timelineCountBadge.textContent = `${milestones.length}`;
  timelineNodesList.innerHTML = '';

  if (milestones.length === 0) {
    timelineNodesList.innerHTML = `
      <div class="text-xs text-muted" style="padding: 16px 0;">
        No milestones extracted yet. Use "+ Add Milestone" or capture an extended chat.
      </div>
    `;
    return;
  }

  milestones.forEach((m, idx) => {
    const node = document.createElement('div');
    node.className = 'timeline-node';
    node.innerHTML = `
      <div class="node-dot">${idx + 1}</div>
      <div class="node-card">
        <div class="node-header">
          <div class="node-title-group">
            <span class="badge" style="font-size: 10px; text-transform: uppercase;">${m.category || 'milestone'}</span>
            <span class="node-title">${escapeHtml(m.title)}</span>
          </div>
          <div style="display: flex; gap: 6px; align-items: center;">
            <button class="btn btn-outline btn-sm btn-pin-node" style="padding: 2px 6px; font-size: 11px;" title="Pin to Brief">
              ${m.pinned ? '📌 Pinned' : 'Pin'}
            </button>
            <button class="icon-link btn-delete-node" style="font-size: 14px;" title="Remove milestone">&times;</button>
          </div>
        </div>
        <p class="node-summary">${escapeHtml(m.summary)}</p>
        <div class="node-footer">
          <span>Source: ${m.sourceMessageId ? `Message #${m.sequence || 'ref'}` : 'Inferred'}</span>
          ${m.sourceMessageId ? `<button class="text-link btn-node-source text-xs">View Original Message</button>` : ''}
        </div>
      </div>
    `;

    // Pin toggle
    node.querySelector('.btn-pin-node').addEventListener('click', async () => {
      m.pinned = !m.pinned;
      await saveCurrentBrief();
      renderMilestoneTimeline();
      showToast(m.pinned ? 'Milestone pinned to brief!' : 'Milestone unpinned.');
    });

    // Delete
    node.querySelector('.btn-delete-node').addEventListener('click', async () => {
      currentBrief.milestones = currentBrief.milestones.filter(item => item.id !== m.id);
      await saveCurrentBrief();
      renderMilestoneTimeline();
    });

    // View Source
    node.querySelector('.btn-node-source')?.addEventListener('click', () => {
      openEvidenceDrawer(m.title, [m.sourceMessageId]);
    });

    timelineNodesList.appendChild(node);
  });
}

function computeAndRenderDiff() {
  if (!currentConversation || !currentBrief) return;

  // Previous facts from existing milestones or baseline
  const previousFacts = (currentBrief.milestones || []).map(m => ({
    id: m.id,
    category: m.category,
    statement: m.summary,
    evidence: [{ messageId: m.sourceMessageId, sequence: m.sequence }],
    reviewStatus: m.reviewStatus || ReviewStatuses.ACCEPTED
  }));

  // Incoming facts from latest messages
  const proposedFacts = (currentBrief.sections || [])
    .filter(s => s.included && s.content)
    .map(s => ({
      id: generateId('fact'),
      category: s.key === 'goal' ? 'goal' : (s.key === 'decisions' ? 'decision' : 'requirement'),
      statement: s.content.split('\n')[0].replace(/^[-•*0-9.]+\s*/, ''),
      evidence: (s.sourceMessageIds || []).map(id => ({ messageId: id })),
      reviewStatus: ReviewStatuses.NEEDS_REVIEW
    }));

  currentDiffItems = computeStateDiff(previousFacts, proposedFacts);
  diffCountBadge.textContent = `${currentDiffItems.length}`;
}

function renderDiffCards() {
  diffCardsList.innerHTML = '';
  if (currentDiffItems.length === 0) {
    diffCardsList.innerHTML = `
      <div class="text-xs text-muted" style="padding: 16px 0;">
        All facts are consistent with baseline. No conflicts or unreviewed state changes detected.
      </div>
    `;
    return;
  }

  currentDiffItems.forEach(diff => {
    const card = document.createElement('div');
    card.className = `diff-card ${diff.kind}`;

    let badgeClass = 'badge-diff-new';
    if (diff.kind === DiffKinds.CHANGED) badgeClass = 'badge-diff-changed';
    if (diff.kind === DiffKinds.POSSIBLE_CONFLICT) badgeClass = 'badge-diff-conflict';

    card.innerHTML = `
      <div class="diff-header">
        <div class="diff-tag-row">
          <span class="badge ${badgeClass}" style="text-transform: uppercase; font-size: 10px;">${diff.kind}</span>
          <span class="text-xs font-semibold">${escapeHtml(diff.reason)}</span>
        </div>
        <span class="badge" style="font-size: 10px;">${diff.reviewStatus}</span>
      </div>

      <div class="diff-comparison">
        <div>
          <div class="diff-box-title">Baseline / Previous Fact</div>
          <p class="text-xs">${diff.previousFact ? escapeHtml(diff.previousFact.statement) : '<em class="text-muted">None (New Discovery)</em>'}</p>
        </div>
        <div>
          <div class="diff-box-title">Proposed Fact</div>
          <p class="text-xs">${diff.proposedFact ? escapeHtml(diff.proposedFact.statement) : '<em class="text-muted">None (Omitted or Replaced)</em>'}</p>
        </div>
      </div>

      <div class="diff-actions-row">
        <button class="btn btn-secondary btn-sm btn-reject-diff">Reject</button>
        <button class="btn btn-primary btn-sm btn-accept-diff">Accept &amp; Merge</button>
      </div>
    `;

    card.querySelector('.btn-accept-diff').addEventListener('click', () => {
      diff.reviewStatus = ReviewStatuses.ACCEPTED;
      card.style.opacity = '0.5';
      showToast('State change accepted into project baseline!');
    });

    card.querySelector('.btn-reject-diff').addEventListener('click', () => {
      diff.reviewStatus = ReviewStatuses.REJECTED;
      card.remove();
      showToast('State change rejected.');
    });

    diffCardsList.appendChild(card);
  });
}

// =========================================================
// PROMPT BUILDER & RIGHT DRAWER
// =========================================================
function renderPromptPreview() {
  if (!currentBrief) return;

  const targetName = targetLlmSelect.options[targetLlmSelect.selectedIndex].text.split(' ')[0];
  const { promptText, tokenCount } = buildContinuationPrompt(currentBrief, { targetName });

  promptPreviewText.value = promptText;
  promptPreviewChars.value = `${promptText.length} chars · ~${tokenCount} tokens`;
  briefTokenBadge.textContent = `~${tokenCount} est. tokens`;
}

function openEvidenceDrawer(title, messageIds = []) {
  evidenceInspectorCard.style.display = 'flex';
  evidenceContent.innerHTML = '';

  if (!messageIds || messageIds.length === 0 || !currentConversation?.messages) {
    evidenceContent.innerHTML = '<div class="text-xs text-muted">No direct message IDs linked to this item.</div>';
    return;
  }

  const matched = currentConversation.messages.filter(m => messageIds.includes(m.id));
  if (matched.length === 0) {
    evidenceContent.innerHTML = '<div class="text-xs text-muted">Source message unavailable in current transcript.</div>';
    return;
  }

  matched.forEach(msg => {
    const card = document.createElement('div');
    card.className = 'evidence-message-card';
    card.innerHTML = `
      <div class="evidence-role">${msg.role.toUpperCase()} (Message #${msg.sequence})</div>
      <div>${escapeHtml(msg.content)}</div>
    `;
    evidenceContent.appendChild(card);
  });
}

// =========================================================
// EVENT HANDLERS & MODALS
// =========================================================
function setupEventListeners() {
  // Studio View Tabs
  studioTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      studioTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const view = tab.getAttribute('data-view');
      viewSections.style.display = view === 'sections' ? 'block' : 'none';
      viewTimeline.style.display = view === 'timeline' ? 'block' : 'none';
      viewDiff.style.display = view === 'diff' ? 'block' : 'none';
    });
  });

  // Mode Selector Buttons
  modeButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      currentMode = btn.getAttribute('data-mode');
      if (currentConversation) {
        currentBrief = buildContinuationBrief(currentConversation, {
          mode: currentMode,
          existingBrief: currentBrief
        });
        await saveBrief(currentBrief);
        renderBriefStudio();
        renderPromptPreview();
        showToast(`Switched to ${currentMode.toUpperCase()} mode (~${currentBrief.sizeEstimate} tokens).`);
      }
    });
  });

  // Title autosave
  briefTitleInput.addEventListener('change', async () => {
    if (currentBrief) {
      currentBrief.title = briefTitleInput.value.trim() || 'Untitled Brief';
      await saveCurrentBrief();
      renderPromptPreview();
      loadConversationsLibrary();
    }
  });

  // Regenerate Draft
  btnRegenerateDraft.addEventListener('click', async () => {
    if (!currentConversation) return;
    currentBrief = buildContinuationBrief(currentConversation, {
      mode: currentMode,
      existingBrief: currentBrief // preserves user edits
    });
    await saveBrief(currentBrief);
    renderBriefStudio();
    renderPromptPreview();
    showToast('Regenerated continuation draft while preserving your edits!');
  });

  // Search input & filter chips
  globalSearchInput.addEventListener('input', () => {
    btnClearSearch.style.display = globalSearchInput.value ? 'block' : 'none';
    loadConversationsLibrary();
  });

  btnClearSearch.addEventListener('click', () => {
    globalSearchInput.value = '';
    btnClearSearch.style.display = 'none';
    loadConversationsLibrary();
  });

  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeSearchFilter = chip.getAttribute('data-filter');
      loadConversationsLibrary();
    });
  });

  // Add Milestone Button
  btnAddMilestone.addEventListener('click', async () => {
    const title = prompt('Milestone Title:', 'Feature Implemented');
    if (!title) return;
    const summary = prompt('Milestone Summary / Outcome:', 'Successfully verified client module.');
    if (!summary) return;

    if (!currentBrief.milestones) currentBrief.milestones = [];
    currentBrief.milestones.push({
      id: generateId('m_custom'),
      title,
      summary,
      category: FactCategories.MILESTONE,
      sequence: (currentBrief.milestones.length + 1),
      pinned: true,
      reviewStatus: ReviewStatuses.ACCEPTED
    });
    await saveCurrentBrief();
    renderMilestoneTimeline();
    showToast('Milestone created!');
  });

  // Target LLM Select
  targetLlmSelect.addEventListener('change', () => {
    renderPromptPreview();
  });

  // Copy Prompt Button
  btnCopyPrompt.addEventListener('click', async () => {
    if (!promptPreviewText.value) return;

    try {
      await navigator.clipboard.writeText(promptPreviewText.value);
      copyBtnText.textContent = '✓ Copied to Clipboard!';
      btnCopyPrompt.style.backgroundColor = 'var(--success)';
      showToast('Continuation prompt copied! Ready to paste into target LLM.');
      setTimeout(() => {
        copyBtnText.textContent = 'Copy Continuation Prompt';
        btnCopyPrompt.style.backgroundColor = '';
      }, 2500);
    } catch {
      showToast('Failed to copy. Please manually select and copy text.');
    }
  });

  // Bridge & Open Tab
  btnBridgeTab.addEventListener('click', () => {
    const target = targetLlmSelect.value;
    if (target === 'generic') {
      showToast('Select ChatGPT, Claude, or Gemini to auto-open target chat.');
      return;
    }

    chrome.runtime.sendMessage({
      action: 'bridge_context',
      target,
      promptText: promptPreviewText.value
    }, (res) => {
      if (res && res.success) {
        showToast(`Opening ${target.toUpperCase()} and preparing prompt injection...`);
      }
    });
  });

  // Markdown Export
  btnExportMarkdown.addEventListener('click', () => {
    if (!currentBrief) return;
    const md = exportBriefToMarkdown(currentBrief, currentConversation);
    downloadFile(md, `${sanitizeFilename(currentBrief.title || 'brief')}.md`, 'text/markdown');
    showToast('Exported brief as Markdown document.');
  });

  // JSON Export
  btnExportJSON.addEventListener('click', () => {
    if (!currentConversation) return;
    const jsonStr = exportToJSON(currentConversation, currentBrief);
    downloadFile(jsonStr, `${sanitizeFilename(currentConversation.title || 'chat')}_export.json`, 'application/json');
    showToast('Exported structured project data as JSON.');
  });

  // Delete Conversation
  btnDeleteConv.addEventListener('click', async () => {
    if (!currentConversation) return;
    const ok = confirm(`Delete "${currentConversation.title}" and its continuation brief from local storage?`);
    if (ok) {
      await deleteConversation(currentConversation.id);
      showToast('Conversation deleted.');
      currentConversation = null;
      currentBrief = null;
      await loadConversationsLibrary();
      if (conversations.length > 0) {
        await selectConversation(conversations[0].id);
      } else {
        location.reload();
      }
    }
  });

  // Evidence Close
  btnCloseEvidence.addEventListener('click', () => {
    evidenceInspectorCard.style.display = 'none';
  });

  // Import Dialog controls
  btnNewChat.addEventListener('click', () => openImportModal('paste'));
  btnCloseImport.addEventListener('click', closeImportModal);
  btnCancelImport.addEventListener('click', closeImportModal);
  btnBrowseFile.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      selectedFileName.textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
      const reader = new FileReader();
      reader.onload = (event) => {
        handleFileContent(event.target.result, file.name);
      };
      reader.readAsText(file);
    }
  });

  importModalTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      importModalTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const mode = tab.getAttribute('data-tab');
      tabPasteContent.style.display = mode === 'paste' ? 'block' : 'none';
      tabFileContent.style.display = mode === 'file' ? 'block' : 'none';
    });
  });

  btnSubmitImport.addEventListener('click', handleManualImportSubmit);

  // Settings Modal controls
  btnOpenSettings.addEventListener('click', openSettingsModal);
  btnCloseSettings.addEventListener('click', closeSettingsModal);
  btnSaveSettings.addEventListener('click', closeSettingsModal);

  btnClearAllData.addEventListener('click', async () => {
    const ok = confirm('WARNING: This will permanently erase ALL conversations, briefs, and search data stored locally in your browser. Proceed?');
    if (ok) {
      await clearAllConversationData();
      alert('All local data cleared successfully.');
      location.reload();
    }
  });
}

// =========================================================
// IMPORT LOGIC
// =========================================================
function openImportModal(initialTab = 'paste') {
  importModal.style.display = 'flex';
  importTitleInput.value = '';
  importPasteArea.value = '';
  importModalTabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-tab') === initialTab));
  tabPasteContent.style.display = initialTab === 'paste' ? 'block' : 'none';
  tabFileContent.style.display = initialTab === 'file' ? 'block' : 'none';
}

function closeImportModal() {
  importModal.style.display = 'none';
}

async function handleManualImportSubmit() {
  const title = importTitleInput.value.trim() || 'Imported Conversation';
  const rawText = importPasteArea.value.trim();

  if (!rawText) {
    alert('Please paste transcript text or select a file to import.');
    return;
  }

  // Check if pasted text is JSON
  if (rawText.startsWith('{') || rawText.startsWith('[')) {
    const jsonParsed = validateAndParseJSON(rawText);
    if (jsonParsed.valid) {
      if (jsonParsed.type === 'contextbridge') {
        await saveConversation(jsonParsed.conversation);
        if (jsonParsed.brief) await saveBrief(jsonParsed.brief);
        closeImportModal();
        await selectConversation(jsonParsed.conversation.id);
        showToast('ContextBridge archive imported successfully!');
        return;
      }
    }
  }

  // Parse text transcript
  const { messages, warnings } = parseRawTranscript(rawText);
  if (messages.length === 0) {
    alert('Could not parse any messages from the provided text.');
    return;
  }

  const convRecord = {
    id: `conv_${Date.now()}`,
    title,
    provider: 'Manual Import',
    captureMethod: 'paste',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages
  };

  await saveConversation(convRecord);
  const brief = buildContinuationBrief(convRecord, { mode: currentMode });
  await saveBrief(brief);

  closeImportModal();
  await loadConversationsLibrary();
  await selectConversation(convRecord.id);

  showToast(`Imported ${messages.length} messages and generated Continuation Brief!`);
}

function handleFileContent(content, fileName) {
  importTitleInput.value = fileName.replace(/\.[^/.]+$/, '');
  importPasteArea.value = content;
  // Switch back to paste view to review parsed contents
  importModalTabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-tab') === 'paste'));
  tabPasteContent.style.display = 'block';
  tabFileContent.style.display = 'none';
  showToast(`File "${fileName}" loaded into editor.`);
}

function openSettingsModal() {
  settingsModal.style.display = 'flex';
}

function closeSettingsModal() {
  settingsModal.style.display = 'none';
}

// =========================================================
// HELPERS
// =========================================================
async function saveCurrentBrief() {
  if (currentBrief) {
    await saveBrief(currentBrief);
    briefTokenBadge.textContent = `~${estimateTokens(currentBrief.sections.filter(s => s.included).map(s => s.content).join('\n'))} est. tokens`;
  }
}

function showToast(message, duration = 3000) {
  toastEl.textContent = message;
  toastEl.classList.add('visible');
  setTimeout(() => {
    toastEl.classList.remove('visible');
  }, duration);
}

function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9_\-]/g, '_').substring(0, 50);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatRelativeTime(timestamp) {
  if (!timestamp) return 'recently';
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
