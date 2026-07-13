import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      window.location.href = window.location.origin + "/dashboard";
      await new Promise(() => {}); // Halt current route transition since we are redirecting the page
    }
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: () => <Outlet />,
});
