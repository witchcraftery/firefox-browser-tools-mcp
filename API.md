# Browser Tools MCP API Documentation

This document describes the Multi-Channel Protocol (MCP) implementation in the Browser Tools MCP Firefox extension and how to integrate with it. This extension is developed as a companion to the [browser-tools-mcp](https://github.com/AgentDeskAI/browser-tools-mcp) project, extending its functionality from Chrome to Firefox.

## MCP Protocol Overview

The Multi-Channel Protocol (MCP) is a communication framework that allows browser extensions to exchange data with external applications such as AI-powered IDEs. This extension implements the MCP protocol to enable Firefox to communicate with tools like Cursor, using the same MCP server infrastructure as the original [browser-tools-mcp](https://github.com/AgentDeskAI/browser-tools-mcp) Chrome extension.

## Message Format

All MCP messages follow this general structure:

```json
{
  "action": "actionName",
  "data": {
    // Action-specific payload
  }
}
```

## Supported Actions

### Element Selection

#### `startElementSelection`

Initiates the element selection mode in the browser.

**Direction**: IDE → Extension

**Example**:

```json
{
  "action": "startElementSelection"
}
```

#### `stopElementSelection`

Stops the element selection mode.

**Direction**: IDE → Extension

**Example**:

```json
{
  "action": "stopElementSelection"
}
```

#### `selectedElementData`

Sends data about the currently selected element.

**Direction**: Extension → IDE

**Example**:

```json
{
  "action": "selectedElementData",
  "data": {
    "tagName": "div",
    "id": "container",
    "classes": ["main", "active"],
    "attributes": {
      "data-id": "123",
      "aria-label": "Main container"
    },
    "styles": {
      "color": "rgb(255, 0, 0)",
      "display": "flex"
    },
    "textContent": "Hello, world!",
    "xpath": "/html/body/div[1]",
    "dimensions": {
      "width": 200,
      "height": 100,
      "top": 50,
      "left": 20
    }
  }
}
```

### Console Logs

#### `consoleLog`

Sends a console log entry from the browser.

**Direction**: Extension → IDE

**Example**:

```json
{
  "action": "consoleLog",
  "logType": "log",
  "args": ["Value:", 42, { "key": "value" }],
  "timestamp": 1647894562000
}
```

#### `clearConsoleLogs`

Requests clearing of stored console logs.

**Direction**: IDE → Extension

**Example**:

```json
{
  "action": "clearConsoleLogs"
}
```

#### `consoleLogsData`

Sends all captured console logs.

**Direction**: Extension → IDE

**Example**:

```json
{
  "action": "consoleLogsData",
  "data": [
    {
      "type": "log",
      "args": ["Test message"],
      "timestamp": 1647894562000
    },
    {
      "type": "error",
      "args": ["Error message"],
      "timestamp": 1647894563000
    }
  ]
}
```

### Network Monitoring

#### `networkLog`

Sends information about a network request.

**Direction**: Extension → IDE

**Example**:

```json
{
  "action": "networkLog",
  "success": true,
  "data": {
    "url": "https://api.example.com/data",
    "method": "GET",
    "status": 200,
    "statusText": "OK",
    "requestHeaders": { "Content-Type": "application/json" },
    "responseHeaders": { "Content-Type": "application/json" },
    "startTime": 1647894562000,
    "endTime": 1647894562500,
    "duration": 500
  }
}
```

#### `clearNetworkLogs`

Requests clearing of stored network logs.

**Direction**: IDE → Extension

**Example**:

```json
{
  "action": "clearNetworkLogs"
}
```

#### `networkLogsData`

Sends all captured network logs.

**Direction**: Extension → IDE

**Example**:

```json
{
  "action": "networkLogsData",
  "data": {
    "success": [
      {
        "url": "https://api.example.com/data",
        "method": "GET",
        "status": 200,
        "statusText": "OK",
        "duration": 500
      }
    ],
    "error": [
      {
        "url": "https://api.example.com/error",
        "method": "POST",
        "status": 500,
        "statusText": "Server Error",
        "duration": 600
      }
    ]
  }
}
```

### Screenshots

#### `takeScreenshot`

Requests a screenshot of the current tab.

**Direction**: IDE → Extension

**Example**:

```json
{
  "action": "takeScreenshot"
}
```

#### `screenshotData`

Sends the screenshot data as a base64-encoded string.

**Direction**: Extension → IDE

**Example**:

```json
{
  "action": "screenshotData",
  "data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

## Integration with External Applications

To integrate with this extension from an external application:

1. **Connection Setup**:
   - For IDE extensions, use the appropriate browser connection APIs
   - For web applications, establish message passing channels

2. **Message Exchange**:
   - Send messages in the format described above
   - Listen for responses from the extension

3. **Error Handling**:
   - Include error handling for cases where the extension is not available
   - Implement timeouts for message exchanges

4. **Authentication**:
   - For secure applications, consider implementing authentication between the extension and your application

## Example: Integration with Cursor IDE

```javascript
// Example pseudo-code for integrating with Cursor IDE
const connectToMcpExtension = () => {
  // Initialize connection
  const port = browser.runtime.connect({
    name: "cursor-ide-integration"
  });
  
  // Set up message listeners
  port.onMessage.addListener((message) => {
    if (message.action === "selectedElementData") {
      // Process selected element data
      cursorAPI.sendToAI(message.data);
    } else if (message.action === "consoleLogsData") {
      // Process console logs
      cursorAPI.updateConsoleLogs(message.data);
    }
  });
  
  // Send messages to the extension
  const selectElement = () => {
    port.postMessage({ action: "startElementSelection" });
  };
  
  return {
    selectElement,
    // Other methods...
  };
};
```

## Limitations and Considerations

- The extension requires appropriate permissions to access webpage content
- Some websites may have Content Security Policies that restrict script injection
- Performance considerations should be taken into account for high-frequency events
- Browser compatibility differences between Firefox and other browsers
