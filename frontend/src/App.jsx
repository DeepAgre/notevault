import { Routes, Route, useLocation } from "react-router-dom";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Trash from "./pages/Trash";
import Resources from "./pages/Resources";
import Reflections from "./pages/Reflections";
import WellnessArcade from "./pages/WellnessArcade";
import About from "./pages/About";
import GlobalAudioPlayer from "./components/GlobalAudioPlayer";

// Helper component to conditionally display the global player only on authenticated pages
function ConditionalAudioPlayer() {
  const location = useLocation();
  const publicPaths = ["/", "/register"];

  // If the user is on the login or register page, do not render the audio player
  if (publicPaths.includes(location.pathname)) {
    return null;
  }

  return <GlobalAudioPlayer />;
}

function App() {
  return (
    <>
      {/* Conditionally rendered Persistent Global Music Player */}
      <ConditionalAudioPlayer />

      <Routes>

        {/* Public routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trash"
          element={
            <ProtectedRoute>
              <Trash />
            </ProtectedRoute>
          }
        />

        <Route
          path="/resources"
          element={
            <ProtectedRoute>
              <Resources />
            </ProtectedRoute>
          }
        />

        <Route path="/reflections" element={<Reflections />} />

        <Route path="/wellness-arcade" element={<WellnessArcade />} />

        <Route path="/about" element={<About />} />

      </Routes>
    </>
  );
}

export default App;