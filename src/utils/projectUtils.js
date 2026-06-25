/**
 * Calculates the number of workflows in each project recursively.
 * 
 * @param {Array} projects - The hierarchical project structure
 * @param {Array} workflows - The flat list of workflows
 * @returns {Array} - The projects array with updated counts
 */
export const calculateProjectCounts = (projects, workflows) => {
    if (!projects || !Array.isArray(projects)) return [];
    if (!workflows || !Array.isArray(workflows)) return projects;

    // Helper to check if a project exists in the project structure
    const projectExists = (projects, id) => {
        for (const project of projects) {
            if (project.id === id) return true;
            if (project.children && projectExists(project.children, id)) return true;
        }
        return false;
    };

    return projects.map(project => {
        // Count workflows directly in this project
        let count = workflows.filter(wf => {
            if (project.id === 'drafts') {
                // Include: no projectId, explicitly 'drafts', or orphaned (invalid projectId)
                const isOrphaned = wf.projectId && !projectExists(projects, wf.projectId);
                return !wf.projectId || wf.projectId === 'drafts' || isOrphaned;
            }
            // For other projects, only include if projectId matches AND project exists
            const isOrphaned = wf.projectId && !projectExists(projects, wf.projectId);
            return wf.projectId === project.id && !isOrphaned;
        }).length;

        // Recursively calculate counts for children
        let updatedChildren = [];
        if (project.children && project.children.length > 0) {
            updatedChildren = calculateProjectCounts(project.children, workflows);
        }

        return {
            ...project,
            count: count,
            children: updatedChildren
        };
    });
};

/**
 * Validates project counts to ensure they are non-negative integers.
 * @param {number} count 
 * @returns {number}
 */
export const validateCount = (count) => {
    if (typeof count !== 'number' || isNaN(count) || count < 0) {
        return 0;
    }
    return Math.floor(count);
};
