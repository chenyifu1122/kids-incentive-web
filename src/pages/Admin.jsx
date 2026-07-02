import { useState, useEffect } from 'react'
import { useApp } from '../App'
import { getTasks, addTask, updateTask, deleteTask, getRewards, addReward, updateReward, deleteReward, getFamily, getMembers, updateFamily } from '../lib/store'
import { CATEGORIES } from '../lib/constants'

export default function Admin() {
  const { session } = useApp()
  const familyId = session.family.id

  const [tab, setTab] = useState('tasks') // tasks | rewards | settings
  const [tasks, setTasks] = useState([])
  const [rewards, setRewards] = useState([])
  const [family, setFamily] = useState(null)
  const [members, setMembers] = useState([])
  const [editing, setEditing] = useState(null) // 正在编辑的项目
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => { loadData() }, [tab])

  async function loadData() {
    try {
      if (tab === 'tasks') setTasks(await getTasks(familyId, false))
      else if (tab === 'rewards') setRewards(await getRewards(familyId, false))
      else {
        const [f, m] = await Promise.all([getFamily(familyId), getMembers(familyId)])
        setFamily(f)
        setMembers(m)
      }
    } catch (e) { console.error(e) }
  }

  // ---- 任务 CRUD ----
  async function handleAddTask(data) {
    await addTask(familyId, data)
    setShowAdd(false)
    loadData()
  }
  async function handleUpdateTask(id, data) {
    await updateTask(id, data)
    setEditing(null)
    loadData()
  }
  async function handleDeleteTask(id) {
    if (!confirm('确定删除此任务？')) return
    await deleteTask(id)
    loadData()
  }

  // ---- 奖励 CRUD ----
  async function handleAddReward(data) {
    await addReward(familyId, data)
    setShowAdd(false)
    loadData()
  }
  async function handleUpdateReward(id, data) {
    await updateReward(id, data)
    setEditing(null)
    loadData()
  }
  async function handleDeleteReward(id) {
    if (!confirm('确定删除此奖励？')) return
    await deleteReward(id)
    loadData()
  }

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold text-gray-800 mb-3">管理</h1>

      {/* Tab */}
      <div className="flex gap-2 mb-3">
        {[
          ['tasks', '任务管理'],
          ['rewards', '奖励管理'],
          ['settings', '家庭设置'],
        ].map(([k, l]) => (
          <button key={k} onClick={() => { setTab(k); setEditing(null); setShowAdd(false) }}
            className={`px-3 py-1.5 rounded-lg text-sm ${tab === k ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* 任务管理 */}
      {tab === 'tasks' && (
        <div>
          <div className="space-y-2 mb-3">
            {tasks.map(t => (
              <div key={t.id} className="bg-white rounded-xl p-3 flex items-center justify-between">
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-800">{t.name}</span>
                  <span className="text-xs text-gray-400 ml-2">{t.coins}🪙</span>
                  {!t.is_active && <span className="text-xs text-gray-300 ml-1">(已停用)</span>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => updateTask(t.id, { is_active: !t.is_active }).then(loadData)}
                    className={`px-2 py-1 text-xs rounded ${t.is_active ? 'text-amber-600 bg-amber-50' : 'text-green-600 bg-green-50'}`}>
                    {t.is_active ? '停用' : '启用'}
                  </button>
                  <button onClick={() => setEditing({ ...t, type: 'task' })} className="px-2 py-1 text-xs text-blue-600 bg-blue-50 rounded">编辑</button>
                  <button onClick={() => handleDeleteTask(t.id)} className="px-2 py-1 text-xs text-red-600 bg-red-50 rounded">删除</button>
                </div>
              </div>
            ))}
          </div>
          {!showAdd && !editing && (
            <button onClick={() => setShowAdd(true)} className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
              + 添加任务
            </button>
          )}
          {showAdd && <TaskForm onSave={handleAddTask} onCancel={() => setShowAdd(false)} />}
          {editing?.type === 'task' && <TaskForm initial={editing} onSave={d => handleUpdateTask(editing.id, d)} onCancel={() => setEditing(null)} />}
        </div>
      )}

      {/* 奖励管理 */}
      {tab === 'rewards' && (
        <div>
          <div className="space-y-2 mb-3">
            {rewards.map(r => (
              <div key={r.id} className="bg-white rounded-xl p-3 flex items-center justify-between">
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-800">{r.name}</span>
                  <span className="text-xs text-gray-400 ml-2">{r.coins_required}🪙</span>
                  {!r.is_active && <span className="text-xs text-gray-300 ml-1">(已停用)</span>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => updateReward(r.id, { is_active: !r.is_active }).then(loadData)}
                    className={`px-2 py-1 text-xs rounded ${r.is_active ? 'text-amber-600 bg-amber-50' : 'text-green-600 bg-green-50'}`}>
                    {r.is_active ? '停用' : '启用'}
                  </button>
                  <button onClick={() => setEditing({ ...r, type: 'reward' })} className="px-2 py-1 text-xs text-blue-600 bg-blue-50 rounded">编辑</button>
                  <button onClick={() => handleDeleteReward(r.id)} className="px-2 py-1 text-xs text-red-600 bg-red-50 rounded">删除</button>
                </div>
              </div>
            ))}
          </div>
          {!showAdd && !editing && (
            <button onClick={() => setShowAdd(true)} className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
              + 添加奖励
            </button>
          )}
          {showAdd && <RewardForm onSave={handleAddReward} onCancel={() => setShowAdd(false)} />}
          {editing?.type === 'reward' && <RewardForm initial={editing} onSave={d => handleUpdateReward(editing.id, d)} onCancel={() => setEditing(null)} />}
        </div>
      )}

      {/* 家庭设置 */}
      {tab === 'settings' && family && (
        <div className="space-y-3">
          <div className="bg-white rounded-xl p-4">
            <label className="text-sm text-gray-600 block mb-1">家庭名称</label>
            <input defaultValue={family.name} onBlur={async e => {
              if (e.target.value !== family.name) await updateFamily(familyId, { name: e.target.value })
            }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="bg-white rounded-xl p-4">
            <label className="text-sm text-gray-600 block mb-1">邀请码</label>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold text-primary-600 tracking-widest">{family.invite_code}</span>
              <button onClick={() => navigator.clipboard?.writeText(family.invite_code)} className="text-xs text-primary-500">复制</button>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4">
            <label className="text-sm text-gray-600 block mb-2">家庭成员</label>
            <div className="space-y-2">
              {members.map(m => (
                <div key={m.id} className="flex items-center justify-between py-1">
                  <span className="text-sm text-gray-700">{m.nickname}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${m.role === 'admin' ? 'bg-primary-50 text-primary-600' : 'bg-gray-50 text-gray-400'}`}>
                    {m.role === 'admin' ? '管理员' : '成员'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---- 表单组件 ----

function TaskForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || '')
  const [category, setCategory] = useState(initial?.category || 'study')
  const [coins, setCoins] = useState(initial?.coins || 10)
  const [discount, setDiscount] = useState(initial?.overtime_discount ?? 50)

  return (
    <div className="bg-white rounded-xl p-4 border border-primary-200 mt-2">
      <h3 className="font-bold text-gray-800 mb-3">{initial ? '编辑任务' : '添加任务'}</h3>
      <div className="space-y-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="任务名称"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
          {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
        </select>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-gray-400">金币</label>
            <input type="number" value={coins} onChange={e => setCoins(+e.target.value)} min={1}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-400">超时折扣%</label>
            <input type="number" value={discount} onChange={e => setDiscount(+e.target.value)} min={0} max={100}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={() => onSave({ name, category, coins, overtime_discount: discount, is_active: true })}
          className="flex-1 py-2 bg-primary-500 text-white rounded-lg text-sm">保存</button>
        <button onClick={onCancel} className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm">取消</button>
      </div>
    </div>
  )
}

function RewardForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || '')
  const [coins, setCoins] = useState(initial?.coins_required || 30)
  const [desc, setDesc] = useState(initial?.description || '')

  return (
    <div className="bg-white rounded-xl p-4 border border-primary-200 mt-2">
      <h3 className="font-bold text-gray-800 mb-3">{initial ? '编辑奖励' : '添加奖励'}</h3>
      <div className="space-y-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="奖励名称"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        <div>
          <label className="text-xs text-gray-400">所需金币</label>
          <input type="number" value={coins} onChange={e => setCoins(+e.target.value)} min={1}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="描述（可选）"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={() => onSave({ name, coins_required: coins, description: desc, is_active: true })}
          className="flex-1 py-2 bg-primary-500 text-white rounded-lg text-sm">保存</button>
        <button onClick={onCancel} className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm">取消</button>
      </div>
    </div>
  )
}
