import { createClient } from '@supabase/supabase-js';

// 这些环境变量将在部署平台（如 Vercel）中设置
// 在本地运行时，如果没有这些变量，应用将回退到使用 Mock 数据
// Fix: Cast import.meta to any because TypeScript definition for ImportMeta is missing env property
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export const isSupabaseConfigured = !!supabase;