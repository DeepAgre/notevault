import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  ChevronDown,
  FileText,
  Heart,
  LogOut,
  Menu,
  MoreHorizontal,
  Pencil,
  Pin,
  Plus,
  Search,
  Settings,
  Trash2,
  X,
  Share2,
  BookOpen,
  Compass,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

const NOTE_COLORS = [
  { card: "bg-[#FFF4B8]", border: "border-[#F5E79B]", accent: "text-[#9A7B00]" },
  { card: "bg-[#CFF4FF]", border: "border-[#AEE7F5]", accent: "text-[#08758E]" },
  { card: "bg-[#FFDDEB]", border: "border-[#F7BED5]", accent: "text-[#A63D67]" },
  { card: "bg-[#DDF7D8]", border: "border-[#BFE8B9]", accent: "text-[#397A35]" },
  { card: "bg-[#E9DEFF]", border: "border-[#D5C4F4]", accent: "text-[#6D4AA0]" },
];

function Reflections() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingNote, setSavingNote] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [viewingNote, setViewingNote] = useState(null);
  const [noteToShare, setNoteToShare] = useState(null);
  const [shareRecipient, setShareRecipient] = useState("");
  const [sharing, setSharing] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [writeMode, setWriteMode] = useState("guided");

  const [situation, setSituation] = useState("");
  const [negativeThought, setNegativeThought] = useState("");
  const [reframing, setReframing] = useState("");
  const [actionPlan, setActionPlan] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [activeFilter, setActiveFilter] = useState("all");

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const mobileMenuRef = useRef(null);
  const [noteToDelete, setNoteToDelete] = useState(null);

  const [stats, setStats] = useState({ total_notes: 0, favorite_notes: 0, pinned_notes: 0, trash_notes: 0 });
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
    const loadReflections = async () => {
      try {
        const response = await api.get("/dashboard");
        setNotes(response.data.notes);
        setStats(response.data.stats);
      } catch (error) {
        console.log(error);
        toast.error("Failed to load reflections archive");
      } finally {
        setLoading(false);
      }
    };
    loadReflections();
  }, []);

  const resetEditor = () => {
    setShowModal(false);
    setEditingNoteId(null);
    setTitle("");
    setContent("");
    setSituation("");
    setNegativeThought("");
    setReframing("");
    setActionPlan("");
    setWriteMode("guided");
    setSavingNote(false);
  };

  const openCreateModal = () => {
    setEditingNoteId(null);
    setTitle("");
    setContent("");
    setSituation("");
    setNegativeThought("");
    setReframing("");
    setActionPlan("");
    setWriteMode("guided");
    setShowModal(true);
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

  const updateNote = async () => {
    if (savingNote) return;

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!content.trim()) {
      toast.error("Content is required");
      return;
    }

    setSavingNote(true);
    try {
      const response = await api.put(`/notes/${editingNoteId}`, { title: title.trim(), content: content.trim() });
      setNotes((prev) => prev.map((n) => (n.id === editingNoteId ? response.data : n)));
      resetEditor();
      toast.success("Reflection updated");
    } catch (error) {
      console.log(error);
      toast.error("Failed to update reflection");
    } finally {
      setSavingNote(false);
    }
  };

  const startEditing = (note) => {
    setViewingNote(null);
    setEditingNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setSituation("");
    setNegativeThought("");
    setReframing("");
    setActionPlan("");
    setShowModal(true);
  };

  const deleteNote = async (noteId) => {
    try {
      await api.delete(`/notes/${noteId}`);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      setStats((prev) => ({ ...prev, total_notes: Math.max(0, prev.total_notes - 1), trash_notes: prev.trash_notes + 1 }));
      toast.success("Moved to trash");
    } catch (error) {
      console.log(error);
      toast.error("Failed to move to trash");
    }
  };

  const togglePin = async (noteId) => {
    try {
      const response = await api.put(`/notes/${noteId}/pin`);
      setNotes((prev) => prev.map((n) => (n.id === noteId ? response.data : n)));
      setStats((prev) => ({ ...prev, pinned_notes: response.data.pinned ? prev.pinned_notes + 1 : Math.max(0, prev.pinned_notes - 1) }));
    } catch (error) {
      console.log(error);
    }
  };

  const toggleFavorite = async (noteId) => {
    try {
      const response = await api.put(`/notes/${noteId}/favorite`);
      setNotes((prev) => prev.map((n) => (n.id === noteId ? response.data : n)));
      setStats((prev) => ({ ...prev, favorite_notes: response.data.favorite ? prev.favorite_notes + 1 : Math.max(0, prev.favorite_notes - 1) }));
    } catch (error) {
      console.log(error);
    }
  };

  const shareNote = async () => {
    if (!noteToShare || sharing) return;
    if (!shareRecipient.trim()) {
      toast.error("Enter a username or email");
      return;
    }

    setSharing(true);
    try {
      const response = await api.post(`/notes/${noteToShare.id}/share`, { recipient: shareRecipient.trim() });
      toast.success(`Shared with ${response.data.recipient}`);
      setNoteToShare(null);
      setShareRecipient("");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.detail || "Failed to share reflection");
    } finally {
      setSharing(false);
    }
  };

  const filteredNotes = useMemo(() => {
    return [...notes]
      .filter((note) => {
        const search = searchQuery.toLowerCase();
        const matchesSearch = note.title.toLowerCase().includes(search) || note.content.toLowerCase().includes(search);
        const matchesFilter = activeFilter === "all" || (activeFilter === "pinned" && note.pinned) || (activeFilter === "favorite" && note.favorite);
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      });
  }, [notes, searchQuery, activeFilter, sortOrder]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#FFFDF8]">
        <div className="flex items-center gap-3 text-sm text-[#77716B]">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-[#7C6CF2]" />
          <span>Opening reflections archive...</span>
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
            <button onClick={() => navigate("/reflections")} className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium bg-[#F0EDFF] text-[#6657D8]">
              <FileText size={18} /> Reflections Vault
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
                    <button onClick={() => navigate("/dashboard")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#77716B] hover:bg-[#F7F5F0]"><Compass size={18} /> Sanctuary Hub</button>
                    <button onClick={() => navigate("/reflections")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium bg-[#F0EDFF] text-[#6657D8]"><FileText size={18} /> Reflections Vault</button>
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
              <p className="text-sm font-medium text-[#8C857D]">Archive & Search</p>
              <h1 className="mt-1 text-4xl font-bold tracking-tight text-[#292726] md:text-5xl">Reflections Vault</h1>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 sm:w-72">
                <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A7A097]" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search reflections" className="w-full rounded-2xl border border-[#E7E2D9] bg-white/80 py-3.5 pl-11 pr-4 text-sm text-[#292726] outline-none transition focus:border-[#B8AEF8] focus:ring-4 focus:ring-[#EEEAFE]" />
              </div>

              <div className="relative w-full sm:w-auto">
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-full cursor-pointer appearance-none rounded-2xl border border-[#E7E2D9] bg-white/80 px-4 py-3.5 pr-10 text-sm text-[#625E59] outline-none sm:w-auto">
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#AAA39A]" />
              </div>
            </div>
          </header>

          {/* Action Row & Filters */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button onClick={() => setActiveFilter("all")} className={`cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition ${activeFilter === "all" ? "bg-[#7C6CF2] text-white" : "bg-white border border-[#E7E2D9] text-[#77716B]"}`}>All ({stats.total_notes})</button>
              <button onClick={() => setActiveFilter("pinned")} className={`cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition ${activeFilter === "pinned" ? "bg-[#7C6CF2] text-white" : "bg-white border border-[#E7E2D9] text-[#77716B]"}`}>Pinned ({stats.pinned_notes})</button>
              <button onClick={() => setActiveFilter("favorite")} className={`cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition ${activeFilter === "favorite" ? "bg-[#7C6CF2] text-white" : "bg-white border border-[#E7E2D9] text-[#77716B]"}`}>Favorites ({stats.favorite_notes})</button>
            </div>

            <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={openCreateModal} className="flex cursor-pointer items-center gap-2 rounded-2xl bg-[#7C6CF2] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-[#7C6CF2]/20 transition hover:bg-[#6E5EE5]">
              <Plus size={18} /> New reflection
            </motion.button>
          </div>

          {/* Notes Grid */}
          <section className="mt-8">
            {filteredNotes.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-[330px] flex-col items-center justify-center rounded-[32px] border border-dashed border-[#DDD7CD] bg-white px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0EDFF] text-[#7C6CF2]"><FileText size={24} /></div>
                <h2 className="mt-5 text-lg font-semibold text-[#3C3834]">{searchQuery ? "No reflections found" : "No reflections yet"}</h2>
                {!searchQuery && (
                  <button onClick={openCreateModal} className="mt-5 flex cursor-pointer items-center gap-2 rounded-xl bg-[#7C6CF2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#6E5EE5]">
                    <Plus size={17} /> Create reflection
                  </button>
                )}
              </motion.div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredNotes.map((note, index) => {
                  const color = NOTE_COLORS[index % NOTE_COLORS.length];
                  return (
                    <motion.article key={note.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} onClick={() => setViewingNote(note)} className={`group relative flex min-h-[290px] cursor-pointer flex-col overflow-hidden rounded-[28px] border ${color.border} ${color.card} p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {note.pinned && <span className={`rounded-full bg-white/60 px-2.5 py-1 text-[11px] font-semibold ${color.accent}`}><Pin size={12} className="inline mr-1" /> Pinned</span>}
                          {note.favorite && <span className="rounded-full bg-white/60 p-1.5 text-[#C58B16]"><Heart size={13} fill="currentColor" /></span>}
                        </div>
                        <span className={`text-xs ${color.accent} opacity-70`}>{new Date(note.updated_at).toLocaleDateString()}</span>
                      </div>

                      <h2 className="mt-7 break-words text-xl font-bold leading-tight text-[#302D2A]">{note.title}</h2>
                      <p className="mt-4 line-clamp-6 text-sm leading-6 text-[#625B54]">{note.content}</p>

                      <div className="mt-auto flex items-center justify-between pt-7">
                        <button onClick={(e) => { e.stopPropagation(); togglePin(note.id); }} className={`flex h-9 w-9 items-center cursor-pointer justify-center rounded-xl bg-white/60 transition hover:bg-white ${note.pinned ? color.accent : "text-[#8B837A]"}`}><Pin size={17} fill={note.pinned ? "currentColor" : "none"} /></button>
                        <button onClick={(e) => { e.stopPropagation(); toggleFavorite(note.id); }} className={`flex h-9 w-9 items-center cursor-pointer justify-center rounded-xl bg-white/60 transition hover:bg-white ${note.favorite ? "text-[#C58B16]" : "text-[#8B837A]"}`}><Heart size={17} fill={note.favorite ? "currentColor" : "none"} /></button>
                        <button onClick={(e) => { e.stopPropagation(); startEditing(note); }} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-white/60 text-[#756E67] transition hover:bg-white"><Pencil size={16} /></button>
                        <button onClick={(e) => { e.stopPropagation(); setNoteToShare(note); }} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-white/60 text-[#756E67] transition hover:bg-white"><Share2 size={16} /></button>
                        <button onClick={(e) => { e.stopPropagation(); setNoteToDelete(note); }} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/60 text-[#A35A62] transition hover:bg-white"><Trash2 size={16} /></button>
                        <button onClick={(e) => { e.stopPropagation(); setViewingNote(note); }} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/60 text-[#756E67] transition hover:bg-white"><MoreHorizontal size={17} /></button>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* View Modal */}
      <AnimatePresence>
        {viewingNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3D3940]/30 p-4 backdrop-blur-sm" onClick={() => setViewingNote(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.97, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} onClick={(e) => e.stopPropagation()} className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-[32px] bg-white p-7 shadow-2xl md:p-10">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9B948C]">Reflection</p>
                  <h2 className="mt-3 break-words text-3xl font-bold tracking-tight text-[#302D2A]">{viewingNote.title}</h2>
                  <p className="mt-3 text-xs text-[#A19A92]">Updated {new Date(viewingNote.updated_at).toLocaleString()}</p>
                </div>
                <button onClick={() => setViewingNote(null)} className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-[#F7F5F0] text-[#77716B]"><X size={18} /></button>
              </div>
              <div className="my-8 h-px bg-[#EEEAE3]" />
              <div className="whitespace-pre-wrap break-words text-[16px] leading-8 text-[#514B45]">{viewingNote.content}</div>
              <div className="mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-[#EEEAE3] pt-6">
                <p className="text-xs text-[#A19A92]">{viewingNote.content.trim().split(/\s+/).filter(Boolean).length} words</p>
                <div className="flex gap-2">
                  <button onClick={() => startEditing(viewingNote)} className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#E3DED6] bg-white px-4 py-2.5 text-sm font-medium text-[#625E59]"><Pencil size={16} /> Edit</button>
                  <button onClick={() => setViewingNote(null)} className="cursor-pointer rounded-xl bg-[#292726] px-5 py-2.5 text-sm font-medium text-white">Close</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#3D3940]/25 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.97, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} className="w-full max-w-xl rounded-[32px] bg-white p-7 shadow-2xl md:p-9">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9B948C]">{editingNoteId ? "Edit" : "New reflection"}</p>
                  <h2 className="mt-2 text-2xl font-bold text-[#302D2A]">{editingNoteId ? "Edit reflection" : "Guided Reflection"}</h2>
                </div>
                <button onClick={resetEditor} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-[#F7F5F0] text-[#77716B]"><X size={18} /></button>
              </div>

              <div className="mt-7 space-y-5 max-h-[65vh] overflow-y-auto pr-1">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#625E59]">Title</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Give your thoughts a title" autoFocus className="w-full rounded-2xl border border-[#E5E0D8] bg-[#FCFBF8] px-4 py-3.5 text-[#302D2A] outline-none transition focus:border-[#B9AEF6] focus:ring-4 focus:ring-[#EEEAFE]" />
                </div>

                {!editingNoteId && (
                  <div className="flex items-center justify-between rounded-xl bg-[#F4F1EA] p-1.5 border border-[#E6E1D6]">
                    <button type="button" onClick={() => setWriteMode("guided")} className={`flex-1 cursor-pointer rounded-lg py-2 text-xs font-semibold transition ${writeMode === "guided" ? "bg-white text-[#302D2A] shadow-sm" : "text-[#77716B]"}`}>Guided Flow</button>
                    <button type="button" onClick={() => setWriteMode("plain")} className={`flex-1 cursor-pointer rounded-lg py-2 text-xs font-semibold transition ${writeMode === "plain" ? "bg-white text-[#302D2A] shadow-sm" : "text-[#77716B]"}`}>Free Journaling</button>
                  </div>
                )}

                {editingNoteId || writeMode === "plain" ? (
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
                  onClick={editingNoteId ? updateNote : createNewNote}
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
                      <Check size={17} /> {editingNoteId ? "Save changes" : "Save reflection"}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {noteToDelete && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#3D3940]/30 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.97, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} className="w-full max-w-md rounded-[30px] bg-white p-7 shadow-2xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0F2] text-[#B85D69]"><Trash2 size={21} /></div>
              <h2 className="mt-5 text-xl font-bold text-[#302D2A]">Move to trash?</h2>
              <p className="mt-2 text-sm leading-6 text-[#77716B]">"{noteToDelete.title}" will be safely tucked away.</p>
              <div className="mt-7 flex justify-end gap-2">
                <button onClick={() => setNoteToDelete(null)} className="cursor-pointer rounded-xl px-5 py-3 text-sm font-medium text-[#77716B]">Cancel</button>
                <button onClick={async () => { await deleteNote(noteToDelete.id); setNoteToDelete(null); }} className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#C85C68] px-5 py-3 text-sm font-semibold text-white"><Trash2 size={16} /> Move to trash</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Reflections;