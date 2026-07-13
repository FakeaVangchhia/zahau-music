const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://srxogdtbokmlfibjkvcw.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyeG9nZHRib2ttbGZpYmprdmN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMTM5ODUsImV4cCI6MjA5Nzg4OTk4NX0.-i3qgr8-Cop4_fwVDwuRxpsENgHLuv2JkjfKy-RA9uM";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from("courses").select("*");
  if (error) {
    console.error("Error fetching courses:", error);
  } else {
    console.log(`Fetched ${data.length} courses:`);
    console.log(JSON.stringify(data, null, 2));
  }
}

run();
