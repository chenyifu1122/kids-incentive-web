import { useState, useEffect } from 'react'
import { useApp } from '../App'
import { getCategoryStats, getDailyTrend, getTransactions, getMembers } from '../lib/store'
import { CATEGORIES, getCategoryInfo } from '../lib/constants'

export default function Stats() {
  const { session, viewMemberId, setViewMemberId } = useApp()
  const familyId = session.family.id
  const memberId = viewMemberId || session.member.id

  const [stats, setStats] = useState({})
  const [trend, setTrend] = useState({})
  const [transactions, setTransactions] = useState([])
  const [members, setMembers] = useState([])
  const [tab, setTab] = useState('category') // category | trend | history

  useEffect(() => { loadData() }, [memberId])

  async function loadData() {
    try {
      const [s, t, tx, ms] = await Promise.all([
        getCategoryStats(familyId, memberId, 30),
        getDailyTrend(familyId, memberId, 7),
        getTransactions(familyId, memberId, 30),
        getMembers(familyId),
      ])
      setStats(s)
      setTrend(t)
      setTransactions(tx)
      setMembers(ms)
    } catch (e) { console.error(e) }
  }

  const trendMax = Math.max(1, ...Object.values(trend).map(d => d.earn + d.spend))

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold text-gray-800 mb-3">统计</h1>

      {/* 成员切换 */}
      {session.member.role === 'admin' && members.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
          {members.map(m => (
            <button key={m.id} onClick={() => setViewMemberId(m.id)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-sm ${
                m.id === memberId ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border border-gray-200'
              }`}>
              {m.nickname}
            </button>
          ))}
        </div>
      )}

      {/* Tab */}
      <div className="flex gap-2 mb-3">
        {[
          ['category', '分类统计'],
          ['trend', '7日趋势'],
          ['history', '金币流水'],
        ].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-3 py-1.5 rounded-lg text-sm ${tab === k ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* 分类统计 */}
      {tab === 'category' && (
        <div className="space-y-2">
          {CATEGORIES.map(c => {
            const s = stats[c.key]
            if (!s) return null
            return (
              <div key={c.key} className="bg-white rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{c.icon}</span>
                  <span className="text-sm text-gray-700">{c.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-800">{s.count}次</span>
                  <span className="text-xs text-gold-600 ml-2">+{s.coins}🪙</span>
                </div>
              </div>
            )
          })}
          {Object.keys(stats).length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">暂无数据</p>
          )}
        </div>
      )}

      {/* 7日趋势 */}
      {tab === 'trend' && (
        <div className="bg-white rounded-xl p-4">
          <div className="flex items-end gap-1 h-32 mb-2">
            {Object.entries(trend).map(([date, d]) => {
              const earnH = Math.round(d.earn / trendMax * 100)
              const spendH = Math.round(d.spend / trendMax * 100)
              return (
                <div key={date} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div className="w-full flex flex-col items-center" style={{ height: '100%' }}>
                    <div className="flex-1" />
                    <div className="w-full flex gap-px" style={{ height: `${earnH + spendH}%` }}>
                      <div className="flex-1 bg-green-400 rounded-t" style={{ height: earnH > 0 ? `${earnH / (earnH + spendH) * 100}%` : '0%' }} />
                      <div className="flex-1 bg-red-300 rounded-b" style={{ height: spendH > 0 ? `${spendH / (earnH + spendH) * 100}%` : '0%' }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex gap-1">
            {Object.keys(trend).map(d => (
              <div key={d} className="flex-1 text-center text-xs text-gray-400">{d.slice(5)}</div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-400">
            <span><span className="inline-block w-2 h-2 bg-green-400 rounded mr-1" />收入</span>
            <span><span className="inline-block w-2 h-2 bg-red-300 rounded mr-1" />支出</span>
          </div>
        </div>
      )}

      {/* 金币流水 */}
      {tab === 'history' && (
        <div className="space-y-2">
          {transactions.map(t => (
            <div key={t.id} className="bg-white rounded-lg p-3 flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-700">{t.description}</span>
                <span className="text-xs text-gray-400 ml-2">{new Date(t.created_at).toLocaleDateString()}</span>
              </div>
              <span className={`font-bold text-sm ${t.type === 'earn' ? 'text-green-500' : 'text-red-400'}`}>
                {t.type === 'earn' ? '+' : '-'}{t.amount}
              </span>
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">暂无流水</p>
          )}
        </div>
      )}
    </div>
  )
}
