import { useState } from 'react';
import { generateWorkflow } from '../../../utils/WorkflowGenerator';

export const useAssistantChat = (pushSnapshot, setNodes, setEdges, fitView) => {
    const [messages, setMessages] = useState([
        { id: '1', role: 'assistant', content: "Hey! I'm your workflow assistant. I can help you build workflows. Choose a suggestion below or type your request." },
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isChatTyping, setIsChatTyping] = useState(false);

    const sendMessage = (text) => {
        if (!text.trim()) return;
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: text }]);
        setChatInput('');
        setIsChatTyping(true);

        setTimeout(() => {
            try {
                const { nodes: newNodes, edges: newEdges, message } = generateWorkflow(text);
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: message || "I've processed your request.",
                }]);
                if (newNodes?.length) {
                    pushSnapshot();
                    setNodes(newNodes);
                    setEdges(newEdges || []);
                    setTimeout(() => fitView(newNodes), 100);
                }
            } catch {
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: "I'm sorry, I encountered an error. Please try again.",
                }]);
            }
            setIsChatTyping(false);
        }, 1500);
    };

    return {
        messages,
        chatInput,
        setChatInput,
        isChatTyping,
        sendMessage,
    };
};
