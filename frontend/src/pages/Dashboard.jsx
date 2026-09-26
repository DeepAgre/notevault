import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  FileText,
  LogOut,
  Menu,
  Plus,
  Settings,
  Trash2,
  X,
  BookOpen,
  Info,
  Flame,
  Award,
  Lock,
  Unlock,
  Compass,
  Sparkles,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

const STREAK_BADGES = [
  { id: "week", title: "7-Day Habit", daysRequired: 7, description: "Wrote reflections for a full week." },
  { id: "three_months", title: "3-Month Dedication", daysRequired: 90, description: "Maintained a steady mindful habit for 3 months." },
  { id: "six_months", title: "6-Month Mastery", daysRequired: 180, description: "Deep self-reflection practice over half a year." },
  { id: "year", title: "1-Year Milestone", daysRequired: 365, description: "A full year of honoring your emotional well-being." },
];

function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingNote, setSavingNote] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [writeMode, setWriteMode] = useState("guided");

  const [situation, setSituation] = useState("");
  const [negativeThought, setNegativeThought] = useState("");
  const [reframing, setReframing] = useState("");
  const [actionPlan, setActionPlan] = useState("");

  const [showInfoModal, setShowInfoModal] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const mobileMenuRef = useRef(null);

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ total_notes: 0, favorite_notes: 0, pinned_notes: 0, trash_notes: 0 });
  const [wellness, setWellness] = useState(null);
  const [activeSound, setActiveSound] = useState(null);
  const audioRef = useRef(null);

  const navigate = useNavigate();

  const streakDays = useMemo(() => {
    if (!notes || notes.length === 0) return 0;
    const daysSet = new Set(notes.map((n) => new Date(n.created_at).toDateString()));
    return Math.max(1, daysSet.size);
  }, [notes]);

  const emotionalSpectrum = useMemo(() => {
    if (!notes || notes.length === 0) {
      return {
        position: 50,
        label: "Serene & Balanced",
        message: "A peaceful starting space. Ready for your daily thoughts.",
      };
    }

    let heavyKeywords = ["fail", "exhaust", "drown", "alone", "stuck", "overwhelm", "zero", "behind", "anxiety", "hard", "tired", "deadline"];
    let heavyCount = 0;
    let soothingCount = 0;

    notes.forEach((n) => {
      const text = (n.title + " " + n.content).toLowerCase();
      if (heavyKeywords.some((kw) => text.includes(kw))) heavyCount++;
      if (text.includes("gentle") || text.includes("step") || text.includes("breath") || text.includes("realiz") || text.includes("kind")) {
        soothingCount++;
      }
    });

    let score = Math.min(95, Math.max(10, Math.round(50 + (soothingCount * 15) - (heavyCount * 12))));

    if (score >= 65) {
      return {
        position: score,
        label: "Grounded & Light",
        message: "You are navigating your reflections with a calm, balanced perspective. Keep honoring your pace.",
      };
    } else if (score >= 35) {
      return {
        position: score,
        label: "Reflecting & Processing",
        message: "You are actively sorting through your thoughts today. Give yourself grace as you process.",
      };
    } else {
      return {
        position: score,
        label: "Carrying Heavy Weight",
        message: "It looks like you are holding onto demanding thoughts right now. Remember that it's okay to rest and take a breather.",
      };
    }
  }, [notes]);

  const [activeTipIndex, setActiveTipIndex] = useState(0);
  
  const currentMessages = [
    { title: "Steady Pacing", text: "You are showing up for yourself through honest daily reflection. That takes courage." },
    { title: "Gentle Awareness", text: "Take a slow, deep breath and let today unfold at its own pace." },
    { title: "Self-Kindness Check", text: "Treat yourself with the same patience you would offer a dear friend." }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTipIndex((prev) => (prev + 1) % currentMessages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out");
    navigate("/");
  };

  const toggleSound = (soundType, audioUrl) => {
    if (activeSound === soundType) {
      if (audioRef.current) audioRef.current.pause();
      setActiveSound(null);
      toast.success("Ambient sound stopped");
    } else {
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(audioUrl);
      audio.loop = true;
      audio.play().catch(() => {});
      audioRef.current = audio;
      setActiveSound(soundType);
      toast.success(`Playing ${soundType} soundscape`);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await api.get("/dashboard");
        const wellnessRes = await api.get("/wellness/insights").catch(() => null);
        setNotes(response.data.notes);
        setUser(response.data.user);
        setStats(response.data.stats);
        if (wellnessRes) setWellness(wellnessRes.data);
      } catch (error) {
        console.log(error);
        toast.error("Failed to load sanctuary");
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const resetEditor = () => {
    setShowModal(false);
    setTitle("");
    setContent("");
    setSituation("");
    setNegativeThought("");
    setReframing("");
    setActionPlan("");
    setWriteMode("guided");
    setSavingNote(false);
  };

  const createNewNote = async () => {
    if (savingNote) return;

    if (!title.trim()) {
      toast.error("Please provide a title for your reflection");
      return;
    }

    let finalContent = content.trim();

    if (writeMode === "guided") {
      if (!situation.trim() && !negativeThought.trim() && !reframing.trim() && !actionPlan.trim()) {
        toast.error("Please fill out at least one section of the guided flow");
        return;
      }
      finalContent = `What is on my mind:\n${situation.trim() || "Not specified"}\n\nHeavy thoughts I am carrying:\n${negativeThought.trim() || "Not specified"}\n\nLooking at it gently:\n${reframing.trim() || "Not specified"}\n\nSmall step forward:\n${actionPlan.trim() || "Not specified"}`;
    } else {
      if (!finalContent) {
        toast.error("Please write down your thoughts");
        return;
      }
    }

    setSavingNote(true);
    try {
      await api.post("/notes", { title: title.trim(), content: finalContent });
      const response = await api.get("/dashboard");
      setNotes(response.data.notes);
      setStats(response.data.stats);
      resetEditor();
      toast.success("Reflection saved safely");
    } catch (error) {
      console.log(error);
      toast.error("Failed to save reflection");
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#FFFDF8]">
        <div className="flex items-center gap-3 text-sm text-[#77716B]">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-[#7C6CF2]" />
          <span>Opening your sanctuary...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#292726] pb-16">
      <div className="pointer-events-none fixed -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-[#D9F5FF] blur-3xl opacity-60" />
      <div className="pointer-events-none fixed -bottom-40 -right-40 h-[420px] w-[420px] rounded-full bg-[#F0E5FF] blur-3xl opacity-60" />

      <div className="relative flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden w-[250px] shrink-0 border-r border-[#EAE6DE] bg-white/70 px-5 py-7 backdrop-blur-xl md:flex md:flex-col">
          <button onClick={() => navigate("/dashboard")} className="flex cursor-pointer items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#7C6CF2] text-white shadow-sm">
              <FileText size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight">Note<span className="text-[#7C6CF2]">Vault</span></span>
          </button>

          <div className="mt-10 space-y-1.5">
            <button onClick={() => navigate("/dashboard")} className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium bg-[#F0EDFF] text-[#6657D8]">
              <Compass size={18} /> Sanctuary Hub
            </button>
            <button onClick={() => navigate("/reflections")} className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#77716B] hover:bg-[#F7F5F0]">
              <FileText size={18} /> Reflections Vault
            </button>
            {/* Added Wellness Arcade Link Here */}
            <button onClick={() => navigate("/wellness-arcade")} className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#77716B] hover:bg-[#F7F5F0]">
              <Sparkles size={18} /> Wellness Arcade
            </button>
            <button onClick={() => navigate("/trash")} className="flex w-full cursor-pointer items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-[#77716B] hover:bg-[#F7F5F0]">
              <span className="flex items-center gap-3"><Trash2 size={18} /> Trash</span>
              <span className="text-xs text-[#AAA39A]">{stats.trash_notes}</span>
            </button>
            <button onClick={() => navigate("/resources")} className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#77716B] hover:bg-[#F7F5F0]">
              <BookOpen size={18} /> Wellness Resources
            </button>
            <button onClick={() => navigate("/settings")} className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#77716B] hover:bg-[#F7F5F0]">
              <Settings size={18} /> Settings
            </button>
          </div>

          <div className="mt-auto border-t border-[#EEEAE3] pt-5">
            <button onClick={handleLogout} className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#A35A62] hover:bg-[#FFF0F1]">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="min-w-0 flex-1 px-5 pt-5 md:px-10 md:py-8 xl:px-14">
          {/* Mobile top bar */}
          <div className="mb-6 flex items-center justify-between md:hidden" ref={mobileMenuRef}>
            <button onClick={() => navigate("/dashboard")} className="flex cursor-pointer items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7C6CF2] text-white">
                <FileText size={18} />
              </div>
              <span className="font-bold">Note<span className="text-[#7C6CF2]">Vault</span></span>
            </button>
            <button onClick={() => setShowMobileMenu((prev) => !prev)} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#E8E3DB] bg-white text-[#625E59]">
              {showMobileMenu ? <X size={19} /> : <Menu size={19} />}
            </button>

            <AnimatePresence>
              {showMobileMenu && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute left-4 right-4 top-16 z-50 rounded-3xl border border-[#E9E5DD] bg-white p-4 shadow-xl md:hidden">
                  <div className="space-y-2">
                    <button onClick={() => navigate("/dashboard")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium bg-[#F0EDFF] text-[#6657D8]"><Compass size={18} /> Sanctuary Hub</button>
                    <button onClick={() => navigate("/reflections")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#77716B] hover:bg-[#F7F5F0]"><FileText size={18} /> Reflections Vault</button>
                    {/* Added Wellness Arcade Link in Mobile Menu Here */}
                    <button onClick={() => navigate("/wellness-arcade")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#77716B] hover:bg-[#F7F5F0]"><Sparkles size={18} /> Wellness Arcade</button>
                    <button onClick={() => navigate("/trash")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#77716B] hover:bg-[#F7F5F0]"><Trash2 size={18} /> Trash ({stats.trash_notes})</button>
                    <button onClick={() => navigate("/resources")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#77716B] hover:bg-[#F7F5F0]"><BookOpen size={18} /> Wellness Resources</button>
                    <button onClick={() => navigate("/settings")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#77716B] hover:bg-[#F7F5F0]"><Settings size={18} /> Settings</button>
                    <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#A35A62] hover:bg-[#FFF0F1]"><LogOut size={18} /> Logout</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Header */}
          <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-[#8C857D]">Your daily emotional reflection & decompression sanctuary</p>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <h1 className="text-4xl font-bold tracking-tight text-[#292726] md:text-5xl">Sanctuary Hub</h1>
                <div className="flex items-center gap-1.5 rounded-full bg-[#FFF3E0] px-3.5 py-1.5 border border-[#FFE0B2] text-[#E65100] shadow-sm">
                  <Flame size={16} fill="currentColor" />
                  <span className="text-xs font-bold">{streakDays} Day Streak</span>
                </div>
              </div>
              {user && <p className="mt-2 text-sm text-[#99928A]">Welcome back, {user.username}</p>}
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/reflections")} className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#E3DED6] bg-white px-5 py-3 text-sm font-semibold text-[#625E59] shadow-sm transition hover:bg-[#F7F5F0]">
                <FileText size={18} /> View All Reflections
              </button>
              <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => setShowModal(true)} className="flex cursor-pointer items-center gap-2 rounded-2xl bg-[#7C6CF2] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-[#7C6CF2]/20 transition hover:bg-[#6E5EE5]">
                <Plus size={18} /> New reflection
              </motion.button>
            </div>
          </header>

          {/* Companion & Emotional Spectrum Section */}
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {/* Sprout Companion */}
            <div className="col-span-2 flex flex-col justify-between rounded-[28px] border border-[#BEE3DB] bg-gradient-to-br from-[#E8F8F5] to-[#D1F2EB] p-7 shadow-sm">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#116466]">Sprout, Your Companion</span>
                    <button onClick={() => setShowInfoModal("sprout")} className="cursor-pointer rounded-full p-1 text-[#116466] hover:bg-white/60 transition"><Info size={15} /></button>
                  </div>
                  <span className="rounded-full bg-white/70 px-3 py-0.5 text-xs font-semibold text-[#116466]">{notes.length} Total Entries</span>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row items-center gap-5">
                  <div className="flex shrink-0 flex-col items-center justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm border border-[#A2D9CE]">
                      <div className="relative flex flex-col items-center">
                        <motion.div animate={{ rotate: [-3, 3, -3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-6 flex gap-1">
                          <div className="h-5 w-3.5 rounded-full bg-[#2E8B57] origin-bottom-right -rotate-12" />
                          <div className="h-5 w-3.5 rounded-full bg-[#3CB371] origin-bottom-left rotate-12" />
                        </motion.div>
                        <div className="h-3.5 w-1 bg-[#116466] mt-2 rounded-full" />
                        <div className="h-8 w-10 rounded-b-xl bg-[#D4A373] shadow-inner flex items-center justify-center">
                          <div className="flex gap-1.5 mb-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-[#2D3142]" />
                            <div className="h-1.5 w-1.5 rounded-full bg-[#2D3142]" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className="mt-2 text-[11px] font-bold text-[#116466]">Sprout</span>
                  </div>

                  <div className="flex-1 w-full rounded-2xl bg-white/85 p-5 shadow-sm border border-[#BEE3DB] backdrop-blur-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#2E8B57] mb-1">{currentMessages[activeTipIndex].title}</p>
                    <h2 className="text-sm font-bold text-[#2D3142]">{currentMessages[activeTipIndex].text}</h2>
                    <p className="mt-2 text-xs leading-relaxed text-[#52796F]">Gentle reminder: You are the sky; your heavy thoughts and deadlines are just passing weather clouds.</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between border-t border-[#BEE3DB]/60 pt-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#116466]">Soundscapes:</span>
                  <button onClick={() => toggleSound("Rain", "https://cdn.pixabay.com/download/audio/2021/09/06/audio_75c7423985.mp3?filename=gentle-rain-15258.mp3")} className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-semibold transition ${activeSound === "Rain" ? "bg-[#116466] text-white" : "bg-white/80 text-[#116466] hover:bg-white"}`}>Rainfall</button>
                  <button onClick={() => toggleSound("Forest", "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=forest-birds-and-wind-6213.mp3")} className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-semibold transition ${activeSound === "Forest" ? "bg-[#116466] text-white" : "bg-white/80 text-[#116466] hover:bg-white"}`}>Forest</button>
                  {activeSound && <button onClick={() => toggleSound(activeSound, "")} className="cursor-pointer rounded-xl bg-red-100 px-3 py-1.5 text-xs font-semibold text-[#B85D69]">Mute</button>}
                </div>
              </div>
            </div>

            {/* Emotional Spectrum Scale Card */}
            <div className="flex flex-col justify-between rounded-[28px] border border-[#F5E79B] bg-gradient-to-br from-[#FFFDEB] to-[#FFF9D6] p-7 shadow-sm">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#9A7B00]">Emotional Spectrum Scale</p>
                    <button onClick={() => setShowInfoModal("spectrum")} className="cursor-pointer text-[#9A7B00] hover:text-black"><Info size={14} /></button>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-white/80 p-4 border border-[#F5E79B]/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#302D2A]">Current State</span>
                    <span className="text-xs font-bold text-[#9A7B00] bg-[#FFF8D9] px-2.5 py-1 rounded-full">{emotionalSpectrum.label}</span>
                  </div>

                  <div className="relative my-6 px-2">
                    <div className="flex justify-between text-[10px] font-medium text-[#8C857D] mb-2">
                      <span>Carrying Weight</span>
                      <span>Processing</span>
                      <span>Grounded</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-gradient-to-r from-[#FADBD8] via-[#FDEBD0] to-[#D5F5E3] relative shadow-inner">
                      <div className="absolute top-1/2 -translate-y-1/2 -ml-3 h-6 w-6 rounded-full bg-[#D4A373] border-2 border-white shadow-md transition-all duration-500" style={{ left: `${emotionalSpectrum.position}%` }} />
                    </div>
                  </div>

                  <p className="mt-2 text-[11px] leading-relaxed text-[#77716B]">{emotionalSpectrum.message}</p>
                </div>
              </div>

              <div className="mt-5 border-t border-[#F5E79B]/60 pt-3">
                <p className="text-[10px] text-[#8C857D] italic text-center">A safe, judgment-free space for your daily thoughts</p>
              </div>
            </div>
          </div>

          {/* Writing Streak & Milestones Section */}
          <section className="mt-8 rounded-[28px] border border-[#E7E2D9] bg-white p-6 shadow-sm mb-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF3E0] text-[#E65100]">
                  <Award size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#302D2A]">Writing Streak & Milestone Badges</h2>
                  <p className="text-xs text-[#77716B]">Consistent daily reflections unlock special milestone badges.</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-[#E65100]">{streakDays}</span>
                <p className="text-[11px] font-semibold text-[#77716B] uppercase">Days Active</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {STREAK_BADGES.map((badge) => {
                const isUnlocked = streakDays >= badge.daysRequired;
                return (
                  <div key={badge.id} className={`flex items-start gap-3.5 rounded-2xl border p-4 transition ${isUnlocked ? "border-[#FFE0B2] bg-[#FFF8F0]" : "border-[#EFECE6] bg-[#FAFAF8] opacity-70"}`}>
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isUnlocked ? "bg-[#FFE0B2] text-[#E65100]" : "bg-[#EFECE6] text-[#A39E93]"}`}>
                      {isUnlocked ? <Unlock size={18} /> : <Lock size={18} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-[#302D2A]">{badge.title}</h3>
                        {isUnlocked && <span className="rounded-full bg-[#E65100] px-1.5 py-0.5 text-[9px] font-bold text-white">Unlocked</span>}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-[#77716B]">{badge.description}</p>
                      <p className="mt-2 text-[10px] font-semibold text-[#A39E93]">
                        {isUnlocked ? "Completed!" : `Requires ${badge.daysRequired} days (${badge.daysRequired - streakDays} days left)`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>

      {/* Info Tooltip Modal */}
      <AnimatePresence>
        {showInfoModal && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#3D3940]/30 p-4 backdrop-blur-sm" onClick={() => setShowInfoModal(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.97, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-[30px] bg-white p-7 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F8F5] text-[#116466]"><Info size={22} /></div>
                <button onClick={() => setShowInfoModal(null)} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-[#F7F5F0] text-[#77716B]"><X size={17} /></button>
              </div>
              <h2 className="mt-5 text-xl font-bold text-[#302D2A]">
                {showInfoModal === "sprout" && "About Sprout, Your Companion"}
                {showInfoModal === "spectrum" && "Emotional Spectrum Scale"}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#625E59]">
                {showInfoModal === "sprout" && "Sprout is your gentle emotional companion here to offer a listening presence, soothing words, and a calm space whenever you log your thoughts."}
                {showInfoModal === "spectrum" && "The emotional spectrum scale uses a sliding indicator ball to map your daily reflection entries, showing whether you are feeling grounded, processing thoughts, or carrying extra weight."}
              </p>
              <div className="mt-7 flex justify-end">
                <button onClick={() => setShowInfoModal(null)} className="cursor-pointer rounded-xl bg-[#292726] px-5 py-2.5 text-sm font-medium text-white">Got it</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#3D3940]/25 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.97, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} className="w-full max-w-xl rounded-[32px] bg-white p-7 shadow-2xl md:p-9">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9B948C]">New reflection</p>
                  <h2 className="mt-2 text-2xl font-bold text-[#302D2A]">Guided Reflection</h2>
                </div>
                <button onClick={resetEditor} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-[#F7F5F0] text-[#77716B]"><X size={18} /></button>
              </div>

              <div className="mt-7 space-y-5 max-h-[65vh] overflow-y-auto pr-1">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#625E59]">Title</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Give your thoughts a title" autoFocus className="w-full rounded-2xl border border-[#E5E0D8] bg-[#FCFBF8] px-4 py-3.5 text-[#302D2A] outline-none transition focus:border-[#B9AEF6] focus:ring-4 focus:ring-[#EEEAFE]" />
                </div>

                <div className="flex items-center justify-between rounded-xl bg-[#F4F1EA] p-1.5 border border-[#E6E1D6]">
                  <button type="button" onClick={() => setWriteMode("guided")} className={`flex-1 cursor-pointer rounded-lg py-2 text-xs font-semibold transition ${writeMode === "guided" ? "bg-white text-[#302D2A] shadow-sm" : "text-[#77716B]"}`}>Guided Flow</button>
                  <button type="button" onClick={() => setWriteMode("plain")} className={`flex-1 cursor-pointer rounded-lg py-2 text-xs font-semibold transition ${writeMode === "plain" ? "bg-white text-[#302D2A] shadow-sm" : "text-[#77716B]"}`}>Free Journaling</button>
                </div>

                {writeMode === "plain" ? (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#625E59]">Your Thoughts</label>
                    <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write freely whatever is on your mind..." rows={9} className="w-full resize-none rounded-2xl border border-[#E5E0D8] bg-[#FCFBF8] px-4 py-3.5 text-[#302D2A] outline-none" />
                  </div>
                ) : (
                  <div className="space-y-4 rounded-2xl bg-[#F9F7F3] p-4 border border-[#EAE5DC]">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#77716B]">Gentle Decompression Guide</p>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#625E59]">1. What situation or burden is on your mind?</label>
                      <input type="text" value={situation} onChange={(e) => setSituation(e.target.value)} placeholder="e.g., Exhausted from constant deadlines" className="w-full rounded-xl border border-[#E5E0D8] bg-white px-3.5 py-2.5 text-sm text-[#302D2A] outline-none" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#625E59]">2. What heavy thoughts are running through your head?</label>
                      <input type="text" value={negativeThought} onChange={(e) => setNegativeThought(e.target.value)} placeholder="e.g., I'm falling behind everyone else" className="w-full rounded-xl border border-[#E5E0D8] bg-white px-3.5 py-2.5 text-sm text-[#302D2A] outline-none" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#625E59]">3. Let's look at this gently. Is this an absolute fact or a passing feeling?</label>
                      <textarea value={reframing} onChange={(e) => setReframing(e.target.value)} placeholder="Write down a kinder, more balanced perspective..." rows={3} className="w-full resize-none rounded-xl border border-[#E5E0D8] bg-white px-3.5 py-2.5 text-sm text-[#302D2A] outline-none" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#625E59]">4. What is one ultra-small act of self-kindness you can offer yourself?</label>
                      <textarea value={actionPlan} onChange={(e) => setActionPlan(e.target.value)} placeholder="e.g., Drink water, close my eyes for 5 minutes..." rows={3} className="w-full resize-none rounded-xl border border-[#E5E0D8] bg-white px-3.5 py-2.5 text-sm text-[#302D2A] outline-none" />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-7 flex justify-end gap-2">
                <button onClick={resetEditor} disabled={savingNote} className="cursor-pointer rounded-xl px-5 py-3 text-sm font-medium text-[#77716B]">Cancel</button>
                <button
                  onClick={createNewNote}
                  disabled={savingNote}
                  className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#7C6CF2] px-5 py-3 text-sm font-semibold text-white hover:bg-[#6E5EE5] disabled:opacity-60"
                >
                  {savingNote ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={17} /> Save reflection
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Dashboard;