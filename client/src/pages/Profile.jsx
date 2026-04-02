import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  Bookmark,
  Calendar,
  ExternalLink,
  GraduationCap,
  Library,
  Loader2,
  MapPin,
  MessageSquareText,
  Pencil,
  Plus,
  ShieldCheck,
  UserRound,
  Mars,
  Venus,
} from "lucide-react";

const T = {
  navy: "#0f3460",
  amber: "#f59e0b",
  emerald: "#10b981",
  slate: "#64748b",
  bg: "#f8fafc",
};

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const StatCard = ({ icon: Icon, value, label, color }) => (
  <motion.div
    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
    className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4"
  >
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
      style={{ backgroundColor: `${color}12`, color: color }}
    >
      <Icon size={22} strokeWidth={2} />
    </div>
    <div className="min-w-0">
      <div className="text-2xl font-bold text-slate-900 tabular-nums leading-none">
        {value || 0}
      </div>
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-tight mt-1">
        {label}
      </div>
    </div>
  </motion.div>
);

const DetailRow = ({ icon: Icon, label, value, mono }) => (
  <div className="flex items-start gap-4 py-4 border-b border-slate-50 last:border-0">
    <div className="mt-1 text-slate-300">
      <Icon size={18} />
    </div>
    <div>
      <p className="text-[10px] uppercase tracking-[0.1em] font-black text-slate-400 mb-0.5">
        {label}
      </p>
      <p
        className={`text-sm font-semibold text-[#0f3460] ${mono ? "font-mono text-xs" : ""}`}
      >
        {value || "—"}
      </p>
    </div>
  </div>
);

const Badge = ({ label, icon: Icon, color }) => (
  <span
    className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border flex items-center gap-2"
    style={{
      backgroundColor: `${color}10`,
      color: color,
      borderColor: `${color}25`,
    }}
  >
    {Icon && <Icon size={12} strokeWidth={3} />}
    {label}
  </span>
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
        setError(err.response?.data?.error || "Scholar Record Not Found");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const getGenderIcon = (gender = "") => {
    const g = gender.toLowerCase();
    if (g === "m" || g === "male") return Mars;
    if (g === "f" || g === "female") return Venus;
    return UserRound;
  };

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
        <Loader2 className="animate-spin" style={{ color: T.navy }} size={32} />
        <span className="mt-4 text-sm font-bold text-slate-500 tracking-widest uppercase">
          Fetching Dossier...
        </span>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8fafc]">
        <div className="text-center p-12 bg-white rounded-3xl shadow-sm border border-slate-200 max-w-sm">
          <p className="text-red-500 font-bold mb-6">{error}</p>
          <Link
            to="/"
            className="text-sm font-black uppercase tracking-widest text-[#0f3460] underline underline-offset-8"
          >
            Return to Portal
          </Link>
        </div>
      </div>
    );

  const stats = user?._count || {
    questions: 0,
    answers: 0,
    votes: 0,
    bookmarks: 0,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#f8fafc] pb-20"
      style={{ fontFamily: "'Inter', 'DM Sans', sans-serif" }}
    >
      <div className="max-w-5xl mx-auto px-6">
        <div className="py-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-[#0f3460] transition-colors"
          >
            <ArrowLeft size={14} strokeWidth={3} /> BACK TO DASHBOARD
          </Link>
        </div>

        <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="h-32 w-full bg-[#0f3460] relative">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="absolute bottom-0 h-1 w-full bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent" />
          </div>

          <div className="px-8 pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-end -mt-14 gap-6">
              <div className="relative group">
                <div className="w-28 h-28 rounded-3xl border-[6px] border-white shadow-lg overflow-hidden bg-slate-100">
                  {user?.image ? (
                    <img
                      src={user.image}
                      className="w-full h-full object-cover"
                      alt="Profile"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#0f3460] text-[#f59e0b] text-3xl font-black">
                      {user?.name?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 rounded-3xl bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Plus className="text-white" size={24} />
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-[#f59e0b] text-[#0f3460] font-black rounded-2xl text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Pencil size={14} strokeWidth={3} /> Edit Profile
                  </div>
                </motion.button>
                <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl border border-slate-200 hover:bg-slate-100 transition-colors">
                  <ExternalLink size={20} />
                </button>
              </div>
            </div>

            <div className="mt-8">
              <h1 className="text-3xl font-black tracking-tight text-[#0f3460]">
                {user?.name}
              </h1>
              <p className="text-sm font-bold text-slate-400 mt-1">
                Scholar Reference:{" "}
                <span className="font-mono text-[#f59e0b]">
                  {user?.scholar_no}
                </span>
              </p>

              <div className="flex flex-wrap gap-2 mt-5">
                <Badge label={user?.department} color={T.navy} />
                <Badge label={`Year ${user?.year}`} color="#7c3aed" />
                <Badge
                  label="Verified Access"
                  icon={ShieldCheck}
                  color={T.emerald}
                />
              </div>
            </div>
          </div>
        </section>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6"
        >
          <StatCard
            icon={MessageSquareText}
            value={stats.questions}
            label="Inquiries"
            color={T.navy}
          />
          <StatCard
            icon={Library}
            value={stats.answers}
            label="Solutions"
            color="#7c3aed"
          />
          <StatCard
            icon={Award}
            value={stats.votes}
            label="Endorsements"
            color={T.emerald}
          />
          <StatCard
            icon={Bookmark}
            value={stats.bookmarks}
            label="Archived"
            color={T.amber}
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-6 bg-[#f59e0b] rounded-full" />
              <h2 className="text-lg font-black text-[#0f3460] uppercase tracking-tighter">
                Academic Record
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12">
              <DetailRow
                icon={UserRound}
                label="Full Legal Name"
                value={user?.name}
              />
              <DetailRow
                icon={GraduationCap}
                label="Department"
                value={user?.department}
              />
              <DetailRow
                icon={Calendar}
                label="Registration Date"
                value={new Date(user?.createdAt).toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              />
              <DetailRow
                icon={MapPin}
                label="Campus Location"
                value="MANIT Bhopal"
              />
              <DetailRow
                icon={getGenderIcon(user?.gender)}
                label="Gender"
                value={user?.gender}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm flex flex-col"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-black text-[#0f3460] uppercase tracking-tighter">
                Snapshot
              </h2>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
            </div>

            <div className="bg-[#0f172a] rounded-2xl p-6 flex-1 font-mono text-[11px] text-[#f59e0b] leading-relaxed relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-white">
                <ShieldCheck size={80} />
              </div>
              <p className="text-slate-500 mb-4">// System Metadata</p>
              <p>
                <span className="text-slate-400">SCHOLAR:</span>{" "}
                {user?.scholar_no}
              </p>
              <p>
                <span className="text-slate-400">DEPT:</span>{" "}
                {user?.department?.substring(0, 15)}...
              </p>
              <p>
                <span className="text-slate-400">NETWORK:</span> MANIT_SECURE
              </p>
              <p>
                <span className="text-slate-400">STATUS:</span> ACTIVE_SESSION
              </p>
            </div>
          </motion.div>
        </div>

        <footer className="mt-6 bg-white rounded-[2rem] p-12 border border-slate-200 text-center shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0f3460] mb-6">
            Peer Doubt Editorial Charter
          </p>
          <p className="text-slate-500 italic text-sm max-w-xl mx-auto leading-relaxed">
            "Knowledge shared in good faith compounds across cohorts. Treat
            every answer as a footnote in the department's collective
            bibliography."
          </p>
        </footer>
      </div>
    </motion.div>
  );
}
