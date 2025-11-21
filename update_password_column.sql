-- 运行这行代码来给您的用户表增加“密码”列
-- Run this line to add the 'password' column to your profiles table
alter table public.profiles add column if not exists password text;
