import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { GraduationCap, LogOut, Menu, UserRound, X, PlusCircle } from "lucide-react";

function getUserIdFromToken() {
  const t = localStorage.getItem("token");
  if (!t) return null;
  try {
    let b = t.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/") ?? "";
    while (b.length % 4) b += "=";
    const sub = JSON.parse(atob(b)).sub;
    return typeof sub === "string" && sub ? sub : null;
  } catch {
    return null;
  }
}

const navLinkClass = ({ isActive }) =>
  `relative text-xs font-[1000] uppercase tracking-widest transition-all ${
    isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-950"
  }`;

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userId = getUserIdFromToken();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function signOut() {
    localStorage.removeItem("token");
    setMenuOpen(false);
    navigate("/");
  }

  return (
    <header 
      className={`sticky top-0 z-[100] h-20 flex items-center border-b-4 border-slate-950 transition-colors duration-300 ${
        scrolled ? "bg-white/95 shadow-xl backdrop-blur-md" : "bg-white"
      }`}
    >
      <div className="mx-auto w-full max-w-7xl flex items-center justify-between px-6">
        <Link
          to="/"
          className="flex items-center gap-3 group active:translate-y-0.5 transition-transform"
          onClick={() => setMenuOpen(false)}
        >
          <div className="flex h-10 w-10 items-center justify-center bg-slate-950 text-white rounded-sm shadow-[3px_3px_0px_0px_rgba(30,157,241,1)] group-hover:shadow-[5px_5px_0px_0px_rgba(30,157,241,1)] transition-all">
            <GraduationCap size={22} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-[1000] tracking-tighter text-slate-950 uppercase leading-none">
            PeerDoubt
          </span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/question" end className={navLinkClass}>
            Questions
          </NavLink>
          
          <div className="h-6 w-px bg-slate-200" />

          <Link
            to="/question/create"
            className="flex items-center gap-2 bg-blue-600 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-slate-950 transition-colors rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none"
          >
            <PlusCircle size={14} strokeWidth={3} />
            Ask Question
          </Link>
        </nav>

        <div className="hidden items-center gap-6 md:flex">
          {userId ? (
            <div className="flex items-center gap-4">
              <Link
                to={`/profile/${userId}`}
                className="flex items-center gap-2 border-2 border-slate-950 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-950 hover:bg-slate-50 transition-colors rounded-sm"
              >
                <UserRound size={14} strokeWidth={3} className="text-blue-600" />
                Profile
              </Link>
              <button
                onClick={signOut}
                className="group flex h-9 w-9 items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
              >
                <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-xs font-black uppercase tracking-[0.2em] text-slate-950 border-b-4 border-blue-600 pb-0.5 hover:text-blue-600 transition-all active:translate-y-1"
            >
              Sign In
            </Link>
          )}
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center bg-slate-950 text-white md:hidden rounded-sm active:scale-90 transition-transform"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} strokeWidth={3} /> : <Menu size={20} strokeWidth={3} />}
        </button>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 top-20 z-[90] h-[calc(100vh-80px)] w-full bg-white p-8 md:hidden animate-in fade-in slide-in-from-top-4">
          <nav className="flex flex-col h-full">
            <div className="flex flex-col gap-8">
              <NavLink
                to="/"
                className="text-5xl font-[1000] tracking-tighter text-slate-900 uppercase leading-none"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </NavLink>
              <NavLink
                to="/question"
                className="text-5xl font-[1000] tracking-tighter text-slate-900 uppercase leading-none"
                onClick={() => setMenuOpen(false)}
              >
                Questions
              </NavLink>
              
              <Link
                to="/question/create"
                className="flex items-center justify-center gap-3 bg-blue-600 py-6 text-xl font-black text-white uppercase tracking-widest shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1"
                onClick={() => setMenuOpen(false)}
              >
                <PlusCircle size={24} strokeWidth={3} />
                Ask Question
              </Link>
            </div>

            <div className="mt-auto flex flex-col gap-4 border-t-4 border-slate-950 pt-8">
              {userId ? (
                <>
                  <Link
                    to={`/profile/${userId}`}
                    className="flex items-center justify-between border-2 border-slate-950 p-5 font-black uppercase tracking-widest text-slate-900 rounded-sm"
                    onClick={() => setMenuOpen(false)}
                  >
                    Account Profile
                    <UserRound size={20} className="text-blue-600" strokeWidth={3} />
                  </Link>
                  <button 
                    onClick={signOut} 
                    className="flex items-center justify-between border-2 border-slate-950 p-5 font-black uppercase tracking-widest text-red-500 rounded-sm"
                  >
                    Logout System
                    <LogOut size={20} strokeWidth={3} />
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex w-full items-center justify-center border-4 border-slate-950 py-5 text-xl font-black text-slate-950 uppercase tracking-widest"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}