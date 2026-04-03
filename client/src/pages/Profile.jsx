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
  Hash,
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

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

/** First letter of first name + first letter of last name (by word). */
function nameInitials(name) {
  if (!name || typeof name !== "string") return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    const w = parts[0];
    return (w[0] ?? "?").toUpperCase();
  }
  const a = parts[0][0] ?? "";
  const b = parts[parts.length - 1][0] ?? "";
  return `${a}${b}`.toUpperCase();
}

function statIconSurface(color) {
  if (typeof color === "string" && color.startsWith("var(")) {
    return `color-mix(in srgb, ${color} 18%, transparent)`;
  }
  return `${color}12`;
}

function statCardBoxStyle(color) {
  if (typeof color === "string" && color.startsWith("var(")) {
    return {
      backgroundColor: `color-mix(in srgb, ${color} 9%, #ffffff)`,
      borderColor: `color-mix(in srgb, ${color} 28%, #e2e8f0)`,
    };
  }
  return {
    backgroundColor: `${color}08`,
    borderColor: `${color}28`,
  };
}

/** Theme tokens from global CSS (:root) */
const theme = {
  primaryBg: "var(--color-theme-primary-bg)",
  primaryFg: "var(--color-theme-primary-fg)",
  secondaryBg: "var(--color-theme-secondary-bg)",
  secondaryFg: "var(--color-theme-secondary-fg)",
  pageBg: "var(--color-theme-page-bg)",
  muted: "var(--color-theme-muted)",
};

const StatCard = ({ icon: Icon, value, label, color }) => (
  <motion.div
    whileHover={{ y: -4, boxShadow: "0 12px 28px -12px rgba(30, 157, 241, 0.2)" }}
    className="p-5 rounded-2xl border shadow-sm flex items-center gap-4"
    style={statCardBoxStyle(color)}
  >
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
      style={{ backgroundColor: statIconSurface(color), color }}
    >
      <Icon size={22} strokeWidth={2.25} />
    </div>
    <div className="min-w-0">
      <div
        className="text-2xl font-bold tabular-nums leading-none"
        style={{ color: "var(--color-theme-secondary-bg)" }}
      >
        {value || 0}
      </div>
      <div
        className="text-[11px] font-bold uppercase tracking-tight mt-1"
        style={{ color: theme.muted }}
      >
        {label}
      </div>
    </div>
  </motion.div>
);

const DetailRow = ({ icon: Icon, label, value, mono, iconColor }) => {
  const accent = iconColor ?? "var(--color-theme-primary-bg)";
  return (
    <div
      className="flex items-start gap-4 py-4 border-b last:border-b-0"
      style={{
        borderBottomColor:
          "color-mix(in srgb, var(--color-theme-primary-bg) 12%, #e2e8f0)",
      }}
    >
      <div
        className="mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
        style={{
          backgroundColor: `color-mix(in srgb, ${accent} 14%, #ffffff)`,
          borderColor: `color-mix(in srgb, ${accent} 25%, #e2e8f0)`,
          color: accent,
        }}
      >
        <Icon size={18} strokeWidth={2.25} />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="text-[10px] uppercase tracking-[0.1em] font-black mb-0.5"
          style={{ color: theme.muted }}
        >
          {label}
        </p>
        <p
          className={`text-sm font-semibold text-[var(--color-theme-secondary-bg)] ${mono ? "font-mono text-xs" : ""}`}
        >
          {value || "—"}
        </p>
      </div>
    </div>
  );
};

function badgeStyles(color) {
  if (typeof color === "string" && color.startsWith("var(")) {
    return {
      backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
      color,
      borderColor: `color-mix(in srgb, ${color} 28%, transparent)`,
    };
  }
  return {
    backgroundColor: `${color}10`,
    color,
    borderColor: `${color}25`,
  };
}

const Badge = ({ label, icon: Icon, color }) => (
  <span
    className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border flex items-center gap-2"
    style={badgeStyles(color)}
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
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ backgroundColor: theme.pageBg }}
      >
        <Loader2
          className="animate-spin"
          style={{ color: theme.primaryBg }}
          size={32}
        />
        <span className="mt-4 text-sm font-bold text-slate-500 tracking-widest uppercase">
          Fetching Profile...
        </span>
      </div>
    );

  if (error)
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ backgroundColor: theme.pageBg }}
      >
        <div
          className="text-center p-12 bg-white rounded-3xl shadow-sm max-w-sm"
          style={{ borderColor: "var(--color-theme-border)", borderWidth: 1 }}
        >
          <p className="text-red-500 font-bold mb-6">{error}</p>
          <Link
            to="/"
            className="text-sm font-black uppercase tracking-widest underline underline-offset-8"
            style={{ color: theme.secondaryBg }}
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
      className="min-h-screen pb-20"
      style={{
        fontFamily: "'Inter', 'DM Sans', sans-serif",
        backgroundColor: theme.pageBg,
      }}
    >
      <div className="max-w-5xl mx-auto px-6">
        <div className="py-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold transition-opacity hover:opacity-85 rounded-xl px-3 py-2 border"
            style={{
              color: theme.primaryBg,
              backgroundColor:
                "color-mix(in srgb, var(--color-theme-primary-bg) 10%, #ffffff)",
              borderColor:
                "color-mix(in srgb, var(--color-theme-primary-bg) 22%, #e2e8f0)",
            }}
          >
            <ArrowLeft size={14} strokeWidth={3} /> BACK TO DASHBOARD
          </Link>
        </div>

        <section
            className="rounded-2xl border shadow-sm bg-white overflow-hidden"
            style={{
              borderColor:
                "color-mix(in srgb, var(--color-theme-primary-bg) 15%, #e2e8f0)",
            }}
          >
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,7.5rem)_1fr] gap-8 md:gap-10 md:items-start">
                {/* Avatar column */}
                <div className="flex justify-center md:justify-start">
                  <div
                    className="relative group h-[7.5rem] w-[7.5rem] shrink-0 rounded-2xl border-2 overflow-hidden shadow-md"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--color-theme-primary-bg) 35%, #e2e8f0)",
                      backgroundColor: "var(--color-theme-avatar-bg)",
                    }}
                  >
                    <div
                      className="h-full w-full flex items-center justify-center text-3xl font-black tracking-tight"
                      style={{
                        color: "var(--color-theme-avatar-fg)",
                      }}
                    >
                      {nameInitials(user?.name)}
                    </div>
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                      style={{
                        backgroundColor:
                          "color-mix(in srgb, var(--color-theme-primary-bg) 45%, transparent)",
                      }}
                    >
                      <Plus
                        style={{ color: "var(--color-theme-primary-fg)" }}
                        size={22}
                      />
                    </div>
                  </div>
                </div>

                {/* Identity + actions */}
                <div className="min-w-0 flex flex-col gap-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
                    <div className="min-w-0 space-y-2 text-center md:text-left">
                      <h1
                        className="text-2xl sm:text-3xl font-black tracking-tight leading-tight break-words"
                        style={{ color: theme.secondaryBg }}
                      >
                        {user?.name}
                      </h1>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: theme.muted }}
                      >
                        Scholar No.{" "}
                        <span
                          className="font-mono font-bold"
                          style={{ color: theme.primaryBg }}
                        >
                          {user?.scholar_no}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start lg:justify-end gap-2 lg:shrink-0 lg:pt-1">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        className="inline-flex items-center gap-2 px-5 py-2.5 font-black rounded-xl text-[10px] sm:text-xs uppercase tracking-widest shadow-sm"
                        style={{
                          backgroundColor: theme.primaryBg,
                          color: theme.primaryFg,
                        }}
                      >
                        <Pencil size={14} strokeWidth={3} /> Edit
                      </motion.button>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center p-2.5 rounded-xl border"
                        style={{
                          backgroundColor:
                            "color-mix(in srgb, var(--color-theme-primary-bg) 8%, #ffffff)",
                          borderColor:
                            "color-mix(in srgb, var(--color-theme-primary-bg) 25%, #e2e8f0)",
                          color: "var(--color-theme-primary-bg)",
                        }}
                      >
                        <ExternalLink size={20} strokeWidth={2.25} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
                    <Badge label={user?.department} color={theme.primaryBg} />
                    <Badge label={`Year ${user?.year}`} color="#7c3aed" />
                    <Badge
                      label="Verified"
                      icon={ShieldCheck}
                      color="#10b981"
                    />
                  </div>
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
            label="Questions"
            color={theme.primaryBg}
          />
          <StatCard
            icon={Library}
            value={stats.answers}
            label="Answers"
            color="#7c3aed"
          />
          <StatCard
            icon={Award}
            value={stats.votes}
            label="Votes"
            color="#10b981"
          />
          <StatCard
            icon={Bookmark}
            value={stats.bookmarks}
            label="Bookmarks"
            color={theme.primaryBg}
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3 rounded-[2rem] p-8 shadow-sm border"
            style={{
              borderColor:
                "color-mix(in srgb, var(--color-theme-primary-bg) 18%, #e2e8f0)",
              backgroundColor:
                "color-mix(in srgb, var(--color-theme-primary-bg) 5%, #ffffff)",
            }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div
                className="w-1.5 h-6 rounded-full"
                style={{ backgroundColor: theme.primaryBg }}
              />
              <h2
                className="text-lg font-black uppercase tracking-tighter"
                style={{ color: theme.secondaryBg }}
              >
                Academic Record
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12">
              <DetailRow
                icon={UserRound}
                label="Full Legal Name"
                value={user?.name}
                iconColor={theme.primaryBg}
              />
              <DetailRow
                icon={Hash}
                label="Scholar No."
                value={user?.scholar_no}
                mono
                iconColor={theme.primaryBg}
              />
              <DetailRow
                icon={GraduationCap}
                label="Department"
                value={user?.department}
                iconColor="#7c3aed"
              />
              <DetailRow
                icon={Calendar}
                label="Registration Date"
                value={new Date(user?.createdAt).toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
                iconColor={theme.primaryBg}
              />
              <DetailRow
                icon={MapPin}
                label="Campus Location"
                value="MANIT Bhopal"
                iconColor="#10b981"
              />
              <DetailRow
                icon={getGenderIcon(user?.gender)}
                label="Gender"
                value={user?.gender}
                iconColor={theme.primaryBg}
              />
            </div>
          </motion.div>
        </div>

        <footer
          className="mt-6 rounded-[2rem] p-12 text-center shadow-sm border"
          style={{
            borderColor:
              "color-mix(in srgb, var(--color-theme-primary-bg) 18%, #e2e8f0)",
            backgroundColor:
              "color-mix(in srgb, var(--color-theme-primary-bg) 6%, #ffffff)",
          }}
        >
          <p
            className="text-[10px] font-black uppercase tracking-[0.3em] mb-6"
            style={{ color: theme.secondaryBg }}
          >
            Peer Doubt Editorial Charter
          </p>
          <p
            className="italic text-sm max-w-xl mx-auto leading-relaxed"
            style={{ color: theme.muted }}
          >
            "Knowledge shared in good faith compounds across cohorts. Treat
            every answer as a footnote in the department's collective
            bibliography."
          </p>
        </footer>
      </div>
    </motion.div>
  );
}