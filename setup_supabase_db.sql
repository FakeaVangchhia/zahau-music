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
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student');
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


-- 3. SEED INITIAL COURSES DATA
INSERT INTO public.courses (id, slug, name, tagline, summary, duration, levels, curriculum, outcomes, certification, hero_image, display_order) VALUES 
('ec9a8bb7-1de9-4c8d-b857-cf0728596b45', 'piano', 'Concert Piano', 'Classical technique to jazz improvisation', 'A complete piano programme covering classical repertoire, jazz harmony, sight-reading and performance.', '12–36 months', ARRAY['Beginner', 'Intermediate', 'Advanced', 'Performance']::TEXT[], '[{"term":"Term 1: Fundamentals","topics":["Posture and hand position","Five-finger scales","Simple intervals"]},{"term":"Term 2: Core Technique","topics":["Major and minor scales","Basic sight reading","Hands coordination"]},{"term":"Term 3: Intermediate Repertoire","topics":["Classical pieces introduction","Pedaling technique","Dynamic control"]}]'::JSONB, ARRAY['Read sheet music fluently', 'Perform at recitals', 'ABRSM grade ready']::TEXT[], 'ABRSM / Trinity College London', NULL, 1),

('a1a0f132-5d2c-4544-a0be-bdbe56e5fb5a', 'keyboard', 'Modern Keyboard', 'Synths, pads and live performance', 'Contemporary keyboard for pop, worship and band settings — chords, voicings, sounds.', '6–24 months', ARRAY['Beginner', 'Intermediate', 'Advanced']::TEXT[], '[{"term":"Term 1","topics":["Chord shapes","Pop progressions","Sound selection"]}]'::JSONB, ARRAY['Play any pop song', 'Lead a band']::TEXT[], 'Zahau Performance Certificate', NULL, 2),

('78ce58c0-a0f5-4073-b54b-e577b48eb258', 'guitar', 'Modern Guitar', 'Electric and acoustic mastery', 'Acoustic, electric and fingerstyle guitar across genres — from open chords to soloing.', '6–36 months', ARRAY['Beginner', 'Intermediate', 'Advanced', 'Performance']::TEXT[], '[{"term":"Term 1","topics":["Open chords","Strumming patterns","First song"]},{"term":"Term 2","topics":["Barre chords","Pentatonic scale","Lead basics"]}]'::JSONB, ARRAY['Play & sing', 'Solo over backing tracks', 'Stage-ready']::TEXT[], 'Trinity Rock & Pop', NULL, 3),

('8fec778c-4ba9-4abe-af5c-ba59dc22bb18', 'bass', 'Bass Guitar', 'The heartbeat of every band', 'Groove, theory and live-band skills on 4 and 5 string electric bass.', '6–24 months', ARRAY['Beginner', 'Intermediate', 'Advanced']::TEXT[], '[{"term":"Term 1","topics":["Right-hand technique","Root–fifth patterns","Locking with drums"]}]'::JSONB, ARRAY['Lock with any drummer', 'Read bass charts']::TEXT[], 'Trinity Rock & Pop Bass', NULL, 4),

('d56d0c9f-f7d0-4225-bcf9-8ec04b5da433', 'drums', 'Drum Lab', 'Rhythmic foundations and polyrhythms', 'Acoustic and electronic drumming — rudiments, grooves, fills and live performance.', '6–36 months', ARRAY['Beginner', 'Intermediate', 'Advanced', 'Performance']::TEXT[], '[{"term":"Term 1","topics":["Single & double strokes","Basic rock beat","Counting"]}]'::JSONB, ARRAY['Play in a band', 'Record drum tracks']::TEXT[], 'Trinity Rock & Pop Drums', NULL, 5),

('72c22f2e-f869-4efb-aaa6-540bd7f6f625', 'violin', 'Orchestral Violin', 'Precision bowing, theory-focused', 'Classical violin in the Western tradition — posture, intonation, etudes, ensemble work.', '12–48 months', ARRAY['Beginner', 'Intermediate', 'Advanced', 'Performance']::TEXT[], '[{"term":"Term 1","topics":["Posture & bow hold","Open strings","First melodies"]}]'::JSONB, ARRAY['Play in chamber ensembles', 'Grade exams']::TEXT[], 'ABRSM Violin', NULL, 6),

('24af4f02-b783-449d-921e-3f4fb7cafa6d', 'voice', 'Vocal Performance', 'Contemporary, classical & stage presence', 'Healthy vocal technique, repertoire and stagecraft for singers of every style.', '6–36 months', ARRAY['Beginner', 'Intermediate', 'Advanced', 'Performance']::TEXT[], '[{"term":"Term 1","topics":["Breath support","Range exploration","Healthy belting"]}]'::JSONB, ARRAY['Sing confidently on stage', 'Studio-ready vocals']::TEXT[], 'Trinity Rock & Pop Vocals', NULL, 7),

('a56b3a2d-6455-448a-9a5d-d986fd27ae8a', 'music-theory', 'Music Theory & Ear Training', 'Hear what you read, write what you hear', 'The shared language of music — reading, writing, analysing and hearing structure.', '3–18 months', ARRAY['Beginner', 'Intermediate', 'Advanced']::TEXT[], '[{"term":"Term 1","topics":["Pitch & rhythm","Major/minor scales","Intervals"]}]'::JSONB, ARRAY['Compose simple pieces', 'Pass ABRSM theory grades']::TEXT[], 'ABRSM Theory of Music', NULL, 8)
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


-- 4. GRANT ADMIN ROLE
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'henrysui7@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
