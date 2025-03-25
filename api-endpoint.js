/**
 * API Endpoint for Browser Tools MCP Firefox Extension
 * This file contains shared constants and utilities for message passing
 */

// Prevent redeclaration when the script is injected multiple times
if (!window.BrowserToolsMCP) {
    // Message types for communication between different parts of the extension
    const MessageType = {
        // Element selection
        START_ELEMENT_SELECTION: 'startElementSelection',
        STOP_ELEMENT_SELECTION: 'stopElementSelection',
        GET_SELECTED_ELEMENT: 'getSelectedElement',
        SELECTED_ELEMENT_DATA: 'selectedElementData',

        // Console logs
        CONSOLE_LOG: 'consoleLog',
        CONSOLE_LOGS_DATA: 'consoleLogsData',
        CLEAR_CONSOLE_LOGS: 'clearConsoleLogs',

        // Network logs
        NETWORK_LOG: 'networkLog',
        NETWORK_LOGS_DATA: 'networkLogsData',
        CLEAR_NETWORK_LOGS: 'clearNetworkLogs',

        // Screenshots
        TAKE_SCREENSHOT: 'takeScreenshot',
        SCREENSHOT_DATA: 'screenshotData',

        // Error handling
        CONTENT_SCRIPT_ERROR: 'contentScriptError'
    };

    // Connection names
    const ConnectionName = {
        DEVTOOLS_PANEL: 'devtools-panel',
        SELECTED_ELEMENT_VIEW: 'selected-element-view'
    };

    // Utility functions for converting data to serializable format
    const Utils = {
        /**
         * Convert an object to a serializable format
         * @param {any} obj - The object to serialize
         * @returns {any} - A serializable version of the object
         */
        makeSerializable: function (obj) {
            if (typeof obj !== 'object' || obj === null) {
                return obj;
            }

            try {
                // Handle circular references by creating a safe version
                const seen = new WeakSet();
                const safeObj = JSON.stringify(obj, (key, value) => {
                    if (typeof value === 'object' && value !== null) {
                        if (seen.has(value)) {
                            return '[Circular Reference]';
                        }
                        seen.add(value);
                    }
                    return value;
                });
                return JSON.parse(safeObj);
            } catch (e) {
                // If it can't be stringified, convert to string
                return String(obj);
            }
        },

        /**
         * Get a timestamp string in ISO format
         * @returns {string} - Current timestamp in ISO format
         */
        getTimestamp: function () {
            return new Date().toISOString();
        },

        /**
         * Escape HTML to prevent XSS
         * @param {string} html - HTML string to escape
         * @returns {string} - Escaped HTML
         */
        escapeHTML: function (html) {
            const div = document.createElement('div');
            div.textContent = html;
            return div.innerHTML;
        },

        /**
         * Format a date for display
         * @param {string} isoString - ISO date string
         * @returns {string} - Formatted date string
         */
        formatDate: function (isoString) {
            const date = new Date(isoString);
            return date.toLocaleTimeString();
        },

        /**
         * Format duration in milliseconds
         * @param {number} ms - Duration in milliseconds
         * @returns {string} - Formatted duration string
         */
        formatDuration: function (ms) {
            if (ms < 1000) {
                return `${Math.round(ms)}ms`;
            } else {
                return `${(ms / 1000).toFixed(2)}s`;
            }
        }
    };

    // Export the module
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            MessageType,
            ConnectionName,
            Utils
        };
    } else {
        // In browser context, add to window
        window.BrowserToolsMCP = {
            MessageType,
            ConnectionName,
            Utils
        };
    }
}

// This ensures we have access to MessageType even if it's not redeclared
if (typeof MessageType === 'undefined' && window.BrowserToolsMCP) {
    const MessageType = window.BrowserToolsMCP.MessageType;
} 