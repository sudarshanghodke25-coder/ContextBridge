/**
 * ContextBridge Popup Controller
 * Connects page detection, quick capture, recent briefs, and workspace launch.
 */

import { normalizeMessages } from './src/domain/normalize.js';
import { buildContinuationBrief } from './src/domain/build-brief.js';
import { saveConversation } from './src/storage/conversation-repository.js';
import { saveBrief, listBriefs } from './src/storage/brief-repository.js';

document.addEventListener('DOMContentLoaded', async () => {
  const detectingEl = document.getElementById('status-detecting');
  const supportedEl = document.getElementById('status-supported');
  const unsupportedEl = document.getElementById('status-unsupported');
  const providerBadge = document.getElementById('provider-badge');
  const detectedTitle = document.getElementById('detected-title');
  const detectedStats = document.getElementById('detected-stats');
  const btnCapture = document.getElementById('btn-capture');
  const btnOpenWorkspace = document.getElementById('btn-open-workspace');
  const btnQuickPaste = document.getElementById('btn-quick-paste');
  const btnQuickImport = document.getElementById('btn-quick-import');
  const btnViewAll = document.getElementById('btn-view-all');
  const btnSettingsLink = document.getElementById('btn-settings-link');
  const recentListEl = document.getElementById('recent-briefs-list');
  const bridgeTargetBtns = document.querySelectorAll('.bridge-target-btn');

  let activeTab = null;
  let detectedPageData = null;

  // 1. Load Recent Briefs
  async function loadRecentBriefs() {
    try {
      const briefs = await listBriefs();
      if (!briefs || briefs.length === 0) {
        recentListEl.innerHTML = '<div class="empty-recent text-xs text-muted">No briefs yet. Capture or paste a chat to begin.</div>';
        return;
      }

      recentListEl.innerHTML = '';
      briefs.slice(0, 3).forEach(brief => {
        const item = document.createElement('div');
        item.className = 'recent-item';
        item.innerHTML = `
          <span class="recent-title">${escapeHtml(brief.title || 'Untitled Brief')}</span>
          <span class="text-xs text-muted">~${brief.sizeEstimate || 0} tok</span>
        `;
        item.addEventListener('click', () => {
          openWorkspace(`briefId=${encodeURIComponent(brief.id)}&convId=${encodeURIComponent(brief.conversationId)}`);
        });
        recentListEl.appendChild(item);
      });
    } catch (err) {
      console.error('Failed to load recent briefs:', err);
    }
  }

  // 2. Open Workspace Helper
  function openWorkspace(query = '') {
    chrome.runtime.sendMessage({ action: 'open_workspace', query }, () => {
      window.close();
    });
  }

  btnOpenWorkspace?.addEventListener('click', () => openWorkspace());
  btnViewAll?.addEventListener('click', () => openWorkspace());
  btnSettingsLink?.addEventListener('click', () => openWorkspace('tab=settings'));

  btnQuickPaste?.addEventListener('click', () => openWorkspace('modal=paste'));
  btnQuickImport?.addEventListener('click', () => openWorkspace('modal=import'));

  // 3. Detect Page Content
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    activeTab = tab;

    if (!tab || !tab.id || !tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://')) {
      showUnsupportedState();
    } else {
      chrome.tabs.sendMessage(tab.id, { action: 'detect_page' }, (response) => {
        detectingEl.style.display = 'none';

        if (chrome.runtime.lastError || !response || !response.supported) {
          showUnsupportedState();
          return;
        }

        detectedPageData = response;
        showSupportedState(response);
      });
    }
  } catch (err) {
    showUnsupportedState();
  }

  function showUnsupportedState() {
    detectingEl.style.display = 'none';
    supportedEl.style.display = 'none';
    unsupportedEl.style.display = 'flex';
  }

  function showSupportedState(data) {
    detectingEl.style.display = 'none';
    unsupportedEl.style.display = 'none';
    supportedEl.style.display = 'flex';

    providerBadge.textContent = data.providerName || 'AI Chat';
    detectedTitle.textContent = data.title || 'Detected Conversation';
    detectedStats.textContent = `${data.messageCount} visible messages · Direct capture ready`;
  }

  // 4. Capture Action
  btnCapture?.addEventListener('click', async () => {
    if (!activeTab || !activeTab.id) return;

    btnCapture.disabled = true;
    btnCapture.textContent = 'Extracting conversation...';

    chrome.tabs.sendMessage(activeTab.id, { action: 'extract_context' }, async (response) => {
      if (chrome.runtime.lastError || !response || !response.success || !response.messages) {
        btnCapture.disabled = false;
        btnCapture.textContent = 'Capture failed. Try manual paste.';
        return;
      }

      try {
        const rawMessages = response.messages;
        const normalized = normalizeMessages(rawMessages, { sourceUrl: activeTab.url });
        
        const convRecord = {
          id: `conv_${Date.now()}`,
          title: response.title || detectedPageData?.title || 'Captured Conversation',
          provider: response.provider || detectedPageData?.providerName || 'AI Chat',
          sourceUrl: activeTab.url || '',
          captureMethod: 'adapter',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: normalized
        };

        await saveConversation(convRecord);

        // Build brief
        const brief = buildContinuationBrief(convRecord);
        await saveBrief(brief);

        // Open directly in full workspace
        openWorkspace(`convId=${encodeURIComponent(convRecord.id)}&briefId=${encodeURIComponent(brief.id)}`);
      } catch (err) {
        console.error('Error saving captured conversation:', err);
        btnCapture.disabled = false;
        btnCapture.textContent = 'Save error. Retry';
      }
    });
  });

  // 5. Direct Bridge Targets
  bridgeTargetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      if (detectedPageData && activeTab) {
        // Extract context and bridge
        chrome.tabs.sendMessage(activeTab.id, { action: 'extract_context' }, async (response) => {
          if (response && response.messages && response.messages.length > 0) {
            const normalized = normalizeMessages(response.messages);
            const conv = {
              id: `conv_${Date.now()}`,
              title: response.title || 'Bridged Chat',
              provider: response.provider || 'AI Chat',
              messages: normalized
            };
            const brief = buildContinuationBrief(conv);
            chrome.runtime.sendMessage({
              action: 'bridge_context',
              target,
              context: normalized,
              promptText: brief.sections.filter(s => s.included).map(s => s.content).join('\n\n')
            }, () => window.close());
            return;
          }
          // Fallback: open target tab directly
          chrome.runtime.sendMessage({ action: 'bridge_context', target, promptText: '' }, () => window.close());
        });
      } else {
        chrome.runtime.sendMessage({ action: 'bridge_context', target, promptText: '' }, () => window.close());
      }
    });
  });

  // Helper
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // Load initial briefs
  loadRecentBriefs();
});
