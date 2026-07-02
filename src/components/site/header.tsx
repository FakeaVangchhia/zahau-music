import { Link } from "@tanstack/react-router";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const NAV = [
  { to: "/curriculum", label: "Curriculum" },
  { to: "/fees", label: "Fees" },
  { to: "/about", label: "About" },
  { to: "/courses", label: "Courses" },
  { to: "/gallery", label: "Gallery" },
  { to: "/schedule", label: "Weekly Schedule" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [session, setSession] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [rawSession, setRawSession] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setRawSession(session);
      setSession(!!session);
    }).catch(err => console.error("Supabase auth session fetch failed:", err));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
    let localTheme = null;
    try {
      localTheme = localStorage.getItem("theme");
    } catch (e) {
      console.error("[ThemeToggle] Failed to read from localStorage:", e);
    }
    const isDark = localTheme ? localTheme === "dark" : document.documentElement.classList.contains("dark");
    console.log("[ThemeToggle] Initial theme setup. isDark:", isDark);
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    console.log("[ThemeToggle] Toggling theme. Current:", theme, "Next:", nextTheme);
    setTheme(nextTheme);
    try {
      localStorage.setItem("theme", nextTheme);
    } catch (e) {
      console.error("[ThemeToggle] Failed to write to localStorage:", e);
    }
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      console.log("[ThemeToggle] Added 'dark' class to html element.");
    } else {
      document.documentElement.classList.remove("dark");
      console.log("[ThemeToggle] Removed 'dark' class from html element.");
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 w-full px-4 sm:px-6 lg:px-8 pointer-events-none transition-all duration-300 ${
      scrolled ? "py-2" : "py-4"
    }`}>
      <div className={`mx-auto max-w-7xl w-full rounded-2xl flex items-center justify-between pointer-events-auto transition-all duration-300 ${
        scrolled 
          ? "glass-panel px-6 py-2 shadow-2xl shadow-black/5 dark:shadow-black/50 border border-border/60 dark:border-white/5 bg-background/80 dark:bg-card/40 backdrop-blur-lg" 
          : "glass-panel px-6 py-3 shadow-xl shadow-black/5 dark:shadow-black/30 border border-border/40 dark:border-white/5"
      }`}>
        <Link to="/" className="flex items-center gap-3 text-xl tracking-tighter uppercase text-foreground group">

          <img src={logo} alt="Zahau Logo" className="h-9 w-9 object-contain rounded-full border border-azure/20 shadow-md group-hover:rotate-12 group-hover:scale-105 transition-all duration-500" />
          <span className="font-display font-extrabold tracking-tight flex items-center gap-2">
            Zahau 
            <span className="font-serif italic text-azure font-light normal-case text-lg tracking-normal">music</span>
            <span className="flex items-end gap-[3px] h-3 w-4 mb-0.5 opacity-80 shrink-0">
              <span className="w-[2.5px] bg-azure music-visualizer-bar-1 rounded-full h-full block" />
              <span className="w-[2.5px] bg-azure music-visualizer-bar-2 rounded-full h-full block" style={{ animationDelay: "0.15s" }} />
              <span className="w-[2.5px] bg-azure music-visualizer-bar-3 rounded-full h-full block" style={{ animationDelay: "0.3s" }} />
              <span className="w-[2.5px] bg-azure music-visualizer-bar-4 rounded-full h-full block" style={{ animationDelay: "0.05s" }} />
            </span>
          </span>
        </Link>
        <nav className="hidden md:flex gap-7 text-[11px] font-bold uppercase tracking-widest">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-foreground/80 hover:text-azure transition-all duration-200 relative py-1 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-azure hover:after:w-full after:transition-all after:duration-300"
              activeProps={{ className: "text-azure after:w-full" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="size-10 grid place-items-center rounded-xl hover:bg-muted text-foreground/80 hover:text-foreground transition-all duration-200 cursor-pointer"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? (
              <Sun className="size-5 text-yellow-500 animate-pulse" />
            ) : (
              <Moon className="size-5 text-azure" />
            )}
          </button>
          <Link
            to={session ? "/dashboard" : "/auth"}
            className={`hidden sm:inline-flex px-6 py-2.5 text-[10px] font-mono font-bold uppercase tracking-widest transition-all duration-300 rounded-xl hover:scale-105 active:scale-95 cursor-pointer ${
              session && isAdmin
                ? "bg-azure text-azure-foreground hover:bg-azure/85 shadow-lg shadow-azure/20"
                : "bg-navy text-navy-foreground hover:bg-azure hover:text-azure-foreground dark:bg-muted dark:text-foreground dark:hover:bg-azure dark:hover:text-azure-foreground shadow-md hover:shadow-lg"
            }`}
          >
            {session ? (isAdmin ? "Admin Console" : "Dashboard") : "Login"}
          </Link>
          <button
            className="md:hidden size-10 grid place-items-center rounded-xl hover:bg-muted"
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
