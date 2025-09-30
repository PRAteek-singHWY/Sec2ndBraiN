import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "../assets/icons/Logo";
import { AuthContext } from "../context/AuthContext";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useContext(AuthContext);

  // Simulated auth state — replace with your real auth logic/context

  const baseButtonClasses =
    "w-40 py-2 px-4 rounded-lg font-bold border-2 text-lg transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 cursor-pointer";

  const handleSignOut = () => {
    // Your real sign-out logic here (e.g., clear tokens, update context/state)
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-purple-50 flex flex-col items-center justify-center px-4 text-center text-purple-600">
      <Logo />
      <h1 className="text-5xl font-extrabold mb-4 text-purple-600 font-mono">
        Sec2ndBrain
      </h1>
      <p className="max-w-xl mb-10 text-lg text-purple-700 font-light italic">
        Your personal library for the internet's best moments. Paste, save, and
        remember.
      </p>
      <div className="flex gap-8">
        {!isAuthenticated ? (
          <>
            <button
              onClick={() => navigate("/signup")}
              className={`${baseButtonClasses} bg-purple-600 border-purple-600 text-white hover:bg-white hover:text-purple-600`}
              type="button"
            >
              Sign Up
            </button>

            <button
              onClick={() => navigate("/signin")}
              className={`${baseButtonClasses} bg-white border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white`}
              type="button"
            >
              Sign In
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate("/dashboard")}
              className={`${baseButtonClasses} bg-white border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white`}
              type="button"
            >
              Dashboard
            </button>
            <button
              onClick={handleSignOut}
              className={`${baseButtonClasses} bg-red-600 border-red-600 text-white hover:bg-white hover:text-red-600`}
              type="button"
            >
              Sign Out
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
