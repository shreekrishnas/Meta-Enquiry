import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kvdilloynerxxdkcjvxc.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2ZGlsbG95bmVyeHhka2NqdnhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1OTExMjMsImV4cCI6MjEwNDE2NzEyM30.eOEi3hho5s4SXK9yzXnLz85U9OliaK9zXJkNHqEDMaQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
