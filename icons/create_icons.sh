#!/bin/bash

# Generate SVG icon for icon16.png
cat >icon16.svg <<'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
  <rect width="16" height="16" fill="#0060df" rx="2" ry="2"/>
  <text x="8" y="12" font-family="Arial" font-size="10" fill="white" text-anchor="middle">BT</text>
</svg>
EOF

# Generate SVG icon for icon48.png
cat >icon48.svg <<'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <rect width="48" height="48" fill="#0060df" rx="6" ry="6"/>
  <text x="24" y="32" font-family="Arial" font-size="24" fill="white" text-anchor="middle">BT</text>
</svg>
EOF

# Generate SVG icon for icon128.png
cat >icon128.svg <<'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <rect width="128" height="128" fill="#0060df" rx="16" ry="16"/>
  <text x="64" y="80" font-family="Arial" font-size="60" fill="white" text-anchor="middle">BT</text>
</svg>
EOF

# Check if ImageMagick is installed
if command -v convert &>/dev/null; then
  # Convert SVG to PNG using ImageMagick
  convert icon16.svg icon16.png
  convert icon48.svg icon48.png
  convert icon128.svg icon128.png
  # Clean up SVG files
  rm icon16.svg icon48.svg icon128.svg
  echo "Icons generated successfully."
else
  echo "ImageMagick not found. Please install it to convert SVG to PNG."
  echo "For now, SVG files have been created. You'll need to convert them to PNG manually."
fi
