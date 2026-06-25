/**
 * Mock Data - Chat History and Messages
 */

export const initialChatHistory = [
    { id: '1', title: 'tet', date: 'Today' },
    { id: '2', title: 'Workflow Optimization', date: 'Yesterday' },
    { id: '3', title: 'Node JS Connector', date: '3 days ago' },
];

export const initialMessages = [
    { id: '1', role: 'agent', content: "Hey, I'm your workflow assistant. Let me know what you'd like to build." },
    { id: '2', role: 'user', content: 'tet' },
    { id: '3', role: 'agent', content: 'Hello Andy! Are you referring to Tết, the Vietnamese Lunar New Year? Since your timezone is set to Vietnam, that seems likely. I can help you sketch a workflow, map tasks, or organize the next steps. What would you like to build?' }
];

export const suggestedPrompts = [
    'Create email automation workflow',
    'Data processing pipeline',
    'Customer support workflow',
];

export default {
    initialChatHistory,
    initialMessages,
    suggestedPrompts,
};
