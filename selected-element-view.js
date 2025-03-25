// Firefox Browser Tools MCP Extension - Selected Element View Script
// Displays selected element data in a popup window

// DOM elements
let selectedElementContainer;

// Current element data
let selectedElementData = null;

// Create a connection to the background script
const backgroundPort = browser.runtime.connect({
    name: "selected-element-view"
});

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Selected Element View loaded');

    // Get DOM references
    selectedElementContainer = document.getElementById('selected-element-container');

    // Set up refresh button
    document.getElementById('refresh-btn').addEventListener('click', refreshData);

    // Request initial data
    requestSelectedElementData();

    // Set up message listeners
    setupMessageListeners();
});

// Set up message listeners for communication with background script
function setupMessageListeners() {
    // Listen for messages from the background script
    backgroundPort.onMessage.addListener(message => {
        if (message.action === 'selectedElementData') {
            updateSelectedElementData(message.data);
        }
    });
}

// Request the selected element data from the background script
function requestSelectedElementData() {
    backgroundPort.postMessage({
        action: 'getSelectedElementData'
    });
}

// Refresh the data
function refreshData() {
    requestSelectedElementData();
}

// Update the selected element data in the UI
function updateSelectedElementData(data) {
    if (!data) {
        selectedElementContainer.innerHTML = `
      <div class="empty-state">
        <p>No element selected yet.</p>
        <p>Use the Browser Tools MCP DevTools panel to select an element.</p>
      </div>
    `;
        return;
    }

    selectedElementData = data;

    // Build HTML content based on the data
    let content = `<div class="element-container">`;

    // Add tag name
    content += `<h2>${data.tagName}</h2>`;

    // Add ID if available
    if (data.id) {
        content += `<div class="element-property">
      <span class="element-property-name">ID:</span>
      <span class="element-property-value">${data.id}</span>
    </div>`;
    }

    // Add classes if available
    if (data.className) {
        content += `<div class="element-property">
      <span class="element-property-name">Classes:</span>
      <span class="element-property-value">${data.className}</span>
    </div>`;
    }

    // Add attributes
    if (data.attributes && data.attributes.length > 0) {
        content += `<div class="element-property"><span class="element-property-name">Attributes:</span></div>`;

        data.attributes.forEach(attr => {
            content += `<div class="element-property">
        <span class="element-property-name">${attr.name}:</span>
        <span class="element-property-value">${attr.value}</span>
      </div>`;
        });
    }

    // Add HTML
    if (data.outerHTML) {
        content += `<div class="element-property"><span class="element-property-name">HTML:</span></div>
    <div class="selected-element-html">${escapeHTML(data.outerHTML)}</div>`;
    }

    // Add computed styles
    if (data.computedStyle) {
        content += `<div class="element-property"><span class="element-property-name">Computed Styles:</span></div>
    <div class="css-properties">`;

        for (const [prop, value] of Object.entries(data.computedStyle)) {
            content += `<div class="css-property">
        <span class="property-name">${prop}:</span>
        <span class="property-value">${value};</span>
      </div>`;
        }

        content += `</div>`;
    }

    content += `</div>`;

    // Update the container
    selectedElementContainer.innerHTML = content;
}

// Helper function to escape HTML
function escapeHTML(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
}
