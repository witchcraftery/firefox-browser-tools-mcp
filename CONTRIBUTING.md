# Contributing to Firefox Browser Tools MCP

Thank you for your interest in contributing to Firefox Browser Tools MCP! This document provides guidelines and instructions for contributing to this project.

## Development Setup

1. Clone the repository:
   ```
   git clone https://github.com/witchcraftery/firefox-browser-tools-mcp.git
   cd firefox-browser-tools-mcp
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Copy the environment variables example file and add your API keys if needed:
   ```
   cp .env.example .env
   ```

4. For development, run:
   ```
   npm run dev
   ```

5. To build the extension:
   ```
   npm run build
   ```

6. To sign the extension (requires API keys):
   ```
   node sign-extension.js
   ```

## Development Guidelines

### Code Style

- Follow the existing code style in the project
- Use meaningful variable and function names
- Add comments for complex logic

### Testing

- Test all changes in Firefox browser
- Ensure the extension works properly in both light and dark themes
- Verify that your changes don't break existing functionality

### Submitting Changes

1. Create a new branch for your changes:
   ```
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them with clear, descriptive commit messages

3. Push your branch to GitHub:
   ```
   git push origin feature/your-feature-name
   ```

4. Create a pull request against the `main` branch
   - Fill out the pull request template completely
   - Reference any related issues

5. Wait for a review from the maintainers

## Browser Tools MCP Documentation

For more information about the Browser Tools MCP and how to use it with AI assistants, please refer to the README.md file in the repository.

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project.