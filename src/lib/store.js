import { supabase } from './supabase'
import { DEFAULT_TASKS, DEFAULT_REWARDS, generateInviteCode } from './constants'

// ========== 账号体系 ==========

/** 手机号转虚拟邮箱（用户完全无感） */
function phoneToEmail(phone) {
  return `${phone}@kids.app`
}

/** 注册（手机号+密码） */
export async function signUp(phone, password) {
  const email = phoneToEmail(phone)
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) {
    if (error.message.includes('already registered')) throw new Error('该手机号已注册')
    throw error
  }
  return data
}

/** 登录（手机号+密码） */
export async function signIn(phone, password) {
  const email = phoneToEmail(phone)
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    if (error.message.includes('Invalid login')) throw new Error('手机号或密码错误')
    throw error
  }
  return data
}

/** 退出登录 */
export async function signOut() {
  await supabase.auth.signOut()
}

// ========== 会话管理 ==========

/** 初始化会话：检查登录状态，已登录则查找家庭 */
export async function initSession() {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return { userId: null, member: null, loggedIn: false }
  }

  const userId = session.user.id

  // 查找该用户关联的家庭成员记录
  const { data: member } = await supabase
    .from('members')
    .select('*, families(*)')
    .eq('user_id', userId)
    .single()

  return { userId, member, loggedIn: true }
}

/** 获取当前认证用户ID */
export async function getUserId() {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id
}

// ========== 家庭管理 ==========

/** 创建家庭（当前用户成为管理员） */
export async function createFamily(name, adminNickname = '管理员') {
  const userId = await getUserId()
  if (!userId) throw new Error('未登录')

  const inviteCode = generateInviteCode()

  // 插入家庭
  const { data: family, error: fe } = await supabase
    .from('families')
    .insert({ name, invite_code: inviteCode })
    .select()
    .single()
  if (fe) throw fe

  // 插入管理员成员
  const { data: member, error: me } = await supabase
    .from('members')
    .insert({ family_id: family.id, user_id: userId, nickname: adminNickname, role: 'admin' })
    .select()
    .single()
  if (me) throw me

  // 添加默认任务
  const tasks = DEFAULT_TASKS.map((t, i) => ({ ...t, family_id: family.id, sort_order: i }))
  await supabase.from('tasks').insert(tasks)

  // 添加默认奖励
  const rewards = DEFAULT_REWARDS.map((r, i) => ({ ...r, family_id: family.id, sort_order: i }))
  await supabase.from('rewards').insert(rewards)

  return { family, member }
}

/** 通过邀请码加入家庭 */
export async function joinFamily(inviteCode, nickname) {
  const userId = await getUserId()
  if (!userId) throw new Error('未登录')

  // 查找家庭
  const { data: family, error: fe } = await supabase
    .from('families')
    .select()
    .eq('invite_code', inviteCode.toUpperCase())
    .single()
  if (fe || !family) throw new Error('邀请码无效')

  // 检查是否已加入
  const { data: existing } = await supabase
    .from('members')
    .select()
    .eq('family_id', family.id)
    .eq('user_id', userId)
    .single()
  if (existing) throw new Error('你已经加入了这个家庭')

  // 加入
  const { data: member, error: me } = await supabase
    .from('members')
    .insert({ family_id: family.id, user_id: userId, nickname, role: 'member' })
    .select()
    .single()
  if (me) throw me

  return { family, member }
}

/** 获取家庭信息 */
export async function getFamily(familyId) {
  const { data, error } = await supabase.from('families').select().eq('id', familyId).single()
  if (error) throw error
  return data
}

/** 更新家庭信息 */
export async function updateFamily(familyId, updates) {
  const { data, error } = await supabase.from('families').update(updates).eq('id', familyId).select().single()
  if (error) throw error
  return data
}

// ========== 成员管理 ==========

/** 获取家庭所有成员 */
export async function getMembers(familyId) {
  const { data, error } = await supabase.from('members').select().eq('family_id', familyId).order('created_at')
  if (error) throw error
  return data
}

/** 更新成员信息 */
export async function updateMember(memberId, updates) {
  const { data, error } = await supabase.from('members').update(updates).eq('id', memberId).select().single()
  if (error) throw error
  return data
}

/** 删除成员 */
export async function deleteMember(memberId) {
  const { error } = await supabase.from('members').delete().eq('id', memberId)
  if (error) throw error
}

// ========== 任务 ==========

/** 获取家庭任务列表 */
export async function getTasks(familyId, activeOnly = true) {
  let q = supabase.from('tasks').select().eq('family_id', familyId)
  if (activeOnly) q = q.eq('is_active', true)
  const { data, error } = await q.order('sort_order').order('created_at')
  if (error) throw error
  return data
}

/** 添加任务 */
export async function addTask(familyId, task) {
  const { data, error } = await supabase.from('tasks').insert({ ...task, family_id: familyId }).select().single()
  if (error) throw error
  return data
}

/** 更新任务 */
export async function updateTask(taskId, updates) {
  const { data, error } = await supabase.from('tasks').update(updates).eq('id', taskId).select().single()
  if (error) throw error
  return data
}

/** 删除任务 */
export async function deleteTask(taskId) {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId)
  if (error) throw error
}

// ========== 奖励 ==========

/** 获取家庭奖励列表 */
export async function getRewards(familyId, activeOnly = true) {
  let q = supabase.from('rewards').select().eq('family_id', familyId)
  if (activeOnly) q = q.eq('is_active', true)
  const { data, error } = await q.order('sort_order').order('created_at')
  if (error) throw error
  return data
}

/** 添加奖励 */
export async function addReward(familyId, reward) {
  const { data, error } = await supabase.from('rewards').insert({ ...reward, family_id: familyId }).select().single()
  if (error) throw error
  return data
}

/** 更新奖励 */
export async function updateReward(rewardId, updates) {
  const { data, error } = await supabase.from('rewards').update(updates).eq('id', rewardId).select().single()
  if (error) throw error
  return data
}

/** 删除奖励 */
export async function deleteReward(rewardId) {
  const { error } = await supabase.from('rewards').delete().eq('id', rewardId)
  if (error) throw error
}

// ========== 完成任务 ==========

/** 完成任务（含金币计算和流水记录） */
export async function completeTask(familyId, memberId, task, onTime) {
  const coinsEarned = onTime ? task.coins : Math.round(task.coins * task.overtime_discount / 100)
  const desc = onTime ? `按时完成「${task.name}」` : `超时完成「${task.name}」(${task.overtime_discount}%)`

  // 插入完成记录
  const { data: completion, error: ce } = await supabase
    .from('completions')
    .insert({
      family_id: familyId,
      task_id: task.id,
      member_id: memberId,
      task_name: task.name,
      category: task.category,
      on_time: onTime,
      coins_earned: coinsEarned,
    })
    .select()
    .single()
  if (ce) throw ce

  // 插入金币流水
  const { data: transaction, error: te } = await supabase
    .from('transactions')
    .insert({
      family_id: familyId,
      member_id: memberId,
      type: 'earn',
      amount: coinsEarned,
      description: desc,
      reference_id: completion.id,
    })
    .select()
    .single()
  if (te) throw te

  return { completion, transaction }
}

/** 获取完成记录 */
export async function getCompletions(familyId, memberId = null, days = 7) {
  const since = new Date()
  since.setDate(since.getDate() - days)
  
  let q = supabase.from('completions')
    .select()
    .eq('family_id', familyId)
    .gte('completed_at', since.toISOString())
    .order('completed_at', { ascending: false })
  
  if (memberId) q = q.eq('member_id', memberId)
  
  const { data, error } = await q
  if (error) throw error
  return data
}

/** 删除完成记录（管理员） */
export async function deleteCompletion(completionId) {
  const { error } = await supabase.from('completions').delete().eq('id', completionId)
  if (error) throw error
}

// ========== 兑换奖励 ==========

/** 兑换奖励 */
export async function redeemReward(familyId, memberId, reward) {
  // 先检查金币余额
  const balance = await getCoinBalance(familyId, memberId)
  if (balance < reward.coins_required) throw new Error('金币不足')

  // 插入兑换记录
  const { data: redemption, error: re } = await supabase
    .from('redemptions')
    .insert({
      family_id: familyId,
      reward_id: reward.id,
      member_id: memberId,
      reward_name: reward.name,
      coins_spent: reward.coins_required,
      status: 'pending',
    })
    .select()
    .single()
  if (re) throw re

  // 扣减金币
  const { data: transaction, error: te } = await supabase
    .from('transactions')
    .insert({
      family_id: familyId,
      member_id: memberId,
      type: 'spend',
      amount: reward.coins_required,
      description: `兑换「${reward.name}」`,
      reference_id: redemption.id,
    })
    .select()
    .single()
  if (te) throw te

  return { redemption, transaction }
}

/** 获取兑换记录 */
export async function getRedemptions(familyId, status = null) {
  let q = supabase.from('redemptions')
    .select()
    .eq('family_id', familyId)
    .order('created_at', { ascending: false })
  if (status) q = q.eq('status', status)
  const { data, error } = await q
  if (error) throw error
  return data
}

/** 兑现奖励（管理员确认） */
export async function fulfillRedemption(redemptionId) {
  const { data, error } = await supabase
    .from('redemptions')
    .update({ status: 'fulfilled', fulfilled_at: new Date().toISOString() })
    .eq('id', redemptionId)
    .select()
    .single()
  if (error) throw error
  return data
}

/** 取消兑换（退还金币） */
export async function cancelRedemption(familyId, redemptionId) {
  // 获取兑换信息
  const { data: redemption, error: re } = await supabase
    .from('redemptions')
    .select()
    .eq('id', redemptionId)
    .single()
  if (re) throw re
  if (redemption.status !== 'pending') throw new Error('只能取消待兑现的兑换')

  // 更新状态
  const { error: ue } = await supabase
    .from('redemptions')
    .update({ status: 'cancelled' })
    .eq('id', redemptionId)
  if (ue) throw ue

  // 退还金币
  const { data: transaction, error: te } = await supabase
    .from('transactions')
    .insert({
      family_id: familyId,
      member_id: redemption.member_id,
      type: 'earn',
      amount: redemption.coins_spent,
      description: `取消兑换「${redemption.reward_name}」(退还)`,
      reference_id: redemptionId,
    })
    .select()
    .single()
  if (te) throw te

  return transaction
}

// ========== 金币与流水 ==========

/** 计算金币余额（从流水汇总） */
export async function getCoinBalance(familyId, memberId) {
  const { data, error } = await supabase
    .from('transactions')
    .select('type, amount')
    .eq('family_id', familyId)
    .eq('member_id', memberId)
  if (error) throw error

  let balance = 0
  for (const t of data) {
    balance += t.type === 'earn' ? t.amount : -t.amount
  }
  return balance
}

/** 获取金币流水 */
export async function getTransactions(familyId, memberId = null, days = 30) {
  const since = new Date()
  since.setDate(since.getDate() - days)
  
  let q = supabase.from('transactions')
    .select()
    .eq('family_id', familyId)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })
  
  if (memberId) q = q.eq('member_id', memberId)
  
  const { data, error } = await q
  if (error) throw error
  return data
}

// ========== 统计 ==========

/** 按分类统计完成次数和金币 */
export async function getCategoryStats(familyId, memberId = null, days = 30) {
  const since = new Date()
  since.setDate(since.getDate() - days)
  
  let q = supabase.from('completions')
    .select('category, coins_earned')
    .eq('family_id', familyId)
    .gte('completed_at', since.toISOString())
  
  if (memberId) q = q.eq('member_id', memberId)
  
  const { data, error } = await q
  if (error) throw error

  const stats = {}
  for (const c of data) {
    if (!stats[c.category]) stats[c.category] = { count: 0, coins: 0 }
    stats[c.category].count++
    stats[c.category].coins += c.coins_earned
  }
  return stats
}

/** 7日趋势（每天金币收支） */
export async function getDailyTrend(familyId, memberId = null, days = 7) {
  const since = new Date()
  since.setDate(since.getDate() - days)
  since.setHours(0, 0, 0, 0)
  
  let q = supabase.from('transactions')
    .select('type, amount, created_at')
    .eq('family_id', familyId)
    .gte('created_at', since.toISOString())
  
  if (memberId) q = q.eq('member_id', memberId)
  
  const { data, error } = await q
  if (error) throw error

  // 初始化每天数据
  const trend = {}
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    trend[key] = { earn: 0, spend: 0 }
  }

  for (const t of data) {
    const key = t.created_at.slice(0, 10)
    if (trend[key]) {
      if (t.type === 'earn') trend[key].earn += t.amount
      else trend[key].spend += t.amount
    }
  }
  return trend
}
