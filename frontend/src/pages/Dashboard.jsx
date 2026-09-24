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
  Info,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

const NOTE_COLORS = [
  {
    card: "bg-[#FFF4B8]",
    border: "border-[#F5E79B]",
    accent: "text-[#9A7B00]",
    button: "bg-[#F7E88C] hover:bg-[#F2DF72]",
  },
  {
    card: "bg-[#CFF4FF]",
    border: "border-[#AEE7F5]",
    accent: "text-[#08758E]",
    button: "bg-[#AEE9F7] hover:bg-[#94DFEF]",
  },
  {
    card: "bg-[#FFDDEB]",
    border: "border-[#F7BED5]",
    accent: "text-[#A63D67]",
    button: "bg-[#F8C5D9] hover:bg-[#F2B2CC]",
  },
  {
    card: "bg-[#DDF7D8]",
    border: "border-[#BFE8B9]",
    accent: "text-[#397A35]",
    button: "bg-[#C4ECC0] hover:bg-[#B1E4AC]",
  },
  {
    card: "bg-[#E9DEFF]",
    border: "border-[#D5C4F4]",
    accent: "text-[#6D4AA0]",
    button: "bg-[#DCCBFA] hover:bg-[#CEB9F4]",
  },
];

function Dashboard() {
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

  const [showInfoModal, setShowInfoModal] = useState(null); // Tracks which info tooltip is open

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const mobileProfileMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const [noteToDelete, setNoteToDelete] = useState(null);

  const [user, setUser] = useState(null);

  const [stats, setStats] = useState({
    total_notes: 0,
    favorite_notes: 0,
    pinned_notes: 0,
    trash_notes: 0,
  });

  const [wellness, setWellness] = useState(null);
  const [activeSound, setActiveSound] = useState(null);
  const audioRef = useRef(null);

  // --- HUMAN EMOTIONAL SPECTRUM MAPPING (NO NUMBERS) ---
  const emotionalSpectrum = useMemo(() => {
    if (!notes || notes.length === 0) {
      return {
        label: "Serene & Balanced",
        description: "A peaceful starting space. Ready for your daily thoughts.",
        progress: 50,
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

    const score = Math.min(100, Math.max(10, Math.round(50 + (soothingCount * 12) - (heavyCount * 8))));

    if (score >= 70) {
      return {
        label: "Grounded & Light",
        description: "You are navigating your week with self-kindness and balanced perspective.",
        progress: score,
      };
    } else if (score >= 40) {
      return {
        label: "Reflecting & Processing",
        description: "You are actively sorting through daily thoughts and giving yourself permission to pace.",
        progress: score,
      };
    } else {
      return {
        label: "Carrying Heavy Weight",
        description: "You've been holding onto demanding moments. Remember to breathe and take small pauses.",
        progress: score,
      };
    }
  }, [notes]);

  const [activeTipIndex, setActiveTipIndex] = useState(0);
  
  const getTherapeuticMessages = (sentiment) => {
    if (sentiment !== null && sentiment < -0.05) {
      return [
        { title: "Holding Space for Your Rest", text: "You don't have to figure everything out today. It's okay to just breathe." },
        { title: "A Gentle Reminder", text: "Heavy days are temporary weather passing through. You are safe here." },
        { title: "Permission to Pause", text: "Drop your shoulders and unclench your jaw. You've done enough for right now." }
      ];
    }
    return [
      { title: "Steady Pacing", text: "You are showing up for yourself through honest daily reflection. That takes courage." },
      { title: "Gentle Awareness", text: "Take a slow, deep breath and let today unfold at its own pace." },
      { title: "Self-Kindness Check", text: "Treat yourself with the same patience you would offer a dear friend." }
    ];
  };

  const currentMessages = getTherapeuticMessages(wellness ? wellness.average_sentiment : 0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTipIndex((prev) => (prev + 1) % currentMessages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [wellness]);

  const navigate = useNavigate();

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
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target) &&
        mobileProfileMenuRef.current &&
        !mobileProfileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
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

    let finalContent = content.trim();

    if (!finalContent && (situation || negativeThought || reframing || actionPlan)) {
      finalContent = `What is on my mind:\n${situation.trim() || "Not specified"}\n\nHeavy thoughts I am carrying:\n${negativeThought.trim() || "Not specified"}\n\nLooking at it gently:\n${reframing.trim() || "Not specified"}\n\nSmall step forward:\n${actionPlan.trim() || "Not specified"}`;
    }

    if (!title.trim() || !finalContent) {
      toast.error("Please provide a title and your thoughts");
      return;
    }

    setSavingNote(true);

    try {
      await api.post("/notes", {
        title: title.trim(),
        content: finalContent,
      });

      const response = await api.get("/dashboard");
      const wellnessRes = await api.get("/wellness/insights").catch(() => null);

      setNotes(response.data.notes);
      setStats(response.data.stats);
      if (wellnessRes) setWellness(wellnessRes.data);

      resetEditor();
      toast.success("Reflection saved safely");
    } catch (error) {
      console.log(error);
      toast.error("Failed to save reflection");
      setSavingNote(false);
    }
  };

  const updateNote = async () => {
    if (savingNote) return;

    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setSavingNote(true);

    try {
      const response = await api.put(
        `/notes/${editingNoteId}`,
        {
          title: title.trim(),
          content: content.trim(),
        }
      );

      setNotes((previousNotes) =>
        previousNotes.map((note) =>
          note.id === editingNoteId ? response.data : note
        )
      );

      resetEditor();
      toast.success("Reflection updated");
    } catch (error) {
      console.log(error);
      toast.error("Failed to update reflection");
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

      setNotes((previousNotes) =>
        previousNotes.filter((note) => note.id !== noteId)
      );

      setStats((previousStats) => ({
        ...previousStats,
        total_notes: Math.max(0, previousStats.total_notes - 1),
        trash_notes: previousStats.trash_notes + 1,
      }));

      toast.success("Moved to trash");
    } catch (error) {
      console.log(error);
      toast.error("Failed to move to trash");
    }
  };

  const togglePin = async (noteId) => {
    try {
      const response = await api.put(`/notes/${noteId}/pin`);

      setNotes((previousNotes) =>
        previousNotes.map((note) =>
          note.id === noteId ? response.data : note
        )
      );

      setStats((previousStats) => ({
        ...previousStats,
        pinned_notes: response.data.pinned
          ? previousStats.pinned_notes + 1
          : Math.max(0, previousStats.pinned_notes - 1),
      }));
    } catch (error) {
      console.log(error);
    }
  };

  const toggleFavorite = async (noteId) => {
    try {
      const response = await api.put(`/notes/${noteId}/favorite`);

      setNotes((previousNotes) =>
        previousNotes.map((note) =>
          note.id === noteId ? response.data : note
        )
      );

      setStats((previousStats) => ({
        ...previousStats,
        favorite_notes: response.data.favorite
          ? previousStats.favorite_notes + 1
          : Math.max(0, previousStats.favorite_notes - 1),
      }));
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
      const response = await api.post(
        `/notes/${noteToShare.id}/share`,
        {
          recipient: shareRecipient.trim(),
        }
      );

      toast.success(`Shared with ${response.data.recipient}`);
      setNoteToShare(null);
      setShareRecipient("");
    } catch (error) {
      console.log(error);
      const message = error.response?.data?.detail || "Failed to share reflection";
      toast.error(message);
    } finally {
      setSharing(false);
    }
  };

  const filteredNotes = useMemo(() => {
    return [...notes]
      .filter((note) => {
        const search = searchQuery.toLowerCase();
        const matchesSearch =
          note.title.toLowerCase().includes(search) ||
          note.content.toLowerCase().includes(search);

        const matchesFilter =
          activeFilter === "all" ||
          (activeFilter === "pinned" && note.pinned) ||
          (activeFilter === "favorite" && note.favorite);

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      });
  }, [notes, searchQuery, activeFilter, sortOrder]);

  const handleStatClick = (stat) => {
    if (stat === "total") { setActiveFilter("all"); return; }
    if (stat === "pinned") { setActiveFilter("pinned"); return; }
    if (stat === "favorite") { setActiveFilter("favorite"); return; }
    if (stat === "trash") { navigate("/trash"); }
  };

  const navItems = [
    { id: "all", label: "All reflections", icon: FileText, count: stats.total_notes },
    { id: "pinned", label: "Pinned", icon: Pin, count: stats.pinned_notes },
    { id: "favorite", label: "Favorites", icon: Heart, count: stats.favorite_notes },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-[#77716B]">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-[#7C6CF2]" />
          <span>Opening your sanctuary...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#292726]">

      <div className="pointer-events-none fixed -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-[#D9F5FF] blur-3xl opacity-60" />
      <div className="pointer-events-none fixed -bottom-40 -right-40 h-[420px] w-[420px] rounded-full bg-[#F0E5FF] blur-3xl opacity-60" />

      <div className="relative flex min-h-screen">

        {/* Desktop Sidebar */}
        <aside className="hidden w-[250px] shrink-0 border-r border-[#EAE6DE] bg-white/70 px-5 py-7 backdrop-blur-xl md:flex md:flex-col">

          <button
            onClick={() => {
              setActiveFilter("all");
              navigate("/dashboard");
            }}
            className="flex cursor-pointer items-center gap-3 px-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#7C6CF2] text-white shadow-sm">
              <FileText size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Note<span className="text-[#7C6CF2]">Vault</span>
            </span>
          </button>

          <div className="mt-10 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeFilter === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveFilter(item.id)}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    active ? "bg-[#F0EDFF] text-[#6657D8]" : "text-[#77716B] hover:bg-[#F7F5F0] hover:text-[#292726]"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon size={18} strokeWidth={1.9} />
                    {item.label}
                  </span>
                  <span className="text-xs text-[#AAA39A]">{item.count}</span>
                </button>
              );
            })}

            <button
              onClick={() => navigate("/trash")}
              className="flex w-full cursor-pointer items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-[#77716B] transition hover:bg-[#F7F5F0] hover:text-[#292726]"
            >
              <span className="flex items-center gap-3">
                <Trash2 size={18} strokeWidth={1.9} />
                Trash
              </span>
              <span className="text-xs text-[#AAA39A]">{stats.trash_notes}</span>
            </button>

            <button
              onClick={() => navigate("/resources")}
              className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#77716B] transition hover:bg-[#F7F5F0] hover:text-[#292726]"
            >
              <BookOpen size={18} strokeWidth={1.9} />
              Wellness Resources
            </button>

            <button
              onClick={() => navigate("/settings")}
              className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#77716B] transition hover:bg-[#F7F5F0] hover:text-[#292726]"
            >
              <Settings size={18} strokeWidth={1.9} />
              Settings
            </button>
          </div>

          <div className="mt-auto border-t border-[#EEEAE3] pt-5">
            <button
              onClick={handleLogout}
              className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#A35A62] transition hover:bg-[#FFF0F1]"
            >
              <LogOut size={18} strokeWidth={1.9} />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="min-w-0 flex-1 px-5 pb-12 pt-5 md:px-10 md:py-8 xl:px-14">

          {/* Mobile top bar */}
          <div className="mb-6 flex items-center justify-between md:hidden">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex cursor-pointer items-center gap-2"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7C6CF2] text-white">
                <FileText size={18} />
              </div>
              <span className="font-bold">
                Note<span className="text-[#7C6CF2]">Vault</span>
              </span>
            </button>

            <button
              onClick={(event) => {
                event.stopPropagation();
                setShowMobileMenu((value) => !value);
              }}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#E8E3DB] bg-white text-[#625E59]"
            >
              {showMobileMenu ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>

          {/* Header */}
          <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-[#8C857D]">Your daily emotional reflection & decompression sanctuary</p>
              <h1 className="mt-1 text-4xl font-bold tracking-tight text-[#292726] md:text-5xl">
                Sanctuary
              </h1>
              {user && (
                <p className="mt-2 text-sm text-[#99928A]">Welcome back, {user.username}</p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 sm:w-72">
                <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A7A097]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reflections"
                  className="w-full rounded-2xl border border-[#E7E2D9] bg-white/80 py-3.5 pl-11 pr-4 text-sm text-[#292726] outline-none transition placeholder:text-[#AAA39A] focus:border-[#B8AEF8] focus:ring-4 focus:ring-[#EEEAFE]"
                />
              </div>

              <div className="relative w-full sm:w-auto">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full cursor-pointer appearance-none rounded-2xl border border-[#E7E2D9] bg-white/80 px-4 py-3.5 pr-10 text-sm text-[#625E59] outline-none transition focus:border-[#B8AEF8] sm:w-auto"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#AAA39A]" />
              </div>
            </div>
          </header>

          {/* Action row */}
          <div className="mt-3 flex items-center justify-between gap-3 lg:mt-8">
            <div className="flex items-center gap-2">
              {activeFilter !== "all" && (
                <button
                  onClick={() => setActiveFilter("all")}
                  className="cursor-pointer rounded-full bg-[#F0EDFF] px-3.5 py-2 text-xs font-semibold text-[#6657D8]"
                >
                  {activeFilter === "pinned" ? "Pinned" : "Favorites"}
                </button>
              )}
            </div>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={openCreateModal}
              className="flex cursor-pointer items-center gap-2 rounded-2xl bg-[#7C6CF2] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-[#7C6CF2]/20 transition hover:bg-[#6E5EE5]"
            >
              <Plus size={18} />
              New reflection
            </motion.button>
          </div>

          {/* Companion & Human-Friendly Insights Section */}
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            
            {/* Sprout Companion Card */}
            <div className="col-span-2 flex flex-col justify-between rounded-[28px] border border-[#BEE3DB] bg-gradient-to-br from-[#E8F8F5] to-[#D1F2EB] p-7 shadow-sm">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#116466]">
                      Sprout, Your Companion
                    </span>
                    <button
                      onClick={() => setShowInfoModal("sprout")}
                      className="cursor-pointer rounded-full p-1 text-[#116466] hover:bg-white/60 transition"
                      title="Learn about Sprout"
                    >
                      <Info size={15} />
                    </button>
                  </div>
                  <span className="rounded-full bg-white/70 px-3 py-0.5 text-xs font-semibold text-[#116466]">
                    {notes.length} Total Entries Logged
                  </span>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row items-center gap-5">
                  <div className="flex shrink-0 flex-col items-center justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm border border-[#A2D9CE]">
                      <div className="relative flex flex-col items-center">
                        <motion.div
                          animate={{ rotate: [-3, 3, -3] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute -top-6 flex gap-1"
                        >
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

                  {/* Adaptive Message Cloud */}
                  <div className="flex-1 w-full rounded-2xl bg-white/85 p-5 shadow-sm border border-[#BEE3DB] backdrop-blur-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#2E8B57] mb-1">
                      {currentMessages[activeTipIndex].title}
                    </p>
                    <h2 className="text-sm font-bold text-[#2D3142]">
                      {currentMessages[activeTipIndex].text}
                    </h2>
                    <p className="mt-2 text-xs leading-relaxed text-[#52796F]">
                      Gentle reminder: You are the sky; your heavy thoughts and deadlines are just passing weather clouds.
                    </p>
                  </div>
                </div>

                {/* Warm Metrics */}
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white/70 p-3 border border-[#BEE3DB]/60">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-semibold text-[#52796F] uppercase">Heavy Moments</p>
                      <button onClick={() => setShowInfoModal("heavy")} className="cursor-pointer text-[#52796F] hover:text-[#116466]"><Info size={13} /></button>
                    </div>
                    <p className="mt-1 text-base font-bold text-[#116466]">{wellness && wellness.average_sentiment < -0.05 ? "Carrying Load" : "Balanced"}</p>
                  </div>
                  <div className="rounded-2xl bg-white/70 p-3 border border-[#BEE3DB]/60">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-semibold text-[#52796F] uppercase">Gentle Reframes</p>
                      <button onClick={() => setShowInfoModal("reframes")} className="cursor-pointer text-[#52796F] hover:text-[#116466]"><Info size={13} /></button>
                    </div>
                    <p className="mt-1 text-base font-bold text-[#116466]">Active</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1 rounded-2xl bg-white/70 p-3 border border-[#BEE3DB]/60">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-semibold text-[#52796F] uppercase">Sanctuary State</p>
                      <button onClick={() => setShowInfoModal("state")} className="cursor-pointer text-[#52796F] hover:text-[#116466]"><Info size={13} /></button>
                    </div>
                    <p className="mt-1 text-xs font-bold text-[#2E8B57]">Safe & Open</p>
                  </div>
                </div>
              </div>

              {/* Ambient Soundscapes */}
              <div className="mt-5 flex flex-wrap items-center justify-between border-t border-[#BEE3DB]/60 pt-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#116466]">Soundscapes:</span>
                  <button
                    onClick={() => toggleSound("Rain", "https://cdn.pixabay.com/download/audio/2021/09/06/audio_75c7423985.mp3?filename=gentle-rain-15258.mp3")}
                    className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                      activeSound === "Rain" ? "bg-[#116466] text-white" : "bg-white/80 text-[#116466] hover:bg-white"
                    }`}
                  >
                    Rainfall
                  </button>
                  <button
                    onClick={() => toggleSound("Forest", "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=forest-birds-and-wind-6213.mp3")}
                    className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                      activeSound === "Forest" ? "bg-[#116466] text-white" : "bg-white/80 text-[#116466] hover:bg-white"
                    }`}
                  >
                    Forest
                  </button>
                  {activeSound && (
                    <button
                      onClick={() => toggleSound(activeSound, "")}
                      className="cursor-pointer rounded-xl bg-red-100 px-3 py-1.5 text-xs font-semibold text-[#B85D69] hover:bg-red-200"
                    >
                      Mute
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Self-Compassion Index (Emotional Spectrum Card) */}
            <div className="flex flex-col justify-between rounded-[28px] border border-[#F5E79B] bg-gradient-to-br from-[#FFFDEB] to-[#FFF9D6] p-7 shadow-sm">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#9A7B00]">
                      Self-Compassion Spectrum
                    </p>
                    <button onClick={() => setShowInfoModal("spectrum")} className="cursor-pointer text-[#9A7B00] hover:text-black"><Info size={14} /></button>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-white/80 p-4 border border-[#F5E79B]/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#302D2A]">Current State</span>
                    <span className="text-xs font-bold text-[#9A7B00] bg-[#FFF8D9] px-2.5 py-1 rounded-full">{emotionalSpectrum.label}</span>
                  </div>

                  <div className="h-2.5 w-full rounded-full bg-[#F5E79B]/50 overflow-hidden my-3">
                    <div
                      className="h-full bg-[#D4A373] transition-all duration-500 rounded-full"
                      style={{ width: `${emotionalSpectrum.progress}%` }}
                    />
                  </div>

                  <p className="mt-2 text-[11px] leading-relaxed text-[#77716B]">
                    {emotionalSpectrum.description}
                  </p>
                </div>

                <div className="mt-4 space-y-2 rounded-2xl bg-white/50 p-3.5 border border-[#F5E79B]/40">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#9A7B00]">Gentle Note</p>
                  <p className="text-[11px] leading-relaxed text-[#625B54]">
                    "You do not have to validate your exhaustion to anyone. Rest is a biological requirement, not a reward."
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-[#F5E79B]/60 pt-3">
                <p className="text-[10px] text-[#8C857D] italic text-center">
                  A safe, judgment-free space for your daily thoughts
                </p>
              </div>
            </div>

          </div>

          {/* Stats Bar */}
          <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <button onClick={() => handleStatClick("total")} className="cursor-pointer rounded-3xl border border-[#EEE9E1] bg-white p-5 text-left transition hover:-translate-y-0.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#8C857D]">Reflections</span>
                <FileText size={18} className="text-[#7C6CF2]" />
              </div>
              <p className="mt-4 text-3xl font-bold text-[#302D2A]">{stats.total_notes}</p>
            </button>

            <button onClick={() => handleStatClick("favorite")} className="cursor-pointer rounded-3xl border border-[#EEE9E1] bg-[#FFF8D9] p-5 text-left transition hover:-translate-y-0.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#8C857D]">Favorites</span>
                <Heart size={18} className="text-[#C58B16]" />
              </div>
              <p className="mt-4 text-3xl font-bold text-[#514421]">{stats.favorite_notes}</p>
            </button>

            <button onClick={() => handleStatClick("pinned")} className="cursor-pointer rounded-3xl border border-[#EEE9E1] bg-[#E7F9FF] p-5 text-left transition hover:-translate-y-0.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#62808A]">Pinned</span>
                <Pin size={18} className="text-[#1685A0]" />
              </div>
              <p className="mt-4 text-3xl font-bold text-[#245A68]">{stats.pinned_notes}</p>
            </button>

            <button onClick={() => handleStatClick("trash")} className="cursor-pointer rounded-3xl border border-[#EEE9E1] bg-[#FFF0F2] p-5 text-left transition hover:-translate-y-0.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#9A7277]">Trash</span>
                <Trash2 size={18} className="text-[#B85D69]" />
              </div>
              <p className="mt-4 text-3xl font-bold text-[#63343B]">{stats.trash_notes}</p>
            </button>
          </div>

          {/* Notes Grid */}
          <section className="mt-9">
            {filteredNotes.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex min-h-[330px] flex-col items-center justify-center rounded-[32px] border border-dashed border-[#DDD7CD] bg-white px-6 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0EDFF] text-[#7C6CF2]">
                  <FileText size={24} />
                </div>
                <h2 className="mt-5 text-lg font-semibold text-[#3C3834]">
                  {searchQuery ? "No reflections found" : "No reflections yet"}
                </h2>
                {!searchQuery && (
                  <button
                    onClick={openCreateModal}
                    className="mt-5 flex cursor-pointer items-center gap-2 rounded-xl bg-[#7C6CF2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#6E5EE5]"
                  >
                    <Plus size={17} />
                    Create reflection
                  </button>
                )}
              </motion.div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredNotes.map((note, index) => {
                  const color = NOTE_COLORS[index % NOTE_COLORS.length];

                  return (
                    <motion.article
                      key={note.id}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      onClick={() => setViewingNote(note)}
                      className={`group relative flex min-h-[290px] cursor-pointer flex-col overflow-hidden rounded-[28px] border ${color.border} ${color.card} p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {note.pinned && (
                            <span className={`rounded-full bg-white/60 px-2.5 py-1 text-[11px] font-semibold ${color.accent}`}>
                              <Pin size={12} className="inline mr-1" />
                              Pinned
                            </span>
                          )}
                          {note.favorite && (
                            <span className="rounded-full bg-white/60 p-1.5 text-[#C58B16]">
                              <Heart size={13} fill="currentColor" />
                            </span>
                          )}
                        </div>
                        <span className={`text-xs ${color.accent} opacity-70`}>
                          {new Date(note.updated_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h2 className="mt-7 break-words text-xl font-bold leading-tight text-[#302D2A]">
                        {note.title}
                      </h2>

                      <p className="mt-4 line-clamp-6 text-sm leading-6 text-[#625B54]">
                        {note.content}
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-7">
                        <button
                          onClick={(e) => { e.stopPropagation(); togglePin(note.id); }}
                          className={`flex h-9 w-9 items-center cursor-pointer justify-center rounded-xl bg-white/60 transition hover:bg-white ${note.pinned ? color.accent : "text-[#8B837A]"}`}
                        >
                          <Pin size={17} fill={note.pinned ? "currentColor" : "none"} />
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(note.id); }}
                          className={`flex h-9 w-9 items-center cursor-pointer justify-center rounded-xl bg-white/60 transition hover:bg-white ${note.favorite ? "text-[#C58B16]" : "text-[#8B837A]"}`}
                        >
                          <Heart size={17} fill={note.favorite ? "currentColor" : "none"} />
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); startEditing(note); }}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-white/60 text-[#756E67] transition hover:bg-white"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); setNoteToShare(note); }}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-white/60 text-[#756E67] transition hover:bg-white"
                        >
                          <Share2 size={16} />
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); setNoteToDelete(note); }}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/60 text-[#A35A62] transition hover:bg-white"
                        >
                          <Trash2 size={16} />
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); setViewingNote(note); }}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/60 text-[#756E67] transition hover:bg-white"
                        >
                          <MoreHorizontal size={17} />
                        </button>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Info Tooltip Modal */}
      <AnimatePresence>
        {showInfoModal && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#3D3940]/30 p-4 backdrop-blur-sm" onClick={() => setShowInfoModal(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-[30px] bg-white p-7 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F8F5] text-[#116466]">
                  <Info size={22} />
                </div>
                <button onClick={() => setShowInfoModal(null)} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-[#F7F5F0] text-[#77716B]">
                  <X size={17} />
                </button>
              </div>

              <h2 className="mt-5 text-xl font-bold text-[#302D2A]">
                {showInfoModal === "sprout" && "About Sprout, Your Companion"}
                {showInfoModal === "heavy" && "Understanding Heavy Moments"}
                {showInfoModal === "reframes" && "About Gentle Reframes"}
                {showInfoModal === "state" && "Sanctuary State"}
                {showInfoModal === "spectrum" && "Self-Compassion Spectrum"}
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-[#625E59]">
                {showInfoModal === "sprout" && "Sprout is your gentle emotional companion here to offer a listening presence, soothing words, and a calm space whenever you log your thoughts."}
                {showInfoModal === "heavy" && "This highlights when your entries carry demanding thoughts or exhaustion, reminding you to take things easy and honor your need for rest."}
                {showInfoModal === "reframes" && "This measures your moments of self-kindness—when you gently look at challenging situations with patience rather than harsh self-criticism."}
                {showInfoModal === "state" && "Your sanctuary state reflects a secure, quiet environment tailored for private emotional decompression and daily journaling."}
                {showInfoModal === "spectrum" && "The spectrum moves gracefully based on your reflection entries, showing whether you are feeling grounded, processing complex thoughts, or carrying extra weight."}
              </p>

              <div className="mt-7 flex justify-end">
                <button
                  onClick={() => setShowInfoModal(null)}
                  className="cursor-pointer rounded-xl bg-[#292726] px-5 py-2.5 text-sm font-medium text-white"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {viewingNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3D3940]/30 p-4 backdrop-blur-sm" onClick={() => setViewingNote(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-[32px] bg-white p-7 shadow-2xl md:p-10"
            >
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9B948C]">Reflection</p>
                  <h2 className="mt-3 break-words text-3xl font-bold tracking-tight text-[#302D2A]">{viewingNote.title}</h2>
                  <p className="mt-3 text-xs text-[#A19A92]">Updated {new Date(viewingNote.updated_at).toLocaleString()}</p>
                </div>
                <button onClick={() => setViewingNote(null)} className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-[#F7F5F0] text-[#77716B]">
                  <X size={18} />
                </button>
              </div>

              <div className="my-8 h-px bg-[#EEEAE3]" />

              <div className="whitespace-pre-wrap break-words text-[16px] leading-8 text-[#514B45]">
                {viewingNote.content}
              </div>

              <div className="mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-[#EEEAE3] pt-6">
                <p className="text-xs text-[#A19A92]">
                  {viewingNote.content.trim().split(/\s+/).filter(Boolean).length} words
                </p>
                <div className="flex gap-2">
                  <button onClick={() => startEditing(viewingNote)} className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#E3DED6] bg-white px-4 py-2.5 text-sm font-medium text-[#625E59]">
                    <Pencil size={16} /> Edit
                  </button>
                  <button onClick={() => setViewingNote(null)} className="cursor-pointer rounded-xl bg-[#292726] px-5 py-2.5 text-sm font-medium text-white">
                    Close
                  </button>
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
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="w-full max-w-xl rounded-[32px] bg-white p-7 shadow-2xl md:p-9"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9B948C]">{editingNoteId ? "Edit" : "New reflection"}</p>
                  <h2 className="mt-2 text-2xl font-bold text-[#302D2A]">{editingNoteId ? "Edit reflection" : "Guided Reflection"}</h2>
                </div>
                <button onClick={resetEditor} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-[#F7F5F0] text-[#77716B]">
                  <X size={18} />
                </button>
              </div>

              <div className="mt-7 space-y-5 max-h-[65vh] overflow-y-auto pr-1">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#625E59]">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your thoughts a title"
                    autoFocus
                    className="w-full rounded-2xl border border-[#E5E0D8] bg-[#FCFBF8] px-4 py-3.5 text-[#302D2A] outline-none transition placeholder:text-[#B0AAA2] focus:border-[#B9AEF6] focus:ring-4 focus:ring-[#EEEAFE]"
                  />
                </div>

                {!editingNoteId && (
                  <div className="flex items-center justify-between rounded-xl bg-[#F4F1EA] p-1.5 border border-[#E6E1D6]">
                    <button
                      type="button"
                      onClick={() => setWriteMode("guided")}
                      className={`flex-1 cursor-pointer rounded-lg py-2 text-xs font-semibold transition ${writeMode === "guided" ? "bg-white text-[#302D2A] shadow-sm" : "text-[#77716B]"}`}
                    >
                      Guided Flow
                    </button>
                    <button
                      type="button"
                      onClick={() => setWriteMode("plain")}
                      className={`flex-1 cursor-pointer rounded-lg py-2 text-xs font-semibold transition ${writeMode === "plain" ? "bg-white text-[#302D2A] shadow-sm" : "text-[#77716B]"}`}
                    >
                      Free Journaling
                    </button>
                  </div>
                )}

                {editingNoteId || writeMode === "plain" ? (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#625E59]">Your Thoughts</label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write freely whatever is on your mind..."
                      rows={9}
                      className="w-full resize-none rounded-2xl border border-[#E5E0D8] bg-[#FCFBF8] px-4 py-3.5 text-[#302D2A] outline-none transition placeholder:text-[#B0AAA2] focus:border-[#B9AEF6] focus:ring-4 focus:ring-[#EEEAFE]"
                    />
                  </div>
                ) : (
                  <div className="space-y-4 rounded-2xl bg-[#F9F7F3] p-4 border border-[#EAE5DC]">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#77716B]">Gentle Decompression Guide</p>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#625E59]">1. What situation or burden is on your mind?</label>
                      <input
                        type="text"
                        value={situation}
                        onChange={(e) => setSituation(e.target.value)}
                        placeholder="e.g., Exhausted from constant deadlines"
                        className="w-full rounded-xl border border-[#E5E0D8] bg-white px-3.5 py-2.5 text-sm text-[#302D2A] outline-none focus:border-[#B9AEF6]"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#625E59]">2. What heavy thoughts are running through your head?</label>
                      <input
                        type="text"
                        value={negativeThought}
                        onChange={(e) => setNegativeThought(e.target.value)}
                        placeholder="e.g., I'm falling behind everyone else"
                        className="w-full rounded-xl border border-[#E5E0D8] bg-white px-3.5 py-2.5 text-sm text-[#302D2A] outline-none focus:border-[#B9AEF6]"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#625E59]">3. Let's look at this gently. Is this an absolute fact or a passing feeling?</label>
                      <textarea
                        value={reframing}
                        onChange={(e) => setReframing(e.target.value)}
                        placeholder="Write down a kinder, more balanced perspective..."
                        rows={3}
                        className="w-full resize-none rounded-xl border border-[#E5E0D8] bg-white px-3.5 py-2.5 text-sm text-[#302D2A] outline-none focus:border-[#B9AEF6]"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#625E59]">4. What is one ultra-small act of self-kindness you can offer yourself?</label>
                      <textarea
                        value={actionPlan}
                        onChange={(e) => setActionPlan(e.target.value)}
                        placeholder="e.g., Drink water, close my eyes for 5 minutes..."
                        rows={3}
                        className="w-full resize-none rounded-xl border border-[#E5E0D8] bg-white px-3.5 py-2.5 text-sm text-[#302D2A] outline-none focus:border-[#B9AEF6]"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-7 flex justify-end gap-2">
                <button onClick={resetEditor} disabled={savingNote} className="cursor-pointer rounded-xl px-5 py-3 text-sm font-medium text-[#77716B]">
                  Cancel
                </button>
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
                      <Check size={17} />
                      {editingNoteId ? "Save changes" : "Save reflection"}
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
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="w-full max-w-md rounded-[30px] bg-white p-7 shadow-2xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0F2] text-[#B85D69]">
                <Trash2 size={21} />
              </div>
              <h2 className="mt-5 text-xl font-bold text-[#302D2A]">Move to trash?</h2>
              <p className="mt-2 text-sm leading-6 text-[#77716B]">"{noteToDelete.title}" will be safely tucked away.</p>
              <div className="mt-7 flex justify-end gap-2">
                <button onClick={() => setNoteToDelete(null)} className="cursor-pointer rounded-xl px-5 py-3 text-sm font-medium text-[#77716B]">
                  Cancel
                </button>
                <button onClick={async () => { await deleteNote(noteToDelete.id); setNoteToDelete(null); }} className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#C85C68] px-5 py-3 text-sm font-semibold text-white">
                  <Trash2 size={16} /> Move to trash
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