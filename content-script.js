/**
 * Content script for Browser Tools MCP Firefox Extension
 * This script runs in the context of web pages and collects data from the page
 */

// Use existing MessageType from api-endpoint if available, or define it if not
let MessageType;
if (window.BrowserToolsMCP && window.BrowserToolsMCP.MessageType) {
    MessageType = window.BrowserToolsMCP.MessageType;
} else {
    // Fallback definition if api-endpoint.js hasn't loaded properly
    MessageType = {
        GET_SELECTED_ELEMENT: 'getSelectedElement',
        SELECTED_ELEMENT_DATA: 'selectedElementData',
        START_ELEMENT_SELECTION: 'startElementSelection',
        STOP_ELEMENT_SELECTION: 'stopElementSelection',
        CONSOLE_LOG: 'consoleLog',
        NETWORK_LOG: 'networkLog'
    };
}

// Variables to track state
let isSelecting = false;
let highlightedElement = null;
let selectedElement = null;
let highlightOverlay = null;

// Initialize the content script
function init() {
    // Set up message listener for communication with background script
    browser.runtime.onMessage.addListener(handleMessage);

    // Set up console log interceptor
    setupConsoleInterceptor();

    // Set up network request interceptor
    setupNetworkInterceptor();

    // Signal that content script is ready
    console.log("Browser Tools MCP content script initialized");
}

// Handle messages from the background script
function handleMessage(message, sender, sendResponse) {
    if (message.action === MessageType.START_ELEMENT_SELECTION ||
        message.action === 'startElementSelection') {
        startElementSelection();
        return Promise.resolve(true);
    }

    if (message.action === MessageType.STOP_ELEMENT_SELECTION ||
        message.action === 'stopElementSelection') {
        stopElementSelection();
        return Promise.resolve(true);
    }

    if ((message.action === MessageType.GET_SELECTED_ELEMENT ||
        message.action === 'getSelectedElement') && selectedElement) {
        sendSelectedElementData();
        return Promise.resolve(true);
    }

    // Return a promise for any unhandled message types
    return Promise.resolve(false);
}

// Start the element selection mode
function startElementSelection() {
    if (isSelecting) return;

    isSelecting = true;

    // Create highlight overlay if it doesn't exist
    if (!highlightOverlay) {
        createHighlightOverlay();
    }

    // Add event listeners for element selection
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleElementClick);
    document.addEventListener('keydown', handleKeyDown);

    // Show the highlight overlay
    highlightOverlay.style.display = 'block';
}

// Stop the element selection mode
function stopElementSelection() {
    if (!isSelecting) return;

    isSelecting = false;

    // Remove event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('click', handleElementClick);
    document.removeEventListener('keydown', handleKeyDown);

    // Hide the highlight overlay
    if (highlightOverlay) {
        highlightOverlay.style.display = 'none';
    }
}

// Create the highlight overlay for element selection
function createHighlightOverlay() {
    highlightOverlay = document.createElement('div');
    highlightOverlay.style.position = 'fixed';
    highlightOverlay.style.pointerEvents = 'none';
    highlightOverlay.style.border = '2px solid #0060df';
    highlightOverlay.style.backgroundColor = 'rgba(0, 96, 223, 0.1)';
    highlightOverlay.style.zIndex = '2147483647';
    highlightOverlay.style.display = 'none';
    document.body.appendChild(highlightOverlay);
}

// Handle mouse movement for element selection
function handleMouseMove(event) {
    if (!isSelecting) return;

    // Use debouncing to improve performance
    if (this.mouseMoveTimeout) {
        clearTimeout(this.mouseMoveTimeout);
    }

    this.mouseMoveTimeout = setTimeout(() => {
        // Prevent default to avoid selecting text
        event.preventDefault();

        // Get element under mouse cursor (ignoring the overlay)
        const element = document.elementFromPoint(event.clientX, event.clientY);

        if (element && element !== highlightOverlay) {
            // Update highlighted element
            highlightedElement = element;

            // Update overlay position
            updateHighlightOverlay(element);
        }
    }, 5); // Small delay to improve performance
}

// Handle element click for selection
function handleElementClick(event) {
    if (!isSelecting) return;

    // Prevent default click behavior
    event.preventDefault();
    event.stopPropagation();

    if (highlightedElement) {
        // Set as selected element
        selectedElement = highlightedElement;

        // Send selected element data to background script
        sendSelectedElementData();

        // Stop selection mode
        stopElementSelection();
    }
}

// Handle keyboard input during selection
function handleKeyDown(event) {
    if (!isSelecting) return;

    // ESC key to cancel selection
    if (event.key === 'Escape') {
        stopElementSelection();
    }
}

// Update the highlight overlay position and size
function updateHighlightOverlay(element) {
    if (!element || !highlightOverlay) return;

    const rect = element.getBoundingClientRect();

    highlightOverlay.style.top = rect.top + 'px';
    highlightOverlay.style.left = rect.left + 'px';
    highlightOverlay.style.width = rect.width + 'px';
    highlightOverlay.style.height = rect.height + 'px';
}

// Send selected element data to background script
function sendSelectedElementData() {
    if (!selectedElement) return;

    // Get element details
    const elementData = {
        tagName: selectedElement.tagName,
        id: selectedElement.id,
        className: selectedElement.className,
        attributes: getElementAttributes(selectedElement),
        computedStyle: getComputedStyles(selectedElement),
        outerHTML: selectedElement.outerHTML
    };

    // Send data to background script
    browser.runtime.sendMessage({
        action: MessageType.SELECTED_ELEMENT_DATA,
        data: elementData
    }).catch(error => {
        // Silently handle connection errors
        if (!error.message.includes('disconnected')) {
            console.error('Error sending selected element data:', error);
        }
    });
}

// Get all attributes from an element
function getElementAttributes(element) {
    const attributes = [];

    for (const attr of element.attributes) {
        attributes.push({
            name: attr.name,
            value: attr.value
        });
    }

    return attributes;
}

// Get computed styles for an element
function getComputedStyles(element) {
    const styles = {};
    const computed = window.getComputedStyle(element);

    // Get commonly useful CSS properties
    const properties = [
        'display', 'position', 'top', 'right', 'bottom', 'left',
        'width', 'height', 'margin', 'padding', 'border',
        'color', 'background-color', 'font-family', 'font-size',
        'z-index', 'opacity', 'visibility'
    ];

    for (const prop of properties) {
        styles[prop] = computed.getPropertyValue(prop);
    }

    return styles;
}

// Set up console log interceptor
function setupConsoleInterceptor() {
    try {
        const originalConsole = {
            log: console.log,
            info: console.info,
            warn: console.warn,
            error: console.error,
            debug: console.debug
        };

        // Override console methods
        for (const method in originalConsole) {
            console[method] = function (...args) {
                try {
                    // Call original method
                    originalConsole[method].apply(console, args);

                    // Send to background script
                    browser.runtime.sendMessage({
                        action: MessageType.CONSOLE_LOG,
                        logType: method,
                        args: args.map(arg => {
                            // Convert to serializable format
                            if (typeof arg === 'object') {
                                try {
                                    return JSON.stringify(arg);
                                } catch (e) {
                                    return String(arg);
                                }
                            }
                            return arg;
                        }),
                        timestamp: new Date().toISOString()
                    }).catch(err => {
                        // Silent error handling for disconnections
                        if (!err.message.includes('disconnected')) {
                            originalConsole.error('Error sending console log:', err);
                        }
                    });
                } catch (e) {
                    // Ensure original console method works even if our code fails
                    originalConsole[method].apply(console, args);
                    originalConsole.error('Error in console interceptor:', e);
                }
            };
        }
    } catch (e) {
        console.error('Failed to setup console interceptor:', e);
    }
}

// Set up network request interceptor
function setupNetworkInterceptor() {
    // Use a proxy to intercept fetch
    const originalFetch = window.fetch;

    window.fetch = async function (input, init) {
        const url = typeof input === 'string' ? input : input.url;
        const method = init && init.method ? init.method : 'GET';
        const startTime = performance.now();

        try {
            const response = await originalFetch.apply(this, arguments);

            // Log successful request
            const endTime = performance.now();
            const duration = endTime - startTime;

            try {
                browser.runtime.sendMessage({
                    action: MessageType.NETWORK_LOG,
                    success: true,
                    data: {
                        url,
                        method,
                        status: response.status,
                        statusText: response.statusText,
                        duration,
                        timestamp: new Date().toISOString()
                    }
                });
            } catch (e) {
                // Ignore errors when sending messages
            }

            return response;
        } catch (error) {
            // Log failed request
            const endTime = performance.now();
            const duration = endTime - startTime;

            try {
                browser.runtime.sendMessage({
                    action: MessageType.NETWORK_LOG,
                    success: false,
                    data: {
                        url,
                        method,
                        error: error.message,
                        duration,
                        timestamp: new Date().toISOString()
                    }
                });
            } catch (e) {
                // Ignore errors when sending messages
            }

            throw error;
        }
    };

    // Intercept XMLHttpRequest
    const originalXhrOpen = XMLHttpRequest.prototype.open;
    const originalXhrSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url) {
        this._mcpMethod = method;
        this._mcpUrl = url;
        originalXhrOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function () {
        const xhr = this;
        const startTime = performance.now();

        xhr.addEventListener('load', function () {
            const endTime = performance.now();
            const duration = endTime - startTime;

            try {
                browser.runtime.sendMessage({
                    action: MessageType.NETWORK_LOG,
                    success: true,
                    data: {
                        url: xhr._mcpUrl,
                        method: xhr._mcpMethod,
                        status: xhr.status,
                        statusText: xhr.statusText,
                        duration,
                        timestamp: new Date().toISOString()
                    }
                });
            } catch (e) {
                // Ignore errors when sending messages
            }
        });

        xhr.addEventListener('error', function () {
            const endTime = performance.now();
            const duration = endTime - startTime;

            try {
                browser.runtime.sendMessage({
                    action: MessageType.NETWORK_LOG,
                    success: false,
                    data: {
                        url: xhr._mcpUrl,
                        method: xhr._mcpMethod,
                        error: 'Network error',
                        duration,
                        timestamp: new Date().toISOString()
                    }
                });
            } catch (e) {
                // Ignore errors when sending messages
            }
        });

        originalXhrSend.apply(this, arguments);
    };
}

// Initialize the content script when loaded
init(); 