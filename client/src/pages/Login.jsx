import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Lock, User, Loader2, ShieldCheck } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [scholar, setScholar] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
    try {
      const { data } = await axios.post(
        `${baseUrl}/api/user/verify`,
        { scholar, password },
        { headers: { 'Content-Type': 'application/json' } }
      )
      if (data.token) localStorage.setItem('token', data.token)
      navigate(`/profile/${data.user.id}`)
    } catch (err) {
      setError(err.response?.data?.error ?? 'Invalid scholar number or password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="h-20 w-20 bg-slate-950 flex items-center justify-center rounded-sm border-4 border-slate-950 shadow-[6px_6px_0px_0px_rgba(30,157,241,1)]">
              <img src="/manit_logo.png" alt="MANIT" className="h-14 w-14 object-contain " />
            </div>
          </div>
          
          <h1 className="text-3xl font-[1000] text-slate-950 tracking-tighter uppercase leading-none">Scholar Portal</h1>
          
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="bg-emerald-500 text-white px-2 py-0.5 border-2 border-slate-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={12} strokeWidth={3} />
                <span className="text-[10px] font-black uppercase tracking-widest">Internal Auth</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-4 border-slate-950 p-8 bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)]">
          {error && (
            <div className="mb-6 border-2 border-slate-950 bg-red-50 p-4 text-[10px] font-black uppercase tracking-tight text-red-600">
              Error: {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <User size={14} strokeWidth={3} className="text-blue-600" />
                Scholar Number
              </label>
              <input
                type="text"
                value={scholar}
                onChange={(e) => setScholar(e.target.value)}
                className="w-full border-4 border-slate-950 p-4 text-sm font-bold text-slate-950 focus:border-blue-600 outline-none transition-colors placeholder:text-slate-200"
                placeholder="21111XXXX"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <Lock size={14} strokeWidth={3} className="text-blue-600" />
                Portal Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-4 border-slate-950 p-4 text-sm font-bold text-slate-950 focus:border-blue-600 outline-none transition-colors placeholder:text-slate-200"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-950 text-white py-5 mt-4 text-xs font-black uppercase tracking-[0.3em] transition-all active:translate-y-1 active:shadow-none shadow-[6px_6px_0px_0px_rgba(30,157,241,1)] flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" strokeWidth={3} />
                  Verifying
                </>
              ) : (
                'Enter System'
              )}
            </button>
          </form>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] leading-loose">
            Knowledge Access Restricted to <br /> 
            MANIT Bhopal Scholars Only
          </p>
        </div>
      </div>
    </div>
  )
}