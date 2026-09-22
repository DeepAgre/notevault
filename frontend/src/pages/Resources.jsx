import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, PhoneCall, Globe, BookOpen, ShieldCheck } from "lucide-react";

function Resources() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#292726] px-6 py-10 md:px-20 lg:px-32">
      <div className="mx-auto max-w-3xl">
        
        {/* Top bar */}
        <div className="flex items-center justify-between mb-12">
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

        {/* Main Content Sections (No heavy rounded boxes / containers) */}
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
    </div>
  );
}

export default Resources;