-- Re-grant execute permissions on has_role to authenticated users
-- so that Row Level Security policies can query it on behalf of clients.
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;

-- Add a policy allowing users to delete their own enrollments
CREATE POLICY "Enroll: owner D" ON public.enrollments
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
