// Quick Supabase Connection Test
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wmmhkbrinbsbwbaxxzlk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbWhrYnJpbmJzYndiYXh4emxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTgzMDQsImV4cCI6MjA4MzY3NDMwNH0.ambRawkTrixph7zv8qIF9QzSNXKYfH62oWs3XI2SLeU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testConnection() {
  console.log('🔄 Testing Supabase connection...\n');
  
  try {
    // Test 1: Check connection
    const { data, error } = await supabase.from('documents').select('count');
    
    if (error) {
      console.log('❌ Connection Error:', error.message);
      console.log('📝 This is normal if database tables are not yet created.');
    } else {
      console.log('✅ Supabase Connected Successfully!');
      console.log('📊 Documents table accessible');
    }
    
    // Test 2: Check Auth
    const { data: { session } } = await supabase.auth.getSession();
    console.log('🔐 Auth Status:', session ? 'Logged in' : 'Not logged in (OK for testing)');
    
    // Test 3: Check Storage
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    if (buckets) {
      console.log('🗂️  Storage Buckets:', buckets.map(b => b.name).join(', ') || 'None');
    }
    
    console.log('\n✨ Connection test complete!');
  } catch (err) {
    console.error('❌ Fatal Error:', err.message);
  }
}

testConnection();
