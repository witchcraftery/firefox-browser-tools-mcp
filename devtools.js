// Firefox Browser Tools MCP Extension - DevTools Script
// Creates devtools panel and handles communication with background script

// Create a connection to the background script
let backgroundPort;

// Initialize the connection to the background page
function initializeBackgroundConnection() {
    backgroundPort = browser.runtime.connect({
        name: "devtools-panel"
    });

    // Listen for messages from the background script
    backgroundPort.onMessage.addListener(message => {
        if (message.action === 'selectedElementData') {
            updateSelectedElementData(message.data);
        } else if (message.action === 'consoleLogs') {
            updateConsoleLogs(message.data);
        } else if (message.action === 'consoleErrors') {
            updateConsoleErrors(message.data);
        } else if (message.action === 'networkSuccessLogs') {
            updateNetworkSuccessLogs(message.data);
        } else if (message.action === 'networkErrorLogs') {
            updateNetworkErrorLogs(message.data);
        } else if (message.action === 'logsCleared') {
            // Handle logs cleared event
            console.log('All logs have been cleared');
        }
    });
}

// Create the devtools panel
browser.devtools.panels.create(
    "Browser Tools MCP",  // title
    "/icon48.png",        // icon
    "panel.html"          // content page
).then(panel => {
    // Panel created successfully
    console.log('DevTools panel created');

    // Initialize the background connection
    initializeBackgroundConnection();

    // Create a sidebar pane for selected element data
    browser.devtools.panels.elements.createSidebarPane(
        "Selected Element Data"
    ).then(sidebar => {
        console.log('Elements panel sidebar created');

        // Set the sidebar content when showing
        sidebar.onShown.addListener(() => {
            // Request the selected element data from the background script
            backgroundPort.postMessage({
                action: 'getSelectedElement'
            });
        });
    });
});

// Function to send a message to the content script to start element selection
function startElementSelection() {
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        if (tabs.length > 0) {
            browser.tabs.sendMessage(tabs[0].id, {
                action: 'startElementSelection'
            });
        }
    });
}

// Function to send a message to the content script to stop element selection
function stopElementSelection() {
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        if (tabs.length > 0) {
            browser.tabs.sendMessage(tabs[0].id, {
                action: 'stopElementSelection'
            });
        }
    });
}

// Update selected element data
function updateSelectedElementData(data) {
    // This function will be called from the panel.js
    // Implement panel-specific logic there
    console.log('Selected element data updated:', data);

    // Update elements panel sidebar if it exists
    try {
        browser.devtools.panels.elements.getActiveSidebarPane().then(sidebar => {
            if (sidebar) {
                sidebar.setObject(data);
            }
        });
    } catch (e) {
        console.error('Error updating sidebar:', e);
    }
}

// Update console logs
function updateConsoleLogs(logs) {
    // This will be handled by panel.js
    console.log('Console logs updated:', logs.length);
}

// Update console errors
function updateConsoleErrors(errors) {
    // This will be handled by panel.js
    console.log('Console errors updated:', errors.length);
}

// Update network success logs
function updateNetworkSuccessLogs(logs) {
    // This will be handled by panel.js
    console.log('Network success logs updated:', logs.length);
}

// Update network error logs
function updateNetworkErrorLogs(logs) {
    // This will be handled by panel.js
    console.log('Network error logs updated:', logs.length);
}

// Function to clear all logs
function clearAllLogs() {
    backgroundPort.postMessage({
        action: 'clearLogs'
    });
}

// Export functions to be used by the panel page
window.browserToolsMCP = {
    startElementSelection,
    stopElementSelection,
    getSelectedElement: () => {
        backgroundPort.postMessage({
            action: 'getSelectedElement'
        });
    },
    getConsoleLogs: () => {
        backgroundPort.postMessage({
            action: 'getConsoleLogs'
        });
    },
    getConsoleErrors: () => {
        backgroundPort.postMessage({
            action: 'getConsoleErrors'
        });
    },
    getNetworkSuccessLogs: () => {
        backgroundPort.postMessage({
            action: 'getNetworkSuccessLogs'
        });
    },
    getNetworkErrorLogs: () => {
        backgroundPort.postMessage({
            action: 'getNetworkErrorLogs'
        });
    },
    clearAllLogs
};

console.log('Browser Tools MCP DevTools Script Loaded'); 