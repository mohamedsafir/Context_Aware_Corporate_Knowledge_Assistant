import { LogOut, Shield, User, Calendar, LayoutDashboard, Library, AlertCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef } from "react";
import API from "../services/api";
import { formatDate } from "../utils/formatDate";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Profile Box States
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [profileError, setProfileError] = useState(false); // 🚨 NEW: Tracks if the fetch failed
    const dropdownRef = useRef(null);

    const toggleProfile = async () => {
        setIsProfileOpen(!isProfileOpen);
        // Only fetch if we don't have the data and we haven't already hit an error
        if (!profileData && !isProfileOpen && !profileError) {
            try {
                setProfileError(false);
                const res = await API.get("/auth/me");
                setProfileData(res.data);
            } catch (err) {
                console.error("Failed to fetch profile. Token might be invalid.", err);
                setProfileError(true); // 🚨 NEW: Tell the UI the fetch failed
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 shrink-0 z-50 relative shadow-sm">

            {/* LEFT SIDE: Brand Identity */}
            <div className="flex items-center gap-10">
                <Link to="/chat" className="text-xl font-black text-slate-900 tracking-tighter hover:opacity-80 transition">
                    OpsMind <span className="text-blue-600">AI</span>
                </Link>

                {/* MIDDLE: Primary Navigation Links */}
                <div className="hidden md:flex items-center gap-6">
                    <Link
                        to="/chat"
                        className={`flex items-center gap-2 text-sm font-semibold transition-colors ${isActive("/chat") ? "text-blue-600" : "text-slate-500 hover:text-slate-900"}`}
                    >
                        <LayoutDashboard size={18} /> Workspace
                    </Link>

                    <Link
                        to="/profile"
                        className={`flex items-center gap-2 text-sm font-semibold transition-colors ${isActive("/profile") ? "text-blue-600" : "text-slate-500 hover:text-slate-900"}`}
                    >
                        <Library size={18} /> My Library
                    </Link>
                </div>
            </div>

            {/* RIGHT SIDE: User Actions & Admin */}
            <div className="flex items-center gap-6">

                {user?.role === "admin" && (
                    <Link
                        to="/admin"
                        className="flex items-center gap-2 text-sm text-purple-600 font-bold bg-purple-50 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition"
                    >
                        <Shield size={16} /> Admin Panel
                    </Link>
                )}

                {/* Profile Toggle */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={toggleProfile}
                        className={`flex items-center gap-2 text-sm font-bold transition-all px-3 py-2 rounded-lg ${isProfileOpen ? "bg-slate-100 text-blue-600" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                        <div className="w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
                            <User size={16} />
                        </div>
                        <span className="hidden sm:inline">Account</span>
                    </button>

                    {/* Profile Dropdown Box */}
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                            {profileData ? (
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-4 border-b border-slate-100 pb-5 mb-5">
                                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-md">
                                            <User size={28} />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-bold text-slate-900 truncate">{profileData.email}</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mt-1">
                                                {profileData.role} Access
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-xs text-slate-500">
                                            <Calendar size={16} className="text-slate-400" />
                                            <span>Member since {formatDate(profileData.createdAt)}</span>
                                        </div>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-red-600 transition-colors shadow-sm"
                                        >
                                            <LogOut size={16} /> Sign Out
                                        </button>
                                    </div>
                                </div>
                            ) : profileError ? (
                                /* 🚨 NEW: Error State UI */
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-2 text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg">
                                        <AlertCircle size={18} />
                                        <span>Session expired. Please sign out and log back in.</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm"
                                    >
                                        <LogOut size={16} /> Force Sign Out
                                    </button>
                                </div>
                            ) : (
                                <div className="py-4 text-center text-sm text-slate-400 italic">Synchronizing profile...</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;