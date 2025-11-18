
// Configuración de Supabase
const SUPABASE_URL = 'https://uzmkkxnshxvdujlkvlqc.supabase.co'; // Reemplaza con tu URL de Supabase
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bWtreG5zaHh2ZHVqbGt2bHFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTU0NzQsImV4cCI6MjA3ODAzMTQ3NH0.L1D5zV7_i8VbnI0_LrCRaH5YVOfrrh6AUX25xxbajUY'; // Reemplaza con tu clave anónima de Supabase

export const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
