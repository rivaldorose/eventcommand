import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import Dashboard from './pages/Dashboard'
import MyEvents from './pages/MyEvents'
import EventEditor from './pages/EventEditor'
import Following from './pages/Following'
import SyncStatus from './pages/SyncStatus'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events" element={<MyEvents />} />
          <Route path="/events/new" element={<EventEditor />} />
          <Route path="/events/:id/edit" element={<EventEditor />} />
          <Route path="/following" element={<Following />} />
          <Route path="/sync/:eventId" element={<SyncStatus />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
