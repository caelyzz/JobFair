import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Check your .env file.');
}

export const supabase = createClient(
  supabaseUrl || 'https://xmrrquiocxfrysbcovff.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtcnJxdWlvY3hmcnlzYmNvdmZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0ODEzMTEsImV4cCI6MjA5NDA1NzMxMX0.KZhST8DACBHJMVfXJm6H0tFOw4GFwnGHoB4QO01Kv9I'
);
