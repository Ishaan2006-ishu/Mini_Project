import { useEffect, useState } from 'react'
import { authAPI } from '../services/api'
import { useAuth } from '../context/useAuth'
import Navbar from '../components/Navbar'
import Loader from '../components/Loader'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let mounted = true

    const loadProfile = async () => {
      try {
        const { data } = await authAPI.getMe()
        if (!mounted) return
        setForm({ name: data?.user?.name || '' })
        setStats(data?.user || null)
      } catch {
        if (!mounted) return
        setStats(user || null)
        setForm({ name: user?.name || '' })
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadProfile()
    return () => { mounted = false }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || form.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters')
      return
    }

    try {
      setSaving(true)
      const { data } = await authAPI.updateMe({ name: form.name.trim() })
      updateUser(data.user)
      setStats(data.user)
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loader text="Loading profile..." />

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Your Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Review your account details and update your display name.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="card p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold">
                {stats?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{stats?.name || 'User'}</h2>
                <p className="text-sm text-gray-500">{stats?.email}</p>
                <div className="mt-2">
                  {stats?.isPremium ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-2.5 py-1 text-xs font-semibold border border-amber-200">
                      <span>⭐</span>
                      Premium Member
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-700 px-2.5 py-1 text-xs font-semibold border border-gray-200">
                      <span>•</span>
                      Free Profile
                    </span>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Display name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ name: e.target.value })}
                  className="input-field"
                  placeholder="Your name"
                />
              </div>

              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Account summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium text-gray-900 text-right break-all">{stats?.email}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-500">Plan</span>
                  {stats?.isPremium ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-xs font-semibold border border-amber-200">
                      ⭐ Premium
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-700 px-2 py-0.5 text-xs font-semibold border border-gray-200">
                      Free
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-500">Joined</span>
                  <span className="font-medium text-gray-900">
                    {stats?.createdAt ? new Date(stats.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </span>
                </div>
              </div>
            </div>

            <div className="card p-6 bg-indigo-50 border-indigo-100">
              <h3 className="font-semibold text-indigo-900 mb-2">Tip</h3>
              <p className="text-sm text-indigo-700 leading-relaxed">
                Use a clean display name so your interview history and reports are easier to recognize.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
