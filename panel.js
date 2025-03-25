/**
 * Panel.js - Handles the DevTools panel UI and functionality
 * For Browser Tools MCP Firefox Extension
 */

// DOM elements
let selectedElementContainer;
let consoleLogsContainer;
let networkContainer;

// Connection to background script
let backgroundPort;

// Track state
let selectedElementData = null;
let consoleLogs = [];
let networkLogs = {
  success: [],
  error: []
};

// Initialize the panel
document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  selectedElementContainer = document.getElementById('selected-element-container');
  consoleLogsContainer = document.getElementById('console-logs-container');
  networkContainer = document.getElementById('network-container');

  // Set up tab navigation
  setupTabs();

  // Set up button handlers
  setupButtons();

  // Connect to background script
  connectToBackground();

  // Load initial data
  loadInitialData();
});

// Set up tab navigation
function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      // Add active class to current tab and content
      const tabName = tab.getAttribute('data-tab');
      tab.classList.add('active');
      document.getElementById(`${tabName}-tab`).classList.add('active');
    });
  });
}

// Set up button event handlers
function setupButtons() {
  const startSelectionButton = document.getElementById('start-selection');
  const stopSelectionButton = document.getElementById('stop-selection');
  const elementTab = document.getElementById('element-tab');

  // Element selection buttons
  startSelectionButton.addEventListener('click', () => {
    // Show visual indicator that selection is active
    elementTab.classList.add('selection-active');
    startSelectionButton.classList.add('active');
    startElementSelection();
  });

  stopSelectionButton.addEventListener('click', () => {
    // Hide the selection indicator
    elementTab.classList.remove('selection-active');
    startSelectionButton.classList.remove('active');
    stopElementSelection();
  });

  // Console log buttons
  document.getElementById('refresh-logs').addEventListener('click', () => {
    const button = document.getElementById('refresh-logs');
    // Add visual feedback
    button.classList.add('active');
    refreshConsoleLogs();
    // Remove active state after a delay
    setTimeout(() => button.classList.remove('active'), 300);
  });

  document.getElementById('clear-logs').addEventListener('click', () => {
    const button = document.getElementById('clear-logs');
    // Add visual feedback
    button.classList.add('active');
    clearConsoleLogs();
    // Remove active state after a delay
    setTimeout(() => button.classList.remove('active'), 300);
  });

  // Network log buttons
  document.getElementById('refresh-network').addEventListener('click', () => {
    const button = document.getElementById('refresh-network');
    // Add visual feedback
    button.classList.add('active');
    refreshNetworkLogs();
    // Remove active state after a delay
    setTimeout(() => button.classList.remove('active'), 300);
  });

  document.getElementById('clear-network').addEventListener('click', () => {
    const button = document.getElementById('clear-network');
    // Add visual feedback
    button.classList.add('active');
    clearNetworkLogs();
    // Remove active state after a delay
    setTimeout(() => button.classList.remove('active'), 300);
  });
}

// Connect to the background script
function connectToBackground() {
  try {
    backgroundPort = browser.runtime.connect({
      name: 'devtools-panel'
    });

    // Set up message listener
    backgroundPort.onMessage.addListener(message => {
      try {
        if (message.action === 'selectedElementData') {
          updateSelectedElementData(message.data);
        } else if (message.action === 'consoleLogsData') {
          updateConsoleLogs(message.data);
        } else if (message.action === 'networkLogsData') {
          updateNetworkLogs(message.data);
        } else if (message.action === 'screenshotData') {
          handleScreenshotData(message.data);
        } else if (message.action === 'contentScriptError') {
          handleContentScriptError(message.data);
        }
      } catch (error) {
        console.error('Error handling message in panel:', error);
      }
    });

    // Handle disconnection
    backgroundPort.onDisconnect.addListener(() => {
      console.log('Disconnected from background script, attempting to reconnect...');
      // Try to reconnect after a short delay
      setTimeout(connectToBackground, 1000);
    });
  } catch (error) {
    console.error('Error connecting to background script:', error);
    // Try to reconnect after a short delay
    setTimeout(connectToBackground, 1000);
  }
}

// Load initial data
function loadInitialData() {
  // Request selected element data
  backgroundPort.postMessage({
    action: 'getSelectedElementData'
  });

  // Request console logs
  refreshConsoleLogs();

  // Request network logs
  refreshNetworkLogs();
}

// Start element selection
function startElementSelection() {
  backgroundPort.postMessage({
    action: 'startElementSelection'
  });

  // Provide visible feedback that the button is active
  document.getElementById('start-selection').classList.add('active');
  document.getElementById('element-tab').classList.add('selection-active');
}

// Stop element selection
function stopElementSelection() {
  backgroundPort.postMessage({
    action: 'stopElementSelection'
  });

  // Remove active styling
  document.getElementById('start-selection').classList.remove('active');
  document.getElementById('element-tab').classList.remove('selection-active');
}

// Refresh console logs
function refreshConsoleLogs() {
  // For now, we'll just display what we have locally
  renderConsoleLogs();
}

// Clear console logs
function clearConsoleLogs() {
  backgroundPort.postMessage({
    action: 'clearConsoleLogs'
  });
}

// Refresh network logs
function refreshNetworkLogs() {
  // For now, we'll just display what we have locally
  renderNetworkLogs();
}

// Clear network logs
function clearNetworkLogs() {
  backgroundPort.postMessage({
    action: 'clearNetworkLogs'
  });
}

// Update selected element data
function updateSelectedElementData(data) {
  selectedElementData = data;

  // Remove the selection active indicator when an element has been selected
  document.getElementById('element-tab').classList.remove('selection-active');
  document.getElementById('start-selection').classList.remove('active');

  renderSelectedElementData();
}

// Update console logs
function updateConsoleLogs(logs) {
  consoleLogs = logs;
  renderConsoleLogs();
}

// Update network logs
function updateNetworkLogs(logs) {
  networkLogs = logs;
  renderNetworkLogs();
}

// Handle screenshot data
function handleScreenshotData(dataUrl) {
  // Create a tab to show the screenshot
  browser.tabs.create({
    url: dataUrl
  });
}

// Handle content script error
function handleContentScriptError(errorData) {
  // Hide selection active indicator if it's showing
  document.getElementById('element-tab').classList.remove('selection-active');
  document.getElementById('start-selection').classList.remove('active');

  // Create an error message
  const errorContainer = document.createElement('div');
  errorContainer.className = 'error-message';

  // Create header with error title
  const errorHeader = document.createElement('h4');
  errorHeader.textContent = 'Error';
  errorContainer.appendChild(errorHeader);

  // Create error message
  const errorMessage = document.createElement('p');
  errorMessage.textContent = errorData.error || 'Unknown error occurred';
  errorContainer.appendChild(errorMessage);

  // Add details if available
  if (errorData.details) {
    const errorDetails = document.createElement('pre');
    errorDetails.className = 'error-details';
    errorDetails.textContent = errorData.details;
    errorContainer.appendChild(errorDetails);
  }

  // Add URL if available
  if (errorData.url) {
    const urlInfo = document.createElement('p');
    urlInfo.className = 'error-url';
    urlInfo.textContent = `URL: ${errorData.url}`;
    errorContainer.appendChild(urlInfo);
  }

  // Add help text for common errors
  if (errorData.error && (
    errorData.error.includes('Cannot use this feature on browser special pages') ||
    errorData.error.includes('Failed to inject content scripts')
  )) {
    const helpText = document.createElement('p');
    helpText.className = 'help-text';
    helpText.innerHTML = 'This feature only works on regular web pages. Try using it on a site like <a href="https://www.mozilla.org" target="_blank">mozilla.org</a> or <a href="https://example.com" target="_blank">example.com</a>.';
    errorContainer.appendChild(helpText);
  }

  // Add a close button
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Dismiss';
  closeButton.className = 'error-close-btn';
  closeButton.addEventListener('click', () => {
    errorContainer.remove();
  });
  errorContainer.appendChild(closeButton);

  // Clear any previous error and add the new one
  const previousError = document.querySelector('.error-message');
  if (previousError) {
    previousError.remove();
  }

  // Insert at the top of the element tab
  const elementTab = document.getElementById('element-tab');
  elementTab.insertBefore(errorContainer, elementTab.firstChild);

  // Automatically switch to element tab to show the error
  const elementTabButton = document.querySelector('[data-tab="element"]');
  if (elementTabButton) {
    elementTabButton.click();
  }

  // Auto-remove after 10 seconds
  setTimeout(() => {
    // Check if the error message still exists before trying to remove it
    if (document.body.contains(errorContainer)) {
      errorContainer.style.opacity = '0';
      errorContainer.style.transition = 'opacity 0.5s ease-out';
      setTimeout(() => {
        if (document.body.contains(errorContainer)) {
          errorContainer.remove();
        }
      }, 500);
    }
  }, 10000);
}

// Render selected element data
function renderSelectedElementData() {
  if (!selectedElementData) {
    selectedElementContainer.innerHTML = `
            <div class="empty-state">
                <p>No element selected yet. Click "Select Element" to pick an element from the page.</p>
            </div>
        `;
    return;
  }

  // Build HTML for the selected element
  let html = `<div class="element-container">`;

  // Add tag name
  html += `<h2>${selectedElementData.tagName}</h2>`;

  // Add ID if available
  if (selectedElementData.id) {
    html += `
            <div class="element-property">
                <span class="element-property-name">ID:</span>
                <span class="element-property-value">${selectedElementData.id}</span>
            </div>
        `;
  }

  // Add classes if available
  if (selectedElementData.className) {
    html += `
            <div class="element-property">
                <span class="element-property-name">Classes:</span>
                <span class="element-property-value">${selectedElementData.className}</span>
            </div>
        `;
  }

  // Add attributes
  if (selectedElementData.attributes && selectedElementData.attributes.length > 0) {
    html += `<div class="element-property">
            <span class="element-property-name">Attributes:</span>
        </div>`;

    for (const attr of selectedElementData.attributes) {
      html += `
                <div class="element-property">
                    <span class="element-property-name">${attr.name}:</span>
                    <span class="element-property-value">${attr.value}</span>
                </div>
            `;
    }
  }

  // Add computed styles
  if (selectedElementData.computedStyle) {
    html += `
            <div class="element-property">
                <span class="element-property-name">Computed Styles:</span>
            </div>
            <div class="css-properties">
        `;

    for (const [prop, value] of Object.entries(selectedElementData.computedStyle)) {
      html += `
                <div class="css-property">
                    <span class="property-name">${prop}:</span>
                    <span class="property-value">${value};</span>
                </div>
            `;
    }

    html += `</div>`;
  }

  // Add HTML
  if (selectedElementData.outerHTML) {
    html += `
            <div class="element-property">
                <span class="element-property-name">HTML:</span>
            </div>
            <div class="selected-element-html">${escapeHTML(selectedElementData.outerHTML)}</div>
        `;
  }

  html += `</div>`;
  selectedElementContainer.innerHTML = html;
}

// Render console logs with performance optimization
function renderConsoleLogs() {
  if (!consoleLogsContainer) return;

  // Create document fragment for better performance
  const fragment = document.createDocumentFragment();

  if (consoleLogs.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = '<p>No console logs captured yet.</p>';
    fragment.appendChild(emptyState);
  } else {
    // Only render the most recent logs if there are too many
    const MAX_VISIBLE_LOGS = 200;
    const logsToRender = consoleLogs.slice(-MAX_VISIBLE_LOGS);

    for (const log of logsToRender) {
      const logEntry = document.createElement('div');
      logEntry.className = `log-entry ${log.type === 'error' ? 'log-entry-error' : ''}`;

      const timestamp = document.createElement('span');
      timestamp.className = 'log-timestamp';
      timestamp.textContent = new Date(log.timestamp).toLocaleTimeString();

      const content = document.createElement('span');
      content.className = 'log-content';
      content.textContent = log.args.join(' ');

      logEntry.appendChild(timestamp);
      logEntry.appendChild(content);
      fragment.appendChild(logEntry);
    }

    if (consoleLogs.length > MAX_VISIBLE_LOGS) {
      const notice = document.createElement('div');
      notice.className = 'help-text';
      notice.textContent = `Showing the most recent ${MAX_VISIBLE_LOGS} logs of ${consoleLogs.length} total logs.`;
      fragment.insertBefore(notice, fragment.firstChild);
    }
  }

  // Clear and update in one operation for better performance
  consoleLogsContainer.innerHTML = '';
  consoleLogsContainer.appendChild(fragment);
}

// Render network logs
function renderNetworkLogs() {
  const allLogs = [
    ...networkLogs.success.map(log => ({ ...log, isSuccess: true })),
    ...networkLogs.error.map(log => ({ ...log, isSuccess: false }))
  ];

  // Sort by timestamp
  allLogs.sort((a, b) => {
    return new Date(a.timestamp) - new Date(b.timestamp);
  });

  if (allLogs.length === 0) {
    networkContainer.innerHTML = `
            <div class="empty-state">
                <p>No network requests captured yet.</p>
            </div>
        `;
    return;
  }

  let html = '';

  for (const log of allLogs) {
    const timestamp = new Date(log.timestamp).toLocaleTimeString();
    const statusClass = log.isSuccess ? 'status-success' : 'status-error';

    html += `
            <div class="network-entry">
                <div>
                    <span class="network-method">${log.method}</span>
                    <span class="network-url">${log.url}</span>
                    ${log.status ?
        `<span class="network-status ${statusClass}">${log.status} ${log.statusText || ''}</span>` :
        `<span class="network-status status-error">Error: ${log.error || 'Unknown error'}</span>`
      }
                </div>
                <div class="log-timestamp">
                    ${timestamp} (${log.duration ? Math.round(log.duration) + 'ms' : 'N/A'})
                </div>
            </div>
        `;
  }

  networkContainer.innerHTML = html;
}

// Helper function to escape HTML
function escapeHTML(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
} 