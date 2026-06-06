import React from "react";

const ChatBubble = ({ message }) => {
    const isUser = message.role === "user";

    return (
        <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-4`}>

            <div className={`max-w-[85%] rounded-xl px-5 py-4 text-[15px] ${isUser
                    ? "bg-slate-100 text-slate-800 border border-slate-200"
                    : "bg-white text-slate-700 border border-slate-200 shadow-sm"
                }`}>
                <div className="flex flex-col gap-1">
                    {Array.isArray(message.content) ? (
                        <ul className={!isUser ? "list-disc ml-5 space-y-1.5" : "space-y-1"}>
                            {message.content.map((paragraph, idx) => {
                                // Strip out the bolding markers (**)
                                let cleaned = paragraph.replace(/\*\*/g, '').trim();
                                if (!cleaned) return null;

                                // If the line starts with a bullet (*), turn it into a real HTML list item
                                if (cleaned.startsWith('*') || cleaned.startsWith('-')) {
                                    return (
                                        <li key={idx} className="leading-relaxed pl-1">
                                            {cleaned.substring(1).trim()}
                                        </li>
                                    );
                                }

                                // Otherwise, render it as a normal paragraph
                                return <p key={idx} className="leading-relaxed mb-2">{cleaned}</p>;
                            })}
                        </ul>
                    ) : (
                        <p className="leading-relaxed">{message.content.replace(/\*/g, '').trim()}</p>
                    )}
                </div>

                 {/* Source Document Badge */}
                {!isUser && message.sources && message.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                        <p className="text-[11px] text-slate-400 font-semibold mb-2 uppercase tracking-wider"> </p>
                        <div className="flex flex-wrap gap-2">
                            {message.sources.map((source, idx) => (
                                <span key={idx} className="text-[11px] bg-slate-50 text-slate-500 px-2 py-1 rounded border border-slate-200">

                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default ChatBubble;