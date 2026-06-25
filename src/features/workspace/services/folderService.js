export const folderExists = (folders, id) => {
    if (!folders || !Array.isArray(folders)) return false;
    for (const folder of folders) {
        if (folder.id === id) return true;
        if (folder.children && folderExists(folder.children, id)) return true;
    }
    return false;
};

export const findFolderById = (folders, id) => {
    if (!folders || !Array.isArray(folders)) return null;
    for (const folder of folders) {
        if (folder.id === id) return folder;
        if (folder.children) {
            const found = findFolderById(folder.children, id);
            if (found) return found;
        }
    }
    return null;
};

export const findFolderName = (folders, id) => {
    const folder = findFolderById(folders, id);
    return folder ? folder.name : null;
};

export const buildFolderIdSet = (folders, set = new Set()) => {
    folders.forEach(f => { set.add(f.id); if (f.children) buildFolderIdSet(f.children, set); });
    return set;
};

export const calculateFolderCounts = (folders, workflows) => {
    if (!folders || !Array.isArray(folders)) return [];
    if (!workflows || !Array.isArray(workflows)) return folders;

    const folderIdSet = buildFolderIdSet(folders);

    const countFolders = (foldersArr) => foldersArr.map(folder => {
        let count = workflows.filter(wf => {
            if (folder.id === 'drafts') {
                const isOrphaned = wf.folderId && !folderIdSet.has(wf.folderId);
                return !wf.folderId || wf.folderId === 'drafts' || isOrphaned;
            }
            const isOrphaned = wf.folderId && !folderIdSet.has(wf.folderId);
            return wf.folderId === folder.id && !isOrphaned;
        }).length;

        return {
            ...folder,
            count,
            children: folder.children && folder.children.length > 0
                ? countFolders(folder.children)
                : []
        };
    });

    return countFolders(folders);
};

export const validateCount = (count) => {
    if (typeof count !== 'number' || isNaN(count) || count < 0) {
        return 0;
    }
    return Math.floor(count);
};
