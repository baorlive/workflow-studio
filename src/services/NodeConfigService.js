import { NODE_CONFIG } from '../constants/workflow';

/**
 * Service for node configuration and default parameters
 */
export class NodeConfigService {
    /**
     * Get default parameters for a node type
     */
    static getDefaultParams(nodeType) {
        return NODE_CONFIG.DEFAULT_PARAMS[nodeType] || {
            customParam: { type: 'string', label: 'Custom Parameter', value: '' }
        };
    }

    /**
     * Initialize node with default parameters if missing
     */
    static initializeNodeParams(node) {
        if (node.parameters) {
            return node;
        }

        return {
            ...node,
            parameters: this.getDefaultParams(node.type)
        };
    }

    /**
     * Validate node parameters
     */
    static validateParams(node) {
        if (!node.parameters) {
            return { valid: false, errors: ['Missing parameters'] };
        }

        const errors = [];

        Object.entries(node.parameters).forEach(([key, param]) => {
            if ((param.type === 'string' || param.type === 'select') && !String(param.value).trim()) {
                errors.push(`${param.label || key} is required`);
            }
        });

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Update a specific parameter value
     */
    static updateParam(node, paramKey, newValue) {
        return {
            ...node,
            parameters: {
                ...node.parameters,
                [paramKey]: {
                    ...node.parameters[paramKey],
                    value: newValue
                }
            }
        };
    }
}
