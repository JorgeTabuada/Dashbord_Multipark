import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your actual Supabase URL and Anon Key.
// It's best practice to store these in environment variables.
// For Next.js, create a .env.local file in the root of your project with:
// NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
// NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_anon_key

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Developer guidance: Check if placeholders are still in use
if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn(
    'Supabase client is using placeholder credentials. ' +
    'Please update them in /lib/supabaseClient.js or, preferably, ' +
    'set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
  );
} else if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  // This case handles if one is set but not the other, or if they are set but are the placeholder values
  // which the above 'if' block would catch. This is more for if they are set to something else but not via env vars.
  console.info(
    'Supabase client is configured using fallback values in /lib/supabaseClient.js. ' +
    'For production, it is strongly recommended to use environment variables ' +
    '(NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY).'
  );
}


export const supabase = createClient(supabaseUrl, supabaseAnonKey);
