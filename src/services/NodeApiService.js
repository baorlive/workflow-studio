// Service to handle node-related API calls (simulated for now)

export const nodesApi = {
  loadMethodNode: async (nodeName, payload) => {
    // Simulate API call
    console.log(`[Mock API] calling loadMethodNode for ${nodeName}`, payload);
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (payload.loadMethod === 'getUserId') {
            resolve({ user_id: 'user_12345_mocked' });
        } else if (payload.loadMethod === 'getColumns') {
            // Return dynamic columns based on table selection
            const tableName = payload.parameters?.table_name?.value || payload.parameters?.table_name || 'unknown';
            
            if (tableName === 'Users') {
                resolve([
                    { name: 'username', type: 'string', label: 'Username', required: true },
                    { name: 'email', type: 'string', label: 'Email' },
                    { name: 'role', type: 'select', label: 'Role', options: ['Admin', 'User'] }
                ]);
            } else if (tableName === 'Products') {
                resolve([
                    { name: 'product_name', type: 'string', label: 'Product Name' },
                    { name: 'price', type: 'number', label: 'Price' },
                    { name: 'stock', type: 'number', label: 'Stock Level' }
                ]);
            } else if (tableName === 'Orders') {
                // Return an array field with dynamic schema for rows
                resolve([
                    {
                        name: 'rows',
                        type: 'array',
                        label: 'Order Rows',
                        description: 'Add orders dynamically',
                        arrayParams: [
                            { name: 'order_id', type: 'string', label: 'Order ID' },
                            { name: 'product', type: 'string', label: 'Product' },
                            { name: 'quantity', type: 'number', label: 'Quantity' },
                            { name: 'invoice', type: 'file', label: 'Invoice File' }
                        ]
                    }
                ]);
            } else {
                resolve([
                    { name: 'generic_col', type: 'string', label: 'Generic Column' }
                ]);
            }
        } else if (payload.loadMethod && (payload.loadMethod.startsWith('getOptions') || payload.loadMethod.startsWith('list'))) {
            // Return options for AsyncSelect
            resolve([
                { label: 'Option A', name: 'opt_a', description: 'First option' },
                { label: 'Option B', name: 'opt_b', description: 'Second option' },
                { label: 'Option C', name: 'opt_c', description: 'Third option' }
            ]);
        } else {
            // Default mock response
            resolve({ 
                user_id: `mocked_value_for_${payload.loadMethod}`,
                data: { result: 'success' }
            });
        }
      }, 500);
    });
  },

  getCredentials: async (credentialType) => {
    // Simulate API call
    console.log(`[Mock API] calling getCredentials for ${credentialType}`);
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Return dummy credentials
        resolve([
          { id: 'cred_1', name: 'My API Key', type: credentialType },
          { id: 'cred_2', name: 'Production DB', type: credentialType },
          { id: 'cred_3', name: 'Test Token', type: credentialType },
        ]);
      }, 500);
    });
  },

  testNode: async (nodeName, payload) => {
    // Simulate API call
    console.log(`[Mock API] calling testNode for ${nodeName}`, payload);
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Return dummy output response
        resolve({
          output: {
            result: 'success',
            // Echo back the input parameters to verify they were sent correctly
            input_parameters: payload.parameters || {},
            data: {
              processed: true,
              value: 42,
              message: `Processed node ${nodeName}`
            },
            html: `<div>
              <h3>Test Result</h3>
              <p>This is a <strong>mock HTML output</strong> for node ${nodeName}.</p>
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
              </ul>
            </div>`,
            attachments: [
              { name: 'report.pdf', url: '#', size: '1.2 MB', type: 'application/pdf' },
              { name: 'data.csv', url: '#', size: '45 KB', type: 'text/csv' }
            ],
            logs: [
              'Starting execution...',
              'Validating inputs...',
              'Executing logic...',
              'Finished successfully.'
            ]
          }
        });
      }, 1500);
    });
  },

  saveCredential: async (credential) => {
    // Simulate API call
    console.log(`[Mock API] calling saveCredential`, credential);
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Return saved credential with ID
        resolve({
          id: `new_cred_${Date.now()}`,
          ...credential
        });
      }, 800);
    });
  }
};
