import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Award,
  Bookmark,
  Calendar,
  ExternalLink,
  GraduationCap,
  Hash,
  Library,
  Loader2,
  MapPin,
  MessageSquareText,
  Pencil,
  ShieldCheck,
  UserRound,
  Mars,
  Venus,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

function nameInitials(name) {
  if (!name || typeof name !== "string") return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return (parts[0][0] ?? "?").toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

const StatCard = ({ icon: Icon, value, label }) => (
  <div className="bg-white p-6 border-r-2 border-slate-900 last:border-r-0 flex flex-col items-center justify-center group transition-colors hover:bg-slate-50">
    <Icon size={20} className="text-blue-600 mb-2 transition-transform group-hover:scale-110" strokeWidth={3} />
    <span className="text-3xl font-[1000] tracking-tighter text-slate-900 leading-none">
      {value || 0}
    </span>
    <span className="text-[10px] font-black uppercase tracking-widest mt-2 text-slate-400">
      {label}
    </span>
  </div>
);

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex flex-col gap-1 py-4 border-b border-slate-100 last:border-b-0">
    <div className="flex items-center gap-2 text-blue-600">
      <Icon size={14} strokeWidth={3} />
      <span className="text-[10px] font-black uppercase tracking-widest leading-none">{label}</span>
    </div>
    <span className="text-sm font-bold text-slate-900 uppercase tracking-tight">
      {value || "Not Disclosed"}
    </span>
  </div>
);

export default function Profile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return setLoading(false);
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${BASE_URL}/api/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data.user);
      } catch (err) {
        setError(err.response?.data?.error || "Scholar Record Missing");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-blue-600" size={32} strokeWidth={3} />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6 text-center">
      <div className="border-4 border-slate-900 p-10 max-w-sm">
        <p className="font-black uppercase tracking-tighter text-red-600 mb-6">{error}</p>
        <Link to="/" className="inline-block text-xs font-black uppercase tracking-widest bg-slate-900 text-white px-8 py-4 hover:bg-blue-600 transition-colors">
          Return to Portal
        </Link>
      </div>
    </div>
  );

  const stats = user?._count || { questions: 0, answers: 0, votes: 0, bookmarks: 0 };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-20 selection:bg-yellow-200">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="py-10">
          <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-colors">
            <ArrowLeft size={16} strokeWidth={4} /> Dashboard
          </Link>
        </div>

        <section className="border-4 border-slate-900 overflow-hidden shadow-[12px_12px_0px_0px_rgba(30,157,241,0.1)]">
          
          <div className="p-8 md:p-12 border-b-4 border-slate-900 bg-white">
            <div className="flex flex-col md:flex-row gap-12 items-center md:items-start text-center md:text-left">
              
              <div className="relative shrink-0">
                <div className="h-32 w-32 bg-blue-600 flex items-center justify-center text-4xl font-[1000] text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  {nameInitials(user?.name)}
                </div>
              </div>

              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-8">
                  <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-[1000] uppercase tracking-tighter leading-[0.85] text-slate-900">
                      {user?.name}
                    </h1>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 px-3 py-1.5 border border-blue-100">
                        {user?.department}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 px-3 py-1.5 border border-slate-200">
                        Class of {user?.year + 4} // Year {user?.year}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    <button className="bg-slate-950 text-white px-8 py-4 text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:translate-y-1">
                      Edit Profile
                    </button>
                    <button className="border-2 border-slate-950 p-4 hover:bg-zinc-50 transition-colors">
                      <ExternalLink size={18} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 bg-white">
            <StatCard icon={MessageSquareText} value={stats.questions} label="Questions" />
            <StatCard icon={Library} value={stats.answers} label="Solutions" />
            <StatCard icon={Award} value={stats.votes} label="Votes" />
            <StatCard icon={Bookmark} value={stats.bookmarks} label="Saved" />
          </div>
        </section>

        {/* Info Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-12 border-2 border-slate-900 p-8 md:p-12 relative overflow-hidden bg-white">
            <div className="absolute -top-10 -right-10 opacity-[0.03] pointer-events-none">
              <GraduationCap size={300} strokeWidth={1} />
            </div>
            
            <h2 className="text-2xl font-[1000] uppercase tracking-tighter mb-12 flex items-center gap-4">
              <span className="h-4 w-4 bg-blue-600" />
              Academic Dossier
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-4">
              <DetailItem icon={UserRound} label="Full Legal Name" value={user?.name} />
              <DetailItem icon={Hash} label="Scholar Identity No" value={user?.scholar_no} />
              <DetailItem icon={MapPin} label="Primary Campus" value="MANIT Bhopal" />
              <DetailItem 
                icon={Calendar} 
                label="Registration Date" 
                value={new Date(user?.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric", day: "numeric" })} 
              />
              <DetailItem 
                icon={user?.gender?.toLowerCase().startsWith('m') ? Mars : Venus} 
                label="Gender Marker" 
                value={user?.gender} 
              />
              <DetailItem icon={ShieldCheck} label="Verification Status" value="Active Member" />
            </div>
          </div>
        </div>

        <footer className="mt-24 border-t-2 border-slate-100 pt-10 flex flex-col items-center">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300 text-center leading-loose italic">
            "Knowledge Shared is Knowledge Gained" // PeerDoubt System v1.0
          </p>
        </footer>
      </div>
    </div>
  );
}