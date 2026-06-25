import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../ui/Icon';
import { trackHelpOpen, trackHelpClose } from '../../utils/analytics';
import { NODE_HELP_CONTENT, GENERAL_ANSWERS, COMMON_QUESTIONS } from '../../data/mockNodeHelp';
import { getNodeIoSpec, getNodeKind, getNodeSpec } from '../../services/NodeLibraryService';

/**
 * Guided Node Help Modal - Friendly Edition
 * 
 * Tailored for non-technical users.
 * Features:
 * - Plain language explanations
 * - Chat-based interface
 * - Visual cues (Icons, Colors)
 * - Mocked guided responses
 */
const NodeHelpModal = ({ node, isOpen, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [configMode, setConfigMode] = useState('basic');
    const chatContainerRef = useRef(null);
    const startTimeRef = useRef(Date.now());

    // Get friendly content for this node type
    const kind = getNodeKind(node);
    const nodeType = kind ? String(kind).toLowerCase() : 'default';
    const spec = getNodeSpec(node?.type);
    const baseContent = NODE_HELP_CONTENT[nodeType] || NODE_HELP_CONTENT.default;

    // Merge spec data into content for accuracy
    const content = useMemo(() => ({
        ...baseContent,
        simpleName: spec?.title || baseContent.simpleName,
        description: spec?.summary || baseContent.description
    }), [baseContent, spec?.title, spec?.summary]);

    const ioSpec = getNodeIoSpec(node);

    useEffect(() => {
        if (!isOpen) return;

        trackHelpOpen(node.type, node.title);
        startTimeRef.current = Date.now();

        // Reset chat when node changes
        setMessages([
            {
                role: 'assistant',
                text: `Hi! I'm your helper for the **${content.simpleName}**. ${content.description}`
            }
        ]);

        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => {
            window.removeEventListener('keydown', handleEscape);
            const duration = (Date.now() - startTimeRef.current) / 1000;
            trackHelpClose(node.type, duration);
        };
    }, [isOpen, node?.type, node?.title, onClose, content]);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    if (!isOpen) return null;

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userText = inputValue.trim();
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setInputValue('');
        setIsTyping(true);

        // Simulate assistant processing delay
        setTimeout(() => {
            const response = generateResponse(userText, content);
            setMessages(prev => [...prev, { role: 'assistant', text: response }]);
            setIsTyping(false);
        }, 1200);
    };

    const generateResponse = (query, nodeContent) => {
        const lowerQuery = query.toLowerCase();

        // Check node-specific Q&A
        if (nodeContent.qa) {
            const match = nodeContent.qa.find(item =>
                lowerQuery.includes(item.question.toLowerCase()) ||
                lowerQuery.includes(item.question.replace('?', '').toLowerCase())
            );
            if (match) return match.answer;
        }

        // Check general Q&A
        for (const [key, value] of Object.entries(GENERAL_ANSWERS)) {
            if (lowerQuery.includes(key)) return value;
        }

        // Fallback friendly responses
        if (lowerQuery.includes('example') || lowerQuery.includes('use case')) {
            return `Here are some ways to use this: ${nodeContent.examples.join(', ')}.`;
        }

        if (lowerQuery.includes('thank')) {
            return "You're welcome! Happy automating!";
        }

        return "I'm not sure about that specific detail, but I can tell you that this node is mainly used for " + nodeContent.description.toLowerCase();
    };

    const handleQuickQuestion = (question) => {
        setInputValue(question);
        // Optional: auto-submit
        // setInputValue(question);
        // handleSendMessage({ preventDefault: () => {} });
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-stretch justify-end sm:justify-center md:justify-end pointer-events-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-[2px] pointer-events-auto transition-opacity"
                onClick={onClose}
            />

            {/* Modal Panel */}
            <div
                className="pointer-events-auto w-full md:w-[450px] h-full bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-slide-in-right font-sans overflow-hidden"
                role="dialog"
                aria-modal="true"
                aria-labelledby="help-title"
            >
                {/* Header with Visual Cue */}
                <div className="flex-shrink-0 p-5 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-gray-50 ${content.color}`}>
                            <Icon name={content.visualIcon} size={24} />
                        </div>
                        <div>
                            <h2 id="help-title" className="font-bold text-lg text-gray-900">{content.simpleName}</h2>
                            <p className="text-sm text-gray-500">aka {node.title}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close Help"
                    >
                        <Icon name="x" size={20} />
                    </button>
                </div>

                {/* Chat Area */}
                <div
                    ref={chatContainerRef}
                    className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-5 space-y-6 bg-gray-50/30"
                >
                    {/* Guided introduction and specs */}
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 flex-shrink-0 mt-1">
                            <Icon name="bot" size={18} />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1.5 bg-primary-50 rounded-lg text-primary-600">
                                        <Icon name="bot" size={14} />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                                        Node Guide
                                    </h3>
                                </div>
                                <div className="text-sm text-gray-700 leading-relaxed">
                                    <p>Hi! I&apos;m your guide for the <strong>{content.simpleName}</strong> node.</p>
                                    <p className="mt-2">{content.description}</p>
                                    <p className="mt-2 text-sm text-gray-500">Ask about inputs, outputs, configuration, or examples.</p>
                                </div>
                            </div>

                            {(spec || ioSpec) && (
                                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-1.5 bg-primary-50 rounded-lg text-primary-600">
                                            <Icon name="fileText" size={14} />
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                                            Quick Specs
                                        </h3>
                                    </div>

                                    {spec?.credentialRequired ? (
                                        <div className="mb-4">
                                            <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold uppercase tracking-wide">
                                                <Icon name="lock" size={10} />
                                                Credentials required
                                            </span>
                                        </div>
                                    ) : null}

                                    <div className="space-y-4">
                                        {/* Friendly Input / Output Section */}
                                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2 mb-3">
                                                <Icon name="activity" size={12} />
                                                Data Flow
                                            </div>

                                            <div className="flex flex-col gap-3 relative">
                                                {/* Connecting Line (Desktop) */}
                                                <div className="hidden sm:block absolute left-[13px] top-8 bottom-8 w-0.5 bg-gray-200 -z-0"></div>

                                                {/* Input */}
                                                <div className="relative z-10">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-7 h-7 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                                                            <Icon name="logIn" size={12} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-sm font-semibold text-gray-900 mb-1">What it needs</div>
                                                            {ioSpec?.inputs?.length ? (
                                                                <ul className="space-y-2">
                                                                    {ioSpec.inputs.map((i, idx) => (
                                                                        <li key={idx} className="bg-white border border-gray-200 rounded-lg p-2 text-sm shadow-sm">
                                                                            <div className="flex items-center justify-between mb-0.5">
                                                                                <span className="font-mono font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[10px]">{i.name}</span>
                                                                                <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-full">
                                                                                    {i.type === 'object' ? 'Data Bundle' : i.type === 'string' ? 'Text' : i.type}
                                                                                </span>
                                                                            </div>
                                                                            {i.description && <div className="text-gray-600 leading-snug mt-1">{i.description}</div>}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            ) : (
                                                                <div className="text-sm text-gray-400 italic pl-1">No specific inputs required</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Flow Arrow */}
                                                <div className="flex justify-center sm:justify-start sm:pl-[5px] py-1">
                                                    <Icon name="arrowDown" size={14} className="text-gray-300" />
                                                </div>

                                                {/* Output */}
                                                <div className="relative z-10">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-7 h-7 rounded-full bg-green-100 border-2 border-white shadow-sm flex items-center justify-center text-green-600 shrink-0 mt-0.5">
                                                            <Icon name="logOut" size={12} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-sm font-semibold text-gray-900 mb-1">What it produces</div>
                                                            {ioSpec?.outputs?.length ? (
                                                                <ul className="space-y-2">
                                                                    {ioSpec.outputs.map((o, idx) => (
                                                                        <li key={idx} className="bg-white border border-gray-200 rounded-lg p-2 text-sm shadow-sm">
                                                                            <div className="flex items-center justify-between mb-0.5">
                                                                                <span className="font-mono font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded text-[10px]">{o.name}</span>
                                                                                <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-full">
                                                                                    {o.type === 'object' ? 'Data Bundle' : o.type === 'string' ? 'Text' : o.type}
                                                                                </span>
                                                                            </div>
                                                                            {o.description && <div className="text-gray-600 leading-snug mt-1">{o.description}</div>}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            ) : (
                                                                <div className="text-sm text-gray-400 italic pl-1">No specific outputs</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Configuration Section */}
                                        {spec?.resolvedFields && (
                                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                                                        <Icon name="sliders" size={12} />
                                                        Configuration
                                                    </div>

                                                    {/* Toggle */}
                                                    {spec.resolvedFields.advanced?.length > 0 && (
                                                        <div className="flex items-center bg-gray-200/50 p-0.5 rounded-lg">
                                                            <button
                                                                onClick={() => setConfigMode('basic')}
                                                                className={`px-3 py-1 text-[10px] font-medium rounded-md transition-all ${configMode === 'basic'
                                                                        ? 'bg-white text-blue-600 shadow-sm'
                                                                        : 'text-gray-500 hover:text-gray-700'
                                                                    }`}
                                                            >
                                                                Basic
                                                            </button>
                                                            <button
                                                                onClick={() => setConfigMode('advanced')}
                                                                className={`px-3 py-1 text-[10px] font-medium rounded-md transition-all ${configMode === 'advanced'
                                                                        ? 'bg-white text-blue-600 shadow-sm'
                                                                        : 'text-gray-500 hover:text-gray-700'
                                                                    }`}
                                                            >
                                                                Advanced
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-4">
                                                    {/* Basic Fields */}
                                                    {configMode === 'basic' && (
                                                        spec.resolvedFields.basic?.length ? (
                                                            <div className="space-y-4">
                                                                {spec.resolvedFields.basic.map((f, idx) => (
                                                                    <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:border-blue-200 transition-colors">
                                                                        <div className="flex items-start justify-between mb-1">
                                                                            <div className="font-medium text-sm text-gray-900">
                                                                                {f.name}
                                                                                {f.required && <span className="text-red-500 ml-0.5" title="Required">*</span>}
                                                                            </div>
                                                                            {f.placeholder && (
                                                                                <div className="text-[10px] text-gray-400 font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                                                                    {f.placeholder}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-sm text-gray-600 leading-relaxed">
                                                                            {f.description}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-sm text-gray-500 italic text-center py-2">No basic configuration fields</div>
                                                        )
                                                    )}

                                                    {/* Advanced Fields */}
                                                    {configMode === 'advanced' && (
                                                        spec.resolvedFields.advanced?.length ? (
                                                            <div className="space-y-4">
                                                                {spec.resolvedFields.advanced.map((f, idx) => (
                                                                    <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:border-blue-200 transition-colors">
                                                                        <div className="flex items-start justify-between mb-1">
                                                                            <div className="font-medium text-sm text-gray-900">
                                                                                {f.name}
                                                                                {f.required && <span className="text-red-500 ml-0.5" title="Required">*</span>}
                                                                            </div>
                                                                            {f.placeholder && (
                                                                                <div className="text-[10px] text-gray-400 font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                                                                    {f.placeholder}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-sm text-gray-600 leading-relaxed">
                                                                            {f.description}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-sm text-gray-500 italic text-center py-2">No advanced configuration fields</div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat Messages */}
                    {messages.slice(1).map((msg, idx) => ( // Skip initial greeting as it's covered by Quick Summary
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                        ? 'bg-primary-600 text-white rounded-tr-none'
                                        : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none'
                                    }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="flex-shrink-0 p-4 bg-white border-t border-gray-100">
                    {/* Suggested Questions */}
                    <div className="flex flex-wrap gap-2 pb-3 mb-2">
                        {COMMON_QUESTIONS.map((q, i) => (
                            <button
                                key={i}
                                onClick={() => handleQuickQuestion(q)}
                                className="whitespace-nowrap px-3 py-1.5 bg-gray-50 hover:bg-primary-50 hover:text-primary-600 border border-gray-200 hover:border-primary-200 rounded-full text-sm font-medium text-gray-600 transition-all"
                            >
                                {q}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSendMessage} className="relative">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask a question..."
                            className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300 transition-all placeholder-gray-400"
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isTyping}
                            aria-label="Send"
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 transition-colors shadow-sm"
                        >
                            <Icon name="arrowUp" size={16} />
                        </button>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default NodeHelpModal;
