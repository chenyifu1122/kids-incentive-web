import { useState } from 'react'
import { useApp } from '../App'
import { signIn, signUp, createFamily, joinFamily } from '../lib/store'

export default function Welcome() {
  const { session, onJoined, onLogin } = useApp()
  // 主模式: null=登录 | 'register'=注册 | 'create'=创建家庭 | 'join'=加入家庭
  const [mode, setMode] = useState(null)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [familyName, setFamilyName] = useState('')
  const [adminNickname, setAdminNickname] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!phone.trim()) return setError('请输入手机号')
    if (!/^\d{11}$/.test(phone.trim())) return setError('手机号格式不正确')
    if (!password) return setError('请输入密码')
    setLoading(true); setError('')
    try {
      const data = await signIn(phone.trim(), password)
      onLogin(data.user.id)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleRegister = async () => {
    if (!phone.trim()) return setError('请输入手机号')
    if (!/^\d{11}$/.test(phone.trim())) return setError('手机号格式不正确')
    if (!password) return setError('请输入密码')
    if (password.length < 6) return setError('密码至少6位')
    setLoading(true); setError('')
    try {
      const data = await signUp(phone.trim(), password)
      onLogin(data.user.id)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleCreate = async () => {
    if (!familyName.trim()) return setError('请输入家庭名称')
    setLoading(true); setError('')
    try {
      const { member, family } = await createFamily(familyName.trim(), adminNickname.trim() || '管理员')
      onJoined(member, family)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleJoin = async () => {
    if (!inviteCode.trim()) return setError('请输入邀请码')
    if (!nickname.trim()) return setError('请输入你的昵称')
    setLoading(true); setError('')
    try {
      const { member, family } = await joinFamily(inviteCode.trim(), nickname.trim())
      onJoined(member, family)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  // 已登录但未加入家庭 → 显示创建/加入
  if (session?.loggedIn && !session?.member) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col items-center justify-center p-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-2xl shadow-lg">
            🪙
          </div>
          <h1 className="text-2xl font-bold text-gray-800">儿童激励兑现</h1>
          <p className="text-gray-400 text-sm mt-1">完成任务赚金币，兑换心仪奖励</p>
        </div>

        {!mode ? (
          <div className="w-full max-w-xs space-y-3">
            <button onClick={() => setMode('create')}
              className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium shadow-sm active:bg-primary-700 transition-colors">
              创建家庭
            </button>
            <button onClick={() => setMode('join')}
              className="w-full py-3 bg-white text-primary-600 rounded-xl font-medium border-2 border-primary-200 active:bg-primary-50 transition-colors">
              加入家庭
            </button>
          </div>
        ) : mode === 'create' ? (
          <div className="w-full max-w-xs space-y-3">
            <h2 className="text-lg font-bold text-gray-700 text-center">创建家庭</h2>
            <input value={familyName} onChange={e => setFamilyName(e.target.value)} placeholder="家庭名称（如：快乐家）"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-1 focus:ring-primary-400 outline-none text-sm" />
            <input value={adminNickname} onChange={e => setAdminNickname(e.target.value)} placeholder="你的昵称（默认：管理员）"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-1 focus:ring-primary-400 outline-none text-sm" />
            {error && <p className="text-red-500 text-xs text-center">{error}</p>}
            <button onClick={handleCreate} disabled={loading}
              className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium disabled:opacity-50 active:bg-primary-700 transition-colors">
              {loading ? '创建中...' : '创建并进入'}
            </button>
            <button onClick={() => { setMode(null); setError('') }} className="w-full py-2 text-gray-400 text-sm">
              返回
            </button>
          </div>
        ) : (
          <div className="w-full max-w-xs space-y-3">
            <h2 className="text-lg font-bold text-gray-700 text-center">加入家庭</h2>
            <input value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())} placeholder="输入6位邀请码" maxLength={6}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-1 focus:ring-primary-400 outline-none text-sm text-center tracking-widest font-mono" />
            <input value={nickname} onChange={e => setNickname(e.target.value)} placeholder="你的昵称"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-1 focus:ring-primary-400 outline-none text-sm" />
            {error && <p className="text-red-500 text-xs text-center">{error}</p>}
            <button onClick={handleJoin} disabled={loading}
              className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium disabled:opacity-50 active:bg-primary-700 transition-colors">
              {loading ? '加入中...' : '加入家庭'}
            </button>
            <button onClick={() => { setMode(null); setError('') }} className="w-full py-2 text-gray-400 text-sm">
              返回
            </button>
          </div>
        )}
      </div>
    )
  }

  // 未登录 → 显示登录/注册
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-2xl shadow-lg">
          🪙
        </div>
        <h1 className="text-2xl font-bold text-gray-800">儿童激励兑现</h1>
        <p className="text-gray-400 text-sm mt-1">完成任务赚金币，兑换心仪奖励</p>
      </div>

      {mode !== 'register' ? (
        /* 登录 */
        <div className="w-full max-w-xs space-y-3">
          <h2 className="text-lg font-bold text-gray-700 text-center">登录</h2>
          <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="手机号" maxLength={11} type="tel"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-1 focus:ring-primary-400 outline-none text-sm" />
          <input value={password} onChange={e => setPassword(e.target.value)} placeholder="密码" type="password"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-1 focus:ring-primary-400 outline-none text-sm" />
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          <button onClick={handleLogin} disabled={loading}
            className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium disabled:opacity-50 active:bg-primary-700 transition-colors">
            {loading ? '登录中...' : '登录'}
          </button>
          <p className="text-center text-gray-400 text-sm">
            没有账号？
            <button onClick={() => { setMode('register'); setError('') }} className="text-primary-600 font-medium ml-1">
              注册
            </button>
          </p>
        </div>
      ) : (
        /* 注册 */
        <div className="w-full max-w-xs space-y-3">
          <h2 className="text-lg font-bold text-gray-700 text-center">注册</h2>
          <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="手机号" maxLength={11} type="tel"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-1 focus:ring-primary-400 outline-none text-sm" />
          <input value={password} onChange={e => setPassword(e.target.value)} placeholder="密码（至少6位）" type="password"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-1 focus:ring-primary-400 outline-none text-sm" />
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          <button onClick={handleRegister} disabled={loading}
            className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium disabled:opacity-50 active:bg-primary-700 transition-colors">
            {loading ? '注册中...' : '注册'}
          </button>
          <p className="text-center text-gray-400 text-sm">
            已有账号？
            <button onClick={() => { setMode(null); setError('') }} className="text-primary-600 font-medium ml-1">
              登录
            </button>
          </p>
        </div>
      )}
    </div>
  )
}
