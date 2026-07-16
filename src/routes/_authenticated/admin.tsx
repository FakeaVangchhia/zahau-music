import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { ensureAdminRole } from "@/lib/site.functions";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [{ title: "Admin Console — Zahau Music School" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const ensureAdmin = useServerFn(ensureAdminRole);
  const [email, setEmail] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return; // _authenticated guard already redirects

      // Server-side check first (also self-heals the allowlisted admin's role),
      // then fall back to the user_roles table for manually assigned admins.
      let isAdmin = false;
      try {
        isAdmin = (await ensureAdmin()).isAdmin;
      } catch (e) {
        console.error("Admin check failed:", e);
      }
      if (!isAdmin) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .maybeSingle();
        isAdmin = roleData?.role === "admin";
      }

      if (cancelled) return;
      if (!isAdmin) {
        navigate({ to: "/dashboard", replace: true });
        return;
      }
      setEmail(data.user.email ?? "");
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-azure border-t-transparent" />
          <p className="text-sm font-mono text-muted-foreground">Opening admin console…</p>
        </div>
      </div>
    );
  }

  return <AdminDashboard email={email} signOut={signOut} />;
}
