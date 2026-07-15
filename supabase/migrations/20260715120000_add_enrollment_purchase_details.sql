-- Record what was actually purchased on each enrollment.
-- Previously only the course link was stored, so the student dashboard showed
-- catalog data (course name + catalog duration range) instead of the bought
-- package, and re-purchasing the same instrument was silently dropped by the
-- UNIQUE (user_id, course_id) constraint.

ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS package_title TEXT,
  ADD COLUMN IF NOT EXISTS instrument TEXT,
  ADD COLUMN IF NOT EXISTS amount_paid INTEGER,
  ADD COLUMN IF NOT EXISTS payment_id TEXT;
