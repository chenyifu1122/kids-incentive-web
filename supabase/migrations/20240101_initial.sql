-- ============================================
-- 儿童激励兑现 - Supabase 数据库初始化
-- 在 Supabase SQL Editor 中执行此脚本
-- ============================================

-- 1. 启用 UUID 扩展
create extension if not exists "uuid-ossp";

-- 2. 建表

-- 家庭组
create table families (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  invite_code text not null unique,
  created_at timestamptz default now()
);

-- 家庭成员
create table members (
  id uuid default uuid_generate_v4() primary key,
  family_id uuid references families(id) on delete cascade not null,
  user_id uuid not null,
  nickname text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz default now(),
  unique(family_id, user_id)
);

-- 任务
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  family_id uuid references families(id) on delete cascade not null,
  name text not null,
  category text not null,
  coins integer not null,
  overtime_discount integer not null default 50,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- 奖励
create table rewards (
  id uuid default uuid_generate_v4() primary key,
  family_id uuid references families(id) on delete cascade not null,
  name text not null,
  coins_required integer not null,
  description text default '',
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- 任务完成记录
create table completions (
  id uuid default uuid_generate_v4() primary key,
  family_id uuid references families(id) on delete cascade not null,
  task_id uuid references tasks(id) on delete cascade not null,
  member_id uuid references members(id) on delete cascade not null,
  task_name text not null,
  category text not null,
  on_time boolean not null,
  coins_earned integer not null,
  completed_at timestamptz default now()
);

-- 金币流水
create table transactions (
  id uuid default uuid_generate_v4() primary key,
  family_id uuid references families(id) on delete cascade not null,
  member_id uuid references members(id) on delete cascade not null,
  type text not null check (type in ('earn', 'spend')),
  amount integer not null,
  description text not null,
  reference_id uuid,
  created_at timestamptz default now()
);

-- 奖励兑换记录
create table redemptions (
  id uuid default uuid_generate_v4() primary key,
  family_id uuid references families(id) on delete cascade not null,
  reward_id uuid references rewards(id) on delete cascade not null,
  member_id uuid references members(id) on delete cascade not null,
  reward_name text not null,
  coins_spent integer not null,
  status text not null default 'pending' check (status in ('pending', 'fulfilled', 'cancelled')),
  created_at timestamptz default now(),
  fulfilled_at timestamptz
);

-- 3. RLS 辅助函数

create or replace function is_family_member(family_uuid uuid)
returns boolean as $$
  select exists (
    select 1 from members
    where family_id = family_uuid and user_id = auth.uid()
  );
$$ language sql security definer stable;

create or replace function is_family_admin(family_uuid uuid)
returns boolean as $$
  select exists (
    select 1 from members
    where family_id = family_uuid and user_id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- 获取当前用户在指定家庭中的 member_id
create or replace function my_member_id(family_uuid uuid)
returns uuid as $$
  select id from members
  where family_id = family_uuid and user_id = auth.uid()
  limit 1;
$$ language sql security definer stable;

-- 4. 启用 RLS

alter table families enable row level security;
alter table members enable row level security;
alter table tasks enable row level security;
alter table rewards enable row level security;
alter table completions enable row level security;
alter table transactions enable row level security;
alter table redemptions enable row level security;

-- 5. RLS 策略

-- families: 所有已认证用户可查看家庭信息（邀请码本身就是公开的，创建时需要 select 返回数据）
create policy "families_select" on families for select using (auth.uid() is not null);
create policy "families_insert" on families for insert with check (auth.uid() is not null);
create policy "families_update" on families for update using (is_family_admin(id));

-- members: 用户可查看自己所属家庭的所有成员，也可查看自己的记录（解决插入时 select 返回的循环依赖）
create policy "members_select" on members for select using (user_id = auth.uid() OR is_family_member(family_id));
create policy "members_insert" on members for insert with check (user_id = auth.uid());
create policy "members_update" on members for update using (is_family_admin(family_id));
create policy "members_delete" on members for delete using (is_family_admin(family_id));

-- tasks
create policy "tasks_select" on tasks for select using (is_family_member(family_id));
create policy "tasks_insert" on tasks for insert with check (is_family_admin(family_id));
create policy "tasks_update" on tasks for update using (is_family_admin(family_id));
create policy "tasks_delete" on tasks for delete using (is_family_admin(family_id));

-- rewards
create policy "rewards_select" on rewards for select using (is_family_member(family_id));
create policy "rewards_insert" on rewards for insert with check (is_family_admin(family_id));
create policy "rewards_update" on rewards for update using (is_family_admin(family_id));
create policy "rewards_delete" on rewards for delete using (is_family_admin(family_id));

-- completions
create policy "completions_select" on completions for select using (is_family_member(family_id));
create policy "completions_insert" on completions for insert with check (is_family_member(family_id) and member_id = my_member_id(family_id));
create policy "completions_delete" on completions for delete using (is_family_admin(family_id));

-- transactions
create policy "transactions_select" on transactions for select using (is_family_member(family_id));
create policy "transactions_insert" on transactions for insert with check (is_family_member(family_id));

-- redemptions
create policy "redemptions_select" on redemptions for select using (is_family_member(family_id));
create policy "redemptions_insert" on redemptions for insert with check (is_family_member(family_id) and member_id = my_member_id(family_id));
create policy "redemptions_update" on redemptions for update using (is_family_admin(family_id));

-- 6. 性能索引

create index idx_members_family on members(family_id);
create index idx_members_user on members(user_id);
create index idx_tasks_family_active on tasks(family_id, is_active);
create index idx_rewards_family_active on rewards(family_id, is_active);
create index idx_completions_family on completions(family_id);
create index idx_completions_member on completions(member_id);
create index idx_completions_date on completions(completed_at desc);
create index idx_transactions_family on transactions(family_id);
create index idx_transactions_member on transactions(member_id);
create index idx_transactions_date on transactions(created_at desc);
create index idx_redemptions_family on redemptions(family_id);
create index idx_redemptions_status on redemptions(family_id, status);
