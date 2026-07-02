export default function RewardCard({ reward, coins, onRedeem, onFulfill, onCancel, status }) {
  const canRedeem = coins >= reward.coins_required

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <span className="font-medium text-gray-800">{reward.name}</span>
          {reward.description && (
            <p className="text-xs text-gray-400 mt-1">{reward.description}</p>
          )}
          {status && (
            <span className={`inline-block text-xs mt-1 px-2 py-0.5 rounded-full ${
              status === 'pending' ? 'bg-amber-50 text-amber-600' :
              status === 'fulfilled' ? 'bg-green-50 text-green-600' :
              'bg-gray-50 text-gray-400'
            }`}>
              {status === 'pending' ? '待兑现' : status === 'fulfilled' ? '已兑现' : '已取消'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gold-50 px-2 py-1 rounded-lg">
            <span className="text-sm">🪙</span>
            <span className="font-bold text-gold-600 text-sm">{reward.coins_required}</span>
          </div>
          {onRedeem && (
            <button onClick={() => onRedeem(reward)} disabled={!canRedeem}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                canRedeem ? 'bg-primary-500 text-white active:bg-primary-700' : 'bg-gray-100 text-gray-300'
              }`}>
              兑换
            </button>
          )}
          {onFulfill && status === 'pending' && (
            <button onClick={() => onFulfill()} className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg active:bg-green-700">
              兑现
            </button>
          )}
          {onCancel && status === 'pending' && (
            <button onClick={() => onCancel()} className="px-2 py-1.5 text-gray-400 text-sm rounded-lg border border-gray-200 active:bg-gray-50">
              取消
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
