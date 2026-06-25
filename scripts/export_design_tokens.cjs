
const fs = require('fs');
const path = require('path');

// Paths
const CSS_PATH = path.join(__dirname, '../src/styles/index.css');
const OUTPUT_PATH = path.join(__dirname, '../design-export/tokens.json');

// 1. Parse Colors from CSS
function parseColors(cssContent) {
    const colorRegex = /--color-([\w-]+):\s*(#[0-9a-fA-F]{6}|rgba?\(.*?\));/g;
    const colors = {};
    let match;

    while ((match = colorRegex.exec(cssContent)) !== null) {
        const name = match[1];
        const value = match[2];
        
        // Structure: primary-500 -> primary: { 500: value }
        const parts = name.split('-');
        if (parts.length >= 2) {
            const category = parts[0]; // primary, surface, etc
            const shade = parts.slice(1).join('-'); // 500, text, text-muted
            
            if (!colors[category]) colors[category] = {};
            colors[category][shade] = {
                value: value,
                type: 'color'
            };
        } else {
            colors[name] = { value, type: 'color' };
        }
    }
    return colors;
}

// 2. Define Typography (Based on Design System)
const typography = {
    fontFamily: {
        sans: { value: "Inter", type: "fontFamilies" },
        mono: { value: "JetBrains Mono", type: "fontFamilies" }
    },
    fontSize: {
        xs: { value: "12px", type: "fontSizes" },
        sm: { value: "14px", type: "fontSizes" },
        base: { value: "16px", type: "fontSizes" },
        lg: { value: "18px", type: "fontSizes" },
        xl: { value: "20px", type: "fontSizes" },
        "2xl": { value: "24px", type: "fontSizes" },
        "3xl": { value: "30px", type: "fontSizes" },
        "4xl": { value: "36px", type: "fontSizes" },
        "5xl": { value: "48px", type: "fontSizes" },
        "6xl": { value: "60px", type: "fontSizes" }
    },
    fontWeight: {
        normal: { value: "400", type: "fontWeights" },
        medium: { value: "500", type: "fontWeights" },
        semibold: { value: "600", type: "fontWeights" },
        bold: { value: "700", type: "fontWeights" },
        extrabold: { value: "800", type: "fontWeights" }
    }
};

// 3. Define Spacing (4px Grid)
const spacing = {
    "0": { value: "0px", type: "spacing" },
    "1": { value: "4px", type: "spacing" },
    "2": { value: "8px", type: "spacing" },
    "3": { value: "12px", type: "spacing" },
    "4": { value: "16px", type: "spacing" },
    "5": { value: "20px", type: "spacing" },
    "6": { value: "24px", type: "spacing" },
    "8": { value: "32px", type: "spacing" },
    "10": { value: "40px", type: "spacing" },
    "12": { value: "48px", type: "spacing" },
    "16": { value: "64px", type: "spacing" },
    "20": { value: "80px", type: "spacing" },
    "24": { value: "96px", type: "spacing" },
    "32": { value: "128px", type: "spacing" },
    "40": { value: "160px", type: "spacing" },
    "48": { value: "192px", type: "spacing" },
    "56": { value: "224px", type: "spacing" },
    "64": { value: "256px", type: "spacing" }
};

// Main Execution
try {
    const cssContent = fs.readFileSync(CSS_PATH, 'utf8');
    const colors = parseColors(cssContent);

    const designTokens = {
        meta: {
            name: "Workflow Studio Design System",
            version: "1.0.0",
            generatedAt: new Date().toISOString()
        },
        color: colors,
        typography: typography,
        spacing: spacing
    };

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(designTokens, null, 2));
    console.log(`Design tokens exported to ${OUTPUT_PATH}`);

} catch (error) {
    console.error('Error exporting tokens:', error);
    process.exit(1);
}
