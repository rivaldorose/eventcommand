import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-[#0A0A0A] mb-2">EventCommand</h1>
          <p className="text-sm text-[#474747]">Create your account</p>
        </div>

        <div className="bg-white rounded-[14px] p-8" style={{ border: '1px solid #EBEBEB' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-[#FEF2F2] text-[#DC2626] text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-widest text-[#474747] mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#f3f3f3] border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#0A0A0A]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-widest text-[#474747] mb-2">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full bg-[#f3f3f3] border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#0A0A0A]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0A0A0A] text-white py-3 rounded-full font-semibold text-sm hover:bg-[#222] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-[#474747] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#0A0A0A] font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
