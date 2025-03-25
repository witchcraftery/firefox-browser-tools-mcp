/**
 * Background script for Browser Tools MCP Firefox Extension
 * This script runs in the background and handles communication between content scripts and devtools
 */

// Initialize connections and message handlers
const connections = {};
let selectedElementData = null;
let consoleLogs = [];
let consoleErrors = [];
let networkLogs = {
    success: [],
    error: []
};

// Max log entries to prevent memory issues
const MAX_LOG_ENTRIES = 1000;

// Initialize the shared state
function initializeState() {
    selectedElementData = null;
    consoleLogs = [];
    consoleErrors = [];
    networkLogs = {
        success: [],
        error: []
    };
}

// Handle connections from devtools panels
browser.runtime.onConnect.addListener(function (port) {
    // Store the port for future communication
    if (port.name === 'devtools-panel' || port.name === 'selected-element-view') {
        const tabId = port.sender.tab ? port.sender.tab.id : port.name;

        if (!connections[tabId]) {
            connections[tabId] = [];
        }

        connections[tabId].push(port);

        // Send initial data if available
        if (port.name === 'devtools-panel') {
            port.postMessage({
                action: 'consoleLogsData',
                data: consoleLogs
            });

            port.postMessage({
                action: 'networkLogsData',
                data: networkLogs
            });

            if (selectedElementData) {
                port.postMessage({
                    action: 'selectedElementData',
                    data: selectedElementData
                });
            }
        } else if (port.name === 'selected-element-view' && selectedElementData) {
            port.postMessage({
                action: 'selectedElementData',
                data: selectedElementData
            });
        }

        // Listen for messages from the port
        port.onMessage.addListener(function (message) {
            handleMessage(message, port);
        });

        // Clean up when port disconnects
        port.onDisconnect.addListener(function () {
            const index = connections[tabId].indexOf(port);
            if (index !== -1) {
                connections[tabId].splice(index, 1);
            }

            if (connections[tabId].length === 0) {
                delete connections[tabId];
            }
        });
    }
});

// Handle messages from content scripts
browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    try {
        // Return a Promise that resolves with the response
        return Promise.resolve().then(() => {
            if (request.action === 'consoleLog') {
                consoleLogs.push({
                    type: request.logType,
                    args: request.args,
                    timestamp: request.timestamp
                });

                // Limit the size of logs array
                if (consoleLogs.length > MAX_LOG_ENTRIES) {
                    consoleLogs = consoleLogs.slice(-MAX_LOG_ENTRIES);
                }

                // Broadcast to connected devtools
                broadcastMessage({
                    action: 'consoleLogsData',
                    data: consoleLogs
                });

                return true;
            }

            if (request.action === 'networkLog') {
                if (request.success) {
                    networkLogs.success.push(request.data);
                    if (networkLogs.success.length > MAX_LOG_ENTRIES) {
                        networkLogs.success = networkLogs.success.slice(-MAX_LOG_ENTRIES);
                    }
                } else {
                    networkLogs.error.push(request.data);
                    if (networkLogs.error.length > MAX_LOG_ENTRIES) {
                        networkLogs.error = networkLogs.error.slice(-MAX_LOG_ENTRIES);
                    }
                }

                // Broadcast to connected devtools
                broadcastMessage({
                    action: 'networkLogsData',
                    data: networkLogs
                });

                return true;
            }

            if (request.action === 'selectedElementData') {
                selectedElementData = request.data;

                // Broadcast to connected devtools
                broadcastMessage({
                    action: 'selectedElementData',
                    data: selectedElementData
                });

                return true;
            }

            // Default response for unhandled messages
            return false;
        });
    } catch (error) {
        console.error('Error handling message:', error);
        return Promise.resolve(false);
    }
});

// Handle messages from devtools panels
function handleMessage(message, port) {
    try {
        // Start element selection
        if (message.action === 'startElementSelection') {
            sendToActiveTab({ action: 'startElementSelection' });
            return;
        }

        // Stop element selection
        if (message.action === 'stopElementSelection') {
            sendToActiveTab({ action: 'stopElementSelection' });
            return;
        }

        // Clear console logs
        if (message.action === 'clearConsoleLogs') {
            consoleLogs = [];
            broadcastMessage({ action: 'consoleLogsData', data: consoleLogs });
            return;
        }

        // Clear network logs
        if (message.action === 'clearNetworkLogs') {
            networkLogs = { success: [], error: [] };
            broadcastMessage({ action: 'networkLogsData', data: networkLogs });
            return;
        }

        // Get selected element data
        if (message.action === 'getSelectedElementData') {
            port.postMessage({
                action: 'selectedElementData',
                data: selectedElementData
            });
            return;
        }

        // Take screenshot
        if (message.action === 'takeScreenshot') {
            browser.tabs.captureVisibleTab()
                .then(dataUrl => {
                    port.postMessage({
                        action: 'screenshotData',
                        data: dataUrl
                    });
                })
                .catch(error => {
                    console.error('Error capturing screenshot:', error);
                    port.postMessage({
                        action: 'contentScriptError',
                        data: {
                            error: 'Failed to capture screenshot',
                            details: error.message || 'Unknown error'
                        }
                    });
                });
            return;
        }

        console.log('Unhandled message in handleMessage:', message);
    } catch (error) {
        console.error('Error in handleMessage:', error);
        port.postMessage({
            action: 'contentScriptError',
            data: {
                error: 'Internal extension error',
                details: error.message || 'Unknown error'
            }
        });
    }
}

// Send message to the active tab's content script
function sendToActiveTab(message) {
    browser.tabs.query({ active: true, currentWindow: true })
        .then(tabs => {
            if (tabs.length > 0) {
                // Check if we can access the tab (not a restricted page)
                const url = tabs[0].url;
                if (!url || url.startsWith('about:') || url.startsWith('moz-extension:') ||
                    url.startsWith('chrome:') || url.startsWith('edge:') || url.startsWith('devtools:')) {
                    // Cannot inject content scripts into browser special pages
                    console.log(`Cannot use content scripts on restricted page: ${url}`);
                    // Notify devtools panels about error
                    broadcastMessage({
                        action: 'contentScriptError',
                        data: {
                            error: 'Cannot use this feature on browser special pages',
                            url: url
                        }
                    });
                    return;
                }

                // Try sending the message to content script
                return browser.tabs.sendMessage(tabs[0].id, message)
                    .catch(error => {
                        console.error('Error sending message to content script:', error);

                        // Check if the error is because content script isn't loaded
                        if (error.message && error.message.includes('Receiving end does not exist')) {
                            console.log('Content script not found, trying to inject it...');

                            // First inject api-endpoint.js, then content-script.js
                            return browser.tabs.executeScript(tabs[0].id, {
                                file: 'api-endpoint.js'
                            }).then(() => {
                                // Short delay to ensure api-endpoint is initialized
                                return new Promise(resolve => setTimeout(resolve, 100));
                            }).then(() => {
                                // Then inject content-script.js
                                return browser.tabs.executeScript(tabs[0].id, {
                                    file: 'content-script.js'
                                });
                            }).then(() => {
                                console.log('Content scripts injected successfully');
                                // Give the content script time to initialize
                                return new Promise(resolve => setTimeout(resolve, 200));
                            }).then(() => {
                                // Try sending the message again
                                return browser.tabs.sendMessage(tabs[0].id, message)
                                    .catch(retryError => {
                                        console.error('Failed to send message after script injection:', retryError);
                                        broadcastMessage({
                                            action: 'contentScriptError',
                                            data: {
                                                error: 'Failed to send message to content script after injection',
                                                details: retryError.message || 'Unknown error'
                                            }
                                        });
                                        throw retryError;
                                    });
                            }).catch(injectionError => {
                                console.error('Failed to inject content scripts:', injectionError);
                                broadcastMessage({
                                    action: 'contentScriptError',
                                    data: {
                                        error: 'Failed to inject content scripts',
                                        details: injectionError.message || 'Unknown error'
                                    }
                                });
                                throw injectionError;
                            });
                        } else {
                            // Not a content script loading issue, broadcast the error
                            broadcastMessage({
                                action: 'contentScriptError',
                                data: {
                                    error: 'Error sending message to content script',
                                    details: error.message || 'Unknown error'
                                }
                            });
                            throw error;
                        }
                    });
            } else {
                console.error('No active tab found');
                broadcastMessage({
                    action: 'contentScriptError',
                    data: {
                        error: 'No active tab found'
                    }
                });
            }
        })
        .catch(error => {
            console.error('Error querying tabs:', error);
            broadcastMessage({
                action: 'contentScriptError',
                data: {
                    error: 'Error querying tabs',
                    details: error.message || 'Unknown error'
                }
            });
        });
}

// Broadcast message to all connected devtools panels
function broadcastMessage(message) {
    if (!message || typeof message !== 'object') {
        console.error('Invalid message format for broadcast:', message);
        return;
    }

    // Get list of connection tab IDs
    const tabIds = Object.keys(connections);

    if (tabIds.length === 0) {
        // No connections to broadcast to
        return;
    }

    // Send to each connected port
    tabIds.forEach(tabId => {
        const ports = connections[tabId];
        if (!Array.isArray(ports) || ports.length === 0) {
            return;
        }

        ports.forEach(port => {
            try {
                port.postMessage(message);
            } catch (error) {
                console.error(`Error broadcasting message to ${tabId}:`, error);
                // We don't remove the port here as it might be temporary error
                // The port's onDisconnect handler will clean it up if needed
            }
        });
    });
}

// Handle browser action click - open extension panel
browser.browserAction.onClicked.addListener(function (tab) {
    browser.windows.create({
        url: browser.runtime.getURL("selected-element-view.html"),
        type: "popup",
        width: 800,
        height: 600
    });
});

// Initialize state when extension is loaded
initializeState();

console.log('Browser Tools MCP Background Script Loaded'); 