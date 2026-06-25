-- Create Posts Table for Blog IF NOT EXISTS
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

-- Grant Access Roles
GRANT SELECT ON public.posts TO anon, authenticated;
GRANT ALL ON public.posts TO service_role;
GRANT ALL ON public.posts TO authenticated;

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Drop Policies if they exist and Recreate them
DROP POLICY IF EXISTS "Posts: public read" ON public.posts;
CREATE POLICY "Posts: public read" ON public.posts FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Posts: admin write" ON public.posts;
CREATE POLICY "Posts: admin write" ON public.posts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

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
