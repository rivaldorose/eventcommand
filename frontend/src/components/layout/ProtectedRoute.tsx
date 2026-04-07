import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'

export default function ProtectedRoute() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-[#999] !text-4xl">sync</span>
          <p className="text-sm text-[#474747] mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
