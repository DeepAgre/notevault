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
        if (response.data && response.data.stats) {
          setStats(response.data.stats);
        }
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

          <div className="mx-auto max-w-3xl pt-2">
            {/* Page Header */}
            <div className="mb-14">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7C6CF2]">
                About NoteVault
              </p>
              <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-[#302D2A]">
                A Safe Sanctuary for Your Mind
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-[#77716B]">
                NoteVault was created to be more than just a note-taking tool—it is a digital decompression chamber designed to help you process heavy thoughts, reduce anxiety, and honor your emotional pace.
              </p>
            </div>

            {/* Main Content Sections */}
            <div className="space-y-12">
              {/* Section 1: Why We Built NoteVault */}
              <section className="border-b border-[#EFEAE0] pb-10">
                <h2 className="text-xl font-bold text-[#302D2A] flex items-center gap-2.5">
                  <Heart size={20} className="text-[#116466]" />
                  Why We Built NoteVault
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#625B54]">
                  In a world driven by constant productivity, deadlines, and digital noise, mental fatigue and silent burnout have become normal. Traditional note-taking apps are built for raw storage and task management, often making you feel pressured to be constantly "on."
                </p>
                <p className="mt-4 text-sm leading-7 text-[#625B54]">
                  We built NoteVault to shift that paradigm. It provides a judgment-free, beautifully quiet container where your reflections are treated with care. Whether you are sorting through burnout, unpacking complex emotions, or looking for a moment of calm, NoteVault acts as your personal emotional anchor.
                </p>
              </section>

              {/* Section 2: What Makes NoteVault Unique */}
              <section className="border-b border-[#EFEAE0] pb-10">
                <h2 className="text-xl font-bold text-[#302D2A] flex items-center gap-2.5">
                  <Sparkles size={20} className="text-[#7C6CF2]" />
                  What Makes NoteVault Unique
                </h2>
                <div className="mt-6 space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-[#302D2A] flex items-center gap-2">
                      <Compass size={16} className="text-[#116466]" /> Guided Decompression
                    </h3>
                    <p className="text-xs text-[#77716B] mt-1 leading-6">
                      Our guided reflection flow helps break down heavy thoughts into manageable perspectives and tiny, kind self-care steps.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#302D2A] flex items-center gap-2">
                      <Sparkles size={16} className="text-[#9A7B00]" /> Wellness Arcade
                    </h3>
                    <p className="text-xs text-[#77716B] mt-1 leading-6">
                      Interactive breathing pods, micro-resilience quests, and gratitude prompts to instantly shift focus away from anxiety.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#302D2A] flex items-center gap-2">
                      <Shield size={16} className="text-[#6D4AA0]" /> Private & Secure
                    </h3>
                    <p className="text-xs text-[#77716B] mt-1 leading-6">
                      Your thoughts belong to you alone. Protected with secure JWT authentication and isolated data structures for complete peace of mind.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 3: How It Works */}
              <section className="pb-6">
                <h2 className="text-xl font-bold text-[#302D2A] flex items-center gap-2.5">
                  <BookOpen size={20} className="text-[#C58B16]" />
                  How It Works
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#625B54]">
                  Get started with your personal sanctuary in three simple steps:
                </p>

                <div className="mt-6 space-y-4">
                  <div className="pl-4 border-l-2 border-[#7C6CF2]">
                    <h3 className="text-sm font-bold text-[#302D2A]">1. Check Into Your Sanctuary Hub</h3>
                    <p className="text-xs text-[#77716B] mt-1">View your active writing streaks, stream global background soundscapes (Rainfall or Forest), and check your emotional spectrum scale.</p>
                  </div>

                  <div className="pl-4 border-l-2 border-[#52B788]">
                    <h3 className="text-sm font-bold text-[#302D2A]">2. Log or Reflect Freely</h3>
                    <p className="text-xs text-[#77716B] mt-1">Use either our structured Guided Decompression format or free-form journaling to capture whatever is on your mind.</p>
                  </div>

                  <div className="pl-4 border-l-2 border-[#C58B16]">
                    <h3 className="text-sm font-bold text-[#302D2A]">3. Engage with the Wellness Arcade</h3>
                    <p className="text-xs text-[#77716B] mt-1">Take a breather in our interactive pacing pod or tackle micro-quests whenever you need an emotional reset.</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default About;