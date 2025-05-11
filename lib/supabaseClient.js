import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ppukydptrmevsqtxlhfp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdWt5ZHB0cm1ldnNxdHhsaGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MzAyOTMsImV4cCI6MjA2MTQwNjI5M30.iw_YXVCZgU7SoA6wyXrdTEZNfazXl6a7KxLQ05LbOp4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})