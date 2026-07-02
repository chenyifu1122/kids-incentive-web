import { useState, useEffect, createContext, useContext } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Welcome from './pages/Welcome'
import Home from './pages/Home'
import Tasks from './pages/Tasks'
import Rewards from './pages/Rewards'
import Stats from './pages/Stats'
import Admin from './pages/Admin'
import TabBar from './components/TabBar'
import { initSession, signOut } from './lib/store'

// 鍏ㄥ眬涓婁笅鏂?const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

export default function App() {
  const [session, setSession] = useState(null)    // { userId, member, family, loggedIn }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 褰撳墠鏌ョ湅鐨勬垚鍛業D锛堢鐞嗗憳鍙垏鎹㈡煡鐪嬪叾浠栨垚鍛橈級
  const [viewMemberId, setViewMemberId] = useState(null)

  useEffect(() => {
    initSession()
      .then(({ userId, member, loggedIn }) => {
        if (loggedIn && member) {
          setSession({ userId, member, family: member.families, loggedIn: true })
          setViewMemberId(member.id)
        } else if (loggedIn) {
          setSession({ userId, member: null, family: null, loggedIn: true })
        } else {
          setSession({ userId: null, member: null, family: null, loggedIn: false })
        }
      })
      .catch(err => {
        console.error('浼氳瘽鍒濆鍖栧け璐?', err)
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [])

  // 鐧诲綍鎴愬姛鍚庣殑鍥炶皟
  const onLogin = async (userId) => {
    const { member } = await initSession()
    if (member) {
      setSession({ userId, member, family: member.families, loggedIn: true })
      setViewMemberId(member.id)
    } else {
      setSession({ userId, member: null, family: null, loggedIn: true })
    }
  }

  // 鍔犲叆/鍒涘缓瀹跺涵鍚庣殑鍥炶皟
  const onJoined = (member, family) => {
    setSession(prev => ({ ...prev, member, family }))
    setViewMemberId(member.id)
  }

  // 閫€鍑哄搴?  const onLeave = () => {
    setSession(prev => ({ ...prev, member: null, family: null }))
    setViewMemberId(null)
  }

  // 閫€鍑虹櫥褰?  const onSignOut = async () => {
    await signOut()
    setSession({ userId: null, member: null, family: null, loggedIn: false })
    setViewMemberId(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 animate-bounce" />
          <p className="text-gray-400 text-sm">鍔犺浇涓?..</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center">
          <p className="text-red-500 mb-2">鍒濆鍖栧け璐?/p>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">
            閲嶆柊鍔犺浇
          </button>
        </div>
      </div>
    )
  }

  // 鏈櫥褰曟垨鏈姞鍏ュ搴?鈫?娆㈣繋椤?  if (!session?.loggedIn || !session?.member) {
    return (
      <AppContext.Provider value={{ session, onJoined, onLogin }}>
        <Welcome />
      </AppContext.Provider>
    )
  }

  // 宸插姞鍏?鈫?涓荤晫闈?  const isAdmin = session.member.role === 'admin'

  return (
    <AppContext.Provider value={{
      session,
      onLeave,
      onSignOut,
      viewMemberId,
      setViewMemberId,
      isAdmin,
    }}>
      <HashRouter>
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
      </HashRouter>
    </AppContext.Provider>
  )
}
