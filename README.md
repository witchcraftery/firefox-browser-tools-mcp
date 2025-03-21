# Firefox Browser Tools MCP

A Firefox extension that provides browser tools for AI assistants to interact with web pages. This extension allows AI assistants to select, analyze, and retrieve information about webpage elements, including animation and hover effects.

## Features

- **Element Selection**: Capture detailed information about selected elements on web pages
- **Animation Detection**: Analyze CSS animations and transitions on selected elements
- **Hover Effect Analysis**: Detect hover effects on selected elements
- **API Integration**: Expose element data through a local API for AI assistants
- **Cross-tab Support**: Works with active and inactive tabs

## Installation

### From Releases

1. Download the latest `.xpi` file from the [Releases](https://github.com/witchcraftery/firefox-browser-tools-mcp/releases) page
2. Open Firefox and navigate to `about:addons`
3. Click the gear icon and select "Install Add-on From File..."
4. Select the downloaded `.xpi` file

### Development Installation

1. Clone the repository:
   ```
   git clone https://github.com/witchcraftery/firefox-browser-tools-mcp.git
   cd firefox-browser-tools-mcp
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build the extension:
   ```
   npm run build
   ```

4. Load the extension in Firefox:
   - Navigate to `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on..."
   - Select any file in the `dist/` directory

## Usage

### For Users

1. Install the extension in Firefox
2. Right-click on an element to select it
3. The extension will capture information about the selected element
4. Use AI assistants that support the Browser Tools MCP to interact with the selected elements

### For AI Assistants

The extension provides the following API endpoints:

- `GET http://localhost:8766/latest` - Get information about the latest selected element
- `GET http://localhost:8766/animations/analyze` - Analyze animations on the selected element
- `GET http://localhost:8766/hover/analyze` - Analyze hover effects on the selected element
- `GET http://localhost:8766/help` - Get information about available endpoints

Example:
```bash
curl http://localhost:8766/latest | jq
```

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

### Building the Extension

```bash
npm run build
```

### Running in Development Mode

```bash
npm run dev
```

### Signing the Extension

To sign the extension for distribution, you need Mozilla Add-ons API keys:

1. Create a `.env` file based on `.env.example`
2. Add your Mozilla Add-ons API keys
3. Run:
   ```bash
   node sign-extension.js
   ```

## How It Works

1. The content script injects into web pages and listens for element selections
2. When an element is selected, it extracts detailed information and sends it to the background script
3. The background script stores the element data in a local cache file
4. The API server reads from the cache file and exposes the data through HTTP endpoints
5. AI assistants can access the endpoints to get information about selected elements

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Witchcraftery for creating and maintaining the extension
- Contributors who helped improve and test the extension