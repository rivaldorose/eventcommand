import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main
        className="flex flex-col min-h-screen px-12 pb-12 transition-all duration-300 ease-in-out"
        style={{ marginLeft: collapsed ? 72 : 256 }}
      >
        <Outlet />
        <footer className="flex justify-between items-center py-12 mt-auto text-[11px] font-medium uppercase tracking-widest text-neutral-400">
          <p>&copy; 2026 Event Command Center. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-neutral-950 transition-colors underline-offset-4 hover:underline">Privacy Policy</a>
            <a href="#" className="hover:text-neutral-950 transition-colors underline-offset-4 hover:underline">Terms of Service</a>
            <a href="#" className="hover:text-neutral-950 transition-colors underline-offset-4 hover:underline">Support</a>
          </div>
        </footer>
      </main>
    </div>
  )
}
