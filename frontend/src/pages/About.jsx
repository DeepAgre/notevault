import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Compass,
  FileText,
  Sparkles,
  Heart,
  Shield,
  Trash2,
  BookOpen,
  Settings,
  Info,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

function About() {
  const [stats, setStats] = useState({ total_notes: 0, trash_notes: 0 });
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out");
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
    const loadStats = async () => {
      try {
        const response = await api.get("/dashboard");
        setStats(response.data.stats);
      } catch (error) {
        console.error(error);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#292726] pb-20">
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
            <button onClick={() => navigate("/about")} className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium bg-[#F0EDFF] text-[#6657D8]">
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
                    <button onClick={() => navigate("/wellness-arcade")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#77716B] hover:bg-[#F7F5F0]"><Sparkles size={18} /> Wellness Arcade</button>
                    <button onClick={() => navigate("/trash")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#77716B] hover:bg-[#F7F5F0]"><Trash2 size={18} /> Trash ({stats.trash_notes})</button>
                    <button onClick={() => navigate("/resources")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#77716B] hover:bg-[#F7F5F0]"><BookOpen size={18} /> Wellness Resources</button>
                    <button onClick={() => navigate("/settings")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#77716B] hover:bg-[#F7F5F0]"><Settings size={18} /> Settings</button>
                    <button onClick={() => navigate("/about")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium bg-[#F0EDFF] text-[#6657D8]"><Info size={18} /> About NoteVault</button>
                    <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#A35A62] hover:bg-[#FFF0F1]"><LogOut size={18} /> Logout</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mx-auto max-w-4xl">
            {/* Title Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center pt-2"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-[#F0EDFF] px-4 py-1.5 text-xs font-bold text-[#6657D8] mb-4">
                <Sparkles size={14} /> The NoteVault Philosophy
              </div>
              <h1 className="text-4xl font-black tracking-tight text-[#292726] md:text-5xl">
                A Safe Sanctuary for Your Mind
              </h1>
              <p className="mt-4 text-base leading-relaxed text-[#77716B] max-w-2xl mx-auto">
                NoteVault was created to be more than just a note-taking tool—it is a digital decompression chamber designed to help you process heavy thoughts, reduce anxiety, and honor your emotional pace.
              </p>
            </motion.div>

            {/* Why We Made It */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-16 rounded-[32px] border border-[#E7E2D9] bg-white p-8 shadow-sm md:p-10"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F8F5] text-[#116466]">
                  <Heart size={22} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#302D2A]">Why We Built NoteVault</h2>
                  <p className="text-sm text-[#77716B]">The purpose behind the platform</p>
                </div>
              </div>
              <p className="mt-6 text-sm leading-8 text-[#514B45]">
                In a world driven by constant productivity, deadlines, and digital noise, mental fatigue and silent burnout have become normal. Traditional note-taking apps are built for raw storage and task management, often making you feel pressured to be constantly "on." 
              </p>
              <p className="mt-4 text-sm leading-8 text-[#514B45]">
                We built NoteVault to shift that paradigm. It provides a judgment-free, beautifully quiet container where your reflections are treated with care. Whether you are sorting through burnout, unpacking complex emotions, or looking for a moment of calm, NoteVault acts as your personal emotional anchor.
              </p>
            </motion.section>

            {/* Core Features Grid */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-12"
            >
              <h2 className="text-2xl font-bold text-[#302D2A] text-center mb-8">What Makes NoteVault Unique</h2>
              
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-[28px] border border-[#BEE3DB] bg-[#E8F8F5]/50 p-7">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#116466] shadow-sm mb-5">
                    <Compass size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-[#302D2A]">Guided Decompression</h3>
                  <p className="mt-2 text-sm leading-6 text-[#52796F]">
                    Our guided reflection flow helps break down heavy thoughts into manageable perspectives and tiny, kind self-care steps.
                  </p>
                </div>

                <div className="rounded-[28px] border border-[#F5E79B] bg-[#FFFDEB]/50 p-7">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#9A7B00] shadow-sm mb-5">
                    <Sparkles size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-[#302D2A]">Wellness Arcade</h3>
                  <p className="mt-2 text-sm leading-6 text-[#7E6922]">
                    Interactive breathing pods, micro-resilience quests (inspired by SuperBetter), and gratitude prompts to instantly shift focus away from anxiety.
                  </p>
                </div>

                <div className="rounded-[28px] border border-[#D5C4F4] bg-[#E9DEFF]/50 p-7">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#6D4AA0] shadow-sm mb-5">
                    <Shield size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-[#302D2A]">Private & Secure</h3>
                  <p className="mt-2 text-sm leading-6 text-[#5E4785]">
                    Your thoughts belong to you alone. Protected with secure JWT authentication and isolated data structures for complete peace of mind.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* How It Works */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-12 rounded-[32px] border border-[#E7E2D9] bg-white p-8 shadow-sm md:p-10"
            >
              <h2 className="text-2xl font-bold text-[#302D2A]">How It Works</h2>
              <div className="mt-6 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F0EDFF] text-xs font-bold text-[#7C6CF2]">1</div>
                  <div>
                    <h3 className="text-sm font-bold text-[#302D2A]">Check Into Your Sanctuary Hub</h3>
                    <p className="mt-1 text-sm text-[#77716B]">View your active writing streaks, stream global background soundscapes (Rainfall or Forest), and check your emotional spectrum scale.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F0EDFF] text-xs font-bold text-[#7C6CF2]">2</div>
                  <div>
                    <h3 className="text-sm font-bold text-[#302D2A]">Log or Reflect Freely</h3>
                    <p className="mt-1 text-sm text-[#77716B]">Use either our structured Guided Decompression format or free-form journaling to capture whatever is on your mind.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F0EDFF] text-xs font-bold text-[#7C6CF2]">3</div>
                  <div>
                    <h3 className="text-sm font-bold text-[#302D2A]">Engage with the Wellness Arcade</h3>
                    <p className="mt-1 text-sm text-[#77716B]">Take a breather in our interactive pacing pod or tackle micro-quests whenever you need an emotional reset.</p>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default About;