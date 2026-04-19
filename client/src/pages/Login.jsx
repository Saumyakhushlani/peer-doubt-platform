import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [scholar, setScholar] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
    try {
      const { data } = await axios.post(
        `${baseUrl}/api/user/verify`,
        { scholar, password },
        { headers: { "Content-Type": "application/json" } }
      );
      if (data.token) localStorage.setItem("token", data.token);
      navigate(`/profile/${data.user.id}`);
    } catch (err) {
      setError(
        err.response?.data?.error ?? "Invalid scholar number or password"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col font-sans text-slate-900 selection:bg-blue-200/80 selection:text-slate-900 lg:flex-row">
      {/* Left: brand (stacked on top on mobile) */}
      <div className="relative flex flex-col justify-center overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 px-8 py-12 text-white lg:w-1/2 lg:min-h-0 lg:px-12 lg:py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.12) 0%, transparent 45%), radial-gradient(circle at 80% 70%, rgba(59,130,246,0.25) 0%, transparent 40%)",
          }}
        />
        <div className="relative mx-auto w-full max-w-md lg:mx-0">
          <div className="mb-8 flex justify-center lg:justify-start">
            <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-white/10 shadow-lg ring-1 ring-white/20 backdrop-blur-sm sm:h-32 sm:w-32">
              <img
                src="/manit_logo.png"
                alt="MANIT"
                className="h-24 w-24 object-contain sm:h-28 sm:w-28"
              />
            </div>
          </div>
          <h1 className="text-center text-3xl font-semibold tracking-tight lg:text-left lg:text-4xl">
            Peer Doubt
          </h1>
          <p className="mt-3 text-center text-sm leading-relaxed text-blue-100 lg:text-left lg:text-base">
            Sign in with the same scholar ID and password you use on{" "}
            <a
              href="https://stu.manit.ac.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-white underline decoration-white/40 underline-offset-2 transition-colors hover:text-blue-50"
            >
              stu.manit.ac.in
            </a>
            .
          </p>
          <p className="mt-6 hidden text-sm text-blue-200/90 lg:block">
            For MANIT Bhopal scholars only.
          </p>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex flex-1 flex-col justify-center bg-slate-50 px-4 py-10 lg:w-1/2 lg:bg-white lg:px-12 lg:py-16">
        <div className="mx-auto w-full max-w-md">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            Back to home
          </Link>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm sm:p-10 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Sign in
              </h2>
              <p className="mt-2 hidden text-sm text-slate-600 lg:block">
                Enter your credentials to continue.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-red-100 bg-red-50/90 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="scholar"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Scholar number
                </label>
                <input
                  id="scholar"
                  type="text"
                  value={scholar}
                  onChange={(e) => setScholar(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 focus:border-blue-700 focus:ring-4 focus:ring-blue-700/12"
                  placeholder="21111XXXX"
                  autoComplete="username"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 focus:border-blue-700 focus:ring-4 focus:ring-blue-700/12"
                  placeholder="Same password as stu.manit.ac.in"
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-700/25 transition-all hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                    Signing in…
                  </>
                ) : (
                  "Continue"
                )}
              </button>
            </form>
          </div>

          <p className="mt-8 text-center text-xs text-slate-500 lg:text-left">
            For MANIT Bhopal scholars only. Credentials match{" "}
            <a
              href="https://stu.manit.ac.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-700 underline decoration-blue-700/25 underline-offset-2 hover:text-blue-800"
            >
              stu.manit.ac.in
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
