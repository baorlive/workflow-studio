import React, { useRef, useEffect, useState } from 'react';
import Icon from '../ui/Icon';
import useClickOutside from '../../hooks/useClickOutside';

const MOCK_WAVEFORM = [4, 10, 18, 22, 14, 24, 16, 8, 20, 12, 24, 10, 18, 6, 22, 14, 20, 8, 24, 12, 16, 22, 6, 18, 24, 10, 14, 20, 8, 16];

const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
};

/**
 * AssistantPanel Component
 *
 * Floating panel for interacting with the workflow assistant within the editor.
 */
const AssistantPanel = ({ isOpen, onClose, messages, input, setInput, onSend, isTyping, suggestions = [], onSuggestionClick }) => {
    const scrollRef = useRef(null);
    const fileInputRef = useRef(null);
    const attachmentMenuRef = useRef(null);
    const timerRef = useRef(null);

    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
    const [acceptedFileTypes, setAcceptedFileTypes] = useState('');
    // recordingState: 'idle' | 'recording' | 'paused' | 'preview'
    const [recordingState, setRecordingState] = useState('idle');
    const [recordingTime, setRecordingTime] = useState(0);
    const [previewPlaying, setPreviewPlaying] = useState(false);

    // Timer
    useEffect(() => {
        if (recordingState === 'recording') {
            timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [recordingState]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping, isOpen]);

    useClickOutside(attachmentMenuRef, () => setShowAttachmentMenu(false), showAttachmentMenu);

    const handleAttachmentClick = () => setShowAttachmentMenu(!showAttachmentMenu);

    const handleAttachmentSelect = (type) => {
        setShowAttachmentMenu(false);
        setAcceptedFileTypes(type === 'image' ? '.png,.jpg,.jpeg' : '.txt,.pdf,.docx');
        setTimeout(() => fileInputRef.current?.click(), 0);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setInput(prev => prev + ` [Attached: ${file.name}]`);
        e.target.value = '';
    };

    const startRecording = () => {
        setRecordingTime(0);
        setPreviewPlaying(false);
        setRecordingState('recording');
    };

    const pauseRecording = () => setRecordingState('paused');
    const resumeRecording = () => setRecordingState('recording');
    const stopRecording = () => { setPreviewPlaying(false); setRecordingState('preview'); };
    const cancelRecording = () => { setRecordingTime(0); setRecordingState('idle'); };
    const reRecord = () => { setRecordingTime(0); setPreviewPlaying(false); setRecordingState('recording'); };

    const sendVoice = () => {
        setInput('[Voice message]');
        setRecordingState('idle');
        setRecordingTime(0);
        setTimeout(() => onSend(), 0);
    };

    if (!isOpen) return null;

    const hasUserMessages = messages.some(m => m.role === 'user');
    const isPaused = recordingState === 'paused';

    // Wave bars for recording
    const AMPLITUDES = [0.35, 0.6, 1, 0.75, 0.45, 0.9, 0.55, 0.8, 1, 0.5, 0.85, 0.4, 0.7, 1, 0.6];

    return (
        <>
            <style>{`
                @keyframes waveBar {
                    0%, 100% { transform: scaleY(0.2); }
                    50% { transform: scaleY(1); }
                }
            `}</style>

            <div className="absolute top-20 left-4 bottom-24 w-[550px] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 flex flex-col animate-in slide-in-from-left-2 duration-200 overflow-hidden">

                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-black rounded-lg text-white">
                            <Icon name="sparkles" size={16} />
                        </div>
                        <h3 className="font-semibold text-gray-900">Workflow Assistant</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-md transition-colors"
                    >
                        <Icon name="x" size={18} />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-white" ref={scrollRef}>
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex w-full mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex max-w-[85%] gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${msg.role === 'user' ? 'bg-primary-100 text-primary-700' : 'bg-gray-900 text-white'}`}
                                    aria-label={msg.role === 'user' ? 'You' : 'Workflow Assistant'}
                                >
                                    {msg.role === 'user'
                                        ? (msg.author ? msg.author[0].toUpperCase() : 'Me')
                                        : <Icon name="sparkles" size={14} />}
                                </div>
                                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-primary-50 text-gray-900 rounded-tr-none'
                                    : 'bg-gray-50 text-gray-800 rounded-tl-none'
                                    } whitespace-pre-wrap`}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    ))}

                    {!hasUserMessages && suggestions.length > 0 && (
                        <div className="flex flex-col gap-2 mb-4 px-2">
                            <p className="text-sm text-gray-500 mb-1 font-medium">Suggested actions:</p>
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => onSuggestionClick(suggestion)}
                                    className="text-left text-sm p-3 rounded-lg bg-gray-50 hover:bg-primary-50 hover:text-primary-700 border border-gray-200 hover:border-primary-200 transition-all duration-200 flex items-center gap-2 group"
                                >
                                    <Icon name="sparkles" size={14} className="text-gray-400 group-hover:text-primary-500" />
                                    <span>{suggestion}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {isTyping && (
                        <div className="flex w-full mb-4 justify-start">
                            <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-black text-white">
                                    <Icon name="sparkles" size={14} />
                                </div>
                                <div className="bg-gray-50 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl shrink-0">

                    {/* ── RECORDING / PAUSED ── */}
                    {(recordingState === 'recording' || recordingState === 'paused') && (
                        <div className="flex items-center gap-2 bg-white border border-primary-200 rounded-xl px-3 py-2 shadow-sm">
                            {/* Cancel */}
                            <button
                                onClick={cancelRecording}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                                title="Cancel"
                            >
                                <Icon name="x" size={16} />
                            </button>

                            {/* Wave bars */}
                            <div className="flex items-center gap-[3px] flex-1 h-8 px-1 overflow-hidden">
                                {AMPLITUDES.map((amp, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            width: 3,
                                            height: 24,
                                            borderRadius: 2,
                                            backgroundColor: isPaused ? '#c7d2fe' : '#6366f1',
                                            transformOrigin: 'center',
                                            transform: isPaused ? `scaleY(${amp * 0.5 + 0.15})` : undefined,
                                            animation: isPaused ? 'none' : `waveBar ${600 + i * 40}ms ease-in-out ${i * 70}ms infinite`,
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Timer */}
                            <span className="text-sm font-mono font-semibold text-primary-600 shrink-0 min-w-[38px] text-right">
                                {formatTime(recordingTime)}
                            </span>

                            {/* Pause / Resume */}
                            <button
                                onClick={isPaused ? resumeRecording : pauseRecording}
                                className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-50 transition-colors shrink-0"
                                title={isPaused ? 'Resume' : 'Pause'}
                            >
                                <Icon name={isPaused ? 'play' : 'pause'} size={16} />
                            </button>

                            {/* Stop */}
                            <button
                                onClick={stopRecording}
                                className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors shrink-0"
                                title="Stop"
                            >
                                <Icon name="square" size={13} />
                            </button>
                        </div>
                    )}

                    {/* ── PREVIEW ── */}
                    {recordingState === 'preview' && (
                        <div className="flex flex-col gap-2">
                            {/* Waveform player */}
                            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">
                                <button
                                    onClick={() => setPreviewPlaying(p => !p)}
                                    className="w-8 h-8 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition-colors flex items-center justify-center shrink-0"
                                    title={previewPlaying ? 'Pause preview' : 'Play preview'}
                                >
                                    <Icon name={previewPlaying ? 'pause' : 'play'} size={13} />
                                </button>

                                {/* Static waveform */}
                                <div className="flex items-center gap-[2px] flex-1 h-8">
                                    {MOCK_WAVEFORM.map((h, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                width: 3,
                                                height: h,
                                                borderRadius: 2,
                                                backgroundColor: i < Math.floor(MOCK_WAVEFORM.length * 0.55) ? '#6366f1' : '#e0e7ff',
                                            }}
                                        />
                                    ))}
                                </div>

                                <span className="text-sm font-mono text-gray-400 shrink-0">
                                    {formatTime(recordingTime)}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={reRecord}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-200 transition-colors"
                                >
                                    <Icon name="refreshCw" size={13} />
                                    Re-record
                                </button>
                                <button
                                    onClick={sendVoice}
                                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm bg-primary-600 text-white hover:bg-primary-700 transition-colors font-medium shadow-sm"
                                >
                                    <Icon name="send" size={13} />
                                    Send
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── IDLE / NORMAL INPUT ── */}
                    {recordingState === 'idle' && (
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary-100 focus-within:border-primary-300 transition-all relative">
                            {/* Attachment */}
                            <div ref={attachmentMenuRef} className="relative">
                                <button
                                    onClick={handleAttachmentClick}
                                    className={`p-1.5 rounded-lg transition-colors ${showAttachmentMenu
                                        ? 'text-primary-600 bg-primary-50'
                                        : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'
                                        }`}
                                    title="Attach file"
                                >
                                    <Icon name="plus" size={20} />
                                </button>

                                {showAttachmentMenu && (
                                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 animate-in slide-in-from-bottom-2 duration-200">
                                        <button
                                            onClick={() => handleAttachmentSelect('image')}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 flex items-center gap-2 transition-colors"
                                        >
                                            <Icon name="image" size={16} />
                                            <span>Image</span>
                                        </button>
                                        <button
                                            onClick={() => handleAttachmentSelect('document')}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 flex items-center gap-2 transition-colors"
                                        >
                                            <Icon name="fileText" size={16} />
                                            <span>Document</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept={acceptedFileTypes}
                                onChange={handleFileChange}
                            />

                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSend()}
                                placeholder="Ask anything..."
                                aria-label="Chat message"
                                className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-900 placeholder-gray-400 py-1 min-w-0"
                            />

                            {/* Mic button */}
                            <button
                                onClick={startRecording}
                                className="p-1.5 rounded-lg transition-colors text-gray-400 hover:text-primary-600 hover:bg-primary-50"
                                title="Voice Input"
                            >
                                <Icon name="mic" size={20} />
                            </button>

                            {/* Send */}
                            <button
                                onClick={onSend}
                                disabled={!input.trim()}
                                className={`p-2 rounded-lg transition-colors ${input.trim()
                                    ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'
                                    : 'bg-gray-100 text-gray-300'
                                    }`}
                            >
                                <Icon name="send" size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AssistantPanel;
