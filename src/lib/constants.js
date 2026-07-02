// 任务分类
export const CATEGORIES = [
  { key: 'study', label: '学习', icon: '📖', color: '#3B82F6' },
  { key: 'life', label: '生活', icon: '🏠', color: '#10B981' },
  { key: 'sport', label: '运动', icon: '⚽', color: '#F59E0B' },
  { key: 'chores', label: '家务', icon: '🧹', color: '#8B5CF6' },
  { key: 'reading', label: '阅读', icon: '📚', color: '#EC4899' },
  { key: 'art', label: '艺术', icon: '🎨', color: '#14B8A6' },
]

export function getCategoryInfo(key) {
  return CATEGORIES.find(c => c.key === key) || { key, label: key, icon: '📌', color: '#6B7280' }
}

// 默认任务（创建家庭时自动添加）
export const DEFAULT_TASKS = [
  { name: '按时完成作业', category: 'study', coins: 10, overtime_discount: 50 },
  { name: '考试进步', category: 'study', coins: 20, overtime_discount: 100 },
  { name: '早睡早起', category: 'life', coins: 5, overtime_discount: 0 },
  { name: '自己整理房间', category: 'chores', coins: 5, overtime_discount: 50 },
  { name: '帮忙洗碗', category: 'chores', coins: 5, overtime_discount: 50 },
  { name: '运动30分钟', category: 'sport', coins: 8, overtime_discount: 50 },
  { name: '阅读30分钟', category: 'reading', coins: 8, overtime_discount: 50 },
  { name: '练习乐器30分钟', category: 'art', coins: 10, overtime_discount: 50 },
]

// 默认奖励
export const DEFAULT_REWARDS = [
  { name: '看动画片30分钟', coins_required: 30, description: '' },
  { name: '吃冰淇淋', coins_required: 20, description: '' },
  { name: '买一本漫画书', coins_required: 50, description: '' },
  { name: '去游乐场玩', coins_required: 100, description: '' },
  { name: '买一个新玩具', coins_required: 150, description: '' },
  { name: '周末自由活动一天', coins_required: 200, description: '' },
]

// 生成6位邀请码（大写字母+数字）
export function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}
