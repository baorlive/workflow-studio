
/**
 * WorkflowGenerator Utility
 * 
 * Mocks the generation of workflows based on user prompts.
 * In a real application, this would call a workflow planning service.
 */

const generateId = () => Math.random().toString(36).substr(2, 9);

const createNode = (id, type, title, x, y, icon, description) => ({
    id,
    type,
    title,
    x,
    y,
    icon,
    description
});

const createEdge = (source, target, label = '') => ({
    id: `e-${source}-${target}`,
    source,
    target,
    label
});

export const generateWorkflow = (prompt) => {
    const p = prompt.toLowerCase();
    
    // 1. Email Automation Workflow
    if (p.includes('email') || p.includes('notification')) {
        const nodes = [
            createNode('1', 'trigger', 'New User Signup', 400, 50, 'zap', 'Triggers when a new user signs up'),
            createNode('2', 'data', 'Get User Data', 400, 180, 'database', 'Fetch user details'),
            createNode('3', 'conditional', 'Check Subscription', 400, 300, 'gitBranch', 'Is premium user?'),
            createNode('4', 'action', 'Send Welcome Email', 200, 450, 'send', 'Standard welcome email'),
            createNode('5', 'action', 'Send Premium Welcome', 600, 450, 'star', 'Premium welcome package'),
            createNode('6', 'delay', 'Wait 2 Days', 400, 600, 'clock', 'Delay for follow-up'),
            createNode('7', 'action', 'Send Follow-up', 400, 750, 'mail', 'Follow-up email')
        ];
        
        const edges = [
            createEdge('1', '2'),
            createEdge('2', '3'),
            createEdge('3', '4', 'No'),
            createEdge('3', '5', 'Yes'),
            createEdge('4', '6'),
            createEdge('5', '6'),
            createEdge('6', '7')
        ];
        
        return { nodes, edges, message: "I've generated an email automation workflow for you. It handles new user signups, checks subscription status, and sends appropriate emails." };
    }
    
    // 2. Data Processing Pipeline
    if (p.includes('data') || p.includes('process') || p.includes('pipeline')) {
        const nodes = [
            createNode('1', 'trigger', 'Scheduled Daily', 400, 50, 'clock', 'Runs every day at midnight'),
            createNode('2', 'data', 'Fetch Raw Data', 400, 180, 'database', 'Get data from external API'),
            createNode('3', 'transform', 'Clean Data', 400, 300, 'repeat', 'Remove duplicates and nulls'),
            createNode('4', 'compute', 'Score Responses', 400, 420, 'cpu', 'Classify feedback into priority bands'),
            createNode('5', 'conditional', 'Check Score', 400, 550, 'gitBranch', 'Filter by sentiment score'),
            createNode('6', 'action', 'Generate Report', 200, 700, 'fileText', 'Create PDF report'),
            createNode('7', 'action', 'Alert Team', 600, 700, 'alertTriangle', 'Send alert for negative sentiment')
        ];
        
        const edges = [
            createEdge('1', '2'),
            createEdge('2', '3'),
            createEdge('3', '4'),
            createEdge('4', '5'),
            createEdge('5', '6', 'Positive/Neutral'),
            createEdge('5', '7', 'Negative')
        ];
        
        return { nodes, edges, message: "Here's a data processing pipeline. It fetches data, cleans it, scores responses, and takes action based on the results." };
    }

    // 3. Customer Support Workflow
    if (p.includes('support') || p.includes('inbox') || p.includes('customer')) {
         const nodes = [
            createNode('1', 'trigger', 'Incoming Chat', 400, 50, 'messageSquare', 'User initiates chat'),
            createNode('2', 'compute', 'Intent Routing', 400, 180, 'cpu', 'Route the request to the right queue'),
            createNode('3', 'conditional', 'Route Query', 400, 300, 'gitBranch', 'Route based on intent'),
            createNode('4', 'action', 'Auto-Reply', 200, 450, 'messageSquareReply', 'Standard automated reply'),
            createNode('5', 'action', 'Assign Agent', 600, 450, 'users', 'Route to human agent'),
            createNode('6', 'data', 'Log Conversation', 400, 600, 'database', 'Save chat logs')
        ];
        
        const edges = [
            createEdge('1', '2'),
            createEdge('2', '3'),
            createEdge('3', '4', 'Simple Query'),
            createEdge('3', '5', 'Complex Issue'),
            createEdge('4', '6'),
            createEdge('5', '6')
        ];
        
        return { nodes, edges, message: "I've set up a customer support workflow. It handles incoming chats, routes the request, and sends it to either an automated reply or a human agent." };
    }

    // 4. Default / Generic Workflow
    const nodes = [
        createNode('1', 'trigger', 'Start', 400, 50, 'play', 'Manual start'),
        createNode('2', 'action', 'Process Input', 400, 180, 'cpu', 'Process the input data'),
        createNode('3', 'action', 'Output Result', 400, 300, 'save', 'Save the result')
    ];
    
    const edges = [
        createEdge('1', '2'),
        createEdge('2', '3')
    ];
    
    return { nodes, edges, message: "I've created a simple workflow to get you started. You can add more nodes from the panel." };
};
