import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";
import { FileText, Trash2, Database, AlertCircle } from "lucide-react"; // 🚨 Added AlertCircle icon

const Profile = () => {
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null); // 🚨 NEW: Error state to catch backend failures

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setError(null); // Clear any previous errors
            const res = await API.get("/upload/documents");
            setDocuments(res.data);
        } catch (err) {
            console.error("Failed to fetch documents", err);
            // 🚨 NEW: Extract the real error message from the backend
            if (err.response && err.response.status === 401) {
                setError("Your session has expired. Please log out and log back in.");
            } else {
                setError(err.response?.data?.error || "Failed to load your documents.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (filename) => {
        if (!window.confirm(`Are you sure you want to delete all chunks for "${filename}"?`)) return;

        try {
            await API.delete(`/upload/documents/${encodeURIComponent(filename)}`);
            fetchDocuments(); // Refresh the list after deletion
        } catch (err) {
            console.error("Failed to delete document", err);
            alert("Could not delete document. Please try again.");
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            <Navbar />
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-3xl mx-auto">

                    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Database className="text-slate-900" size={24} />
                            <h2 className="text-2xl font-bold text-slate-900">Connected Database Chunks</h2>
                        </div>
                        <p className="text-slate-500 mb-6">
                            These are the documents you have uploaded. The OpsMind RAG engine will use these files to answer your queries.
                        </p>

                        {/* 🚨 NEW: Display the error message if the API fails */}
                        {error ? (
                            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3 border border-red-100">
                                <AlertCircle size={20} />
                                <span className="font-medium">{error}</span>
                            </div>
                        ) : isLoading ? (
                            <div className="flex items-center justify-center p-8 text-slate-400">
                                <span className="animate-pulse">Loading your knowledge base...</span>
                            </div>
                        ) : documents.length === 0 ? (
                            <div className="bg-slate-50 rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">
                                You haven't uploaded any documents yet. Use the paperclip icon in the chat to add one!
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {documents.map((doc, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-lg hover:border-slate-300 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <FileText className="text-slate-400" size={20} />
                                            <span className="font-medium text-slate-700">{doc}</span>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(doc)}
                                            className="text-red-400 hover:text-red-600 p-2 rounded-md hover:bg-red-50 transition-colors"
                                            title="Delete Document"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Profile;