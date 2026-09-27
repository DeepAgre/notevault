import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  UserRound,
  Database,
  LogOut,
  ChevronRight,
  FileText,
  X,
  Compass,
  Sparkles,
  Trash2,
  BookOpen,
  Settings as SettingsIcon,
  Info,
  Menu,
} from "lucide-react";
import api from "../services/api";
import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
} from "docx";
import toast from "react-hot-toast";

function Settings() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ trash_notes: 0 });
  const [loading, setLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const mobileMenuRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out");
    navigate("/", { replace: true });
  };

  const handleExportNotes = () => {
    setShowExportModal(true);
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

  const exportNotes = async (format) => {
    try {
      setExporting(true);

      const response = await api.get("/notes");
      const notes = response.data;

      if (format === "txt") {
        const text = [
          "NoteVault",
          "==============================",
          "",
          `Exported: ${new Date().toLocaleString()}`,
          "",
          ...notes.map((note, index) => [
            "------------------------------",
            "",
            `NOTE ${index + 1}`,
            `Title: ${note.title}`,
            `Created: ${new Date(note.created_at).toLocaleString()}`,
            `Updated: ${new Date(note.updated_at).toLocaleString()}`,
            `Pinned: ${note.pinned ? "Yes" : "No"}`,
            `Favorite: ${note.favorite ? "Yes" : "No"}`,
            "",
            "Content:",
            note.content,
            "",
          ].join("\n")),
        ].join("\n");

        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "notevault-notes.txt";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      if (format === "json") {
        const exportData = {
          exported_at: new Date().toISOString(),
          notes: notes,
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "notevault-notes.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      if (format === "docx") {
        const children = [
          new Paragraph({
            text: "NoteVault",
            heading: HeadingLevel.TITLE,
          }),
          new Paragraph({
            text: `Exported: ${new Date().toLocaleString()}`,
          }),
          new Paragraph({
            text: "",
          }),
        ];

        notes.forEach((note, index) => {
          children.push(
            new Paragraph({
              text: `Note ${index + 1}: ${note.title}`,
              heading: HeadingLevel.HEADING_1,
            })
          );
          children.push(
            new Paragraph({
              text: `Created: ${new Date(note.created_at).toLocaleString()}`,
            })
          );
          children.push(
            new Paragraph({
              text: `Updated: ${new Date(note.updated_at).toLocaleString()}`,
            })
          );
          children.push(
            new Paragraph({
              text: `Pinned: ${note.pinned ? "Yes" : "No"}`
            })
          );
          children.push(
            new Paragraph({
              text: `Favorite: ${note.favorite ? "Yes" : "No"}`
            })
          );
          children.push(
            new Paragraph({
              text: ""
            })
          );
          children.push(
            new Paragraph({
              text: note.content
            })
          );
          children.push(
            new Paragraph({
              text: ""
            })
          );
        });

        const doc = new Document({
          sections: [{ children }],
        });

        const blob = await Packer.toBlob(doc);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "notevault-notes.docx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      setShowExportModal(false);
      toast.success("Notes exported successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to export notes");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    const fetchProfileAndStats = async () => {
      try {
        const profileRes = await api.get("/profile");
        setProfile(profileRes.data);
        const dashRes = await api.get("/dashboard");
        if (dashRes.data && dashRes.data.stats) {
          setStats(dashRes.data.stats);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndStats();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#FFFDF8]">
        <div className="flex items-center gap-3 text-sm text-[#77716B]">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-[#7C6CF2]" />
          <span>Loading your settings...</span>
        </div>
      </div>
    );
  }

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
            <button onClick={() => navigate("/settings")} className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium bg-[#F0EDFF] text-[#6657D8]">
              <SettingsIcon size={18} /> Settings
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
                    <button onClick={() => navigate("/resources")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#77716B] hover:bg-[#F7F5F0]"><BookOpen size={18} /> Wellness Resources</button>
                    <button onClick={() => navigate("/settings")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium bg-[#F0EDFF] text-[#6657D8]"><SettingsIcon size={18} /> Settings</button>
                    <button onClick={() => navigate("/about")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#77716B] hover:bg-[#F7F5F0]"><Info size={18} /> About NoteVault</button>
                    <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#A35A62] hover:bg-[#FFF0F1]"><LogOut size={18} /> Logout</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mx-auto max-w-4xl pt-2">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-[#7C6CF2]" />
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7C6CF2]">Account</p>
              </div>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#302D2A] md:text-5xl">Settings</h1>
              <p className="mt-3 max-w-xl text-[#77716B]">Manage your NoteVault account and preferences.</p>
            </motion.div>

            {/* Profile */}
            <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-10 overflow-hidden rounded-3xl border border-[#EEE9E1] bg-white shadow-sm">
              <div className="border-b border-[#EEE9E1] p-6 md:p-8">
                <div className="flex items-center gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#F0EDFF] text-2xl font-bold text-[#6657D8] ring-1 ring-[#DDD6FA]">
                    {profile?.username?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <UserRound size={18} className="text-[#7C6CF2]" />
                      <h2 className="text-xl font-semibold text-[#302D2A]">Profile</h2>
                    </div>
                    <p className="mt-1 text-sm text-[#77716B]">Your account information</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-px bg-[#EEE9E1] md:grid-cols-2">
                <div className="bg-white p-6 transition-colors hover:bg-[#FFFEFC] md:p-8">
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#A19A92]">Username</p>
                  <p className="mt-3 break-all text-lg font-medium text-[#3C3834]">{loading ? "Loading..." : profile?.username || "—"}</p>
                </div>
                <div className="bg-white p-6 md:p-8">
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#A19A92]">Email</p>
                  <p className="mt-3 break-all text-lg font-medium text-[#3C3834]">{loading ? "Loading..." : profile?.email || "—"}</p>
                </div>
              </div>
            </motion.section>

            {/* Data */}
            <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6 rounded-3xl border border-[#EEE9E1] bg-white p-6 shadow-sm md:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0EDFF] text-[#6657D8]">
                  <Database size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Data</h2>
                  <p className="mt-1 text-sm text-[#77716B]">Manage your notes and stored data.</p>
                </div>
              </div>

              <div className="mt-7 space-y-3">
                <button type="button" onClick={handleExportNotes} className="flex w-full cursor-pointer items-center justify-between rounded-2xl border border-[#EEE9E1] bg-[#FCFBF8] p-5 text-left transition hover:border-[#D8D1FA] hover:bg-[#F7F5FF]">
                  <div>
                    <p className="font-medium text-[#3C3834]">Export notes</p>
                    <p className="mt-1 text-sm text-slate-500">Download a copy of your notes.</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-400" />
                </button>

                <button type="button" onClick={() => navigate("/trash")} className="flex w-full cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:border-[#E8D5D8] hover:bg-[#FFF7F8]">
                  <div>
                    <p className="font-medium text-[#3C3834]">Trash</p>
                    <p className="mt-1 text-sm text-slate-500">View and restore deleted notes.</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-400" />
                </button>
              </div>
            </motion.section>

            {/* Account Actions */}
            <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-6 rounded-3xl border border-red-100 bg-white p-6 shadow-sm md:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-500">
                  <LogOut size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Account</h2>
                  <p className="mt-1 text-sm text-slate-500">Manage your current session.</p>
                </div>
              </div>

              <div className="mt-7">
                <button type="button" onClick={handleLogout} className="flex w-full cursor-pointer items-center justify-between rounded-2xl border border-red-100 bg-red-50 p-5 text-left transition hover:border-red-200 hover:bg-red-100">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-red-500 shadow-sm">
                      <LogOut size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-red-700">Log out</p>
                      <p className="mt-1 text-sm text-red-500/70">Sign out of your NoteVault account.</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-red-400" />
                </button>
              </div>
            </motion.section>

            {/* About */}
            <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-600">NoteVault</p>
              <h2 className="mt-3 text-2xl font-semibold">Your thoughts, organized.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">A simple and elegant space to capture, organize and manage your ideas.</p>
              <div className="mt-7 border-t border-slate-200 pt-5">
                <p className="text-xs text-slate-400">NoteVault • Version 1.0</p>
              </div>
            </motion.section>
          </div>
        </main>
      </div>

      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3D3940]/30 p-4 backdrop-blur-sm" onClick={() => !exporting && setShowExportModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-[30px] border border-[#EEE9E1] bg-white p-7 shadow-2xl md:p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7C6CF2]">Export</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">Export your notes</h2>
                <p className="mt-2 text-sm text-slate-500">Choose a format for your notes.</p>
              </div>
              <button onClick={() => setShowExportModal(false)} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200">
                <X size={17} />
              </button>
            </div>

            <div className="mt-7 space-y-3">
              <button disabled={exporting} onClick={() => exportNotes("txt")} className="group flex w-full cursor-pointer items-center justify-between rounded-2xl border border-[#EEE9E1] bg-[#FCFBF8] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#D8D1FA] hover:bg-[#F7F5FF] hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0EDFF] text-[#6657D8]">
                    <FileText size={19} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#3C3834]">Text file</p>
                    <p className="mt-1 text-sm text-[#8C857D]">.txt — Easy to read anywhere</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[#B0AAA2] transition-transform group-hover:translate-x-0.5" />
              </button>

              <button disabled={exporting} onClick={() => exportNotes("docx")} className="group flex w-full cursor-pointer items-center justify-between rounded-2xl border border-[#EEE9E1] bg-[#FCFBF8] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#D8D1FA] hover:bg-[#F7F5FF] hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0EDFF] text-[#6657D8]">
                    <FileText size={19} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#3C3834]">Word document</p>
                    <p className="mt-1 text-sm text-[#8C857D]">.docx — Best for editing</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[#B0AAA2] transition-transform group-hover:translate-x-0.5" />
              </button>

              <button disabled={exporting} onClick={() => exportNotes("json")} className="group flex w-full cursor-pointer items-center justify-between rounded-2xl border border-[#EEE9E1] bg-[#FCFBF8] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#D8D1FA] hover:bg-[#F7F5FF] hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0EDFF] text-[#6657D8]">
                    <Database size={19} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#3C3834]">JSON backup</p>
                    <p className="mt-1 text-sm text-[#8C857D]">.json — Best for data backup</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[#B0AAA2] transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={() => setShowExportModal(false)} className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100">
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Settings;