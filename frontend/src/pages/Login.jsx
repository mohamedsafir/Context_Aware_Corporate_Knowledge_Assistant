import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";

const Login = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        try {
            if (isRegistering) {
                await API.post("/auth/register", { email, password, role: "user" });
                setSuccess("Account created successfully! You can now sign in.");
                setIsRegistering(false);
                setPassword("");
            } else {
                const res = await API.post("/auth/login", { email, password });
                login(res.data.token, res.data.role);
                navigate("/chat");
            }
        } catch (err) {
            setError(err.response?.data?.error || "Authentication failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // Changed to w-screen h-screen to fill the browser entirely
        <div className="w-screen h-screen flex bg-slate-900 overflow-hidden">

            {/* The Main Container: removed rounded-2xl and shadow-2xl to allow full edge-to-edge filling */}
            <div className={`w-full h-full flex transition-all duration-700 ease-in-out ${isRegistering ? 'flex-row-reverse' : 'flex-row'}`}>

                {/* 🎨 Image Section: h-full makes it stretch top-to-bottom */}
                <div
                    className="hidden md:block w-1/2 h-full bg-cover bg-center relative transition-all duration-700"
                    style={{
                        backgroundImage: isRegistering
                            ? "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2000&auto=format&fit=crop')"
                            : "url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2000&auto=format&fit=crop')"
                    }}
                >
                    <div className="absolute inset-0 bg-slate-900/40 flex flex-col justify-end p-16 text-white">
                        <h2 className="text-4xl font-bold mb-4">
                            {isRegistering ? "Join OpsMind AI" : "Welcome Back"}
                        </h2>
                        <p className="text-xl text-slate-100 max-w-lg">
                            {isRegistering
                                ? "Unlock the power of your corporate knowledge base."
                                : "Access your intelligent workspace and pick up right where you left off."}
                        </p>
                    </div>
                </div>

                {/* 📝 Form Section: h-full makes it stretch top-to-bottom */}
                <div className="w-full md:w-1/2 h-full flex flex-col justify-center bg-white p-8 lg:p-24 overflow-y-auto">
                    <div className="max-w-md w-full mx-auto">
                        <div className="mb-10">
                            <h1 className="text-4xl font-bold text-slate-900">OpsMind AI</h1>
                            <p className="text-slate-500 mt-2">
                                {isRegistering ? "Create your workspace account" : "Corporate Knowledge Assistant"}
                            </p>
                        </div>

                        {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm font-medium border border-red-100">{error}</div>}
                        {success && <div className="bg-emerald-50 text-emerald-600 p-4 rounded-lg mb-6 text-sm font-medium border border-emerald-100">{success}</div>}

                        <form onSubmit={handleAuth} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none bg-slate-50"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none bg-slate-50"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 text-lg shadow-lg"
                            >
                                {isLoading ? "Processing..." : (isRegistering ? "Create Account" : "Sign In")}
                            </button>
                        </form>

                        <div className="mt-8 text-center pt-8 border-t border-slate-100">
                            <p className="text-slate-600">
                                {isRegistering ? "Already have an account?" : "Don't have an account?"}
                                <button
                                    type="button"
                                    onClick={() => { setIsRegistering(!isRegistering); setError(""); setSuccess(""); }}
                                    className="ml-2 text-blue-600 font-bold hover:underline"
                                >
                                    {isRegistering ? "Sign In" : "Sign Up"}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;