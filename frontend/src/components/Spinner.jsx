import { Loader2 } from "lucide-react";

const Spinner = () => {
    return (
        <div className="flex items-center justify-center p-4 text-slate-500 animate-fade-in">
            <Loader2 className="animate-spin text-blue-600 mr-2" size={20} />
            <span className="text-sm font-medium">OpsMind is analyzing documents...</span>
        </div>
    );
};

export default Spinner;