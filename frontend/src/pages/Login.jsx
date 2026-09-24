import { motion } from "framer-motion";
import { useState } from "react";
import { User, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const validateForm = () => {
    const cleanIdentifier = identifier.trim();
    const cleanPassword = password;

    if (!cleanIdentifier || !cleanPassword) {
      return "Please enter your email/username and password.";
    }

    if (cleanIdentifier.length < 2) {
      return "Please enter a valid email or username.";
    }

    if (cleanPassword.length < 6) {
      return "Password must be at least 6 characters long.";
    }

    return null;
  };

  const handleLogin = async (e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }

    // Clear previous errors before validating
    setErrorMessage("");

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      toast.error(validationError);
      return;
    }

    setLoading(true);

    const formData = new URLSearchParams();
    formData.append("username", identifier.trim());
    formData.append("password", password);

    try {
      const response = await api.post("/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (response && response.data && response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        toast.success("Signed in successfully!");
        navigate("/dashboard");
      } else {
        throw new Error("Invalid response structure from server.");
      }
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      let errorMsg = "Something went wrong. Please check your connection and try again.";
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMsg = "Invalid email/username or password. Please try again.";
        } else if (error.response.data && error.response.data.detail) {
          errorMsg = typeof error.response.data.detail === "string" 
            ? error.response.data.detail 
            : "Invalid credentials provided.";
        }
      } else if (error.request) {
        errorMsg = "Unable to reach the server. Please verify your backend is running.";
      }

      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fffaf7] text-slate-900">
      {/* Colorful background blobs */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-300/40 blur-[110px]" />
      <div className="pointer-events-none absolute right-[-120px] top-20 h-[420px] w-[420px] rounded-full bg-pink-300/40 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-[-160px] left-[20%] h-[420px] w-[420px] rounded-full bg-purple-300/30 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-[-120px] right-[10%] h-[320px] w-[320px] rounded-full bg-yellow-200/50 blur-[110px]" />

      {/* Main Container */}
      <div className="relative flex min-h-screen items-center justify-center px-5 py-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[430px]"
        >
          {/* Logo Heading */}
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-black tracking-tight text-slate-900">
              Note<span className="text-cyan-500">Vault</span>
            </h1>
            <p className="mt-3 text-sm text-slate-500">
              Sign in to your account
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-[32px] border border-white/80 bg-white/75 p-7 shadow-[0_25px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl sm:p-9">
            <form onSubmit={handleLogin} className="space-y-5">
              
              {/* Persistent Error Message Box */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 shadow-sm"
                >
                  {errorMessage}
                </motion.div>
              )}

              {/* Email / Username Input */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email or Username
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="you@example.com or username"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (errorMessage) setErrorMessage(""); // Clear error as user types
                    }}
                    autoComplete="username"
                    disabled={loading}
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 py-3.5 pl-11 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(""); // Clear error as user types
                    }}
                    autoComplete="current-password"
                    disabled={loading}
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 py-3.5 pl-11 pr-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 font-semibold text-white shadow-lg shadow-slate-900/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight
                      size={18}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Switch to Register */}
            <div className="mt-7 border-t border-slate-200 pt-6 text-center">
              <p className="text-sm text-slate-500">
                Don't have an account?
              </p>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="mt-2 text-sm font-semibold text-cyan-600 transition hover:text-cyan-500 cursor-pointer"
              >
                Create an account
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;