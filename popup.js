document.addEventListener('DOMContentLoaded', async () => {
  const statusText = document.getElementById('status-text');
  const bridgeOptions = document.getElementById('bridge-options');

  // Get current active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab) {
    statusText.textContent = "Cannot access current tab.";
    return;
  }

  // Ask content script to extract context
  chrome.tabs.sendMessage(tab.id, { action: "extract_context" }, (response) => {
    if (chrome.runtime.lastError) {
      statusText.textContent = "No supported LLM chat found on this page.";
      return;
    }

    if (response && response.success && response.context) {
      statusText.textContent = `Found ${response.context.length} messages in context.`;
      bridgeOptions.style.display = 'block';

      // Set up click handlers for buttons
      const buttons = document.querySelectorAll('.bridge-btn');
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          const target = btn.getAttribute('data-target');
          bridgeContext(target, response.context);
        });
      });
    } else {
      statusText.textContent = "Could not extract conversation context.";
    }
  });

  function bridgeContext(targetLLM, contextArray) {
    statusText.textContent = `Bridging to ${targetLLM}...`;
    bridgeOptions.style.display = 'none';

    chrome.runtime.sendMessage({
      action: "bridge_context",
      target: targetLLM,
      context: contextArray
    }, (res) => {
      if (res && res.success) {
        window.close(); // close popup on success
      } else {
        statusText.textContent = "Failed to bridge context.";
        bridgeOptions.style.display = 'block';
      }
    });
  }
});
