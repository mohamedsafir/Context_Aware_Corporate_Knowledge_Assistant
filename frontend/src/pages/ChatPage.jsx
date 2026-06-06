import { useState, useEffect, useRef } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ChatBubble from "../components/ChatBubble";
import Spinner from "../components/Spinner";
// 🚨 NEW: Added ChevronUp to the imports
import { Send, Paperclip, ChevronDown, ChevronUp } from "lucide-react";

const ChatPage = () => {
    // Chat States
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentChatId, setCurrentChatId] = useState(null);

    // Scroll States & Refs
    const scrollRef = useRef(null);
    const chatContainerRef = useRef(null);
    // 🚨 NEW: Separate states for both buttons
    const [showScrollBottom, setShowScrollBottom] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Upload State
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    // Auto-scroll when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 🚨 NEW: Smart listener for BOTH directions
    const handleScroll = () => {
        if (chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;

            // Show DOWN button if we are not at the bottom
            setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 150);

            // Show UP button if we have scrolled down from the top (more than 200px)
            setShowScrollTop(scrollTop > 200);
        }
    };

    const scrollToBottom = () => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // 🚨 NEW: Function to instantly jump to the top
    const scrollToTop = () => {
        chatContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const fetchHistory = async () => {
        try {
            const res = await API.get("/query/history");
            setHistory(res.data);
        } catch (err) {
            console.error("Failed to fetch history", err);
        }
    };

    const handleSelectHistory = (chat) => {
        setCurrentChatId(chat._id);
        if (chat.messages && chat.messages.length > 0) {
            setMessages(chat.messages);
        } else {
            setMessages([
                { role: "user", content: chat.question || "Unknown Question" },
                { role: "ai", content: chat.answer ? (Array.isArray(chat.answer) ? chat.answer : chat.answer.split('\n')) : ["No answer found."] }
            ]);
        }
    };

    const handleDeleteChat = async (id) => {
        try {
            await API.delete(`/query/history/${id}`);
            fetchHistory();
            if (currentChatId === id) {
                setMessages([]);
                setCurrentChatId(null);
            }
        } catch (err) {
            console.error("Failed to delete chat", err);
        }
    };

    const handleFileUploadDirect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("pdf", file);

        try {
            const res = await API.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setMessages((prev) => [...prev, {
                role: "ai",
                content: [`✅ Successfully uploaded and processed "${file.name}" (${res.data.chunksSaved} chunks). You can now ask questions about it!`],
                sources: []
            }]);
            fetchHistory();
        } catch (err) {
            console.error("Upload failed", err);
            const errorMessage = err.response?.data?.error || "Upload failed. Please check your backend terminal.";
            alert(`Error: ${errorMessage}`);
        } finally {
            setIsUploading(false);
            e.target.value = null;
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!question.trim()) return;

        const userMessage = { role: "user", content: question };
        setMessages((prev) => [...prev, userMessage]);
        setQuestion("");
        setIsLoading(true);

        try {
            const res = await API.post("/query/ask", {
                question: userMessage.content,
                chatId: currentChatId
            });

            if (!currentChatId && res.data.chatId) {
                setCurrentChatId(res.data.chatId);
            }

            const aiMessage = {
                role: "ai",
                content: res.data.answer || ["No answer generated."],
                sources: res.data.sources || []
            };

            setMessages((prev) => [...prev, aiMessage]);
            fetchHistory();

        } catch (err) {
            setMessages((prev) => [...prev, {
                role: "ai",
                content: ["Error: Could not connect to the AI server. Please try again."],
                sources: []
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900">
            <Sidebar
                history={history}
                onNewChat={() => {
                    setMessages([]);
                    setCurrentChatId(null);
                }}
                onSelectChat={handleSelectHistory}
                onDeleteChat={handleDeleteChat}
            />

            <div className="flex-1 flex flex-col min-w-0 relative">
                <Navbar />

                <div
                    className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col"
                    ref={chatContainerRef}
                    onScroll={handleScroll}
                >
                    <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full h-full justify-end pb-4 animate-fade-in">
                        {messages.length === 0 && !isUploading && (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                                <p className="text-xl font-medium text-slate-600 mb-2">How can OpsMind help you today?</p>
                                <p className="text-sm">Ask a question, or attach a new PDF below.</p>
                            </div>
                        )}

                        {messages.map((msg, idx) => <ChatBubble key={idx} message={msg} />)}

                        {(isLoading || isUploading) && (
                            <div className="flex items-center gap-3 text-slate-500 mb-4">
                                <Spinner />
                                <span className="text-sm">{isUploading ? "Analyzing document..." : "Thinking..."}</span>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </div>

                {/* 🚨 NEW: Stacked Floating Navigation Buttons */}
                <div className="absolute right-8 bottom-28 flex flex-col gap-3 z-10">
                    {showScrollTop && (
                        <button
                            onClick={scrollToTop}
                            className="bg-slate-900 text-white p-2 rounded-full shadow-lg hover:bg-slate-700 transition-all flex items-center justify-center animate-fade-in"
                            title="Scroll to top"
                        >
                            <ChevronUp size={24} />
                        </button>
                    )}
                    {showScrollBottom && (
                        <button
                            onClick={scrollToBottom}
                            className="bg-slate-900 text-white p-2 rounded-full shadow-lg hover:bg-slate-700 transition-all flex items-center justify-center animate-fade-in"
                            title="Scroll to newest message"
                        >
                            <ChevronDown size={24} />
                        </button>
                    )}
                </div>

                {/* Chat Input Area */}
                <div className="p-4 bg-white border-t border-slate-200">
                    <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center">
                        <label className={`absolute left-4 cursor-pointer transition-colors ${isUploading ? 'text-slate-300' : 'text-slate-400 hover:text-slate-700'}`}>
                            <Paperclip size={20} />
                            <input
                                type="file"
                                className="hidden"
                                accept=".pdf"
                                onChange={handleFileUploadDirect}
                                disabled={isUploading || isLoading}
                            />
                        </label>

                        <input
                            type="text"
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg py-4 pl-12 pr-14 focus:ring-1 focus:ring-slate-900 outline-none transition-all text-slate-800 placeholder:text-slate-400 shadow-inner disabled:bg-slate-100"
                            placeholder="Query your document or upload a new one..."
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            disabled={isLoading || isUploading}
                        />

                        <button
                            type="submit"
                            disabled={isLoading || isUploading || !question.trim()}
                            className="absolute right-2 top-2 bottom-2 bg-slate-900 hover:bg-slate-800 text-white p-2 px-4 rounded-md transition-all disabled:bg-slate-300 shadow-sm flex items-center justify-center"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                    <p className="text-[10px] text-center text-slate-400 mt-3 uppercase tracking-widest font-bold">
                        Powered by RAG Engine System
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;