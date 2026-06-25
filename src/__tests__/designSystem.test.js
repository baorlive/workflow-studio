
import { describe, it, expect } from 'vitest';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config.js';
import fs from 'fs';
import path from 'path';

const fullConfig = resolveConfig(tailwindConfig);

describe('Design System Audit', () => {
    describe('Color System', () => {
        it('should have primary-500 defined as the brand color variable', () => {
            // Check that the configuration points to the CSS variable
            expect(fullConfig.theme.colors.primary['500']).toBe('var(--color-primary-500)');
        });

        it('should have primary-600 defined as the hover state variable', () => {
            expect(fullConfig.theme.colors.primary['600']).toBe('var(--color-primary-600)');
        });

        it('should define the 4 core brand color primitives', () => {
            const cssPath = path.resolve(__dirname, '../design-system/tokens/primitives.css');
            const cssContent = fs.readFileSync(cssPath, 'utf-8');

            expect(cssContent).toMatch(/--primitive-color-brand:\s*var\(--primitive-color-brand-3\)/i);
            expect(cssContent).toMatch(/--primitive-color-background:\s*var\(--primitive-color-gray-50\)/i);
            expect(cssContent).toMatch(/--primitive-color-text:\s*var\(--primitive-color-gray-900\)/i);
            expect(cssContent).toMatch(/--primitive-color-border:\s*var\(--primitive-color-gray-200\)/i);
            expect(cssContent).toMatch(/--primitive-color-brand-1:\s*#ede9fe/i);
            expect(cssContent).toMatch(/--primitive-color-brand-2:\s*#c4b5fd/i);
            expect(cssContent).toMatch(/--primitive-color-brand-3:\s*#5b4de8/i);
            expect(cssContent).toMatch(/--primitive-color-brand-4:\s*#4338ca/i);
        });

        it('should define compatibility aliases in theme setup', () => {
            const cssPath = path.resolve(__dirname, '../design-system/themes/light.css');
            const cssContent = fs.readFileSync(cssPath, 'utf-8');

            expect(cssContent).toMatch(/--color-primary-500:\s*var\(--semantic-color-brand\)/i);
            expect(cssContent).toMatch(/--color-surface:\s*var\(--semantic-color-background\)/i);
        });

        it('should not contain hardcoded brand hex in semantic tokens (should use mappings)', () => {
            const cssPath = path.resolve(__dirname, '../design-system/tokens/semantic.css');
            const cssContent = fs.readFileSync(cssPath, 'utf-8');
            expect(cssContent).not.toMatch(/#5b4de8/i);
        });

        it('should map semantic and component tokens to primitive references', () => {
            const semanticPath = path.resolve(__dirname, '../design-system/tokens/semantic.css');
            const buttonPath = path.resolve(__dirname, '../design-system/tokens/components/button.tokens.css');
            const inputPath = path.resolve(__dirname, '../design-system/tokens/components/input.tokens.css');
            const cardPath = path.resolve(__dirname, '../design-system/tokens/components/card.tokens.css');

            const semantic = fs.readFileSync(semanticPath, 'utf-8');
            const button = fs.readFileSync(buttonPath, 'utf-8');
            const input = fs.readFileSync(inputPath, 'utf-8');
            const card = fs.readFileSync(cardPath, 'utf-8');

            expect(semantic).toMatch(/--semantic-color-brand:\s*var\(--primitive-color-brand\)/i);
            expect(button).toMatch(/--button-primary-bg:\s*var\(--primitive-color-brand\)/i);
            expect(input).toMatch(/--input-border-focus:\s*var\(--primitive-color-brand\)/i);
            expect(card).toMatch(/--card-border-hover:\s*var\(--primitive-color-brand\)/i);
        });
    });
});
