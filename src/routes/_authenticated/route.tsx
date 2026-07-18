import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // If returning from Google OAuth, the session arrives in the URL hash and
    // supabase-js needs a moment to persist it — retry briefly instead of
    // bouncing the user straight to /auth.
    const hasAccessToken =
      typeof window !== "undefined" && window.location.hash.includes("access_token");
    const maxAttempts = hasAccessToken ? 10 : 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) return { user: data.user };
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    throw redirect({ to: "/auth" });
  },
  component: () => <Outlet />,
});
