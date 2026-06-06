import { MessageSquare, Plus, Trash2 } from "lucide-react";

const Sidebar = ({ history, onNewChat, onSelectChat, onDeleteChat }) => {
    return (
        <div className="w-64 bg-slate-900 h-screen flex flex-col shrink-0 border-r border-slate-800 hidden md:flex">
            <div className="p-4">
                <button onClick={onNewChat} className="w-full flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium p-3 rounded-lg transition border border-slate-700 shadow-sm">
                    <Plus size={18} /> New Conversation
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2 mt-2">Recent Questions</div>

                {history.length === 0 ? (
                    <div className="text-sm text-slate-500 px-2">No history yet.</div>
                ) : (
                    history.map((chat) => (
                        <div key={chat._id} className="flex items-center justify-between gap-2 text-sm text-slate-300 hover:bg-slate-800 p-2.5 rounded-md cursor-pointer transition group">
                            <div
                                className="flex items-center gap-3 flex-1 overflow-hidden"
                                onClick={() => onSelectChat(chat)}
                            >
                                <MessageSquare size={16} className="text-slate-500 shrink-0 group-hover:text-blue-400" />
                                {/* 🚨 CHANGED: Now looks for chat.title first! */}
                                <span className="truncate">{chat.title || chat.question || "Conversation"}</span>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevents opening the chat when clicking delete
                                    onDeleteChat(chat._id);
                                }}
                                className="text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete Chat"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Sidebar;