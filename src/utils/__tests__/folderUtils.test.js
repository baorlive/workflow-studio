import { describe, it, expect } from 'vitest';
import { calculateFolderCounts, validateCount } from '../folderUtils';

describe('folderUtils', () => {
    describe('calculateFolderCounts', () => {
        const mockFolders = [
            { id: 'f1', name: 'Project A', children: [] },
            { id: 'f2', name: 'Project B', children: [
                { id: 'f2-1', name: 'Subproject B1', children: [] }
            ]},
            { id: 'drafts', name: 'Drafts', children: [] }
        ];

        const mockWorkflows = [
            { id: 'w1', folderId: 'f1' },
            { id: 'w2', folderId: 'f1' },
            { id: 'w3', folderId: 'f2' },
            { id: 'w4', folderId: 'f2-1' },
            { id: 'w5', status: 'Draft' } // Implicit draft
        ];

        it('should correctly count workflows in folders', () => {
            const result = calculateFolderCounts(mockFolders, mockWorkflows);
            
            expect(result[0].count).toBe(2); // Project A
            expect(result[1].count).toBe(1); // Project B
            expect(result[1].children[0].count).toBe(1); // Subproject B1
        });

        it('should handle drafts correctly', () => {
            const result = calculateFolderCounts(mockFolders, mockWorkflows);
            const draftFolder = result.find(f => f.id === 'drafts');
            expect(draftFolder.count).toBe(1);
        });

        it('should return 0 for empty folders', () => {
            const result = calculateFolderCounts(mockFolders, []);
            expect(result[0].count).toBe(0);
        });

        it('should handle invalid inputs gracefully', () => {
            expect(calculateFolderCounts(null, [])).toEqual([]);
            expect(calculateFolderCounts([], null)).toEqual([]);
        });
    });

    describe('validateCount', () => {
        it('should return the number for valid inputs', () => {
            expect(validateCount(5)).toBe(5);
            expect(validateCount(0)).toBe(0);
        });

        it('should return 0 for negative numbers', () => {
            expect(validateCount(-1)).toBe(0);
        });

        it('should return 0 for non-number inputs', () => {
            expect(validateCount('abc')).toBe(0);
            expect(validateCount(null)).toBe(0);
            expect(validateCount(undefined)).toBe(0);
        });
    });
});
