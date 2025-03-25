# Browser Tools MCP for Firefox

A Firefox extension that provides developer tools for web development and debugging. This extension was developed to extend the [browser-tools-mcp](https://github.com/AgentDeskAI/browser-tools-mcp) project by AgentDeskAI, which originally offered only a Chrome plugin. Designed for use with the Zen browser, it allows seamless integration with MCP-compatible IDEs like Cursor.

## Purpose

The original [browser-tools-mcp](https://github.com/AgentDeskAI/browser-tools-mcp) project provides a Chrome extension that enables AI-powered IDEs to monitor and interact with browser activities via the Model Context Protocol (MCP). Recognizing the need for similar functionality in Firefox, we developed this extension to extend MCP's capabilities to Firefox users, especially those using the Zen browser.

## Features

- View selected element details
- Monitor console logs
- Track network requests
- Analyze webpage elements
- Seamless integration with MCP-compatible IDEs like Cursor

## Connection with MCP

This extension integrates with the existing [browser-tools-mcp](https://github.com/AgentDeskAI/browser-tools-mcp) server, utilizing the same MCP protocol to ensure consistent communication between Firefox and IDEs.

## Installation

### Development Mode

1. Clone this repository
2. Install dependencies with `npm install`
3. Run the extension in development mode with `npm start`

### Build for Distribution

1. Build the extension with `npm run build`
2. The packaged extension will be available in the `dist` directory

## Usage

Once installed and configured, the extension allows MCP-compatible IDEs to:

- Monitor browser console output
- Capture network traffic
- Take screenshots
- Analyze selected elements

## Signing the Extension

To sign the extension for distribution on the Firefox Add-ons store:

1. Create a `.env` file based on `.env.example`
2. Add your AMO API keys to the `.env` file
3. Run `npm run sign`

## Development

- `npm run build` - Build the extension
- `npm start` - Run the extension in development mode
- `npm run lint` - Lint the extension
- `npm run sign` - Sign the extension for distribution

## For Developers

If you're developing tools that interact with the MCP protocol or building IDE extensions that need browser capabilities, this extension provides a reference implementation for Firefox. The code structure demonstrates:

- How to establish MCP communication channels
- Data formatting for AI-readable browser state
- Event capture and translation between browser and IDE

## License

MIT
