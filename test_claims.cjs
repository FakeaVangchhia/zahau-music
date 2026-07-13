const { createClient } = require("@supabase/supabase-js");
const client = createClient("https://example.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
console.log("getClaims exists:", typeof client.auth.getClaims);
