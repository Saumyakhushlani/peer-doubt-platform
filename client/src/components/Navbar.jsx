import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { GraduationCap, LogOut, Menu, UserRound, X } from "lucide-react";

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
  `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
    isActive
      ? "bg-sky-100 text-[#1e9df1]"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const userId = getUserIdFromToken();

  function signOut() {
    localStorage.removeItem("token");
    setMenuOpen(false);
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 text-[#0f1419]"
          onClick={() => setMenuOpen(false)}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1e9df1] text-white shadow-sm">
            <GraduationCap className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <span className="hidden font-black tracking-tight sm:inline sm:text-lg">
            Peer Doubt
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/question" end className={navLinkClass}>
            Questions
          </NavLink>
          <Link
            to="/question/create"
            className="ml-1 rounded-lg bg-[#1e9df1] px-4 py-2 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-95"
          >
            Ask
          </Link>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {userId ? (
            <>
              <Link
                to={`/profile/${userId}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <UserRound className="h-4 w-4 text-[#1e9df1]" />
                Profile
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
            >
              Sign in
            </Link>
          )}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            <NavLink
              to="/"
              end
              className={navLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              to="/question"
              end
              className={navLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              Questions
            </NavLink>
            <Link
              to="/question/create"
              className="mt-1 rounded-lg bg-[#1e9df1] px-3 py-2.5 text-center text-sm font-bold text-white"
              onClick={() => setMenuOpen(false)}
            >
              Ask a question
            </Link>
            <div className="my-2 border-t border-slate-100 pt-2">
              {userId ? (
                <>
                  <Link
                    to={`/profile/${userId}`}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    <UserRound className="h-4 w-4 text-[#1e9df1]" />
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={signOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block rounded-lg bg-slate-900 px-3 py-2.5 text-center text-sm font-bold text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign in
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
