import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import api from "../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  FileText,
Trash2,
Settings,
LogOut,
Menu,
X,
Pin,
Heart,
RotateCcw,
} from "lucide-react";

function Trash() {
  const [trashNotes, setTrashNotes] = useState([]);
const [loading, setLoading] = useState(true);

const [user, setUser] = useState(null);
const [showProfileMenu, setShowProfileMenu] = useState(false);
const [showMobileMenu, setShowMobileMenu] = useState(false);
const [noteToDelete, setNoteToDelete] = useState(null);

const profileMenuRef = useRef(null);

const navigate = useNavigate();

const handleLogout = () => {
  localStorage.removeItem("token");
  toast.success("Logged out");
  navigate("/");
};

useEffect(() => {
  const handleOutsideClick = (event) => {
    if (
      profileMenuRef.current &&
      !profileMenuRef.current.contains(event.target)
    ) {
      setShowProfileMenu(false);
    }
  };

  document.addEventListener("mousedown", handleOutsideClick);

  return () => {
    document.removeEventListener("mousedown", handleOutsideClick);
  };
}, []);

  const restoreNote = async (noteId) => {
    try {
      await api.put(`/trash/${noteId}/restore`);

      setTrashNotes((previousNotes) =>
        previousNotes.filter((note) => note.id !== noteId)
      );

      toast.success("Note restored successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to restore note");
    }
  };

  const permanentlyDeleteNote = async (noteId) => {
    try {
      await api.delete(`/trash/${noteId}`);

      setTrashNotes((previousNotes) =>
        previousNotes.filter((note) => note.id !== noteId)
      );

      toast.success("Note permanently deleted");
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete note");
    }
  };

  useEffect(() => {
  const fetchTrash = async () => {
    try {
      const response = await api.get("/trash");
      setTrashNotes(response.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load trash");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await api.get("/profile");
      setUser(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  fetchTrash();
  fetchProfile();
}, []);

  if (loading) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />
        <span>Loading trash...</span>
      </div>
    </div>
  );
}

  return (
  <div className="min-h-screen bg-[#FFFDF8] text-[#292726]">

    {/* Soft decorative background */}
    <div className="pointer-events-none fixed -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-[#D9F5FF] blur-3xl" />

    <div className="pointer-events-none fixed -bottom-40 -right-40 h-[420px] w-[420px] rounded-full bg-[#F0E5FF] blur-3xl" />

    <div className="relative flex min-h-screen">

      {/* Desktop Sidebar */}
<aside className="hidden w-[250px] shrink-0 border-r border-[#EAE6DE] bg-white/80 px-5 py-7 backdrop-blur-xl md:flex md:flex-col">

  <button
    onClick={() => navigate("/dashboard")}
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

    <button
      onClick={() => navigate("/dashboard")}
      className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#77716B] transition hover:bg-[#F7F5F0] hover:text-[#292726]"
    >
      <FileText size={18} strokeWidth={1.9} />
      All notes
    </button>

    <button
      onClick={() => navigate("/dashboard")}
      className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#77716B] transition hover:bg-[#F7F5F0] hover:text-[#292726]"
    >
      <Pin size={18} strokeWidth={1.9} />
Pinned
    </button>

    <button
      onClick={() => navigate("/dashboard")}
      className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#77716B] transition hover:bg-[#F7F5F0] hover:text-[#292726]"
    >
      <Heart size={18} strokeWidth={1.9} />
Favorites
    </button>

    <button
      className="flex w-full cursor-pointer items-center justify-between rounded-2xl bg-[#FFF0F2] px-4 py-3 text-sm font-medium text-[#B85D69]"
    >
      <span className="flex items-center gap-3">
        <Trash2 size={18} strokeWidth={1.9} />
        Trash
      </span>

      <span className="text-xs text-[#C98B92]">
        {trashNotes.length}
      </span>
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
    onClick={() => setShowMobileMenu((value) => !value)}
    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#E8E3DB] bg-white text-[#625E59]"
  >
    {showMobileMenu ? (
      <X size={19} />
    ) : (
      <Menu size={19} />
    )}
  </button>

</div>

<AnimatePresence>
  {showMobileMenu && (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="mb-6 overflow-hidden rounded-3xl border border-[#E9E5DD] bg-white p-2 shadow-lg shadow-[#7C6CF2]/5 md:hidden"
    >

      <button
        onClick={() => {
          setShowMobileMenu(false);
          navigate("/dashboard");
        }}
        className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium text-[#77716B] transition hover:bg-[#F7F5F0]"
      >
        <FileText size={18} />
        All notes
      </button>

      <button
        onClick={() => {
          setShowMobileMenu(false);
          navigate("/dashboard");
        }}
        className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium text-[#77716B] transition hover:bg-[#F7F5F0]"
      >
        <Pin size={18} />
Pinned
      </button>

      <button
        onClick={() => {
          setShowMobileMenu(false);
          navigate("/dashboard");
        }}
        className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium text-[#77716B] transition hover:bg-[#F7F5F0]"
      >
       <Heart size={18} />
Favorites
      </button>

      <button
        className="flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-[#FFF0F2] px-4 py-3.5 text-sm font-medium text-[#B85D69]"
      >
        <Trash2 size={18} />
        Trash
      </button>

      <button
        onClick={() => {
          setShowMobileMenu(false);
          navigate("/settings");
        }}
        className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium text-[#77716B] transition hover:bg-[#F7F5F0]"
      >
        <Settings size={18} />
        Settings
      </button>

      <button
        onClick={handleLogout}
        className="mt-1 flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm text-[#A35A62] transition hover:bg-[#FFF1F2]"
      >
        <LogOut size={18} />
        Logout
      </button>

    </motion.div>
  )}
</AnimatePresence>

        {/* Back to Dashboard */}
        

        {/* Header */}
        <div>
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-red-400 shadow-lg shadow-red-400/50" />

            <p className="text-xs font-medium uppercase tracking-[0.2em] text-red-400">
              Deleted Notes
            </p>
          </div>

          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Trash
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
            Notes you delete are moved here temporarily. You can restore them
            or permanently remove them.
          </p>
        </div>

        {/* Trash Content */}
        <div className="mt-10">

          {trashNotes.length === 0 ? (

            /* Empty Trash */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] px-6 text-center backdrop-blur-xl"
            >

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-400/10 text-2xl text-red-400">
                🗑️
              </div>

              <h2 className="mt-6 text-xl font-semibold text-white">
                Trash is empty
              </h2>

              <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                Deleted notes will appear here. You can restore them before
                they are permanently removed.
              </p>

            </motion.div>

          ) : (

            /* Notes Grid */
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

              {trashNotes.map((note, index) => (

                <motion.div
  key={note.id}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.35 }}
  className={`group relative flex min-h-[280px] flex-col overflow-hidden rounded-[28px] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#302D2A]/[0.08] ${
  [
    "border-[#F2DD82] bg-[#FFF4B8]",
    "border-[#A9E2F2] bg-[#C9F1FC]",
    "border-[#F3B8D0] bg-[#FFD6E5]",
    "border-[#B8E5B0] bg-[#DDF6D7]",
  ][index % 4]
}`}
>

  {/* Deleted Badge */}
  <div className="flex items-center justify-between gap-3">

    <span className="rounded-lg border border-[#F3C9CE] bg-[#FFF0F2] px-2.5 py-1 text-xs font-medium text-[#B85D69]">
      In Trash
    </span>

    <span className="text-xs font-medium text-[#AAA39B]">
      #{note.id}
    </span>

  </div>

  {/* Title */}
  <h2 className="mt-5 break-words text-xl font-semibold tracking-tight text-[#302D2A]">
    {note.title}
  </h2>

  {/* Content */}
  <p className="mt-4 line-clamp-4 text-sm leading-7 text-[#77716B]">
    {note.content}
  </p>

  {/* Bottom */}
  <div className="mt-auto pt-7">

    <div className="border-t border-[#EEEAE3] pt-5">

      {/* Deleted Date */}
      <p className="text-xs font-medium tracking-wide text-[#A19A92]">
        Deleted on{" "}
        {note.deleted_at
          ? new Date(note.deleted_at).toLocaleDateString()
          : "Unknown date"}
      </p>

      {/* Buttons */}
      <div className="mt-4 flex gap-2">

        {/* Restore */}
        <button
          onClick={() => restoreNote(note.id)}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#BFECEF] bg-[#ECFAFB] px-3 py-2.5 text-sm font-medium text-[#27AFC0] transition hover:border-[#9FE2E8] hover:bg-[#E0F7F9]"
        >
          <RotateCcw size={16} />
          Restore
        </button>

        {/* Permanent Delete */}
        <button
          onClick={() => setNoteToDelete(note)}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#F3C9CE] bg-[#FFF0F2] px-3 py-2.5 text-sm font-medium text-[#B85D69] transition hover:border-[#E9AEB6] hover:bg-[#FFE7EA]"
        >
          <Trash2 size={16} />
          Delete
        </button>

      </div>

    </div>

  </div>

</motion.div>

              ))}

            </div>

          )}

        </div>

{/* Permanent Delete Confirmation */}
        <AnimatePresence>
          {noteToDelete && (
            <div
              className="fixed inset-0 z-[70] flex items-center justify-center bg-[#3D3940]/30 p-4 backdrop-blur-sm"
              onClick={() => setNoteToDelete(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-[30px] bg-white p-7 shadow-2xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0F2] text-[#B85D69]">
                  <Trash2 size={21} />
                </div>

                <h2 className="mt-5 text-xl font-bold text-[#302D2A]">
                  Delete permanently?
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#77716B]">
                  "{noteToDelete.title}" will be permanently deleted and
                  cannot be recovered.
                </p>

                <div className="mt-7 flex justify-end gap-2">
                  <button
                    onClick={() => setNoteToDelete(null)}
                    className="cursor-pointer rounded-xl px-5 py-3 text-sm font-medium text-[#77716B] hover:bg-[#F7F5F0]"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={async () => {
                      await permanentlyDeleteNote(noteToDelete.id);
                      setNoteToDelete(null);
                    }}
                    className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#C85C68] px-5 py-3 text-sm font-semibold text-white hover:bg-[#B84E5A]"
                  >
                    <Trash2 size={16} />
                    Delete permanently
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

            </main>

    </div>

  </div>
  );
}

export default Trash;