import { createClient } from '@supabase/supabase-js';


// Initialize Supabase client
// Using direct values from project configuration
const supabaseUrl = 'https://ydcbxqkwuufyjwuzxvpo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkY2J4cWt3dXVmeWp3dXp4dnBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MjY3MTgsImV4cCI6MjA2NTIwMjcxOH0.KM7PdribvZtVNfmjR_Jc9GiOHQVnf7vh99dEUxDoAeE';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };