#!/bin/bash

# Create placeholder PWA icons using ImageMagick
# These will be replaced with actual branding later

# Check if convert command exists
if ! command -v convert &> /dev/null; then
    echo "ImageMagick not found. Creating simple text placeholders..."
    
    # Create SVG placeholders that can be used
    echo '<?xml version="1.0" encoding="UTF-8"?>
<svg width="192" height="192" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" fill="#000000"/>
  <text x="96" y="96" font-size="80" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-weight="bold">EM</text>
</svg>' > icon-192.svg
    
    echo '<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#000000"/>
  <text x="256" y="256" font-size="200" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-weight="bold">EM</text>
</svg>' > icon-512.svg
    
    echo "✓ Created SVG placeholders"
    echo "Note: Convert these to PNG manually or use an online tool"
    echo "Or install ImageMagick: sudo apt install imagemagick"
else
    echo "Creating PWA icons with ImageMagick..."
    
    # Create 192x192 icon
    convert -size 192x192 xc:black \
            -gravity center \
            -pointsize 80 \
            -fill white \
            -annotate +0+0 "EM" \
            icon-192.png
    
    # Create 512x512 icon
    convert -size 512x512 xc:black \
            -gravity center \
            -pointsize 200 \
            -fill white \
            -annotate +0+0 "EM" \
            icon-512.png
    
    echo "✓ Created icon-192.png and icon-512.png"
fi

echo ""
echo "Icons created! Replace with your actual logo later."

