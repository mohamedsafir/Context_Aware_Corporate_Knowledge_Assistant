import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <h1 className="text-6xl font-bold text-slate-800 mb-4">404</h1>
            <p className="text-xl text-slate-600 mb-8">Page not found.</p>
            <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                Go Home
            </Link>
        </div>
    );
};

export default NotFound;