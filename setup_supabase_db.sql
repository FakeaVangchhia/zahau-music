-- ==========================================
-- ZAHAU MUSIC SCHOOL: SUPABASE DATABASE SETUP
-- ==========================================
-- Copy and paste this script into the Supabase SQL Editor
-- (Dashboard -> SQL Editor -> New Query -> Run)
--
-- This script will:
-- 1. Create all necessary tables, enums, triggers, and functions
-- 2. Configure Row Level Security (RLS) policies
-- 3. Seed the initial 8 courses with curriculum and details
-- 4. Automatically grant the "admin" role to henrysui7@gmail.com

-- 1. ENUMS & EXTENSIONS
CREATE TYPE public.app_role AS ENUM ('admin', 'student');

-- 2. TABLES
-- Profiles Table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles: owner read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Profiles: owner update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Profiles: owner insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- User Roles Table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Roles: self read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Functions & Triggers for Roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO service_role;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  
  IF NEW.email = 'henrysui7@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student');
  END IF;
  
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Leads Table (Consultations)
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  course_interest TEXT,
  message TEXT,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.leads TO anon, authenticated;
GRANT SELECT ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leads: anyone insert" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Leads: admin read" ON public.leads FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Newsletter Table
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.newsletter_subscribers TO anon, authenticated;
GRANT SELECT ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "News: anyone subscribe" ON public.newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "News: admin read" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Courses Table (includes video_url)
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT,
  summary TEXT,
  duration TEXT,
  levels TEXT[],
  curriculum JSONB,
  outcomes TEXT[],
  certification TEXT,
  hero_image TEXT,
  video_url TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.courses TO anon, authenticated;
GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Courses: public read" ON public.courses FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Courses: admin write" ON public.courses FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Enrollments Table
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  level TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  progress INT NOT NULL DEFAULT 0,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enrollments TO authenticated;
GRANT ALL ON public.enrollments TO service_role;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enroll: owner R" ON public.enrollments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Enroll: owner W" ON public.enrollments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enroll: owner U" ON public.enrollments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Enroll: owner D" ON public.enrollments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Events Table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_type TEXT NOT NULL,
  description TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  location TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.events TO anon, authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events: public read" ON public.events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Events: admin write" ON public.events FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Event Registrations Table
CREATE TABLE public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_id)
);
GRANT SELECT, INSERT, DELETE ON public.event_registrations TO authenticated;
GRANT ALL ON public.event_registrations TO service_role;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "EReg: owner R" ON public.event_registrations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "EReg: owner W" ON public.event_registrations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "EReg: owner D" ON public.event_registrations FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Posts Table (Blog)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  body TEXT[] NOT NULL,
  author TEXT NOT NULL DEFAULT 'Faculty Desk',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.posts TO anon, authenticated;
GRANT ALL ON public.posts TO service_role;
GRANT ALL ON public.posts TO authenticated;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Posts: public read" ON public.posts;
CREATE POLICY "Posts: public read" ON public.posts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Posts: admin write" ON public.posts;
CREATE POLICY "Posts: admin write" ON public.posts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));


-- 3. SEED INITIAL COURSES DATA
INSERT INTO public.courses (id, slug, name, tagline, summary, duration, levels, curriculum, outcomes, certification, hero_image, display_order) VALUES 
('ec9a8bb7-1de9-4c8d-b857-cf0728596b45', 'piano', 'Concert Piano', 'Classical technique to jazz improvisation', 'A complete piano programme covering classical repertoire, jazz harmony, sight-reading and performance. Students progress from basic touch and posture through graded exam repertoire to concert-level performance.', '12–36 months', ARRAY['Beginner', 'Intermediate', 'Advanced', 'Performance']::TEXT[], '[{"term":"Term 1: Fundamentals","topics":["Posture and hand position","Five-finger exercises","Simple intervals & scales"]},{"term":"Term 2: Core Technique","topics":["Major and minor scales","Basic sight reading","Hands coordination & pedaling"]},{"term":"Term 3: Intermediate Repertoire","topics":["Classical pieces (Bach, Mozart, Beethoven)","Dynamic control & expression","Performance preparation"]},{"term":"Term 4: Advanced Performance","topics":["Concerto repertoire","Jazz harmony & improvisation","Concert recital preparation"]}]'::JSONB, ARRAY['Read sheet music fluently', 'Perform at recitals', 'ABRSM / Trinity grade ready', 'Improvise over jazz standards']::TEXT[], 'ABRSM / Trinity College London', NULL, 1),

('a1a0f132-5d2c-4544-a0be-bdbe56e5fb5a', 'keyboard', 'Modern Keyboard', 'Synths, pads and live performance', 'Contemporary keyboard for pop, worship and band settings. Students learn chord voicings, rhythmic accompaniment patterns, sound selection and live band coordination.', '6–24 months', ARRAY['Beginner', 'Intermediate', 'Advanced']::TEXT[], '[{"term":"Term 1","topics":["Chord shapes & voicings","Pop progressions","Sound selection & patch design"]},{"term":"Term 2","topics":["Rhythmic comping patterns","Lead lines & fills","Playing in a band context"]},{"term":"Term 3","topics":["Advanced harmony","Worship & contemporary styles","Live performance skills"]}]'::JSONB, ARRAY['Play any pop song', 'Lead a band or worship team', 'Design and navigate synth sounds']::TEXT[], 'Zahau Performance Certificate', NULL, 2),

('78ce58c0-a0f5-4073-b54b-e577b48eb258', 'guitar', 'Modern Guitar', 'Ukelele, Classical, Bass Guitar & Electric', 'Comprehensive guitar programme covering acoustic, electric, bass, classical and ukelele. From open chords and basic strumming to advanced soloing, fingerpicking, and performance across all styles.', '6–36 months', ARRAY['Beginner', 'Intermediate', 'Advanced', 'Performance']::TEXT[], '[{"term":"Term 1: Foundations","topics":["Open chords & strumming patterns","Basic fingerpicking","First songs & music reading"]},{"term":"Term 2: Technique","topics":["Barre chords","Pentatonic & major scales","Lead guitar basics"]},{"term":"Term 3: Styles","topics":["Classical technique (nylon string)","Electric soloing & effects","Bass guitar grooves & bass lines","Ukelele chords & strumming"]},{"term":"Term 4: Performance","topics":["Stage performance skills","Advanced repertoire","Recording & tone shaping"]}]'::JSONB, ARRAY['Play & sing across all styles', 'Solo over backing tracks', 'Read TAB & standard notation', 'Perform on stage confidently']::TEXT[], 'Trinity Rock & Pop', NULL, 3),

('d56d0c9f-f7d0-4225-bcf9-8ec04b5da433', 'drums', 'Drum Lab', 'Rhythmic foundations and polyrhythms', 'Acoustic and electronic drumming — rudiments, grooves, fills and live performance. Students develop timing, independence and stylistic versatility across rock, jazz, pop and Latin genres.', '6–36 months', ARRAY['Beginner', 'Intermediate', 'Advanced', 'Performance']::TEXT[], '[{"term":"Term 1: Fundamentals","topics":["Single & double strokes","Basic rock beat","Counting & subdivisions"]},{"term":"Term 2: Grooves","topics":["16th-note patterns","Hi-hat variations","Fills & transitions"]},{"term":"Term 3: Styles","topics":["Jazz brush technique","Latin patterns","Playing with a click track"]},{"term":"Term 4: Performance","topics":["Band performance skills","Studio recording basics","Electronic drum programming"]}]'::JSONB, ARRAY['Play in a live band', 'Record drum tracks professionally', 'Play across rock, jazz, Latin & pop styles']::TEXT[], 'Trinity Rock & Pop Drums', NULL, 4),

('24af4f02-b783-449d-921e-3f4fb7cafa6d', 'voice', 'Vocal Performance', 'Hindustani, Carnatic & Western vocal', 'Comprehensive vocal training across all three major traditions — Hindustani classical, Carnatic classical, and Western contemporary. Students develop healthy technique, repertoire depth and powerful stage presence.', '6–36 months', ARRAY['Beginner', 'Intermediate', 'Advanced', 'Performance']::TEXT[], '[{"term":"Term 1: Foundations","topics":["Breath support & posture","Range exploration & warm-ups","Pitch accuracy & tone quality"]},{"term":"Term 2: Style Streams","topics":["Hindustani: Ragas & Taal basics","Carnatic: Swara & Varna","Western: Contemporary pop technique & belting"]},{"term":"Term 3: Repertoire","topics":["Song selection & interpretation","Mic technique & stagecraft","Ensemble & harmony singing"]},{"term":"Term 4: Performance","topics":["Concert preparation","Recording vocals in studio","Exam & recital performance"]}]'::JSONB, ARRAY['Sing confidently on stage', 'Perform in Hindustani, Carnatic or Western style', 'Studio-ready vocal technique', 'Control pitch, breath and dynamics']::TEXT[], 'Trinity Rock & Pop Vocals / Sangeet Visharad', NULL, 5),

('a56b3a2d-6455-448a-9a5d-d986fd27ae8a', 'music-theory', 'Music Theory', 'Written theory, oral theory & ear training', 'The shared language of music — reading, writing, analysing, hearing and understanding musical structure. Covers written theory, oral theory, ear training, dictation, and harmony for all instruments and styles.', '3–18 months', ARRAY['Beginner', 'Intermediate', 'Advanced']::TEXT[], '[{"term":"Term 1: Foundations","topics":["Pitch & rhythm reading","Major/minor scales & keys","Intervals & basic harmony"]},{"term":"Term 2: Ear Training","topics":["Melodic dictation","Chord recognition by ear","Rhythmic dictation & sight-singing"]},{"term":"Term 3: Written & Oral Theory","topics":["Four-part harmony","Oral theory examinations","Analysis of musical forms"]},{"term":"Term 4: Advanced","topics":["Modal harmony & jazz theory","Composition & counterpoint","ABRSM Theory exam preparation"]}]'::JSONB, ARRAY['Read & write music fluently', 'Develop a trained musical ear', 'Compose simple pieces', 'Pass ABRSM Theory of Music grades']::TEXT[], 'ABRSM Theory of Music', NULL, 6)
ON CONFLICT (id) DO UPDATE SET 
  slug = EXCLUDED.slug, 
  name = EXCLUDED.name, 
  tagline = EXCLUDED.tagline, 
  summary = EXCLUDED.summary, 
  duration = EXCLUDED.duration, 
  levels = EXCLUDED.levels, 
  curriculum = EXCLUDED.curriculum, 
  outcomes = EXCLUDED.outcomes, 
  certification = EXCLUDED.certification, 
  display_order = EXCLUDED.display_order;

-- Seed Initial Blog Posts
INSERT INTO public.posts (slug, title, excerpt, body, author, date) VALUES 
('how-to-practice', 'How to practice (without quitting)', 'Twenty minutes a day, the right way, beats two hours of frustration. Here''s how faculty structure their own practice.', ARRAY[
  'Most students don''t quit because they lack talent. They quit because they practice in a way that punishes them every time they sit down.',
  'Start with twenty minutes. Open your case, tune, and play one phrase — slowly — until it sounds the way you want. Then stop. That''s a practice session. Tomorrow, you''ll want to do it again.',
  'When you''re ready for more, the structure is: five minutes of fundamentals, ten minutes of your current piece (one section, not the whole thing), and five minutes of just playing for fun. That''s it.',
  'Two hours of guilt-ridden, unfocused practice will set you back further than skipping a day entirely. Be honest with your attention. Music will repay you for it.'
], 'Henry Jahau', '2026-05-12'),

('choosing-first-instrument', 'Choosing your first instrument', 'Posture, attention span, room acoustics — the practical questions parents never think to ask.', ARRAY[
  'Parents usually ask us which instrument is easiest. We never answer that. We ask: how loud is your home, how patient is your child, and what music makes them sit very still?',
  'An eight-year-old who lights up at film scores wants piano or violin. The same age who taps their foot through every song is a drummer. Don''t fight the signal.',
  'Practical notes: piano needs the most floor space; drums need the most ear-protection from siblings; violin needs the most patience in the first year. None of those are reasons to avoid them — just things to plan for.'
], 'Faculty Desk', '2026-04-28'),

('stage-fright', 'Stage fright is a craft, not a curse', 'Why the best performers are the ones who plan their nervousness, not the ones who avoid it.', ARRAY[
  'The myth: confident performers don''t get nervous. The truth: every concert violinist I''ve ever shared a green room with has shaking hands ten minutes before the downbeat.',
  'What separates them is not absence of fear. It''s a routine. They know what they''re going to eat, when they''re going to warm up, what scale they''ll play last, and what they''ll think about as they walk on.',
  'Build your routine in lessons, not on the day. Make stage fright a craft you rehearse, and it stops being a curse.'
], 'Henry Jahau', '2026-03-15'),

('abrsm-prep', 'The honest guide to ABRSM prep', 'What graders actually look for — and what students waste hours preparing.', ARRAY[
  'ABRSM examiners are not trying to catch you out. They''re listening for musicality, control, and accuracy — in that order. Most students prepare in the opposite order.',
  'Spend the first half of your prep on the easiest piece in your list, until it sings. Then move to scales. Then sight-reading. Save the technically hardest piece for last — by then, your hands will be ready for it.',
  'Aural is the smallest section by marks but the easiest to gain points in. Don''t skip it.'
], 'Faculty Desk', '2026-02-02')
ON CONFLICT (slug) DO NOTHING;


-- 4. GRANT ADMIN ROLE
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'henrysui7@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;


-- 5. STORAGE BUCKET & POLICIES SETUP
-- Create 'videos' storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to videos
CREATE POLICY "Allow public read access to videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

-- Allow admins to upload videos
CREATE POLICY "Allow admin insert access to videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'videos' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow admins to update videos
CREATE POLICY "Allow admin update access to videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'videos' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow admins to delete videos
CREATE POLICY "Allow admin delete access to videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'videos' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);


-- 6. MANUAL UPI QR PAYMENTS (replaces Razorpay) — see
-- migrations/20260723000000_create_payments_qr.sql for the full rationale.

-- payment_settings — single-row admin config for the QR
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upi_vpa TEXT NOT NULL DEFAULT '',
  payee_name TEXT NOT NULL DEFAULT 'Zahau Music School',
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payment_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.payment_settings TO authenticated;
GRANT ALL ON public.payment_settings TO service_role;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "PaySettings: public read" ON public.payment_settings
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "PaySettings: admin write" ON public.payment_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.payment_settings (upi_vpa, payee_name) VALUES ('', 'Zahau Music School');

-- payment_submissions — student payments awaiting admin approval
CREATE TABLE IF NOT EXISTS public.payment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL DEFAULT 'enrollment',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  package_title TEXT,
  instrument TEXT,
  day TEXT,
  slot TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  amount INTEGER NOT NULL,
  upi_reference TEXT NOT NULL,
  screenshot_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS payment_submissions_status_idx ON public.payment_submissions (status);
CREATE INDEX IF NOT EXISTS payment_submissions_user_idx ON public.payment_submissions (user_id);
GRANT SELECT ON public.payment_submissions TO authenticated;
GRANT ALL ON public.payment_submissions TO service_role;
ALTER TABLE public.payment_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Payments: owner read" ON public.payment_submissions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Payments: admin read" ON public.payment_submissions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- payment-proofs storage bucket (PRIVATE)
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Proofs: owner insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'payment-proofs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "Proofs: owner read"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'payment-proofs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "Proofs: admin read"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'payment-proofs' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);


-- 7. UPI AUTO-VERIFICATION (KYC-free, via bank-SMS webhook) — see
-- migrations/20260723010000_create_bank_transactions_auto_verify.sql.
CREATE TABLE IF NOT EXISTS public.bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  utr TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  sender TEXT,
  raw_message TEXT,
  matched_submission_id UUID REFERENCES public.payment_submissions(id) ON DELETE SET NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS bank_transactions_matched_idx ON public.bank_transactions (matched_submission_id);
GRANT SELECT ON public.bank_transactions TO authenticated;
GRANT ALL ON public.bank_transactions TO service_role;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "BankTxn: admin read" ON public.bank_transactions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.payment_submissions
  ADD COLUMN IF NOT EXISTS verified_via TEXT,
  ADD COLUMN IF NOT EXISTS bank_txn_id UUID
    REFERENCES public.bank_transactions(id) ON DELETE SET NULL;

