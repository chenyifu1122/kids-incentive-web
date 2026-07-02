import { getCategoryInfo } from '../lib/constants'

export default function TaskCard({ task, onComplete, compact = false }) {
  const cat = getCategoryInfo(task.category)

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">{cat.icon}</span>
            <span className="font-medium text-gray-800">{task.name}</span>
          </div>
          {!compact && (
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: cat.color + '20', color: cat.color }}>
                {cat.label}
              </span>
              {task.overtime_discount < 100 && (
                <span className="text-xs text-gray-400">超时{task.overtime_discount}%</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gold-50 px-2 py-1 rounded-lg">
            <span className="text-sm">🪙</span>
            <span className="font-bold text-gold-600 text-sm">{task.coins}</span>
          </div>
          {onComplete && (
            <button onClick={() => onComplete(task)}
              className="px-3 py-1.5 bg-primary-500 text-white text-sm rounded-lg active:bg-primary-700 transition-colors">
              完成
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
