import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Compass,
  FileText,
  Trash2,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  Wind,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  Play,
  Award,
  Info,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

function WellnessArcade() {
  const [loading, setLoading] = useState(true);
  const [activeGame, setActiveGame] = useState(null); // null, 'breathing', 'quests', 'gratitude'
  const [gameLoading, setGameLoading] = useState(false);

  // Navigation & Menu States
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const mobileMenuRef = useRef(null);
  const [stats, setStats] = useState({ total_notes: 0, trash_notes: 0 });

  // Game 1: Breathing States
  const [breathState, setBreathState] = useState("Ready"); // Ready, Inhale, Hold, Exhale
  const [breathTimer, setBreathTimer] = useState(4);
  const isBreathingRef = useRef(false);

  // Game 2: SuperBetter Micro-Quests States
  const [quests, setQuests] = useState([
    { id: 1, title: "Take 5 slow, deep breaths away from screens", category: "Mental", completed: false, loading: false },
    { id: 2, title: "Drink a full glass of water and stretch your shoulders", category: "Physical", completed: false, loading: false },
    { id: 3, title: "Write down one thing you accomplished today", category: "Emotional", completed: false, loading: false },
    { id: 4, title: "Send a kind message or text to a friend or ally", category: "Social", completed: false, loading: false },
  ]);

  // Game 3: Gratitude Scavenger Hunt States
  const [gratitudeIndex, setGratitudeIndex] = useState(0);
  const gratitudePrompts = [
    "Find something within arm's reach that has a comforting texture. Touch it mindfully for 10 seconds.",
    "Look out a window or at the sky. Notice one detail you usually overlook.",
    "Find an item in your room that brings back a pleasant memory.",
    "Locate something yellow or blue nearby and think of why it stands out.",
    "Acknowledge one personal strength you showed this week.",
  ];

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/");
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
    const loadDashboardData = async () => {
      try {
        const response = await api.get("/dashboard");
        setStats(response.data.stats);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  // Handler to select and load a game with proper loading spinner & prevention
  const selectGame = (gameId) => {
    if (gameLoading) return;
    setGameLoading(true);
    setActiveGame(null);

    setTimeout(() => {
      setActiveGame(gameId);
      setGameLoading(false);
    }, 600); // Smooth loading transition
  };

  // Breathing Loop Controller
  useEffect(() => {
    let interval = null;
    if (activeGame === "breathing" && isBreathingRef.current) {
      interval = setInterval(() => {
        setBreathTimer((prev) => {
          if (prev <= 1) {
            if (breathState === "Inhale") {
              setBreathState("Hold");
              return 4;
            } else if (breathState === "Hold") {
              setBreathState("Exhale");
              return 4;
            } else {
              setBreathState("Inhale");
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeGame, breathState]);

  const startBreathingSession = () => {
    isBreathingRef.current = true;
    setBreathState("Inhale");
    setBreathTimer(4);
    toast.success("Breathing session started");
  };

  const stopBreathingSession = () => {
    isBreathingRef.current = false;
    setBreathState("Ready");
    setBreathTimer(4);
  };

  const toggleQuestCompletion = (id) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === id ? { ...q, completed: !q.completed } : q))
    );
    toast.success("Quest progress updated");
  };

  const nextGratitudePrompt = () => {
    setGratitudeIndex((prev) => (prev + 1) % gratitudePrompts.length);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#FFFDF8]">
        <div className="flex items-center gap-3 text-sm text-[#77716B]">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-[#7C6CF2]" />
          <span>Opening wellness sanctuary...</span>
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
            <button onClick={() => navigate("/dashboard")} className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#77716B] hover:bg-[#F7F5F0]">
              <Compass size={18} /> Sanctuary Hub
            </button>
            <button onClick={() => navigate("/reflections")} className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#77716B] hover:bg-[#F7F5F0]">
              <FileText size={18} /> Reflections Vault
            </button>
            <button onClick={() => navigate("/wellness-arcade")} className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium bg-[#F0EDFF] text-[#6657D8]">
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
            {/* Added About Link Here */}
            <button onClick={() => navigate("/about")} className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#77716B] hover:bg-[#F7F5F0]">
              <Info size={18} /> About NoteVault
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
                    <button onClick={() => navigate("/dashboard")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#77716B] hover:bg-[#F7F5F0]"><Compass size={18} /> Sanctuary Hub</button>
                    <button onClick={() => navigate("/reflections")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#77716B] hover:bg-[#F7F5F0]"><FileText size={18} /> Reflections Vault</button>
                    <button onClick={() => navigate("/wellness-arcade")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium bg-[#F0EDFF] text-[#6657D8]"><Sparkles size={18} /> Wellness Arcade</button>
                    <button onClick={() => navigate("/trash")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#77716B] hover:bg-[#F7F5F0]"><Trash2 size={18} /> Trash</button>
                    <button onClick={() => navigate("/resources")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#77716B] hover:bg-[#F7F5F0]"><BookOpen size={18} /> Wellness Resources</button>
                    <button onClick={() => navigate("/settings")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#77716B] hover:bg-[#F7F5F0]"><Settings size={18} /> Settings</button>
                    {/* Added About Link in Mobile Menu */}
                    <button onClick={() => navigate("/about")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#77716B] hover:bg-[#F7F5F0]"><Info size={18} /> About NoteVault</button>
                    <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#A35A62] hover:bg-[#FFF0F1]"><LogOut size={18} /> Logout</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Header */}
          <header className="flex flex-col gap-2">
            <p className="text-sm font-medium text-[#8C857D]">Interactive Decompression</p>
            <h1 className="text-4xl font-bold tracking-tight text-[#292726] md:text-5xl">Wellness Arcade</h1>
            <p className="text-sm text-[#77716B]">Engage in science-backed mini-activities designed to lower stress, build resilience, and ground your focus.</p>
          </header>

          {/* Main Area: Game Selector vs Active Game */}
          <div className="mt-8">
            {gameLoading ? (
              <div className="flex min-h-[350px] items-center justify-center rounded-[32px] border border-[#E7E2D9] bg-white/60">
                <div className="flex items-center gap-3 text-sm text-[#77716B]">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-[#7C6CF2]" />
                  <span>Loading activity module...</span>
                </div>
              </div>
            ) : activeGame === null ? (
              <div className="grid gap-6 md:grid-cols-3">
                {/* Game Card 1 */}
                <div className="group relative flex flex-col justify-between rounded-[28px] border border-[#F5E79B] bg-[#FFF4B8] p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-[#9A7B00] shadow-sm"><Wind size={22} /></div>
                    <h2 className="mt-5 text-xl font-bold text-[#302D2A]">Quiet Space Pod</h2>
                    <p className="mt-2 text-sm leading-6 text-[#625B54]">A guided sensory breathing exercise to ground your focus and reduce physical tension instantly.</p>
                  </div>
                  <button onClick={() => selectGame("breathing")} className="mt-7 flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-white/80 py-3 text-sm font-semibold text-[#9A7B00] shadow-sm transition hover:bg-white">
                    <Play size={16} /> Launch Pod
                  </button>
                </div>

                {/* Game Card 2 */}
                <div className="group relative flex flex-col justify-between rounded-[28px] border border-[#AEE7F5] bg-[#CFF4FF] p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-[#08758E] shadow-sm"><Award size={22} /></div>
                    <h2 className="mt-5 text-xl font-bold text-[#302D2A]">Micro-Resilience Quests</h2>
                    <p className="mt-2 text-sm leading-6 text-[#625B54]">Complete small, positive daily self-care actions inspired by psychological resilience frameworks.</p>
                  </div>
                  <button onClick={() => selectGame("quests")} className="mt-7 flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-white/80 py-3 text-sm font-semibold text-[#08758E] shadow-sm transition hover:bg-white">
                    <Play size={16} /> Open Quests
                  </button>
                </div>

                {/* Game Card 3 */}
                <div className="group relative flex flex-col justify-between rounded-[28px] border border-[#F7BED5] bg-[#FFDDEB] p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-[#A63D67] shadow-sm"><Sparkles size={22} /></div>
                    <h2 className="mt-5 text-xl font-bold text-[#302D2A]">Gratitude Scavenger Hunt</h2>
                    <p className="mt-2 text-sm leading-6 text-[#625B54]">Explore your immediate physical surroundings through mindful prompts that break rumination.</p>
                  </div>
                  <button onClick={() => selectGame("gratitude")} className="mt-7 flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-white/80 py-3 text-sm font-semibold text-[#A63D67] shadow-sm transition hover:bg-white">
                    <Play size={16} /> Start Hunt
                  </button>
                </div>
              </div>
            ) : (
              /* Active Game Renderer */
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-[#E7E2D9] bg-white p-7 shadow-sm md:p-10">
                <button onClick={() => { stopBreathingSession(); setActiveGame(null); }} className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#7C6CF2] transition hover:opacity-80">
                  <ArrowLeft size={17} /> Back to Arcade
                </button>

                {/* GAME 1: BREATHING POD */}
                {activeGame === "breathing" && (
                  <div className="mt-8 flex flex-col items-center text-center">
                    <h2 className="text-2xl font-bold text-[#302D2A]">Quiet Space Breathing Pod</h2>
                    <p className="mt-2 text-sm text-[#77716B]">Follow the rhythm of the circle. Inhale as it expands, hold, and exhale as it contracts.</p>

                    <div className="relative my-12 flex h-60 w-60 items-center justify-center rounded-full bg-[#F0EDFF]">
                      <motion.div
                        animate={{
                          scale: breathState === "Inhale" ? 1.35 : breathState === "Exhale" ? 0.85 : 1.1,
                          backgroundColor: breathState === "Inhale" ? "#7C6CF2" : breathState === "Hold" ? "#A397F7" : "#B8AEF8",
                        }}
                        transition={{ duration: 4, ease: "easeInOut" }}
                        className="absolute h-40 w-40 rounded-full shadow-lg"
                      />
                      <div className="relative z-10 text-white">
                        <p className="text-xs font-semibold uppercase tracking-widest">{breathState}</p>
                        <p className="mt-1 text-3xl font-black">{breathState === "Ready" ? "-" : breathTimer}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {breathState === "Ready" ? (
                        <button onClick={startBreathingSession} className="cursor-pointer rounded-2xl bg-[#7C6CF2] px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-[#6E5EE5]">
                          Start Session
                        </button>
                      ) : (
                        <button onClick={stopBreathingSession} className="cursor-pointer rounded-2xl border border-[#E7E2D9] bg-white px-6 py-3.5 text-sm font-semibold text-[#77716B] hover:bg-[#F7F5F0]">
                          Stop Session
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* GAME 2: SUPERBETTER MICRO-QUESTS */}
                {activeGame === "quests" && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-[#302D2A]">Micro-Resilience Quests</h2>
                        <p className="mt-1 text-sm text-[#77716B]">Check off small actions to build psychological momentum and emotional energy.</p>
                      </div>
                      <span className="rounded-full bg-[#EAFBF7] px-4 py-1.5 text-xs font-semibold text-[#1B8062]">
                        {quests.filter((q) => q.completed).length} / {quests.length} Completed
                      </span>
                    </div>

                    <div className="mt-8 space-y-3">
                      {quests.map((quest) => (
                        <div key={quest.id} onClick={() => toggleQuestCompletion(quest.id)} className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition ${quest.completed ? "border-[#C7E9DF] bg-[#F4FBF9]" : "border-[#EFEAE2] bg-[#FAFAF7] hover:border-[#DCD5C9]"}`}>
                          <div className="flex items-center gap-3">
                            <div className={`flex h-6 w-6 items-center justify-center rounded-lg border transition ${quest.completed ? "border-[#1B8062] bg-[#1B8062] text-white" : "border-[#C4BFA6] bg-white"}`}>
                              {quest.completed && <CheckCircle2 size={16} />}
                            </div>
                            <span className={`text-sm font-medium ${quest.completed ? "text-[#77716B] line-through" : "text-[#302D2A]"}`}>{quest.title}</span>
                          </div>
                          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#77716B] border border-[#EFEAE2]">{quest.category}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* GAME 3: GRATITUDE SCAVENGER HUNT */}
                {activeGame === "gratitude" && (
                  <div className="mt-6 flex flex-col items-center text-center">
                    <h2 className="text-2xl font-bold text-[#302D2A]">Gratitude Scavenger Hunt</h2>
                    <p className="mt-2 text-sm text-[#77716B]">Shift focus away from internal stress by grounding yourself in your immediate environment.</p>

                    <div className="my-10 w-full max-w-lg rounded-[28px] border border-[#F7BED5] bg-[#FFDDEB]/40 p-8 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#A63D67]">Prompt Challenge</p>
                      <p className="mt-4 text-lg font-medium leading-8 text-[#302D2A]">{gratitudePrompts[gratitudeIndex]}</p>
                    </div>

                    <button onClick={nextGratitudePrompt} className="flex cursor-pointer items-center gap-2 rounded-2xl bg-[#A63D67] px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-[#94335A]">
                      <RefreshCw size={17} /> Next Challenge
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default WellnessArcade;