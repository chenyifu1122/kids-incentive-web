import { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Welcome from './pages/Welcome'
import Home from './pages/Home'
import Tasks from './pages/Tasks'
import Rewards from './pages/Rewards'
import Stats from './pages/Stats'
import Admin from './pages/Admin'
import TabBar from './components/TabBar'
import { initSession } from './lib/store'

// 全局上下文
const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

export default function App() {
  const [session, setSession] = useState(null)    // { userId, member, family }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 当前查看的成员ID（管理员可切换查看其他成员）
  const [viewMemberId, setViewMemberId] = useState(null)

  useEffect(() => {
    initSession()
      .then(({ userId, member }) => {
        if (member) {
          setSession({ userId, member, family: member.families })
          setViewMemberId(member.id)
        } else {
          setSession({ userId, member: null, family: null })
        }
      })
      .catch(err => {
        console.error('会话初始化失败:', err)
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [])

  // 加入/创建家庭后的回调
  const onJoined = (member, family) => {
    setSession(prev => ({ ...prev, member, family }))
    setViewMemberId(member.id)
  }

  // 退出家庭
  const onLeave = () => {
    setSession(prev => ({ ...prev, member: null, family: null }))
    setViewMemberId(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 animate-bounce" />
          <p className="text-gray-400 text-sm">加载中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center">
          <p className="text-red-500 mb-2">初始化失败</p>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">
            重新加载
          </button>
        </div>
      </div>
    )
  }

  // 未加入家庭 → 欢迎页
  if (!session?.member) {
    return (
      <AppContext.Provider value={{ session, onJoined }}>
        <Welcome />
      </AppContext.Provider>
    )
  }

  // 已加入 → 主界面
  const isAdmin = session.member.role === 'admin'

  return (
    <AppContext.Provider value={{
      session,
      onLeave,
      viewMemberId,
      setViewMemberId,
      isAdmin,
    }}>
      <BrowserRouter>
        <div className="max-w-md mx-auto min-h-screen bg-gray-50 relative">
          <div className="pb-tab">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/admin" element={isAdmin ? <Admin /> : <Navigate to="/" />} />
            </Routes>
          </div>
          <TabBar isAdmin={isAdmin} />
        </div>
      </BrowserRouter>
    </AppContext.Provider>
  )
}
