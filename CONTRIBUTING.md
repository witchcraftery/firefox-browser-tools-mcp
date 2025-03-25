# Contributing to Browser Tools MCP for Firefox

Thank you for considering contributing to Browser Tools MCP for Firefox! This document provides guidelines and instructions for contributing to this project.

## Understanding the MCP Architecture

This extension was developed to extend the [browser-tools-mcp](https://github.com/AgentDeskAI/browser-tools-mcp) project's capabilities to Firefox. It integrates with the MCP server to facilitate communication between Firefox and AI-powered IDEs like Cursor.

### Key Components

- `background.js`: Manages communication and state
- `content-script.js`: Interacts with webpage DOM
- `api-endpoint.js`: Implements MCP protocol methods
- `devtools.js`: Connects with Firefox's devtools API
- `panel.js`: Provides the UI for the devtools panel

### Data Flow

- Browser events (DOM selection, console logs, network activities) are captured.
- Events are formatted according to the MCP protocol.
- Data is sent to connected IDE clients or displayed in the devtools panel.

## How to Contribute

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes.
4. Test your changes.
5. Submit a pull request.

## Development Setup

1. Clone the repository.
2. Install dependencies with `npm install`.
3. Run the extension in development mode with `npm start`.
4. For testing with an IDE integration, you'll need to:
   - Configure your IDE to connect to the extension.
   - Enable debugging in `manifest.json`.
   - Check logs in both Firefox and the IDE.

## Code Style

- Use consistent indentation (2 spaces).
- Follow the existing code style.
- Write meaningful commit messages.
- Document MCP protocol changes carefully.

## Testing

- Test your changes in Firefox before submitting a pull request.
- Ensure that your changes don't break existing functionality.
- Verify MCP data format compatibility.
- Test with actual IDE integration when possible.

## MCP Protocol Compatibility

When making changes that affect the communication protocol:

1. Maintain backward compatibility where possible.
2. Document any breaking changes thoroughly.
3. Update version numbers appropriately.
4. Consider impacts on IDE integrations.
5. Test MCP data exchanges with mock clients.

## Pull Request Process

1. Update the README.md with details of changes if appropriate.
2. Update the version number in `package.json` following [SemVer](http://semver.org/).
3. Include test results, especially for MCP protocol changes.
4. The pull request will be merged once it has been reviewed and approved.

## Code of Conduct

Please be respectful and inclusive in your interactions with others. We aim to foster an open and welcoming environment.

## Questions?

If you have any questions about the MCP protocol or how to implement specific features, feel free to open an issue or contact the maintainers directly.
