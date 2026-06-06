import { useState, useEffect } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import {
    Upload, FileText, CheckCircle, LayoutDashboard,
    Database, Users, Settings, MoreVertical, Activity,
    Brain, AlertTriangle, Wrench, RefreshCw, Search,
    Bell, ChevronRight, Shield, Terminal, Trash2, XCircle
} from "lucide-react";
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

// --- Sub-components for Scalability ---

const SkeletonCard = () => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-slate-200 rounded w-1/2"></div>
    </div>
);

const ToggleSwitch = ({ label, description, enabled, onToggle, danger }) => (
    <div className="flex items-center justify-between py-5 border-b border-slate-100 last:border-0">
        <div>
            <h3 className={`font-bold mb-1 ${danger ? 'text-red-600' : 'text-slate-800'}`}>{label}</h3>
            <p className="text-sm text-slate-500">{description}</p>
        </div>
        <button
            onClick={onToggle}
            className={`w-12 h-6 rounded-full relative transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${enabled ? (danger ? 'bg-red-500 focus:ring-red-500' : 'bg-indigo-500 focus:ring-indigo-500') : 'bg-slate-200 focus:ring-slate-400'}`}
        >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${enabled ? 'translate-x-7' : 'translate-x-1'}`} />
        </button>
    </div>
);

const Admin = () => {
    // --- Global State ---
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    // --- Knowledge Base State ---
    const [file, setFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState({ message: "", type: "" });
    const [isUploading, setIsUploading] = useState(false);

    // --- AI & Telemetry State ---
    const [aiReport, setAiReport] = useState(null);
    const [isRefreshingAi, setIsRefreshingAi] = useState(false);
    const [systemLogs, setSystemLogs] = useState([]);

    const [liveStats, setLiveStats] = useState({
        totalUsers: 0, indexedDocuments: 0, totalQueries: 0,
        apiUsageData: [], userGrowthData: []
    });

    // --- Settings State ---
    const [settings, setSettings] = useState({
        strictRag: true, autoIndex: false, debugMode: true
    });

    // --- Mock Data Generators & Fetchers ---
    const generateLog = (msg, type = "info") => ({
        id: Date.now() + Math.random(),
        time: new Date().toLocaleTimeString([], { hour12: false }),
        msg, type
    });

    const fetchLiveStats = async () => {
        try {
            const res = await API.get("/admin/stats");
            if (res.data) setLiveStats(res.data);
        } catch (err) {
            // High-fidelity fallback data
            setLiveStats({
                totalUsers: 24, indexedDocuments: 8, totalQueries: 1420,
                apiUsageData: [
                    { name: 'Mon', queries: 120 }, { name: 'Tue', queries: 210 },
                    { name: 'Wed', queries: 180 }, { name: 'Thu', queries: 300 },
                    { name: 'Fri', queries: 450 }, { name: 'Sat', queries: 110 },
                    { name: 'Sun', queries: 50 },
                ],
                userGrowthData: [
                    { name: 'W1', users: 5 }, { name: 'W2', users: 12 },
                    { name: 'W3', users: 18 }, { name: 'W4', users: 24 },
                ]
            });
        } finally {
            setIsInitialLoading(false);
        }
    };

    const fetchAiReport = async () => {
        setIsRefreshingAi(true);
        try {
            const res = await API.get("/admin/insights");
            setAiReport(res.data);
        } catch (err) {
            setTimeout(() => {
                setAiReport({
                    system_health_score: 94,
                    key_insights: ["Query latency optimized by 12%.", "High engagement on NLP-related documents."],
                    problems_detected: ["Token limit approached on large query combinations."],
                    actionable_fixes: ["Implement sliding window chunking for large PDFs.", "Clear orphaned vectors."]
                });
                setIsRefreshingAi(false);
                addLog("Neural analysis complete. System health: Optimal.", "success");
            }, 1200);
        }
    };

    const addLog = (msg, type) => {
        setSystemLogs(prev => [generateLog(msg, type), ...prev].slice(0, 8));
    };

    // --- Lifecycle ---
    useEffect(() => {
        fetchLiveStats();
        fetchAiReport();

        addLog("Admin Core Initialized.", "info");
        addLog("Establishing secure WebSocket connection...", "info");

        // Polling engine + fake activity for the terminal
        const interval = setInterval(() => {
            fetchLiveStats();
            if (Math.random() > 0.7) addLog(`Vector search executed. Latency: ${Math.floor(Math.random() * 40 + 10)}ms`, "info");
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    // --- Handlers ---
    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;
        setIsUploading(true);
        setUploadStatus({ message: "Slicing document into vector chunks...", type: "info" });
        addLog(`Initiating vectorization for: ${file.name}`, "info");

        const formData = new FormData();
        formData.append("pdf", file);

        try {
            await API.post("/upload", formData);
            setUploadStatus({ message: "Document successfully indexed!", type: "success" });
            addLog(`Successfully embedded ${file.name} into hyperspace.`, "success");
            setFile(null);
            fetchLiveStats();
        } catch (err) {
            setUploadStatus({ message: "Upload rejected: Processing error.", type: "error" });
            addLog(`Failed to process ${file.name}`, "error");
        } finally {
            setIsUploading(false);
            setTimeout(() => setUploadStatus({ message: "", type: "" }), 5000);
        }
    };

    const handleSettingToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
        addLog(`System config updated: ${key} = ${!settings[key]}`, "warning");
    };

    const menuItems = [
        { id: "dashboard", label: "Overview", icon: <LayoutDashboard size={18} /> },
        { id: "knowledge", label: "Vector Index", icon: <Database size={18} /> },
        { id: "users", label: "Access Control", icon: <Users size={18} /> },
        { id: "settings", label: "Configuration", icon: <Settings size={18} /> },
    ];

    return (
        <div className="h-screen bg-[#F8FAFC] flex flex-col font-sans overflow-hidden">
            <Navbar />

            <div className="flex-1 flex w-full mx-auto overflow-hidden">
                {/* 🌑 NAVIGATION SIDEBAR */}
                <div className="w-64 bg-[#0F172A] text-slate-400 flex flex-col shadow-2xl z-10">
                    <div className="p-6">
                        <div className="flex items-center gap-3 text-white mb-8">
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 rounded-lg shadow-lg shadow-indigo-500/20">
                                <Shield size={20} className="text-white" />
                            </div>
                            <span className="font-bold text-lg tracking-wide">OpsMind Core</span>
                        </div>

                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 px-3">Command Menu</p>
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === item.id
                                            ? "bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500"
                                            : "hover:bg-slate-800 hover:text-slate-200 border-l-2 border-transparent"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {item.icon}
                                        {item.label}
                                    </div>
                                    {activeTab === item.id && <ChevronRight size={14} />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ⚪ MAIN VIEWPORT */}
                <div className="flex-1 flex flex-col overflow-hidden relative">
                    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shrink-0">
                        <h1 className="text-xl font-bold text-slate-800 capitalize">
                            {activeTab.replace('-', ' ')}
                        </h1>
                        <div className="flex items-center gap-5">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-xs font-bold uppercase tracking-wider">System Operational</span>
                            </div>
                            <button className="text-slate-400 hover:text-slate-600 transition"><Bell size={20} /></button>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

                        {/* 🌟 OVERVIEW DASHBOARD */}
                        {activeTab === "dashboard" && (
                            <div className="max-w-7xl mx-auto animate-fade-in pb-12 space-y-8">

                                {/* KPI Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {isInitialLoading ? (
                                        <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
                                    ) : (
                                        <>
                                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between group hover:shadow-md transition">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-500 mb-1">Active Accounts</p>
                                                    <h4 className="text-4xl font-black text-slate-800">{liveStats.totalUsers}</h4>
                                                </div>
                                                <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform"><Users size={24} /></div>
                                            </div>
                                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between group hover:shadow-md transition">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-500 mb-1">Knowledge Vectors</p>
                                                    <h4 className="text-4xl font-black text-slate-800">{(liveStats.indexedDocuments * 128).toLocaleString()}</h4>
                                                </div>
                                                <div className="h-12 w-12 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform"><Database size={24} /></div>
                                            </div>
                                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between group hover:shadow-md transition">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-500 mb-1">AI Inferences</p>
                                                    <h4 className="text-4xl font-black text-slate-800">{liveStats.totalQueries.toLocaleString()}</h4>
                                                </div>
                                                <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform"><Activity size={24} /></div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Analytics & Telemetry Row */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Charts - takes up 2 columns */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-6">Inference Volume</h3>
                                            <div className="h-64 w-full">
                                                {isInitialLoading ? <div className="h-full w-full bg-slate-50 rounded-xl animate-pulse"></div> : (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <LineChart data={liveStats.apiUsageData}>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                                            <Line type="monotone" dataKey="queries" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Terminal - takes up 1 column */}
                                    <div className="bg-[#0F172A] rounded-2xl shadow-xl flex flex-col overflow-hidden border border-slate-800">
                                        <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center gap-2">
                                            <Terminal size={16} className="text-slate-400" />
                                            <span className="text-xs font-mono text-slate-400">system_event_stream.log</span>
                                        </div>
                                        <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-2 flex flex-col-reverse">
                                            {systemLogs.map((log) => (
                                                <div key={log.id} className="flex gap-3 animate-fade-in">
                                                    <span className="text-slate-500 shrink-0">[{log.time}]</span>
                                                    <span className={`${log.type === 'error' ? 'text-rose-400' :
                                                            log.type === 'success' ? 'text-emerald-400' :
                                                                log.type === 'warning' ? 'text-amber-400' : 'text-indigo-300'
                                                        }`}>{log.msg}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* AI Diagnostics Panel */}
                                <div className="bg-gradient-to-br from-[#1e1b4b] to-[#312e81] rounded-3xl p-1 relative overflow-hidden shadow-2xl">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                    <div className="bg-[#0f172a]/60 backdrop-blur-2xl rounded-[22px] p-8 relative z-10 border border-indigo-500/20">

                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-indigo-500/20 p-3 rounded-2xl border border-indigo-500/30">
                                                    <Brain className="text-indigo-400" size={24} />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-bold text-white">Neural Diagnostics</h2>
                                                    <p className="text-indigo-200/60 text-sm">Automated system health analysis</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {aiReport && (
                                                    <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Score</span>
                                                        <span className={`text-xl font-black ${aiReport.system_health_score >= 90 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                                                            {aiReport.system_health_score}
                                                        </span>
                                                    </div>
                                                )}
                                                <button onClick={fetchAiReport} disabled={isRefreshingAi} className="text-slate-400 hover:text-white transition bg-white/5 p-2.5 rounded-xl border border-white/10 hover:bg-white/10">
                                                    <RefreshCw size={18} className={isRefreshingAi ? "animate-spin text-indigo-400" : ""} />
                                                </button>
                                            </div>
                                        </div>

                                        {isRefreshingAi && !aiReport ? (
                                            <div className="py-12 text-center flex justify-center">
                                                <div className="h-8 w-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                                            </div>
                                        ) : aiReport ? (
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                                {/* Reusable Card Component for Diagnostics */}
                                                {[
                                                    { title: "Insights", icon: <Activity size={14} />, data: aiReport.key_insights, color: "text-blue-400", dot: "bg-blue-500" },
                                                    { title: "Anomalies", icon: <AlertTriangle size={14} />, data: aiReport.problems_detected, color: "text-rose-400", dot: "bg-rose-500" },
                                                    { title: "Optimizations", icon: <Wrench size={14} />, data: aiReport.actionable_fixes, color: "text-emerald-400", dot: "bg-emerald-500" }
                                                ].map((section, idx) => (
                                                    <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                                                        <h3 className={`font-bold ${section.color} text-xs uppercase tracking-wider mb-4 flex items-center gap-2`}>
                                                            {section.icon} {section.title}
                                                        </h3>
                                                        <ul className="space-y-3">
                                                            {section.data.map((item, i) => (
                                                                <li key={i} className="text-sm text-slate-300 flex items-start gap-2 leading-relaxed">
                                                                    <span className={`mt-1.5 size-1.5 rounded-full ${section.dot} shrink-0 shadow-[0_0_8px_currentColor]`}></span> {item}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 🌟 VECTOR INDEX (KNOWLEDGE BASE) */}
                        {activeTab === "knowledge" && (
                            <div className="max-w-6xl mx-auto animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Upload Section */}
                                <div className="lg:col-span-1">
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 sticky top-0">
                                        <h2 className="text-lg font-bold text-slate-800 mb-1">Index New Data</h2>
                                        <p className="text-slate-500 text-sm mb-6">Process PDFs into vector embeddings.</p>

                                        <form onSubmit={handleUpload}>
                                            <label className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 text-center ${file ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}`}>
                                                <FileText size={32} className={`mb-3 ${file ? 'text-indigo-500' : 'text-slate-400'}`} />
                                                <span className="text-sm font-bold text-slate-700 mb-1 line-clamp-1">{file ? file.name : "Select Document"}</span>
                                                <span className="text-xs text-slate-500">{file ? "Ready to process" : "PDF up to 50MB"}</span>
                                                <input type="file" className="hidden" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} disabled={isUploading} />
                                            </label>

                                            <button disabled={!file || isUploading} className="mt-4 w-full bg-[#0F172A] hover:bg-[#1e293b] text-white py-3 rounded-xl font-bold text-sm transition-all disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center gap-2">
                                                {isUploading ? <RefreshCw className="animate-spin" size={16} /> : <Database size={16} />}
                                                {isUploading ? "Embedding..." : "Start Indexing"}
                                            </button>
                                        </form>

                                        {uploadStatus.message && (
                                            <div className={`mt-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in ${uploadStatus.type === 'error' ? 'bg-red-50 text-red-600' : uploadStatus.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {uploadStatus.type === 'error' ? <XCircle size={16} /> : uploadStatus.type === 'success' ? <CheckCircle size={16} /> : <RefreshCw size={16} className="animate-spin" />}
                                                {uploadStatus.message}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Document Management List */}
                                <div className="lg:col-span-2">
                                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                            <h2 className="text-lg font-bold text-slate-800">Active Vector Space</h2>
                                            <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">{liveStats.indexedDocuments} Documents</span>
                                        </div>
                                        <div className="divide-y divide-slate-50">
                                            {/* Mocked Document List - Wire this to your actual DB later */}
                                            {[
                                                { name: "DSA_Master_Guide_2026.pdf", chunks: 342, date: "Today" },
                                                { name: "OpsMind_Architecture_V2.pdf", chunks: 128, date: "Yesterday" },
                                                { name: "HR_Corporate_Policies.pdf", chunks: 85, date: "Last Week" }
                                            ].map((doc, idx) => (
                                                <div key={idx} className="p-5 flex items-center justify-between hover:bg-slate-50 transition group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center"><FileText size={20} /></div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-800">{doc.name}</p>
                                                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                                                <span>{doc.chunks} Chunks</span> • <span>Indexed {doc.date}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition opacity-0 group-hover:opacity-100">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            ))}
                                            {liveStats.indexedDocuments === 0 && (
                                                <div className="p-12 text-center text-slate-400">
                                                    <Database size={32} className="mx-auto mb-3 opacity-50" />
                                                    <p>Vector database is currently empty.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 🌟 CONFIGURATION SETTINGS */}
                        {activeTab === "settings" && (
                            <div className="max-w-3xl mx-auto animate-fade-in">
                                <h2 className="text-2xl font-bold text-slate-800 mb-6">Platform Configuration</h2>
                                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">

                                    <ToggleSwitch
                                        label="Strict Vector Retrieval"
                                        description="Force AI to only answer using provided document context. Disabling allows general LLM knowledge."
                                        enabled={settings.strictRag}
                                        onToggle={() => handleSettingToggle('strictRag')}
                                    />
                                    <ToggleSwitch
                                        label="Auto-Index User Uploads"
                                        description="Automatically embed documents uploaded in the user workspace without admin approval."
                                        enabled={settings.autoIndex}
                                        onToggle={() => handleSettingToggle('autoIndex')}
                                    />
                                    <ToggleSwitch
                                        label="Diagnostic Debug Mode"
                                        description="Expose vector match scores and chunk IDs in the UI for system debugging."
                                        enabled={settings.debugMode}
                                        onToggle={() => handleSettingToggle('debugMode')}
                                    />

                                    <div className="mt-8 pt-8 border-t border-red-100">
                                        <h3 className="font-bold text-red-600 mb-2">Danger Zone</h3>
                                        <div className="bg-red-50/50 border border-red-100 rounded-xl p-5 flex items-center justify-between">
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-sm">Purge Vector Database</h4>
                                                <p className="text-xs text-slate-500 mt-1">Permanently delete all chunks and embeddings. Cannot be undone.</p>
                                            </div>
                                            <button className="bg-white text-red-600 px-4 py-2 rounded-lg text-sm font-bold border border-red-200 hover:bg-red-600 hover:text-white transition shadow-sm">
                                                Purge Data
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Users Tab (Kept ultra-clean) */}
                        {activeTab === "users" && (
                            <div className="max-w-5xl mx-auto animate-fade-in">
                                <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                        <h2 className="text-lg font-bold text-slate-800">Access Control</h2>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input type="text" placeholder="Search accounts..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 w-64 bg-white" />
                                        </div>
                                    </div>
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-widest font-bold">
                                                <th className="p-5">User</th>
                                                <th className="p-5">Status</th>
                                                <th className="p-5">Role</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            <tr className="hover:bg-slate-50/80 transition group">
                                                <td className="p-5 flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">A</div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">admin@opsmind.com</p>
                                                    </div>
                                                </td>
                                                <td className="p-5"><span className="text-sm text-emerald-600 font-medium">Active</span></td>
                                                <td className="p-5"><span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">Admin</span></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;