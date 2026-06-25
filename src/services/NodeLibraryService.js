import nodeSelector from '../data/node_selector.json';
import nodeSchemas from '../data/node_schemas.json';
import { nodeIcons } from '../components/workflow/nodeIcons';

// Helper to determine node kind based on type and schema
const determineKind = (type, schema) => {
    const lowerType = (type || '').toLowerCase();
    
    if (lowerType.includes('trigger') || lowerType.includes('webhook')) {
        return 'trigger';
    }
    
    if (lowerType === 'if_else' || lowerType === 'switch' || lowerType === 'condition') {
        return 'conditional';
    }
    
    if (lowerType.includes('loop')) {
        return 'trigger'; // or a specific loop kind if supported
    }
    
    if (lowerType.includes('delay') || lowerType.includes('wait')) {
        return 'delay';
    }
    
    if (lowerType.includes('transform') || lowerType.includes('map')) {
        return 'transform';
    }
    
    if (lowerType.includes('compute') || lowerType.includes('classify') || lowerType.includes('score')) {
        return 'compute';
    }

    return 'action';
};

// Helper to determine icon based on type
const determineIcon = (type) => {
    if (nodeIcons[type]) {
        return nodeIcons[type];
    }

    const lowerType = (type || '').toLowerCase();
    if (lowerType.includes('trigger')) return 'zap';
    if (lowerType.includes('webhook')) return 'webhook';
    if (lowerType.includes('if_else')) return 'gitBranch';
    if (lowerType.includes('loop')) return 'repeat';
    if (lowerType.includes('delay')) return 'clock';
    if (lowerType.includes('compute') || lowerType.includes('classify') || lowerType.includes('score')) return 'cpu';
    if (lowerType.includes('db') || lowerType.includes('sql') || lowerType.includes('store')) return 'database';
    return 'activity';
};

let cachedLibrary = null;
let nodesMap = null;

export const getNodeLibrary = () => {
    if (cachedLibrary) return cachedLibrary;

    nodesMap = new Map();

    const categories = nodeSelector.map(folder => {
        const nodes = folder.items
            .filter(item => {
                // Filter out garbage nodes
                if (!item.type || !item.label) return false;
                const t = item.type.trim();
                // Check for JSON-like garbage or code snippets
                if (t.startsWith('{') || t.startsWith('}') || t.startsWith(']')) return false;
                if (t.includes('"') && (t.includes(':') || t.includes('='))) return false;
                if (t === 'e.g._?expand=contributions') return false;
                return true;
            })
            .map(item => {
                const schema = nodeSchemas[item.type] || {};
                const kind = determineKind(item.type, schema);
            
            // Check if credential is required based on schema fields
            const credentialRequired = Object.values(schema).some(
                field => field.type === 'credential'
            );

            const allFields = Object.entries(schema).map(([key, field]) => ({
                    name: field.label || key,
                    paramKey: key,
                    ...field
                }));

                const basicFields = allFields.filter(f => f.required !== false);
                const advancedFields = allFields.filter(f => f.required === false);

                const nodeSpec = {
                    id: item.type,
                    type: item.type, // For compatibility
                    title: item.label,
                    summary: item.description, // Alias for description
                    description: item.description,
                    category: folder.title,
                    kind,
                    icon: determineIcon(item.type),
                    credentialRequired,
                    fields: schema,
                    // Add resolvedFields for compatibility with PropertiesPanel
                    resolvedFields: {
                        basic: basicFields,
                        advanced: advancedFields
                    }
                };

            nodesMap.set(item.type, nodeSpec);
            return nodeSpec;
        });

        return {
            id: folder.title, // using title as ID for mapping
            title: folder.title,
            nodes
        };
    });

    cachedLibrary = { categories };
    return cachedLibrary;
};

export const getNodeSpec = (nodeId) => {
    if (!nodesMap) getNodeLibrary(); // Ensure library is built
    return nodesMap.get(nodeId);
};

export const getNodeKind = (node) => {
    // Handle both node object (from ReactFlow) and string ID
    const type = typeof node === 'string' ? node : node?.type;
    if (!type) return 'action';
    
    const spec = getNodeSpec(type);
    if (spec) return spec.kind;
    
    return determineKind(type, {});
};

export const getNodeIoSpec = (node) => {
    const kind = getNodeKind(node);
    
    // Default IO spec
    const inputs = [{ id: 'input', label: 'Input' }];
    const outputs = [{ id: 'output', label: 'Output' }];

    if (kind === 'trigger') {
        return { inputs: [], outputs };
    }

    if (kind === 'conditional') {
        return {
            inputs,
            outputs: [
                { id: 'true', label: 'True' },
                { id: 'false', label: 'False' }
            ]
        };
    }

    return { inputs, outputs };
};

export const createDefaultParametersForNode = (nodeId) => {
    const spec = getNodeSpec(nodeId);
    if (!spec || !spec.fields) return {};
    
    const params = {};
    Object.entries(spec.fields).forEach(([key, field]) => {
        if (field.default !== undefined) {
            params[key] = field.default;
        } else if (field.value !== undefined) {
             params[key] = field.value;
        } else {
            params[key] = '';
        }
    });
    return params;
};
