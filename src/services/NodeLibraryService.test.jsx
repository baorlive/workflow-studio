
import { describe, it, expect } from 'vitest';
import { getNodeLibrary, getNodeSpec } from './NodeLibraryService';

describe('NodeLibraryService', () => {
    it('should load node library correctly', () => {
        const library = getNodeLibrary();
        expect(library).toBeDefined();
        expect(library.categories).toBeInstanceOf(Array);
        expect(library.categories.length).toBeGreaterThan(0);
    });

    it('should have correct fields for Alchemy node', () => {
        const spec = getNodeSpec('alchemy');
        expect(spec).toBeDefined();
        expect(spec.id).toBe('alchemy');
        
        // Check Basic Fields
        expect(spec.resolvedFields.basic).toBeDefined();
        expect(spec.resolvedFields.basic.length).toBeGreaterThan(0);
        
        const networkField = spec.resolvedFields.basic.find(f => f.name === 'Network');
        expect(networkField).toBeDefined();
        expect(networkField.description).toContain('Network selection');
        
        // Check Advanced Fields (PageKey is required: false)
        expect(spec.resolvedFields.advanced).toBeDefined();
        expect(spec.resolvedFields.advanced.length).toBeGreaterThan(0);
        
        const pageKeyField = spec.resolvedFields.advanced.find(f => f.name === 'PageKey');
        expect(pageKeyField).toBeDefined();
    });

    it('should have basic fields populated', () => {
        const spec = getNodeSpec('alchemy');
        const basicNames = spec.resolvedFields.basic.map(f => f.name);
        
        // Basic should have 'Network'
        expect(basicNames).toContain('Network');
        // Basic should NOT have 'PageKey' (it's advanced)
        expect(basicNames).not.toContain('PageKey');
        
        expect(basicNames.length).toBeGreaterThan(0);
    });
});
