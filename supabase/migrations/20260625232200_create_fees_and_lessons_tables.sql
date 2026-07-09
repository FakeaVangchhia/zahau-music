-- ====================================================
-- ZAHAU MUSIC SCHOOL: FEES AND LESSONS MIGRATION
-- ====================================================

-- 1. Drop old events tables if they exist
DROP TABLE IF EXISTS public.event_registrations CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;

-- 2. Create Fees Table
CREATE TABLE public.fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  fees TEXT NOT NULL,
  raw_fees INT NOT NULL,
  duration TEXT NOT NULL,
  mode TEXT NOT NULL,
  tagline TEXT,
  features TEXT[] NOT NULL DEFAULT '{}',
  popular BOOLEAN DEFAULT false,
  badge TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Grant Access Roles for Fees
GRANT SELECT ON public.fees TO anon, authenticated;
GRANT ALL ON public.fees TO service_role;
GRANT ALL ON public.fees TO authenticated;

-- Enable RLS for Fees
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fees: public read" ON public.fees 
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Fees: admin write" ON public.fees 
  FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'::app_role)) 
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));


-- 3. Seed Initial Fees
INSERT INTO public.fees (title, fees, raw_fees, duration, mode, tagline, features, popular, badge, display_order) VALUES
('Level 3: Monthly Method', 'Rs. 4,000', 4000, '1 Month', 'Hybrid / Offline', 'Pay-as-you-go basic foundation track', ARRAY['1 class in a week (4 classes in a month)', '1 hour per class at convenient timings', 'Introduction to basic music theory', 'Pitches, scales, intervals and basic harmony', 'Guitar, keyboard, piano or voice fundamentals', 'Access to practice studios'], false, 'Flexible', 1),
('Level 1: Basic Three Months', 'Rs. 12,000', 12000, '3 Months', 'Hybrid / Offline', 'Structured entry-level skill booster', ARRAY['1 class in a week (12 classes total)', '1 hour per class at convenient timings', 'Classical Piano Beginner syllabus', 'Guitar Foundation and Rhythm Guitar modules', 'Drums basic grooves, fills and counting', 'Musicianship, ear training and theory basics', '1 recital band showcase and studio recording'], false, 'Recommended', 2),
('Standard Certificate Course', 'Rs. 20,000', 20000, '4 Months', 'Online Only', 'Comprehensive remote certificate program', ARRAY['2 classes in a week (32 classes total)', '1 hour per class at convenient timings', 'Select Keyboard, Piano, Guitar, Bass, Drums, Violin, Voice or Theory', 'Includes premium Video Learning Resources', 'Regular assignments and weekly expert feedback', 'Zahau Foundation Certificate on completion', 'Online student portal access'], false, 'Online Standard', 3),
('Level 2: Intermediate Six Months', 'Rs. 24,000', 24000, '6 Months', 'Hybrid / Offline', 'Serious technical and artistic development', ARRAY['1 class in a week (24 classes total)', '1 hour per class at convenient timings', 'Classical Piano Early Intermediate works', 'Exploring Beethoven, Mozart, Schumann, Bartok', 'Intermediate music theory and complex rhythms', 'Solo performance and chamber ensemble playing', 'Professional studio recording session', 'Preparation for ABRSM/Trinity exams'], true, 'Best Value', 4),
('Performance Based Certificate', 'Rs. 25,000', 25000, '6 Months', 'Online Only', 'Elite remote conservatory-grade pathway', ARRAY['2 classes in a week (48 classes total)', '1 hour per class at convenient timings', 'Advanced repertoire in your choice instrument', 'Deep dive into harmony, composition and ear training', 'Includes curated Video Resources and assignments', 'Personalized faculty reviews and expert feedback', 'Performance Grade preparation and recitals', 'Zahau Graduate Recital Certificate'], false, 'Online Premium', 5);


-- 4. Create Lessons Table (replaces Events to show Courses with video & links)
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  link_url TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Grant Access Roles for Lessons
GRANT SELECT ON public.lessons TO anon, authenticated;
GRANT ALL ON public.lessons TO service_role;
GRANT ALL ON public.lessons TO authenticated;

-- Enable RLS for Lessons
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lessons: public read" ON public.lessons 
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Lessons: admin write" ON public.lessons 
  FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'::app_role)) 
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));


-- 5. Seed Initial Lessons
INSERT INTO public.lessons (title, description, video_url, link_url, display_order) VALUES
('Introduction to Piano Basics', 'Learn the fundamental keys, posture, and simple melodies on the piano.', 'https://www.youtube.com/watch?v=Part4vF9b34', 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0', 1),
('Guitar Fingerpicking Techniques', 'Master the art of fingerstyle guitar with these essential patterns.', 'https://www.youtube.com/watch?v=e7aC5Ww-rjg', 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1', 2);
