import React, { useState } from 'react';
import ReactJson from 'react-json-view';
import Icon from '../ui/Icon';
import { cn } from '../../utils/cn';

const OutputPanel = ({ node, outputResponse, errorResponse, loading, onTest }) => {
    const [activeTab, setActiveTab] = useState('json'); // json, html, attachments

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onTest}
                        disabled={loading}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-sm",
                            loading
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-primary-600 text-white hover:bg-primary-700 hover:shadow active:scale-95"
                        )}
                    >
                        {loading ? (
                            <>
                                <Icon name="loader" size={12} className="animate-spin" />
                                Running...
                            </>
                        ) : (
                            <>
                                <Icon name="play" size={12} />
                                Test Node
                            </>
                        )}
                    </button>
                    {outputResponse && (
                        <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-[10px] font-medium border border-green-100">
                            <Icon name="check" size={10} />
                            Success
                        </div>
                    )}
                    {errorResponse && (
                        <div className="flex items-center gap-1 bg-red-50 text-red-700 px-2 py-1 rounded text-[10px] font-medium border border-red-100">
                            <Icon name="alertTriangle" size={10} />
                            Error
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    {['json', 'html', 'attachments'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-2 py-1 rounded text-[10px] font-medium transition-colors capitalize",
                                activeTab === tab ? "bg-white text-primary-600 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto bg-gray-50 p-4 min-h-[200px]">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                        <Icon name="loader" size={24} className="animate-spin text-primary-500" />
                        <span className="text-sm">Executing node...</span>
                    </div>
                ) : errorResponse ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm font-mono whitespace-pre-wrap">
                        {typeof errorResponse === 'string' ? errorResponse : JSON.stringify(errorResponse, null, 2)}
                    </div>
                ) : outputResponse ? (
                    <>
                        {activeTab === 'json' && (
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                <ReactJson
                                    src={outputResponse}
                                    name={false}
                                    displayDataTypes={false}
                                    displayObjectSize={false}
                                    enableClipboard={true}
                                    style={{ padding: '1rem', fontSize: '11px', fontFamily: 'monospace' }}
                                    collapsed={2}
                                />
                            </div>
                        )}
                        {activeTab === 'html' && (
                            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm text-sm text-gray-800">
                                {outputResponse.html ? (
                                    <div dangerouslySetInnerHTML={{ __html: outputResponse.html }} className="prose prose-sm max-w-none" />
                                ) : (
                                    <div className="text-center text-gray-400 text-sm italic py-8">No HTML output available</div>
                                )}
                            </div>
                        )}
                        {activeTab === 'attachments' && (
                            <div className="space-y-2">
                                {outputResponse.attachments && outputResponse.attachments.length > 0 ? (
                                    outputResponse.attachments.map((file, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:border-primary-200 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-100 rounded text-gray-500">
                                                    <Icon name="file" size={16} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-900">{file.name}</span>
                                                    <span className="text-[10px] text-gray-500 uppercase">{file.type?.split('/')[1] || 'file'} • {file.size}</span>
                                                </div>
                                            </div>
                                            <a 
                                                href={file.url} 
                                                download={file.name}
                                                className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 p-1.5 rounded-md transition-colors"
                                                title="Download"
                                            >
                                                <Icon name="download" size={14} />
                                            </a>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-400 text-sm italic py-8 bg-white rounded-lg border border-dashed border-gray-200">
                                        No attachments available
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                        <Icon name="terminal" size={32} className="opacity-20" />
                        <span className="text-sm">Run the node to see output</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OutputPanel;
