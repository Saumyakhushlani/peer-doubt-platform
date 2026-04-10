import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  HelpCircle,
  MessageSquare,
  Users,
  Search,
  PlusCircle,
  ShieldCheck,
  Lock,
} from "lucide-react";

function isSignedIn() {
  return !!localStorage.getItem("token");
}

const featureCards = [
  {
    icon: HelpCircle,
    title: "STRUCTURED ASKING",
    description:
      "Move beyond the chaos of group chats. Tag courses and topics to ensure your questions reach the right peers.",
  },
  {
    icon: MessageSquare,
    title: "CROWDSOURCED TRUTH",
    description:
      "Peer-verified solutions rise to the top. Build your academic reputation by helping others master the material.",
  },
  {
    icon: Users,
    title: "PERMANENT ARCHIVE",
    description:
      "Don't let knowledge disappear. Build a searchable legacy for your cohort that stays accessible every semester.",
  },
];

export default function Home() {
  const signedIn = isSignedIn();

  return (
    <div className="min-h-screen bg-white font-sans text-slate-950 selection:bg-blue-600 selection:text-white">
      <section className="relative border-b-4 border-slate-950 px-6 py-16 lg:py-24 overflow-hidden">
        <div className="absolute top-10 right-10 rotate-12 opacity-5 pointer-events-none hidden lg:block">
          <GraduationCap size={300} strokeWidth={1} />
        </div>

        <div className="mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col items-start gap-6">
            <div className="inline-flex items-center gap-2 border-2 border-slate-950 bg-emerald-500 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <ShieldCheck size={12} strokeWidth={3} />
              Exclusive to MANIT Bhopal
            </div>
            
            <h1 className="max-w-4xl text-5xl font-[1000] leading-[0.85] tracking-tighter sm:text-7xl lg:text-8xl">
              KNOWLEDGE <br />
              <span className="text-blue-600">UNLOCKED.</span>
            </h1>

            <p className="max-w-xl text-base font-bold leading-snug text-slate-500 uppercase tracking-tight md:text-lg">
              The internal intelligence hub for MANIT Scholars. Log in with your Scholar Credentials to access the batch archive.
            </p>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row w-full sm:w-auto">
              {!signedIn ? (
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 border-4 border-slate-950 bg-slate-950 px-8 py-3.5 text-sm font-black uppercase tracking-widest text-white transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(30,157,241,1)] active:translate-y-1 active:shadow-none"
                >
                  <Lock size={18} strokeWidth={3} />
                  Login to Portal
                </Link>
              ) : (
                <Link
                  to="/question/create"
                  className="flex items-center justify-center gap-2 border-4 border-slate-950 bg-blue-600 px-8 py-3.5 text-sm font-black uppercase tracking-widest text-white transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
                >
                  <PlusCircle size={20} strokeWidth={3} />
                  New Doubt
                </Link>
              )}
              <Link
                to="/question"
                className="flex items-center justify-center gap-2 border-4 border-slate-950 bg-white px-8 py-3.5 text-sm font-black uppercase tracking-widest text-slate-950 transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
              >
                Explorer
                <ArrowRight size={20} strokeWidth={3} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 border-b-4 border-slate-950">
        {featureCards.map(({ icon: Icon, title, description }, i) => (
          <div
            key={title}
            className={`p-10 border-slate-950 transition-colors hover:bg-slate-50 ${
              i !== 2 ? "md:border-r-4 border-b-4 md:border-b-0" : "border-b-4 md:border-b-0"
            }`}
          >
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center border-4 border-slate-950 bg-white text-blue-600 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <Icon size={24} strokeWidth={3} />
            </div>
            <h3 className="text-xl font-[1000] uppercase tracking-tighter text-slate-950">{title}</h3>
            <p className="mt-3 text-xs font-bold uppercase leading-relaxed text-slate-400 tracking-wide">
              {description}
            </p>
          </div>
        ))}
      </section>

      <section className="bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="relative border-4 border-slate-950 bg-white p-8 md:p-14 overflow-hidden shadow-[10px_10px_0px_0px_rgba(30,157,241,1)]">
            <div className="relative z-10 grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-3xl font-[1000] uppercase tracking-tighter leading-none md:text-5xl text-slate-950">
                  Secured for <br />
                  <span className="text-blue-600">MANIT Scholars.</span>
                </h2>
                <p className="mt-6 text-sm font-bold text-slate-500 uppercase tracking-tight">
                  Log in once with your Scholar Number. No external noise—just verified curriculum discussion from the people sitting in the same lecture hall.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 lg:justify-end">
                <div className="flex h-28 w-28 flex-col items-center justify-center border-4 border-slate-950 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Search size={32} strokeWidth={3} className="text-blue-600" />
                  <span className="mt-2 text-[9px] font-[1000] uppercase tracking-widest">Indexed</span>
                </div>
                <div className="flex h-28 w-28 flex-col items-center justify-center border-4 border-slate-950 bg-blue-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white">
                  <BookOpen size={32} strokeWidth={3} />
                  <span className="mt-2 text-[9px] font-[1000] uppercase tracking-widest">Library</span>
                </div>
                <div className="flex h-28 w-28 flex-col items-center justify-center border-4 border-slate-950 bg-slate-950 shadow-[4px_4px_0px_0px_rgba(30,157,241,1)] text-white">
                  <GraduationCap size={32} strokeWidth={3} />
                  <span className="mt-2 text-[9px] font-[1000] uppercase tracking-widest">Scholars</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

function GraduationCap({ size, strokeWidth, className }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={strokeWidth} 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}