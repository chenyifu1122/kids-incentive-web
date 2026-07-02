import { useState, useEffect } from 'react'
import { useApp } from '../App'
import TaskCard from '../components/TaskCard'
import { getTasks, completeTask } from '../lib/store'
import { CATEGORIES, getCategoryInfo } from '../lib/constants'

export default function Tasks() {
  const { session, viewMemberId } = useApp()
  const familyId = session.family.id
  const memberId = viewMemberId || session.member.id

  const [tasks, setTasks] = useState([])
  const [activeCat, setActiveCat] = useState('all')
  const [confirming, setConfirming] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadTasks() }, [familyId])

  async function loadTasks() {
    try {
      const data = await getTasks(familyId)
      setTasks(data)
    } catch (e) { console.error(e) }
  }

  const filtered = activeCat === 'all' ? tasks : tasks.filter(t => t.category === activeCat)

  async function handleComplete(onTime) {
    if (!confirming) return
    setLoading(true)
    try {
      await completeTask(familyId, memberId, confirming, onTime)
      setConfirming(null)
    } catch (e) {
      alert('完成失败: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold text-gray-800 mb-3">任务列表</h1>

      {/* 分类筛选 */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
        <button onClick={() => setActiveCat('all')}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            activeCat === 'all' ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}>
          全部
        </button>
        {CATEGORIES.map(c => (
          <button key={c.key} onClick={() => setActiveCat(c.key)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              activeCat === c.key ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {/* 任务列表 */}
      <div className="space-y-2">
        {filtered.map(t => (
          <TaskCard key={t.id} task={t} onComplete={setConfirming} />
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">暂无任务</p>
        )}
      </div>

      {/* 完成确认弹窗 */}
      {confirming && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-6" onClick={() => setConfirming(null)}>
          <div className="bg-white rounded-2xl p-5 w-full max-w-xs shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-800 mb-1">完成「{confirming.name}」</h3>
            <p className="text-xs text-gray-400 mb-4">选择完成情况</p>
            <div className="space-y-2">
              <button onClick={() => handleComplete(true)} disabled={loading}
                className="w-full py-3 bg-primary-500 text-white rounded-xl font-medium disabled:opacity-50 active:bg-primary-700 flex items-center justify-center gap-2">
                <span>✅</span> 按时完成 <span className="font-bold">+{confirming.coins}🪙</span>
              </button>
              {confirming.overtime_discount > 0 && (
                <button onClick={() => handleComplete(false)} disabled={loading}
                  className="w-full py-3 bg-amber-50 text-amber-700 rounded-xl font-medium disabled:opacity-50 active:bg-amber-100 flex items-center justify-center gap-2">
                  <span>⏰</span> 超时完成 <span className="font-bold">+{Math.round(confirming.coins * confirming.overtime_discount / 100)}🪙</span>
                  <span className="text-xs">({confirming.overtime_discount}%)</span>
                </button>
              )}
            </div>
            <button onClick={() => setConfirming(null)} className="w-full py-2 mt-3 text-gray-400 text-sm">取消</button>
          </div>
        </div>
      )}
    </div>
  )
}
