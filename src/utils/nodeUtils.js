import { NODE } from '../constants/nodeConstants';
import lodash from 'lodash';

// Unified validation constants
export const REQUIRED_INPUT_TYPES = new Set(['string', 'password', 'date', 'code', 'json', 'file', 'options', 'asyncOptions', 'number']);

// Unified validation sections
export const VALIDATION_SECTIONS = ['inputParameters', 'actions', 'credentials'];

/**
 * Unified validation function for checking required inputs in node data
 * @param {Object} nodeData - The node data to validate
 * @param {Object} nodeDetails - Optional node details with params (for EditNodes)
 * @param {Array} position - Optional position array (for EditNodes)
 * @param {Function} displayParameters - Optional function to display parameters (for EditNodes)
 * @param {Function} displayOptions - Optional function to display options (for EditNodes)
 * @returns {Object} - Validation result with count and details
 */
export const validateNodeRequiredInputs = (
    nodeData,
    nodeDetails = null,
    position = null,
    displayParameters = null,
    displayOptions = null
) => {
    let unfilledRequiredInputs = 0;
    const validationDetails = {
        total: 0,
        filled: 0,
        unfilled: 0,
        details: []
    };

    // Helper function to check if input is optional
    const isInputOptional = (input, nodeData) => {
        // If optional is explicitly false, it's required
        if (input.optional === false) {
            return false;
        }

        // If optional is explicitly true, it's optional
        if (input.optional === true) {
            return true;
        }

        // If optional is undefined/null, check if it has a default value
        if (input.optional === undefined || input.optional === null) {
            if (input.default !== undefined && input.default !== null && input.default !== '') {
                return true;
            }
            return false;
        }

        // If optional is an object with conditions, evaluate them
        if (typeof input.optional === 'object') {
            const isOptional = Object.entries(input.optional).every(([path, comparisonValue]) => {
                const groundValue = lodash.get(nodeData, path, '');

                if (Array.isArray(comparisonValue)) {
                    return comparisonValue.includes(groundValue);
                }

                if (typeof comparisonValue === 'string' && comparisonValue.startsWith('/') && comparisonValue.endsWith('/')) {
                    // Regex pattern
                    const regex = new RegExp(comparisonValue.slice(1, -1));
                    return regex.test(groundValue);
                }

                return comparisonValue === groundValue;
            });

            return isOptional;
        }

        return false;
    };

    // If we have nodeDetails (EditNodes mode), use detailed validation
    if (nodeDetails && position && displayParameters && displayOptions) {
        const unfilledInputs = position.reduce((count, pos) => {
            if (!nodeDetails[pos]) {
                return count;
            }

            const posParams = displayParameters(nodeDetails[pos] || [], pos, 0);
            const posNodeParams = displayOptions(lodash.cloneDeep(posParams), pos, 0);

            return (
                count +
                posNodeParams.reduce((posCount, input) => {
                    if (!REQUIRED_INPUT_TYPES.has(input.type) || isInputOptional(input, nodeData)) {
                        return posCount;
                    }

                    const valueForInput = lodash.get(nodeData, `${pos}.${input.name}`);
                    const isEmpty = valueForInput === undefined || valueForInput === '';
                    if (isEmpty) {
                        validationDetails.details.push({
                            section: pos,
                            field: input.name,
                            type: input.type,
                            value: valueForInput,
                            status: 'unfilled'
                        });
                    } else {
                        validationDetails.details.push({
                            section: pos,
                            field: input.name,
                            type: input.type,
                            value: valueForInput,
                            status: 'filled'
                        });
                    }

                    return posCount + (isEmpty ? 1 : 0);
                }, 0)
            );
        }, 0);

        unfilledRequiredInputs = unfilledInputs;
        validationDetails.unfilled = unfilledInputs;
        validationDetails.filled = validationDetails.details.filter((d) => d.status === 'filled').length;
        validationDetails.total = validationDetails.details.length;
    } else {
        // AssistantAI mode - check all sections without detailed params
         VALIDATION_SECTIONS.forEach((section) => {
            if (nodeData[section]) {
                 const params = nodeData[`${section}Params`] || [];
                 
                 if (Array.isArray(params) && params.length > 0) {
                     params.forEach((input) => {
                         if (!REQUIRED_INPUT_TYPES.has(input.type) || isInputOptional(input, nodeData)) {
                             return;
                         }
                         
                         const valueForInput = lodash.get(nodeData, `${section}.${input.name}`);
                         
                         // Special validation for credentials
                         if (section === 'credentials' && input.name === 'credentialMethod') {
                            const credentialMethod = valueForInput;
                            const registeredCredential = lodash.get(nodeData, `${section}.registeredCredential`);

                            if (!credentialMethod || credentialMethod === '') {
                                unfilledRequiredInputs++;
                                validationDetails.details.push({
                                    section,
                                    field: input.name,
                                    type: input.type,
                                    value: valueForInput,
                                    status: 'unfilled',
                                    message: 'Credential method is required'
                                });
                            } else if (!registeredCredential || !registeredCredential.id) {
                                unfilledRequiredInputs++;
                                validationDetails.details.push({
                                    section,
                                    field: 'registeredCredential',
                                    type: 'credential',
                                    value: registeredCredential,
                                    status: 'unfilled',
                                    message: `Credential for ${credentialMethod} is not set up`
                                });
                            } else {
                                validationDetails.details.push({
                                    section,
                                    field: input.name,
                                    type: input.type,
                                    value: valueForInput,
                                    status: 'filled'
                                });
                            }
                            return;
                         }

                         if (valueForInput === undefined || valueForInput === '') {
                             unfilledRequiredInputs++;
                             validationDetails.details.push({
                                 section,
                                 field: input.name,
                                 type: input.type,
                                 value: valueForInput,
                                 status: 'unfilled'
                             });
                         } else {
                             validationDetails.details.push({
                                 section,
                                 field: input.name,
                                 type: input.type,
                                 value: valueForInput,
                                 status: 'filled'
                             });
                         }
                     });
                 }
            }
        });
        
        validationDetails.unfilled = unfilledRequiredInputs;
        validationDetails.filled = validationDetails.details.filter((d) => d.status === 'filled').length;
        validationDetails.total = validationDetails.details.length;
    }

    return {
        count: unfilledRequiredInputs,
        details: validationDetails
    };
};

/**
 * Generate validation params for generated nodes
 * This function analyzes node data and creates validation parameters
 * @param {Object} nodeData - The node data to analyze
 * @returns {Object} - Node data with added validation params
 */
export const generateValidationParamsForNode = (nodeData) => {
    const enhancedNodeData = { ...nodeData };

    VALIDATION_SECTIONS.forEach((section) => {
        if (nodeData[section] && typeof nodeData[section] === 'object') {
            const sectionData = nodeData[section];
            const params = [];

            Object.entries(sectionData).forEach(([key, value]) => {
                if (key === 'submit') return;

                // Determine the type based on the value
                let type = 'string';
                if (typeof value === 'number') {
                    type = 'number';
                } else if (typeof value === 'boolean') {
                    type = 'boolean';
                } else if (Array.isArray(value)) {
                    type = 'json';
                } else if (typeof value === 'object' && value !== null) {
                    type = 'json';
                }

                // Create a param object
                const param = {
                    name: key,
                    type: type,
                    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
                    default: value,
                    optional: false // Assume all fields are required for now
                };

                // Special handling for common fields
                if (key === 'amount' || key === 'value') {
                    param.type = 'number';
                } else if (key === 'currency') {
                    param.type = 'options';
                    param.options = ['usd', 'eur', 'gbp', 'jpy', 'cad', 'aud', 'chf', 'cny'];
                } else if (key === 'function' || key === 'method') {
                    param.type = 'options';
                    // This will be populated based on the actual node type
                } else if (key === 'credentialMethod') {
                    param.type = 'options';
                    param.options = ['stripeAPI', 'web3', 'http', 'oauth2'];
                }
                
                params.push(param);
            });
            
            enhancedNodeData[`${section}Params`] = params;
        }
    });
    
    return enhancedNodeData;
};
