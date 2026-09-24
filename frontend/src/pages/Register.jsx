import { motion } from "framer-motion";
import { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const validateForm = () => {
    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    // 1. Check empty fields
    if (!cleanUsername || !cleanEmail || !password) {
      return "Please fill in all required fields.";
    }

    // 2. Username validation
    if (cleanUsername.length < 3) {
      return "Username must be at least 3 characters long.";
    }
    if (cleanUsername.length > 25) {
      return "Username cannot exceed 25 characters.";
    }
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(cleanUsername)) {
      return "Username can only contain letters, numbers, and underscores.";
    }

    // 3. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return "Please enter a valid email address format (e.g. you@example.com).";
    }

    // 4. Password security validation
    if (password.length < 6) {
      return "Password must be at least 6 characters long.";
    }
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUppercase || !hasLowercase || !hasNumber) {
      return "Password must include at least one uppercase letter, one lowercase letter, and one number.";
    }

    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      toast.error(validationError);
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();

    try {
      await api.post("/register", {
        username: cleanUsername,
        email: cleanEmail,
        password: password,
      });

      toast.success("Account created successfully!");
      navigate("/");

    } catch (error) {
      console.error("REGISTER ERROR:", error);

      let errorMsg = "Unable to create your account. Please try again.";
      if (error.response?.status === 400) {
        errorMsg = error.response.data?.detail || "Email or username already exists.";
      }
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fffaf7] text-slate-900">
      {/* Colorful background */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-300/40 blur-[110px]" />
      <div className="pointer-events-none absolute right-[-120px] top-20 h-[420px] w-[420px] rounded-full bg-pink-300/40 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-[-160px] left-[20%] h-[420px] w-[420px] rounded-full bg-purple-300/30 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-[-120px] right-[10%] h-[320px] w-[320px] rounded-full bg-yellow-200/50 blur-[110px]" />

      {/* Main */}
      <div className="relative flex min-h-screen items-center justify-center px-5 py-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[430px]"
        >
          {/* Logo */}
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-black tracking-tight text-slate-900">
              Note<span className="text-cyan-500">Vault</span>
            </h1>
            <p className="mt-3 text-sm text-slate-500">
              Create your account
            </p>
          </div>

          {/* Card */}
          <div className="rounded-[32px] border border-white/80 bg-white/75 p-7 shadow-[0_25px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl sm:p-9">
            <form onSubmit={handleRegister} className="space-y-5">
              {/* Error */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                >
                  {errorMessage}
                </motion.div>
              )}

              {/* Username */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Username
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 py-3.5 pl-11 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400">3-25 characters (letters, numbers, underscores only)</p>
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 py-3.5 pl-11 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                  />
                </div>
              </div>

              {/* Password */}
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
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 py-3.5 pl-11 pr-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400">At least 6 chars with uppercase, lowercase, & number</p>
              </div>

              {/* Create account */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 font-semibold text-white shadow-lg shadow-slate-900/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight
                      size={18}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Sign in */}
            <div className="mt-7 border-t border-slate-200 pt-6 text-center">
              <p className="text-sm text-slate-500">
                Already have an account?
              </p>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="mt-2 text-sm font-semibold text-cyan-600 transition hover:text-cyan-500"
              >
                Sign In
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Register;