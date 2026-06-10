const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nzopgvclvwdpnwofbwlw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56b3BndmNsdndkcG53b2Zid2x3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMTA3MjgsImV4cCI6MjA5NjU4NjcyOH0.O4XtLkRbuN-ijmFKrOcehyCE-IZozT8XDceKCZDVTX8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('courses').select('*');
  if (error) {
    console.error('Error fetching courses:', error);
  } else {
    console.log(`Fetched ${data.length} courses:`);
    console.log(JSON.stringify(data, null, 2));
  }
}

run();
