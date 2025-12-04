import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Home, ShieldAlert } from "lucide-react";

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleGoHome = () => {
    if (user?.role === "student") {
      navigate("/dashboard/student");
    } else if (user?.role === "educator") {
      navigate("/educator/dashboard");
    } else if (user?.role === "admin") {
      navigate("/dashboard/admin");
    } else {
      navigate("/home");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-center">
          <ShieldAlert className="w-16 h-16 text-white mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Access Denied</h1>
        </div>
        
        <div className="p-8 text-center">
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. This area is restricted to educators only.
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium">
              Current Role: <span className="capitalize">{user?.role || "Unknown"}</span>
            </p>
            <p className="text-red-600 text-sm mt-1">
              Required Role: <span className="font-medium">Educator</span>
            </p>
          </div>
          
          <button
            onClick={handleGoHome}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
          >
            <Home className="w-5 h-5" />
            Go to My Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;