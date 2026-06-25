const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value;
  }
});

const url = env.SUPABASE_URL;
const publishableKey = env.SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  console.log("Error: Missing env variables.", { url, publishableKey });
  process.exit(1);
}

const supabase = createClient(url, publishableKey, { auth: { persistSession: false } });

async function run() {
  console.log("Testing signin on URL:", url);
  console.log("Using email: henrysui7@gmail.com");
  
  const timeout = setTimeout(() => {
    console.log("Sign-in request is HANGING (timed out after 10s)!");
    process.exit(1);
  }, 10000);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'henrysui7@gmail.com',
      password: 'zahaumusic@26'
    });
    
    clearTimeout(timeout);
    
    if (error) {
      console.log("Sign-in failed with error:", error.message);
    } else {
      console.log("Sign-in succeeded!", { user: data.user.email, id: data.user.id });
    }
  } catch (err) {
    clearTimeout(timeout);
    console.log("Sign-in exception:", err.message);
  }
}

run();
