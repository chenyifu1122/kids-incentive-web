import { useState, useEffect } from 'react'
import { useApp } from '../App'
import RewardCard from '../components/RewardCard'
import { getRewards, getRedemptions, getCoinBalance, redeemReward, fulfillRedemption, cancelRedemption } from '../lib/store'

export default function Rewards() {
  const { session, viewMemberId, isAdmin } = useApp()
  const familyId = session.family.id
  const memberId = viewMemberId || session.member.id

  const [tab, setTab] = useState('shop')
  const [rewards, setRewards] = useState([])
  const [redemptions, setRedemptions] = useState([])
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadData() }, [memberId])

  async function loadData() {
    try {
      const [rw, rd, bl] = await Promise.all([
        getRewards(familyId),
        getRedemptions(familyId),
        getCoinBalance(familyId, memberId),
      ])
      setRewards(rw)
      setRedemptions(rd)
      setBalance(bl)
    } catch (e) { console.error(e) }
  }

  async function handleRedeem(reward) {
    if (!confirm(`确定兑换「${reward.name}」？将花费 ${reward.coins_required} 金币`)) return
    setLoading(true)
    try {
      await redeemReward(familyId, memberId, reward)
      await loadData()
    } catch (e) { alert(e.message) }
    finally { setLoading(false) }
  }

  async function handleFulfill(id) {
    setLoading(true)
    try {
      await fulfillRedemption(id)
      await loadData()
    } catch (e) { alert(e.message) }
    finally { setLoading(false) }
  }

  async function handleCancel(id) {
    if (!confirm('确定取消兑换？金币将退还')) return
    setLoading(true)
    try {
      await cancelRedemption(familyId, id)
      await loadData()
    } catch (e) { alert(e.message) }
    finally { setLoading(false) }
  }

  const pending = redemptions.filter(r => r.status === 'pending')
  const fulfilled = redemptions.filter(r => r.status === 'fulfilled')

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold text-gray-800 mb-3">奖励</h1>

      {/* Tab 切换 */}
      <div className="flex gap-2 mb-3">
        <button onClick={() => setTab('shop')}
          className={`px-4 py-1.5 rounded-lg text-sm ${tab === 'shop' ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
          兑换商店
        </button>
        <button onClick={() => setTab('pending')}
          className={`px-4 py-1.5 rounded-lg text-sm relative ${tab === 'pending' ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
          待兑现 {pending.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{pending.length}</span>}
        </button>
      </div>

      {tab === 'shop' ? (
        <div className="space-y-2">
          {rewards.filter(r => r.is_active).map(r => (
            <RewardCard key={r.id} reward={r} coins={balance} onRedeem={handleRedeem} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {pending.map(r => {
            const reward = rewards.find(rw => rw.id === r.reward_id)
            return (
              <RewardCard key={r.id} reward={reward || { name: r.reward_name, coins_required: r.coins_spent }}
                coins={balance} status="pending"
                onFulfill={isAdmin ? () => handleFulfill(r.id) : null}
                onCancel={() => handleCancel(r.id)} />
            )
          })}
          {fulfilled.length > 0 && (
            <>
              <p className="text-xs text-gray-400 mt-4 mb-2">已兑现</p>
              {fulfilled.map(r => {
                const reward = rewards.find(rw => rw.id === r.reward_id)
                return (
                  <RewardCard key={r.id} reward={reward || { name: r.reward_name, coins_required: r.coins_spent }}
                    coins={balance} status="fulfilled" />
                )
              })}
            </>
          )}
          {pending.length === 0 && fulfilled.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">暂无兑换记录</p>
          )}
        </div>
      )}
    </div>
  )
}
