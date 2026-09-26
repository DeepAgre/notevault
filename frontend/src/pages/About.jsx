import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Compass, FileText, Sparkles, Heart, Shield, ArrowLeft } from "lucide-react";

function About() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FFFDF8] text-[#292726] pb-20">
      {/* Background blobs */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-[#D9F5FF] blur-3xl opacity-60" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[420px] w-[420px] rounded-full bg-[#F0E5FF] blur-3xl opacity-60" />

      {/* Navigation Header */}
      <div className="mx-auto max-w-4xl px-6 pt-8">
        <button
          onClick={() => navigate(-1)}
          className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#7C6CF2] transition hover:opacity-80"
        >
          <ArrowLeft size={17} /> Back
        </button>
      </div>

      {/* Main Container */}
      <main className="mx-auto max-w-4xl px-6 pt-8">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
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
                <p className="mt-1 text-sm text-[#77716B]">View your active writing streaks, listen to calming background soundscapes (Rainfall or Forest), and check your emotional spectrum scale.</p>
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
      </main>
    </div>
  );
}

export default About;