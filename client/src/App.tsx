import { Route, Routes, Navigate } from "react-router-dom";
import { Signin } from "./pages/SignIn";
import { Signup } from "./pages/SignUp";
import Dashboard from "./pages/dashboard";
import HomePage from "./pages/home";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import TwitterLinks from "./pages/TwitterLinks";
import YoutubeLinks from "./pages/YoutubeLinks";

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signin" element={<Signin />} />

      {/* Private Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/youtube"
        element={
          <ProtectedRoute>
            <YoutubeLinks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/twitter"
        element={
          <ProtectedRoute>
            <TwitterLinks />
          </ProtectedRoute>
        }
      />

      {/* Catch-all: redirect unknown routes to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
