import { useState, useEffect } from 'react'
import { useApp } from '../App'
import CoinDisplay from '../components/CoinDisplay'
import { getCoinBalance, getRewards, getCompletions, getMembers, getFamily } from '../lib/store'

export default function Home() {
  const { session, viewMemberId, setViewMemberId } = useApp()
  const familyId = session.family.id
  const memberId = viewMemberId || session.member.id

  const [balance, setBalance] = useState(0)
  const [nextReward, setNextReward] = useState(null)
  const [recent, setRecent] = useState([])
  const [members, setMembers] = useState([])
  const [family, setFamily] = useState(null)

  useEffect(() => {
    loadData()
  }, [memberId])

  async function loadData() {
    try {
      const [b, rewards, comps, mems, fam] = await Promise.all([
        getCoinBalance(familyId, memberId),
        getRewards(familyId),
        getCompletions(familyId, memberId, 3),
        getMembers(familyId),
        getFamily(familyId),
      ])
      setBalance(b)
      setMembers(mems)
      setFamily(fam)
      setRecent(comps.slice(0, 5))
      const affordable = rewards.filter(r => r.is_active).sort((a, b) => a.coins_required - b.coins_required)
      setNextReward(affordable.find(r => r.coins_required > b) || affordable[0])
    } catch (e) { console.error(e) }
  }

  const progress = nextReward ? Math.min(100, Math.round(balance / nextReward.coins_required * 100)) : 0

  const currentMember = members.find(m => m.id === memberId)

  return (
    <div className="p-4">
      {/* 头部：家庭名+成员 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-gray-800">{family?.name || '我的家庭'}</h1>
          <p className="text-xs text-gray-400">{currentMember?.nickname || session.member.nickname}</p>
        </div>
        {session.member.role === 'admin' && family && (
          <div className="text-xs bg-primary-50 text-primary-600 px-2 py-1 rounded-lg">
            邀请码: {family.invite_code}
          </div>
        )}
      </div>

      {/* 金币余额 */}
      <div className="bg-gradient-to-r from-gold-400 to-gold-500 rounded-2xl p-5 text-center shadow-md mb-4">
        <p className="text-white/80 text-sm mb-1">金币余额</p>
        <CoinDisplay amount={balance} size="lg" />
        {balance > 0 && (
          <p className="text-white/60 text-xs mt-1">继续加油！</p>
        )}
      </div>

      {/* 进度条：距下一个奖励 */}
      {nextReward && (
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">距「{nextReward.name}」</span>
            <span className="text-xs text-gray-400">{balance}/{nextReward.coins_required}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* 成员列表（管理员可切换查看） */}
      {session.member.role === 'admin' && members.length > 1 && (
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2">查看成员</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {members.map(m => (
              <button key={m.id}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  m.id === memberId ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border border-gray-200'
                }`}
                onClick={() => setViewMemberId && setViewMemberId(m.id)}>
                {m.nickname}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 最近完成 */}
      {recent.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-2">最近完成</p>
          <div className="space-y-2">
            {recent.map(c => (
              <div key={c.id} className="bg-white rounded-lg p-3 flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-700">{c.task_name}</span>
                  <span className={`text-xs ml-2 ${c.on_time ? 'text-green-500' : 'text-amber-500'}`}>
                    {c.on_time ? '按时' : '超时'}
                  </span>
                </div>
                <span className="text-sm font-bold text-gold-600">+{c.coins_earned}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
