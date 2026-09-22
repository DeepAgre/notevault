import { useNavigate } from "react-router-dom";
import { FileText, ArrowLeft, BookOpen, Heart, Shield, Sun } from "lucide-react";

function Resources() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#292726] px-5 py-8 md:px-14">
      <div className="mx-auto max-w-4xl">
        
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#E7E2D9] bg-white px-4 py-2.5 text-sm font-medium text-[#625E59] transition hover:bg-[#F7F5F0]"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7C6CF2] text-white">
              <FileText size={18} />
            </div>
            <span className="font-bold text-lg">
              Note<span className="text-[#7C6CF2]">Vault</span>
            </span>
          </div>
        </div>

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7C6CF2]">
            Support & Growth Sanctuary
          </p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-[#302D2A]">
            Mental Wellness & Habit Resources
          </h1>
          <p className="mt-2 text-sm text-[#77716B] leading-relaxed">
            Gentle, evidence-based guides to help you navigate academic burnout, combat feelings of loneliness, and build sustainable daily habits with self-compassion.
          </p>
        </div>

        {/* Resource Sections */}
        <div className="space-y-6">

          {/* Section 1: Navigating Burnout & Heavy Stress */}
          <div className="rounded-[28px] border border-[#E9E4DB] bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F0EDFF] text-[#7C6CF2]">
                <Sun size={20} />
              </div>
              <h2 className="text-xl font-bold text-[#302D2A]">
                Understanding and Unpacking Academic Burnout
              </h2>
            </div>
            <p className="text-sm leading-7 text-[#625B54]">
              Academic burnout is not a reflection of your intelligence or worth; it is a natural signal that your emotional and physical reserves are depleted. When deadlines pile up, try breaking tasks into micro-steps lasting no longer than 10 minutes. Remember that resting is a vital part of productivity, not the reward at the end of it.
            </p>
          </div>

          {/* Section 2: Combating Loneliness */}
          <div className="rounded-[28px] border border-[#E9E4DB] bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF8D9] text-[#C58B16]">
                <Heart size={20} />
              </div>
              <h2 className="text-xl font-bold text-[#302D2A]">
                Coping with Isolation and Feeling Disconnected
              </h2>
            </div>
            <p className="text-sm leading-7 text-[#625B54]">
              Feeling isolated during intense study periods is common. When social connection feels difficult, start small: send a casual message to a friend without expecting a long conversation, step outside into sunlight for five minutes, or share an independent copy of a journal entry with someone you trust. You do not have to navigate tough days alone.
            </p>
          </div>

          {/* Section 3: Gentle Habit Building */}
          <div className="rounded-[28px] border border-[#E9E4DB] bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E7F9FF] text-[#1685A0]">
                <BookOpen size={20} />
              </div>
              <h2 className="text-xl font-bold text-[#302D2A]">
                Building Sustainable, Compassionate Daily Habits
              </h2>
            </div>
            <ul className="space-y-3 text-sm leading-6 text-[#625B54]">
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#1685A0]">•</span>
                <span><strong>The 2-Minute Rule:</strong> If a habit takes less than two minutes (like drinking water or tidying your desk), do it immediately to build momentum.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#1685A0]">•</span>
                <span><strong>Evening Journaling:</strong> Use NoteVault's guided reflection before bed to offload lingering anxieties so your mind can rest.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#1685A0]">•</span>
                <span><strong>Pacing Over Perfection:</strong> Celebrate showing up for yourself, even on days when your output is small.</span>
              </li>
            </ul>
          </div>

          {/* Emergency / Professional Support Notice */}
          <div className="rounded-[28px] border border-[#EAE6DE] bg-[#F7F5F0] p-6 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#77716B] mb-3 shadow-sm">
              <Shield size={18} />
            </div>
            <h3 className="text-sm font-bold text-[#302D2A]">
              Seeking Professional Support
            </h3>
            <p className="mt-1 text-xs text-[#77716B] max-w-lg mx-auto">
              NoteVault is a companion for self-reflection and stress management. If you or someone you know is going through a severe crisis or experiencing overwhelming distress, please reach out to a professional counselor, trusted helpline, or campus wellness center.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Resources;