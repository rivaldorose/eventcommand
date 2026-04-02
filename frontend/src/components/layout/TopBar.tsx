import { useNavigate } from 'react-router-dom'
import Icon from '../ui/Icon'

interface TopBarProps {
  title: string
}

export default function TopBar({ title }: TopBarProps) {
  const navigate = useNavigate()

  return (
    <header className="flex justify-between items-center w-full py-6 sticky top-0 bg-[#FAFAFA]/80 backdrop-blur-md z-50">
      <h2 className="text-2xl font-semibold tracking-tight text-[#0A0A0A]">{title}</h2>
      <div className="flex items-center gap-6">
        <div className="flex gap-4 items-center">
          <button className="text-[#999] hover:text-[#0A0A0A] transition-colors">
            <Icon name="notifications" />
          </button>
          <button className="text-[#999] hover:text-[#0A0A0A] transition-colors">
            <Icon name="account_circle" />
          </button>
        </div>
        <button
          onClick={() => navigate('/events/new')}
          className="bg-[#0A0A0A] text-white px-6 py-2 rounded-full text-sm font-semibold tracking-tight hover:opacity-90 active:scale-95 transition-all"
        >
          Create Event
        </button>
      </div>
    </header>
  )
}
