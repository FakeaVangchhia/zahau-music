import { Link, useRouter } from "@tanstack/react-router";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const NAV = [
  { to: "/courses", label: "Courses" },
  { to: "/fees", label: "Fees" },
  { to: "/events", label: "Events" },
  { to: "/about", label: "About" },
  { to: "/gallery", label: "Gallery" },
  { to: "/schedule", label: "Schedule" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [session, setSession] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [rawSession, setRawSession] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);

  const router = useRouter();
  const pathname = router.state.location.pathname;
  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setRawSession(session);
        setSession(!!session);
      })
      .catch((err) => console.error("Supabase auth session fetch failed:", err));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setRawSession(session);
      setSession(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function checkAdmin() {
      if (rawSession?.user) {
        try {
          const { data } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", rawSession.user.id)
            .maybeSingle();
          setIsAdmin(data?.role === "admin");
        } catch (err) {
          console.error("Failed to fetch user roles:", err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, [rawSession]);

  useEffect(() => {
    setTheme("light");
    try {
      localStorage.setItem("theme", "light");
    } catch (e) {}
    document.documentElement.classList.remove("dark");
  }, []);

  const toggleTheme = () => {};

  const isTransparent = !scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full px-4 sm:px-6 lg:px-8 transition-all duration-500 border-b ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-border/40 shadow-sm py-2.5"
          : "bg-transparent border-transparent shadow-none py-5 sm:py-6"
      }`}
    >
      <div className="mx-auto max-w-7xl w-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 text-xl tracking-tighter uppercase group">
          <img
            src={logo}
            alt="Zahau Logo"
            className="h-9 w-9 object-contain rounded-full border border-azure/20 shadow-md group-hover:rotate-12 group-hover:scale-105 transition-all duration-500"
          />
          <span className="font-display font-extrabold tracking-tight flex items-center gap-2 text-foreground">
            Zahau
            <span className="font-serif italic font-light normal-case text-lg tracking-normal text-azure group-hover:text-azure transition-colors duration-300">
              music
            </span>
            <span className="flex items-end gap-[3px] h-3.5 w-4 mb-0.5 opacity-95 shrink-0">
              <span className="w-[2.5px] music-visualizer-bar-1 rounded-full h-full block bg-azure transition-colors duration-300" />
              <span
                className="w-[2.5px] music-visualizer-bar-2 rounded-full h-full block bg-azure transition-colors duration-300"
                style={{ animationDelay: "0.15s" }}
              />
              <span
                className="w-[2.5px] music-visualizer-bar-3 rounded-full h-full block bg-azure transition-colors duration-300"
                style={{ animationDelay: "0.3s" }}
              />
              <span
                className="w-[2.5px] music-visualizer-bar-4 rounded-full h-full block bg-azure transition-colors duration-300"
                style={{ animationDelay: "0.05s" }}
              />
            </span>
          </span>
        </Link>
        <nav className="hidden md:flex gap-7 text-[11px] font-bold uppercase tracking-widest">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="transition-all duration-200 relative py-1 text-foreground/80 hover:text-azure group"
            >
              {({ isActive }) => (
                <span className="flex flex-col items-center">
                  <span>{n.label}</span>
                  <span
                    className={`absolute -bottom-1 left-0 right-0 h-[2px] bg-azure rounded-full transition-all duration-300 origin-center transform ${
                      isActive ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0 group-hover:scale-x-50 group-hover:opacity-60"
                    }`}
                  />
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to={session ? "/dashboard" : "/auth"}
            className="hidden sm:inline-flex px-6 py-2.5 text-[10px] font-mono font-bold uppercase tracking-widest transition-all duration-300 rounded-xl hover:scale-105 active:scale-95 cursor-pointer bg-navy text-navy-foreground hover:bg-azure hover:text-azure-foreground shadow-md hover:shadow-lg"
          >
            {session ? (isAdmin ? "Admin Console" : "Dashboard") : "Login"}
          </Link>
          <button
            className="md:hidden size-10 grid place-items-center rounded-xl transition-colors text-foreground hover:bg-muted"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden mt-2 glass-panel rounded-2xl overflow-hidden shadow-2xl animate-fade-in pointer-events-auto border border-white/10 dark:border-white/5">
          <nav className="flex flex-col px-6 py-4 gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-3 text-sm font-bold uppercase tracking-widest text-foreground/80 hover:text-azure transition-colors border-b border-border/40 last:border-0"
              >
                {n.label}
              </Link>
            ))}
            <Link
              to={session ? "/dashboard" : "/auth"}
              onClick={() => setOpen(false)}
              className="py-3 text-sm font-bold uppercase tracking-widest text-foreground/80 hover:text-azure transition-colors"
            >
              {session ? (isAdmin ? "Admin Console" : "Dashboard") : "Login"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
