import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'



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
      const response = await axios.post(
        `${baseUrl}/api/user/verify`,
        { scholar, password },
        { headers: { 'Content-Type': 'application/json' } }
      )
      navigate(`/profile/${response.data.user.id}`)
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Sign in failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
      <div className="flex items-center justify-center py-16 px-6">
        <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md border border-blue-100">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <img
                  src="/manit_logo.png"
                  alt="MANIT Logo"
                  className="w-28 h-28 object-contain"
                />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">Please sign in to your account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="scholar"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Scholar number
              </label>

              <input
                type="text"
                id="scholar"
                name="scholar"
                value={scholar}
                onChange={(e) => setScholar(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200 text-gray-800 bg-gray-50 focus:bg-white"
                placeholder="Enter your scholar number"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200 text-gray-800 bg-gray-50 focus:bg-white"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
