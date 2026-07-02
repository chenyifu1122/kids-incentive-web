import { useLocation, useNavigate } from 'react-router-dom'

const TABS = [
  { path: '/', label: '首页', icon: HomeIcon },
  { path: '/tasks', label: '任务', icon: CheckIcon },
  { path: '/rewards', label: '奖励', icon: GiftIcon },
  { path: '/stats', label: '统计', icon: ChartIcon },
  { path: '/admin', label: '管理', icon: GearIcon },
]

export default function TabBar({ isAdmin }) {
  const location = useLocation()
  const navigate = useNavigate()
  const tabs = isAdmin ? TABS : TABS.slice(0, 4)

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="max-w-md mx-auto flex">
        {tabs.map(tab => {
          const active = location.pathname === tab.path
          return (
            <button key={tab.path} onClick={() => navigate(tab.path)}
              className={`flex-1 flex flex-col items-center py-2 transition-colors ${active ? 'text-primary-600' : 'text-gray-400'}`}>
              <tab.icon active={active} />
              <span className="text-xs mt-0.5">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

function HomeIcon({ active }) {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={active ? '#16a34a' : '#9ca3af'} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
}
function CheckIcon({ active }) {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={active ? '#16a34a' : '#9ca3af'} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
}
function GiftIcon({ active }) {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={active ? '#16a34a' : '#9ca3af'} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
  </svg>
}
function ChartIcon({ active }) {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={active ? '#16a34a' : '#9ca3af'} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
}
function GearIcon({ active }) {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={active ? '#16a34a' : '#9ca3af'} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
}
