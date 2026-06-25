/**
 * Calculates the number of workflows in each folder recursively.
 * 
 * @param {Array} folders - The hierarchical folder structure
 * @param {Array} workflows - The flat list of workflows
 * @returns {Array} - The folders array with updated counts
 */
export const calculateFolderCounts = (folders, workflows) => {
    if (!folders || !Array.isArray(folders)) return [];
    if (!workflows || !Array.isArray(workflows)) return folders;

    // Helper to check if a folder exists in the folder structure
    const folderExists = (folders, id) => {
        for (const folder of folders) {
            if (folder.id === id) return true;
            if (folder.children && folderExists(folder.children, id)) return true;
        }
        return false;
    };

    return folders.map(folder => {
        // Count workflows directly in this folder
        let count = workflows.filter(wf => {
            if (folder.id === 'drafts') {
                // Include: no folderId, explicitly 'drafts', or orphaned (invalid folderId)
                const isOrphaned = wf.folderId && !folderExists(folders, wf.folderId);
                return !wf.folderId || wf.folderId === 'drafts' || isOrphaned;
            }
            // For other folders, only include if folderId matches AND folder exists
            const isOrphaned = wf.folderId && !folderExists(folders, wf.folderId);
            return wf.folderId === folder.id && !isOrphaned;
        }).length;

        // Recursively calculate counts for children
        let updatedChildren = [];
        if (folder.children && folder.children.length > 0) {
            updatedChildren = calculateFolderCounts(folder.children, workflows);
            // Optional: Should parent folder include children's counts? 
            // Usually in file systems, no. It just shows immediate content.
            // But if requested "comprehensive dashboard", we might want to know total.
            // For now, let's stick to immediate content + immediate children logic if required.
            // But standard UI pattern is count = items directly inside.
        }

        return {
            ...folder,
            count: count,
            children: updatedChildren
        };
    });
};

/**
 * Validates folder counts to ensure they are non-negative integers.
 * @param {number} count 
 * @returns {number}
 */
export const validateCount = (count) => {
    if (typeof count !== 'number' || isNaN(count) || count < 0) {
        return 0;
    }
    return Math.floor(count);
};
