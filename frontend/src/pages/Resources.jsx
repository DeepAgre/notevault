import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  PhoneCall, 
  Globe, 
  BookOpen, 
  ShieldCheck, 
  Compass, 
  Sparkles, 
  Trash2, 
  Settings, 
  Info, 
  LogOut, 
  Menu, 
  X 
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

function Resources() {
  const [stats, setStats] = useState({ trash_notes: 0 });
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
            <button onClick={() => navigate("/resources")} className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium bg-[#F0EDFF] text-[#6657D8]">
              <BookOpen size={18} /> Wellness Resources
            </button>
            <button onClick={() => navigate("/settings")} className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#77716B] hover:bg-[#F7F5F0]">
              <Settings size={18} /> Settings
            </button>
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
                    <button onClick={() => navigate("/wellness-arcade")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#77716B] hover:bg-[#F7F5F0]"><Sparkles size={18} /> Wellness Arcade</button>
                    <button onClick={() => navigate("/trash")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#77716B] hover:bg-[#F7F5F0]"><Trash2 size={18} /> Trash ({stats.trash_notes})</button>
                    <button onClick={() => navigate("/resources")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium bg-[#F0EDFF] text-[#6657D8]"><BookOpen size={18} /> Wellness Resources</button>
                    <button onClick={() => navigate("/settings")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#77716B] hover:bg-[#F7F5F0]"><Settings size={18} /> Settings</button>
                    <button onClick={() => navigate("/about")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#77716B] hover:bg-[#F7F5F0]"><Info size={18} /> About NoteVault</button>
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
                Support & Mental Well-being
              </p>
              <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-[#302D2A]">
                Wellness & Professional Guidance
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-[#77716B]">
                Evidence-based strategies for overcoming academic burnout, managing loneliness, and building sustainable daily mental habits. Verified government resources and crisis contacts are included below.
              </p>
            </div>

            {/* Main Content Sections */}
            <div className="space-y-12">
              {/* Section 1: Academic Burnout */}
              <section className="border-b border-[#EFEAE0] pb-10">
                <h2 className="text-xl font-bold text-[#302D2A] flex items-center gap-2.5">
                  <BookOpen size={20} className="text-[#7C6CF2]" />
                  Navigating Academic Burnout & Exhaustion
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#625B54]">
                  Burnout occurs when chronic academic or personal stress depletes your emotional resilience. It is not a failure of character or work ethic. To combat burnout effectively, practice micro-pacing: break complex coding tasks or study blocks into small, manageable 15-minute intervals. Remember that sustainable output relies entirely on consistent rest.
                </p>
              </section>

              {/* Section 2: Combating Loneliness */}
              <section className="border-b border-[#EFEAE0] pb-10">
                <h2 className="text-xl font-bold text-[#302D2A] flex items-center gap-2.5">
                  <ShieldCheck size={20} className="text-[#52B788]" />
                  Coping with Isolation During Intense Study Periods
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#625B54]">
                  Spending long hours isolated behind a screen can intensify feelings of anxiety and detachment. When reaching out feels overwhelming, start with low-pressure actions: step outside for daylight exposure, send a brief, casual message to a peer, or offload heavy thoughts into NoteVault's guided journal to process them objectively.
                </p>
              </section>

              {/* Section 3: Official Indian Government Mental Health Helplines */}
              <section className="border-b border-[#EFEAE0] pb-10">
                <h2 className="text-xl font-bold text-[#302D2A] flex items-center gap-2.5">
                  <PhoneCall size={20} className="text-[#C58B16]" />
                  Official Government Helplines (India)
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#625B54]">
                  If you or someone you know is experiencing overwhelming emotional distress, professional support from the Government of India is available 24/7, completely free and confidential:
                </p>
                
                <div className="mt-6 space-y-4">
                  <div className="pl-4 border-l-2 border-[#7C6CF2]">
                    <h3 className="text-sm font-bold text-[#302D2A]">Tele-MANAS (Ministry of Health and Family Welfare)</h3>
                    <p className="text-sm font-semibold text-[#7C6CF2] mt-0.5">Toll-Free Helpline: 14416 or 1-800-891-4416</p>
                    <p className="text-xs text-[#77716B] mt-1">Provides 24/7 free tele-mental health counseling and psychological support across India.</p>
                  </div>

                  <div className="pl-4 border-l-2 border-[#52B788]">
                    <h3 className="text-sm font-bold text-[#302D2A]">KIRAN (Ministry of Social Justice and Empowerment)</h3>
                    <p className="text-sm font-semibold text-[#52B788] mt-0.5">Toll-Free Helpline: 1800-599-0019</p>
                    <p className="text-xs text-[#77716B] mt-1">Mental health rehabilitation helpline offering early screening, psychological first-aid, and distress management.</p>
                  </div>
                </div>
              </section>

              {/* Section 4: Recommended Articles & Reading */}
              <section className="pb-6">
                <h2 className="text-xl font-bold text-[#302D2A] flex items-center gap-2.5">
                  <Globe size={20} className="text-[#1685A0]" />
                  Verified Articles & Digital Reading
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#625B54]">
                  Explore these trusted external platforms for deeper psychological insights and research-backed self-care techniques:
                </p>
                
                <ul className="mt-4 space-y-3 text-sm text-[#7C6CF2]">
                  <li>
                    <a href="https://www.nimhans.ac.in" target="_blank" rel="noopener noreferrer" className="hover:underline font-medium">
                      → National Institute of Mental Health and Neurosciences (NIMHANS) Portal
                    </a>
                  </li>
                  <li>
                    <a href="https://telemanas.mohfw.gov.in" target="_blank" rel="noopener noreferrer" className="hover:underline font-medium">
                      → Tele-MANAS Official Digital Wellness Hub
                    </a>
                  </li>
                  <li>
                    <a href="https://www.who.int/health-topics/mental-health" target="_blank" rel="noopener noreferrer" className="hover:underline font-medium">
                      → World Health Organization (WHO) Mental Health Advisory Articles
                    </a>
                  </li>
                </ul>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Resources;