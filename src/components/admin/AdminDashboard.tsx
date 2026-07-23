import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  BookOpen,
  Calendar,
  CalendarCheck,
  Mail,
  Plus,
  Edit,
  Trash2,
  Video,
  ExternalLink,
  Search,
  FileText,
  User,
  LogOut,
  MapPin,
  Clock,
  Youtube,
  Trash,
  PenTool,
  Calculator,
  Download,
  Home,
  Menu,
  X,
  Wallet,
  LayoutDashboard,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Database } from "@/integrations/supabase/types";
import {
  listPaymentSubmissions,
  reviewPaymentSubmission,
  listBankTransactions,
} from "@/lib/site.functions";
import { getVideoDetails } from "@/lib/utils";

type PaymentSubmission = Database["public"]["Tables"]["payment_submissions"]["Row"] & {
  screenshot_signed_url?: string | null;
};
type BankTxn = Database["public"]["Tables"]["bank_transactions"]["Row"];

type Course = Database["public"]["Tables"]["courses"]["Row"];
type Lead = Database["public"]["Tables"]["leads"]["Row"];
type Subscriber = Database["public"]["Tables"]["newsletter_subscribers"]["Row"];
type Lesson = Database["public"]["Tables"]["lessons"]["Row"];
type Fee = Database["public"]["Tables"]["fees"]["Row"];
type Post = Database["public"]["Tables"]["posts"]["Row"];

// Shape stored in the courses.curriculum JSONB column
type CurriculumTerm = { term: string; topics: string[] };

export function AdminDashboard({ email, signOut }: { email: string; signOut: () => void }) {
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "appointments"
    | "courses"
    | "lessons"
    | "fees"
    | "leads"
    | "subscribers"
    | "posts"
    | "payments"
  >("overview");

  // Data States
  const [courses, setCourses] = useState<Course[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [payments, setPayments] = useState<PaymentSubmission[]>([]);
  const [bankTxns, setBankTxns] = useState<BankTxn[]>([]);

  // Payment settings form
  const [payVpa, setPayVpa] = useState("");
  const [payPayee, setPayPayee] = useState("");
  const [savingPaySettings, setSavingPaySettings] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const listPayments = useServerFn(listPaymentSubmissions);
  const reviewPayment = useServerFn(reviewPaymentSubmission);
  const listBankTxns = useServerFn(listBankTransactions);

  // Loading & Search States
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modal / Form States
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);

  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson> | null>(null);

  const [feeModalOpen, setFeeModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<Partial<Fee> | null>(null);

  const [postModalOpen, setPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Partial<Post> | null>(null);

  const [leadDetail, setLeadDetail] = useState<Lead | null>(null);

  // Local String states for textareas
  const [outcomesInput, setOutcomesInput] = useState("");
  const [featuresInput, setFeaturesInput] = useState("");
  const [blogBodyInput, setBlogBodyInput] = useState("");

  // Storage Upload States
  const [uploadingCourseVideo, setUploadingCourseVideo] = useState(false);
  const [courseVideoProgress, setCourseVideoProgress] = useState(0);
  const [uploadingLessonVideo, setUploadingLessonVideo] = useState(false);
  const [lessonVideoProgress, setLessonVideoProgress] = useState(0);

  // Video Upload Handler
  async function handleVideoUpload(file: File, type: "course" | "lesson") {
    if (!file) return;

    const setUploading = type === "course" ? setUploadingCourseVideo : setUploadingLessonVideo;
    const setProgress = type === "course" ? setCourseVideoProgress : setLessonVideoProgress;

    setUploading(true);
    setProgress(0);

    try {
      // Validate file size (e.g. max 100MB)
      const maxBytes = 100 * 1024 * 1024;
      if (file.size > maxBytes) {
        throw new Error("File size exceeds the 100MB limit.");
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${type}-${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // onUploadProgress is honored by the transport but missing from
      // supabase-js FileOptions typings — passed via a variable so the extra
      // property survives excess-property checks.
      const uploadOptions = {
        cacheControl: "3600",
        upsert: false,
        onUploadProgress: (progress: { loaded: number; total: number }) => {
          const percent = (progress.loaded / progress.total) * 100;
          setProgress(Math.round(percent));
        },
      };
      const { error } = await supabase.storage.from("videos").upload(filePath, file, uploadOptions);

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("videos").getPublicUrl(filePath);

      if (type === "course") {
        setEditingCourse((prev) => (prev ? { ...prev, video_url: publicUrl } : null));
        toast.success("Course intro video uploaded successfully!");
      } else {
        setEditingLesson((prev) => (prev ? { ...prev, video_url: publicUrl } : null));
        toast.success("Lesson video uploaded successfully!");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload video");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  // Fetch all data on mount
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (editingCourse) {
      setOutcomesInput((editingCourse.outcomes || []).join("\n"));
    } else {
      setOutcomesInput("");
    }
  }, [editingCourse]);

  useEffect(() => {
    if (editingFee) {
      setFeaturesInput(Array.isArray(editingFee.features) ? editingFee.features.join("\n") : "");
    } else {
      setFeaturesInput("");
    }
  }, [editingFee]);

  useEffect(() => {
    if (editingPost) {
      setBlogBodyInput(Array.isArray(editingPost.body) ? editingPost.body.join("\n\n") : "");
    } else {
      setBlogBodyInput("");
    }
  }, [editingPost]);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch Courses
      const { data: coursesData, error: coursesErr } = await supabase
        .from("courses")
        .select("*")
        .order("display_order", { ascending: true });
      if (coursesErr) throw coursesErr;
      setCourses(coursesData || []);

      // Fetch Leads
      const { data: leadsData, error: leadsErr } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (leadsErr) throw leadsErr;
      setLeads(leadsData || []);

      // Fetch Subscribers
      const { data: subsData, error: subsErr } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("created_at", { ascending: false });
      if (subsErr) throw subsErr;
      setSubscribers(subsData || []);

      // Fetch Lessons
      const { data: lessonsData, error: lessonsErr } = await supabase
        .from("lessons")
        .select("*")
        .order("display_order", { ascending: true });
      if (lessonsErr) throw lessonsErr;
      setLessons(lessonsData || []);

      // Fetch Fees
      const { data: feesData, error: feesErr } = await supabase
        .from("fees")
        .select("*")
        .order("display_order", { ascending: true });
      if (feesErr) throw feesErr;
      setFees(feesData || []);

      // Fetch Posts
      const { data: postsData, error: postsErr } = await supabase
        .from("posts")
        .select("*")
        .order("date", { ascending: false });
      if (postsErr) throw postsErr;
      setPosts(postsData || []);

      // Fetch payment settings (public read via RLS)
      const { data: settingsRow } = await supabase
        .from("payment_settings")
        .select("upi_vpa, payee_name")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setPayVpa(settingsRow?.upi_vpa ?? "");
      setPayPayee(settingsRow?.payee_name ?? "");

      await refreshPayments();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }

  // Payment submissions carry signed screenshot URLs, so they come from an
  // admin-gated server function rather than the browser client.
  async function refreshPayments() {
    try {
      const [rows, txns] = await Promise.all([listPayments(), listBankTxns()]);
      setPayments(rows as PaymentSubmission[]);
      setBankTxns(txns as BankTxn[]);
    } catch (err) {
      console.error("Failed to load payment submissions:", err);
    }
  }

  async function savePaymentSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingPaySettings(true);
    try {
      // Single-row config — update the existing row if present, else insert.
      const { data: existing } = await supabase
        .from("payment_settings")
        .select("id")
        .limit(1)
        .maybeSingle();
      const payload = {
        upi_vpa: payVpa.trim(),
        payee_name: payPayee.trim() || "Zahau Music School",
        updated_at: new Date().toISOString(),
      };
      const { error } = existing
        ? await supabase.from("payment_settings").update(payload).eq("id", existing.id)
        : await supabase.from("payment_settings").insert([payload]);
      if (error) throw error;
      toast.success("Payment settings saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save payment settings");
    } finally {
      setSavingPaySettings(false);
    }
  }

  async function handleReviewPayment(id: string, action: "approve" | "reject") {
    setReviewingId(id);
    try {
      await reviewPayment({ data: { id, action } });
      toast.success(action === "approve" ? "Payment approved." : "Payment rejected.");
      await refreshPayments();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed. Please try again.");
    } finally {
      setReviewingId(null);
    }
  }

  // Course Actions
  async function saveCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCourse?.name || !editingCourse?.slug) {
      toast.error("Name and Slug are required");
      return;
    }

    try {
      const parsedOutcomes = outcomesInput
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

      const payload = {
        name: editingCourse.name,
        slug: editingCourse.slug,
        tagline: editingCourse.tagline || "",
        summary: editingCourse.summary || "",
        duration: editingCourse.duration || "",
        certification: editingCourse.certification || "",
        hero_image: editingCourse.hero_image || "",
        video_url: editingCourse.video_url || "",
        curriculum: editingCourse.curriculum || [],
        outcomes: parsedOutcomes,
        levels: editingCourse.levels || [],
        display_order: Number(editingCourse.display_order || 0),
      };

      if (editingCourse.id) {
        const { error } = await supabase.from("courses").update(payload).eq("id", editingCourse.id);
        if (error) throw error;
        toast.success("Course updated successfully");
      } else {
        const { error } = await supabase.from("courses").insert([payload]);
        if (error) throw error;
        toast.success("Course created successfully");
      }

      setCourseModalOpen(false);
      setEditingCourse(null);
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save course");
    }
  }

  async function deleteCourse(id: string) {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone."))
      return;
    try {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
      toast.success("Course deleted successfully");
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete course");
    }
  }

  // Lesson Actions
  async function saveLesson(e: React.FormEvent) {
    e.preventDefault();
    if (!editingLesson?.title) {
      toast.error("Title is required");
      return;
    }

    try {
      const payload = {
        title: editingLesson.title,
        description: editingLesson.description || "",
        video_url: editingLesson.video_url || "",
        link_url: editingLesson.link_url || "",
        display_order: Number(editingLesson.display_order || 0),
      };

      if (editingLesson.id) {
        const { error } = await supabase.from("lessons").update(payload).eq("id", editingLesson.id);
        if (error) throw error;
        toast.success("Lesson updated successfully");
      } else {
        const { error } = await supabase.from("lessons").insert([payload]);
        if (error) throw error;
        toast.success("Lesson created successfully");
      }

      setLessonModalOpen(false);
      setEditingLesson(null);
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save lesson");
    }
  }

  async function deleteLesson(id: string) {
    if (!confirm("Are you sure you want to delete this lesson?")) return;
    try {
      const { error } = await supabase.from("lessons").delete().eq("id", id);
      if (error) throw error;
      toast.success("Lesson deleted successfully");
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete lesson");
    }
  }

  // Fee Actions
  async function saveFee(e: React.FormEvent) {
    e.preventDefault();
    if (
      !editingFee?.title ||
      !editingFee?.fees ||
      editingFee?.raw_fees === undefined ||
      !editingFee?.duration ||
      !editingFee?.mode
    ) {
      toast.error("Title, Fees, Raw Fees, Duration, and Mode are required");
      return;
    }

    try {
      const featuresArr = featuresInput
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);

      const payload = {
        title: editingFee.title,
        fees: editingFee.fees,
        raw_fees: Number(editingFee.raw_fees),
        duration: editingFee.duration,
        mode: editingFee.mode,
        tagline: editingFee.tagline || "",
        features: featuresArr,
        popular: !!editingFee.popular,
        badge: editingFee.badge || null,
        display_order: Number(editingFee.display_order || 0),
      };

      if (editingFee.id) {
        const { error } = await supabase.from("fees").update(payload).eq("id", editingFee.id);
        if (error) throw error;
        toast.success("Fee package updated successfully");
      } else {
        const { error } = await supabase.from("fees").insert([payload]);
        if (error) throw error;
        toast.success("Fee package created successfully");
      }

      setFeeModalOpen(false);
      setEditingFee(null);
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save fee package");
    }
  }

  async function deleteFee(id: string) {
    if (!confirm("Are you sure you want to delete this fee package?")) return;
    try {
      const { error } = await supabase.from("fees").delete().eq("id", id);
      if (error) throw error;
      toast.success("Fee package deleted successfully");
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete fee package");
    }
  }

  // Post Actions
  async function savePost(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPost?.title || !editingPost?.slug || !blogBodyInput.trim()) {
      toast.error("Title, Slug, and Content are required");
      return;
    }

    try {
      const bodyParagraphs = blogBodyInput
        .split("\n\n")
        .map((p) => p.trim())
        .filter(Boolean);

      const payload = {
        title: editingPost.title,
        slug: editingPost.slug,
        excerpt: editingPost.excerpt || "",
        body: bodyParagraphs,
        author: editingPost.author || "Faculty Desk",
        date: editingPost.date || new Date().toISOString().split("T")[0],
      };

      if (editingPost.id) {
        const { error } = await supabase.from("posts").update(payload).eq("id", editingPost.id);
        if (error) throw error;
        toast.success("Post updated successfully");
      } else {
        const { error } = await supabase.from("posts").insert([payload]);
        if (error) throw error;
        toast.success("Post created successfully");
      }

      setPostModalOpen(false);
      setEditingPost(null);
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save post");
    }
  }

  async function deletePost(id: string) {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone."))
      return;
    try {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
      toast.success("Post deleted successfully");
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete post");
    }
  }

  async function deleteLead(id: string) {
    if (!confirm("Are you sure you want to delete this lead? This action cannot be undone."))
      return;
    try {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
      toast.success("Lead record deleted successfully");
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete lead");
    }
  }

  // Curriculum State Management helper
  const handleCurriculumChange = (updatedCurriculum: CurriculumTerm[]) => {
    setEditingCourse((prev) => (prev ? { ...prev, curriculum: updatedCurriculum } : null));
  };

  // CSV Export utility
  function exportToCSV(
    data: Record<string, unknown>[],
    filename: string,
    columns: { key: string; label: string }[],
  ) {
    const csvContent = [
      columns.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(","),
      ...data.map((row) =>
        columns
          .map((col) => {
            const val = row[col.key];
            const str = val === null || val === undefined ? "" : String(val);
            return `"${str.replace(/"/g, '""')}"`;
          })
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const leadColumns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "course_interest", label: "Course Interest" },
    { key: "message", label: "Message" },
    { key: "source", label: "Source" },
    { key: "created_at", label: "Date Submitted" },
  ];

  const subscriberColumns = [
    { key: "email", label: "Email Address" },
    { key: "created_at", label: "Subscribed Date" },
  ];

  // Computed: demo bookings count
  const appointments = leads.filter((l) => l.source === "book_demo");

  // Helper: parse message field for Day/Time
  function parseDemoMessage(msg: string | null): { day: string; time: string; rest: string } {
    if (!msg) return { day: "", time: "", rest: "" };
    const dayMatch = msg.match(/Day:\s*([^,\n]+)/i);
    const timeMatch = msg.match(/Time:\s*([^,\n]+)/i);
    return {
      day: dayMatch ? dayMatch[1].trim() : "",
      time: timeMatch ? timeMatch[1].trim() : "",
      rest: msg,
    };
  }

  const navGroups = [
    {
      title: null,
      items: [{ id: "overview", label: "Overview", icon: <LayoutDashboard className="size-4" /> }],
    },
    {
      title: "Learning",
      items: [
        { id: "courses", label: "Courses", icon: <BookOpen className="size-4" /> },
        { id: "lessons", label: "Lessons", icon: <Video className="size-4" /> },
        { id: "fees", label: "Tuition Fees", icon: <Calculator className="size-4" /> },
        { id: "posts", label: "Blog Posts", icon: <PenTool className="size-4" /> },
      ],
    },
    {
      title: "People & Sales",
      items: [
        {
          id: "appointments",
          label: "Appointments",
          icon: <CalendarCheck className="size-4" />,
          badge: appointments.length,
        },
        {
          id: "payments",
          label: "Payments",
          icon: <Wallet className="size-4" />,
          badge: payments.filter((p) => p.status === "pending").length,
        },
        { id: "leads", label: "Leads & Inquiries", icon: <User className="size-4" /> },
        { id: "subscribers", label: "Subscribers", icon: <Mail className="size-4" /> },
      ],
    },
  ] as const;

  const activeLabel =
    navGroups.flatMap((g) => [...g.items]).find((t) => t.id === activeTab)?.label ?? "Overview";

  const sidebarBrand = (
    <div className="flex items-center gap-3 px-5 py-5 border-b border-border/40">
      <div className="size-9 rounded-xl bg-azure/10 border border-azure/20 flex items-center justify-center shrink-0">
        <LayoutDashboard className="size-4 text-azure" />
      </div>
      <div className="min-w-0">
        <p className="font-display text-base font-extrabold uppercase tracking-tight text-foreground leading-tight">
          Zahau Admin
        </p>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-azure font-bold">
          LMS Console
        </p>
      </div>
    </div>
  );

  const sidebarNav = (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6" aria-label="Admin sections">
      {navGroups.map((group, gi) => (
        <div key={gi}>
          {group.title && (
            <p className="px-3 mb-2 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
              {group.title}
            </p>
          )}
          <div className="space-y-1">
            {group.items.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchTerm("");
                  setSidebarOpen(false);
                }}
                aria-current={activeTab === tab.id ? "page" : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-azure text-azure-foreground shadow-md shadow-azure/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {tab.icon}
                <span className="flex-1 text-left">{tab.label}</span>
                {"badge" in tab && tab.badge > 0 && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                      activeTab === tab.id ? "bg-white/20 text-white" : "bg-azure/10 text-azure"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );

  const sidebarFooter = (
    <div className="border-t border-border/40 px-3 py-4 space-y-1">
      <Link
        to="/"
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
      >
        <Home className="size-4" /> View Website
      </Link>
      <button
        onClick={signOut}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
      >
        <LogOut className="size-4" /> Sign Out
      </button>
      <p
        className="px-3 pt-2 text-[10px] text-muted-foreground/60 font-mono truncate"
        title={email}
      >
        {email}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex">
      {/* ===== SIDEBAR (desktop) ===== */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border/60 bg-card/50 sticky top-0 h-screen">
        {sidebarBrand}
        {sidebarNav}
        {sidebarFooter}
      </aside>

      {/* ===== SIDEBAR (mobile drawer) ===== */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative flex flex-col w-72 max-w-[85vw] h-full bg-card border-r border-border/60 shadow-2xl animate-fadeIn">
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Close navigation"
              className="absolute top-4 right-4 size-8 rounded-full bg-muted/60 hover:bg-muted text-foreground flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="size-4" />
            </button>
            {sidebarBrand}
            {sidebarNav}
            {sidebarFooter}
          </aside>
        </div>
      )}

      {/* ===== CONTENT COLUMN ===== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border/60 shadow-sm">
          <div className="flex items-center gap-4 px-4 sm:px-6 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
              className="lg:hidden size-10 grid place-items-center rounded-xl text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <Menu className="size-5" />
            </button>
            <div className="min-w-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-azure font-bold">
                Admin Console
              </p>
              <h1 className="font-display text-lg font-extrabold uppercase tracking-tight leading-tight truncate">
                {activeLabel}
              </h1>
            </div>
            <div className="flex-1" />
            <div className="hidden sm:block text-right">
              <p className="text-[10px] text-muted-foreground font-mono">Logged in as</p>
              <p className="text-xs text-foreground font-medium truncate max-w-[200px]">{email}</p>
            </div>
          </div>
        </header>

        {/* ===== MAIN CONTENT ===== */}
        <main className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-azure border-t-transparent" />
              <p className="text-sm font-mono text-muted-foreground">Syncing database console...</p>
            </div>
          ) : (
            <div className="px-6 sm:px-10 py-8">
              <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
                {/* TAB CONTENT: OVERVIEW */}
                {activeTab === "overview" && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="font-display text-3xl uppercase text-foreground">
                        System Metrics
                      </h2>
                      <p className="text-muted-foreground text-sm mt-1">
                        Real-time status of school data and submissions.
                      </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 sm:gap-6">
                      {(
                        [
                          {
                            id: "appointments",
                            label: "Demo Bookings",
                            val: appointments.length,
                            color: "from-rose-50 to-rose-100/30 border-rose-200/80",
                            icon: <CalendarCheck className="text-rose-600" />,
                            textClr: "text-rose-900",
                          },
                          {
                            id: "courses",
                            label: "Active Courses",
                            val: courses.length,
                            color: "from-blue-50 to-blue-100/30 border-blue-200/80",
                            icon: <BookOpen className="text-blue-600" />,
                            textClr: "text-blue-900",
                          },
                          {
                            id: "leads",
                            label: "Student Leads",
                            val: leads.length,
                            color: "from-emerald-50 to-emerald-100/30 border-emerald-200/80",
                            icon: <User className="text-emerald-600" />,
                            textClr: "text-emerald-900",
                          },
                          {
                            id: "subscribers",
                            label: "Newsletter Subscribers",
                            val: subscribers.length,
                            color: "from-purple-50 to-purple-100/30 border-purple-200/80",
                            icon: <Mail className="text-purple-600" />,
                            textClr: "text-purple-900",
                          },
                          {
                            id: "lessons",
                            label: "Course Videos",
                            val: lessons.length,
                            color: "from-amber-50 to-amber-100/30 border-amber-200/80",
                            icon: <Video className="text-amber-600" />,
                            textClr: "text-amber-900",
                          },
                          {
                            id: "fees",
                            label: "Tuition Packages",
                            val: fees.length,
                            color: "from-indigo-50 to-indigo-100/30 border-indigo-200/80",
                            icon: <Calculator className="text-indigo-600" />,
                            textClr: "text-indigo-900",
                          },
                          {
                            id: "posts",
                            label: "Blog Posts",
                            val: posts.length,
                            color: "from-sky-50 to-sky-100/30 border-sky-200/80",
                            icon: <PenTool className="text-sky-600" />,
                            textClr: "text-sky-900",
                          },
                        ] as const
                      ).map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setActiveTab(s.id);
                            setSearchTerm("");
                          }}
                          className={`bg-gradient-to-br ${s.color} border p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between h-32 hover:scale-[1.02] hover:border-azure/30 transition-all duration-300 shadow-sm group cursor-pointer text-left w-full`}
                        >
                          <div className="flex justify-between items-start w-full">
                            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-azure transition-colors">
                              {s.label}
                            </span>
                            {s.icon}
                          </div>
                          <span
                            className={`font-display text-4xl ${s.textClr} group-hover:text-azure transition-colors`}
                          >
                            {s.val}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Recent Activity Mini-Tables */}
                    <div className="grid lg:grid-cols-3 gap-6">
                      {/* Recent Appointments */}
                      <div className="bg-card border border-border/60 rounded-xl p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-display text-lg uppercase text-foreground">
                            Recent Appointments
                          </h3>
                          <button
                            onClick={() => setActiveTab("appointments")}
                            className="text-xs text-azure hover:underline"
                          >
                            View all
                          </button>
                        </div>
                        {appointments.length === 0 ? (
                          <p className="text-sm text-muted-foreground/60 py-4 font-mono">
                            No demo bookings yet.
                          </p>
                        ) : (
                          <div className="divide-y divide-border/40">
                            {appointments.slice(0, 5).map((appt) => {
                              const parsed = parseDemoMessage(appt.message);
                              return (
                                <div key={appt.id} className="py-3 text-xs">
                                  <p className="font-semibold text-foreground/90">{appt.name}</p>
                                  {parsed.day && (
                                    <p className="text-muted-foreground font-mono mt-0.5">
                                      📅 {parsed.day}
                                      {parsed.time ? ` · ${parsed.time}` : ""}
                                    </p>
                                  )}
                                  <p className="text-muted-foreground/60 font-mono mt-0.5">
                                    {new Date(appt.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Recent Leads */}
                      <div className="bg-card border border-border/60 rounded-xl p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-display text-lg uppercase text-foreground">
                            Recent Leads
                          </h3>
                          <button
                            onClick={() => setActiveTab("leads")}
                            className="text-xs text-azure hover:underline"
                          >
                            View all
                          </button>
                        </div>
                        {leads.length === 0 ? (
                          <p className="text-sm text-muted-foreground/60 py-4 font-mono">
                            No incoming inquiries.
                          </p>
                        ) : (
                          <div className="divide-y divide-border/40">
                            {leads.slice(0, 5).map((lead) => (
                              <div
                                key={lead.id}
                                className="py-3 flex justify-between items-center text-xs"
                              >
                                <div>
                                  <p className="font-semibold text-foreground/90">{lead.name}</p>
                                  <p className="text-muted-foreground font-mono mt-0.5">
                                    {lead.course_interest || "General Inquiry"}
                                  </p>
                                </div>
                                <span className="text-muted-foreground/60 font-mono">
                                  {new Date(lead.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Recent Subscribers */}
                      <div className="bg-card border border-border/60 rounded-xl p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-display text-lg uppercase text-foreground">
                            Recent Subscriptions
                          </h3>
                          <button
                            onClick={() => setActiveTab("subscribers")}
                            className="text-xs text-azure hover:underline"
                          >
                            View all
                          </button>
                        </div>
                        {subscribers.length === 0 ? (
                          <p className="text-sm text-muted-foreground/60 py-4 font-mono">
                            No subscribers yet.
                          </p>
                        ) : (
                          <div className="divide-y divide-border/40">
                            {subscribers.slice(0, 5).map((sub) => (
                              <div
                                key={sub.id}
                                className="py-3 flex justify-between items-center text-xs"
                              >
                                <span className="font-mono text-foreground/90">{sub.email}</span>
                                <span className="text-muted-foreground/60 font-mono">
                                  {new Date(sub.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: APPOINTMENTS */}
                {activeTab === "appointments" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-display text-3xl uppercase text-foreground">
                        Demo Appointments
                      </h2>
                      <p className="text-muted-foreground text-sm mt-1">
                        Incoming demo session requests via the Book Demo form.
                      </p>
                    </div>

                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-3.5 size-4 text-muted-foreground/60" />
                      <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-card border border-border/60 rounded-xl py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-azure transition-all"
                      />
                    </div>

                    {/* Appointments Table */}
                    {(() => {
                      const filtered = appointments.filter(
                        (a) =>
                          a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.email.toLowerCase().includes(searchTerm.toLowerCase()),
                      );
                      if (filtered.length === 0) {
                        return (
                          <div className="bg-card border border-border/60 rounded-xl p-12 text-center">
                            <CalendarCheck className="size-10 text-slate-700 mx-auto mb-3" />
                            <p className="text-muted-foreground/60 font-mono text-sm">
                              No demo bookings yet.
                            </p>
                          </div>
                        );
                      }
                      return (
                        <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs md:text-sm">
                              <thead>
                                <tr className="bg-muted/40 border-b border-border/60 text-muted-foreground font-mono uppercase tracking-wider">
                                  <th className="p-4 font-semibold">Student Name</th>
                                  <th className="p-4 font-semibold">Email</th>
                                  <th className="p-4 font-semibold">Phone</th>
                                  <th className="p-4 font-semibold">Course Interest</th>
                                  <th className="p-4 font-semibold">Day</th>
                                  <th className="p-4 font-semibold">Time Slot</th>
                                  <th className="p-4 font-semibold">Date Submitted</th>
                                  <th className="p-4 font-semibold text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border/40">
                                {filtered.map((appt) => {
                                  const parsed = parseDemoMessage(appt.message);
                                  return (
                                    <tr
                                      key={appt.id}
                                      className="hover:bg-muted/10 text-foreground/85"
                                    >
                                      <td className="p-4 font-semibold text-foreground">
                                        <div className="flex items-center gap-2">
                                          {appt.name}
                                          <span className="bg-azure/10 text-azure border border-azure/20 text-[8px] font-mono uppercase px-1.5 py-0.5 rounded tracking-wider">
                                            Demo
                                          </span>
                                        </div>
                                      </td>
                                      <td className="p-4 font-mono">{appt.email}</td>
                                      <td className="p-4 font-mono">{appt.phone || "—"}</td>
                                      <td className="p-4 font-semibold text-azure">
                                        {appt.course_interest || "General Inquiry"}
                                      </td>
                                      <td className="p-4 font-semibold text-rose-400 font-mono">
                                        {parsed.day || "—"}
                                      </td>
                                      <td className="p-4 font-semibold text-rose-400 font-mono">
                                        {parsed.time || "—"}
                                      </td>
                                      <td className="p-4 font-mono text-muted-foreground/60">
                                        {new Date(appt.created_at).toLocaleDateString(undefined, {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                        })}
                                      </td>
                                      <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                          <button
                                            onClick={() => setLeadDetail(appt)}
                                            className="bg-muted hover:bg-muted/65 border border-border/80 text-foreground/90 font-bold uppercase tracking-wider text-[10px] px-3 py-1.5 rounded transition-all cursor-pointer whitespace-nowrap"
                                          >
                                            View Msg
                                          </button>
                                          <button
                                            onClick={() => deleteLead(appt.id)}
                                            className="bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-foreground font-bold uppercase tracking-wider text-[10px] px-3 py-1.5 rounded transition-all cursor-pointer whitespace-nowrap"
                                            title="Delete Appointment"
                                          >
                                            Delete
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* TAB CONTENT: COURSES */}
                {activeTab === "courses" && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h2 className="font-display text-3xl uppercase text-foreground">Courses</h2>
                        <p className="text-muted-foreground text-sm mt-1">
                          Add details, manage syllabus, and customize certifications.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingCourse({
                            name: "",
                            slug: "",
                            tagline: "",
                            summary: "",
                            duration: "",
                            certification: "",
                            hero_image: "",
                            video_url: "",
                            curriculum: [],
                            outcomes: [],
                            display_order: courses.length + 1,
                          });
                          setCourseModalOpen(true);
                        }}
                        className="bg-azure hover:bg-azure/90 text-azure-foreground font-bold uppercase tracking-wider text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-azure/20"
                      >
                        <Plus className="size-4" /> Add Course
                      </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-3.5 size-4 text-muted-foreground/60" />
                      <input
                        type="text"
                        placeholder="Search courses by name or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-card border border-border/60 rounded-xl py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-azure transition-all"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {courses
                        .filter(
                          (course) =>
                            course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (course.tagline || "")
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            (course.summary || "").toLowerCase().includes(searchTerm.toLowerCase()),
                        )
                        .map((course) => (
                          <div
                            key={course.id}
                            className="bg-card border border-border/60 rounded-xl overflow-hidden shadow-md hover:border-border/80 transition-all flex flex-col"
                          >
                            {course.hero_image ? (
                              <div className="h-40 w-full overflow-hidden bg-muted/70 relative">
                                <img
                                  src={course.hero_image}
                                  alt={course.name}
                                  className="w-full h-full object-cover"
                                />
                                {course.video_url && (
                                  <div
                                    className="absolute top-3 right-3 bg-red-600/90 text-foreground p-1.5 rounded-full shadow-md"
                                    title="Has Video Embed"
                                  >
                                    <Video className="size-4" />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="h-40 w-full bg-background flex items-center justify-center border-b border-border relative">
                                <BookOpen className="size-8 text-slate-700" />
                                {course.video_url && (
                                  <div className="absolute top-3 right-3 bg-red-600/90 text-foreground p-1.5 rounded-full shadow-md">
                                    <Video className="size-4" />
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="p-5 flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-start">
                                  <span className="font-mono text-[9px] uppercase tracking-widest text-azure bg-azure/10 px-2 py-0.5 rounded">
                                    {course.duration || "Self-Paced"}
                                  </span>
                                  <span className="text-muted-foreground/60 text-xs font-mono">
                                    Order: {course.display_order}
                                  </span>
                                </div>
                                <h3 className="font-display text-xl uppercase mt-3 text-foreground leading-tight">
                                  {course.name}
                                </h3>
                                <p className="text-muted-foreground text-xs mt-2 line-clamp-2 leading-relaxed">
                                  {course.tagline || course.summary}
                                </p>

                                {course.video_url &&
                                  (() => {
                                    const videoDetails = getVideoDetails(course.video_url);
                                    return (
                                      <div className="mt-4 p-2 bg-background border border-border/60 rounded flex items-center gap-2 text-xs text-foreground/85 font-mono">
                                        {videoDetails.type === "youtube" ? (
                                          <Youtube className="size-4 text-red-500 shrink-0" />
                                        ) : (
                                          <Video className="size-4 text-azure shrink-0" />
                                        )}
                                        <span className="truncate flex-1">{course.video_url}</span>
                                        <a
                                          href={course.video_url}
                                          target="_blank"
                                          rel="noreferrer noopener"
                                          className="text-muted-foreground hover:text-foreground shrink-0"
                                        >
                                          <ExternalLink className="size-3" />
                                        </a>
                                      </div>
                                    );
                                  })()}
                              </div>

                              <div className="mt-6 pt-4 border-t border-border/60 flex justify-between items-center gap-3">
                                <button
                                  onClick={() => {
                                    setEditingCourse({
                                      ...course,
                                      curriculum: Array.isArray(course.curriculum)
                                        ? course.curriculum
                                        : [],
                                    });
                                    setCourseModalOpen(true);
                                  }}
                                  className="flex-1 bg-muted hover:bg-muted/65 border border-border/80 text-foreground font-bold uppercase tracking-wider text-[10px] py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all"
                                >
                                  <Edit className="size-3" /> Edit / Add Video
                                </button>
                                <button
                                  onClick={() => deleteCourse(course.id)}
                                  className="bg-red-950/30 hover:bg-red-950/80 border border-red-900/40 text-red-400 hover:text-foreground p-2 rounded-lg transition-all"
                                  title="Delete Course"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: LEADS */}
                {activeTab === "leads" && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h2 className="font-display text-3xl uppercase text-foreground">
                          Student Leads
                        </h2>
                        <p className="text-muted-foreground text-sm mt-1">
                          Track admissions trial requests and contact inquiries.
                        </p>
                      </div>
                      <button
                        onClick={() => exportToCSV(leads, "student_leads", leadColumns)}
                        className="bg-muted hover:bg-muted/80 text-foreground font-bold uppercase tracking-wider text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all border border-border/80"
                      >
                        <Download className="size-4" /> Export to CSV
                      </button>
                    </div>

                    {/* Search and Filters */}
                    <div className="relative">
                      <Search className="absolute left-3 top-3.5 size-4 text-muted-foreground/60" />
                      <input
                        type="text"
                        placeholder="Search leads by name, email, or course interest..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-card border border-border/60 rounded-xl py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-azure transition-all"
                      />
                    </div>

                    {/* Leads Table */}
                    <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs md:text-sm">
                          <thead>
                            <tr className="bg-muted/40 border-b border-border/60 text-muted-foreground font-mono uppercase tracking-wider">
                              <th className="p-4 font-semibold">Name</th>
                              <th className="p-4 font-semibold">Email</th>
                              <th className="p-4 font-semibold">Phone</th>
                              <th className="p-4 font-semibold">Course Interest</th>
                              <th className="p-4 font-semibold">Source</th>
                              <th className="p-4 font-semibold">Date</th>
                              <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/40">
                            {leads
                              .filter(
                                (lead) =>
                                  lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  (lead.course_interest || "")
                                    .toLowerCase()
                                    .includes(searchTerm.toLowerCase()),
                              )
                              .map((lead) => (
                                <tr key={lead.id} className="hover:bg-muted/10 text-foreground/85">
                                  <td className="p-4 font-semibold text-foreground">{lead.name}</td>
                                  <td className="p-4 font-mono">{lead.email}</td>
                                  <td className="p-4 font-mono">{lead.phone || "—"}</td>
                                  <td className="p-4 font-semibold text-azure">
                                    {lead.course_interest || "General Inquiry"}
                                  </td>
                                  <td className="p-4 font-mono text-muted-foreground/60">
                                    {lead.source || "Website"}
                                  </td>
                                  <td className="p-4 font-mono text-muted-foreground/60">
                                    {new Date(lead.created_at).toLocaleDateString()}
                                  </td>
                                  <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={() => setLeadDetail(lead)}
                                        className="bg-muted hover:bg-muted/65 border border-border/80 text-foreground/90 font-bold uppercase tracking-wider text-[10px] px-3 py-1.5 rounded transition-all cursor-pointer whitespace-nowrap"
                                      >
                                        View Msg
                                      </button>
                                      <button
                                        onClick={() => deleteLead(lead.id)}
                                        className="bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-foreground font-bold uppercase tracking-wider text-[10px] px-3 py-1.5 rounded transition-all cursor-pointer whitespace-nowrap"
                                        title="Delete Lead"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: SUBSCRIBERS */}
                {activeTab === "subscribers" && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h2 className="font-display text-3xl uppercase text-foreground">
                          Newsletter Subscribers
                        </h2>
                        <p className="text-muted-foreground text-sm mt-1">
                          List of readers signed up to receive monthly recitals and workshop alerts.
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          exportToCSV(subscribers, "newsletter_subscribers", subscriberColumns)
                        }
                        className="bg-muted hover:bg-muted/80 text-foreground font-bold uppercase tracking-wider text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all border border-border/80"
                      >
                        <Download className="size-4" /> Export to CSV
                      </button>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-3 top-3.5 size-4 text-muted-foreground/60" />
                      <input
                        type="text"
                        placeholder="Search subscribers by email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-card border border-border/60 rounded-xl py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-azure transition-all"
                      />
                    </div>

                    <div className="bg-card border border-border/60 rounded-xl overflow-hidden max-w-xl">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs md:text-sm">
                          <thead>
                            <tr className="bg-muted/40 border-b border-border/60 text-muted-foreground font-mono uppercase tracking-wider">
                              <th className="p-4 font-semibold">Email Address</th>
                              <th className="p-4 font-semibold">Subscribed Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/40">
                            {subscribers
                              .filter((sub) =>
                                sub.email.toLowerCase().includes(searchTerm.toLowerCase()),
                              )
                              .map((sub) => (
                                <tr key={sub.id} className="hover:bg-muted/10 text-foreground/85">
                                  <td className="p-4 font-mono text-foreground">{sub.email}</td>
                                  <td className="p-4 font-mono text-muted-foreground/60">
                                    {new Date(sub.created_at).toLocaleDateString()}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: PAYMENTS */}
                {activeTab === "payments" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-display text-3xl uppercase text-foreground">Payments</h2>
                      <p className="text-muted-foreground text-sm mt-1">
                        Verify UPI payments against your bank statement, then approve to activate
                        enrollments and confirm demo bookings.
                      </p>
                    </div>

                    {/* UPI settings */}
                    <form
                      onSubmit={savePaymentSettings}
                      className="bg-card border border-border/60 rounded-xl p-5 space-y-4"
                    >
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-azure font-bold">
                        UPI QR Settings
                      </p>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80 font-bold mb-2">
                            UPI ID (VPA)
                          </label>
                          <input
                            value={payVpa}
                            onChange={(e) => setPayVpa(e.target.value)}
                            placeholder="e.g. zahaumusic@okaxis"
                            className="w-full bg-card border border-border/60 rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-azure transition-all"
                          />
                        </div>
                        <div>
                          <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80 font-bold mb-2">
                            Payee Name
                          </label>
                          <input
                            value={payPayee}
                            onChange={(e) => setPayPayee(e.target.value)}
                            placeholder="Zahau Music School"
                            className="w-full bg-card border border-border/60 rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-azure transition-all"
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground/70 font-light">
                        Students see a QR built from this UPI ID with the exact package amount
                        pre-filled. Leave the UPI ID blank to hide online payment.
                      </p>
                      <button
                        type="submit"
                        disabled={savingPaySettings}
                        className="bg-azure text-azure-foreground hover:bg-azure/90 font-bold uppercase tracking-wider text-xs px-5 py-2.5 rounded-lg transition-all cursor-pointer disabled:opacity-40"
                      >
                        {savingPaySettings ? "Saving…" : "Save Settings"}
                      </button>
                    </form>

                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-3.5 size-4 text-muted-foreground/60" />
                      <input
                        type="text"
                        placeholder="Search by name, email or UTR..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-card border border-border/60 rounded-xl py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-azure transition-all"
                      />
                    </div>

                    {/* Submissions Table */}
                    {(() => {
                      const q = searchTerm.toLowerCase();
                      const filtered = payments.filter(
                        (p) =>
                          p.name.toLowerCase().includes(q) ||
                          p.email.toLowerCase().includes(q) ||
                          (p.upi_reference || "").toLowerCase().includes(q),
                      );
                      if (filtered.length === 0) {
                        return (
                          <div className="bg-card border border-border/60 rounded-xl p-12 text-center">
                            <Wallet className="size-10 text-slate-700 mx-auto mb-3" />
                            <p className="text-muted-foreground/60 font-mono text-sm">
                              No payment submissions yet.
                            </p>
                          </div>
                        );
                      }
                      return (
                        <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs md:text-sm">
                              <thead>
                                <tr className="bg-muted/40 border-b border-border/60 text-muted-foreground font-mono uppercase tracking-wider">
                                  <th className="p-4 font-semibold">Student</th>
                                  <th className="p-4 font-semibold">Type</th>
                                  <th className="p-4 font-semibold">Details</th>
                                  <th className="p-4 font-semibold">Amount</th>
                                  <th className="p-4 font-semibold">UTR</th>
                                  <th className="p-4 font-semibold">Proof</th>
                                  <th className="p-4 font-semibold">Status</th>
                                  <th className="p-4 font-semibold text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border/40">
                                {filtered.map((p) => (
                                  <tr key={p.id} className="hover:bg-muted/10 text-foreground/85">
                                    <td className="p-4 font-semibold text-foreground">
                                      <div>{p.name}</div>
                                      <div className="font-mono text-[10px] text-muted-foreground/60">
                                        {p.email}
                                      </div>
                                    </td>
                                    <td className="p-4">
                                      <span className="bg-azure/10 text-azure border border-azure/20 text-[8px] font-mono uppercase px-1.5 py-0.5 rounded tracking-wider">
                                        {p.kind}
                                      </span>
                                    </td>
                                    <td className="p-4 text-foreground/85">
                                      {p.kind === "enrollment"
                                        ? `${p.package_title ?? "—"}${p.instrument ? ` · ${p.instrument}` : ""}`
                                        : `${p.day ?? "—"} · ${p.slot ?? "—"}`}
                                    </td>
                                    <td className="p-4 font-semibold text-emerald-400 font-mono">
                                      Rs. {p.amount}
                                    </td>
                                    <td className="p-4 font-mono text-foreground/80">
                                      {p.upi_reference || "—"}
                                    </td>
                                    <td className="p-4">
                                      {p.screenshot_signed_url ? (
                                        <a
                                          href={p.screenshot_signed_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-azure hover:underline font-mono text-[11px] inline-flex items-center gap-1"
                                        >
                                          <ExternalLink className="size-3" /> View
                                        </a>
                                      ) : (
                                        <span className="text-muted-foreground/40">—</span>
                                      )}
                                    </td>
                                    <td className="p-4">
                                      <div className="flex flex-col items-start gap-1">
                                        <span
                                          className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded tracking-wider border ${
                                            p.status === "approved"
                                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                              : p.status === "rejected"
                                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                          }`}
                                        >
                                          {p.status}
                                        </span>
                                        {p.status === "approved" && p.verified_via && (
                                          <span
                                            className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded tracking-wider ${
                                              p.verified_via === "auto"
                                                ? "text-emerald-400"
                                                : "text-muted-foreground/60"
                                            }`}
                                          >
                                            {p.verified_via === "auto" ? "⚡ auto" : "manual"}
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="p-4 text-right">
                                      {p.status === "pending" ? (
                                        <div className="flex items-center justify-end gap-2">
                                          <button
                                            onClick={() => handleReviewPayment(p.id, "approve")}
                                            disabled={reviewingId === p.id}
                                            className="bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 hover:border-emerald-500 text-emerald-400 hover:text-foreground font-bold uppercase tracking-wider text-[10px] px-3 py-1.5 rounded transition-all cursor-pointer whitespace-nowrap disabled:opacity-40"
                                          >
                                            Approve
                                          </button>
                                          <button
                                            onClick={() => handleReviewPayment(p.id, "reject")}
                                            disabled={reviewingId === p.id}
                                            className="bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-foreground font-bold uppercase tracking-wider text-[10px] px-3 py-1.5 rounded transition-all cursor-pointer whitespace-nowrap disabled:opacity-40"
                                          >
                                            Reject
                                          </button>
                                        </div>
                                      ) : (
                                        <span className="text-muted-foreground/40 font-mono text-[10px]">
                                          {p.reviewed_at
                                            ? new Date(p.reviewed_at).toLocaleDateString()
                                            : "—"}
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Unmatched bank credits — money received that didn't auto-match a
                        submission (wrong UTR typed, wrong amount, or paid outside the flow). */}
                    {(() => {
                      const unmatched = bankTxns.filter((t) => !t.matched_submission_id);
                      if (unmatched.length === 0) return null;
                      return (
                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5 space-y-3">
                          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-500 font-bold">
                            Unmatched Bank Credits ({unmatched.length})
                          </p>
                          <p className="text-[11px] text-muted-foreground/70 font-light">
                            Payments received into your account that didn't auto-match a submission
                            (wrong UTR, wrong amount, or paid outside the flow). Reconcile manually.
                          </p>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="text-muted-foreground font-mono uppercase tracking-wider border-b border-border/40">
                                  <th className="p-2 font-semibold">UTR</th>
                                  <th className="p-2 font-semibold">Amount</th>
                                  <th className="p-2 font-semibold">From</th>
                                  <th className="p-2 font-semibold">Received</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border/30">
                                {unmatched.map((t) => (
                                  <tr key={t.id} className="text-foreground/85">
                                    <td className="p-2 font-mono">{t.utr}</td>
                                    <td className="p-2 font-mono text-emerald-400">
                                      Rs. {t.amount}
                                    </td>
                                    <td className="p-2 font-mono text-muted-foreground/70">
                                      {t.sender || "—"}
                                    </td>
                                    <td className="p-2 font-mono text-muted-foreground/60">
                                      {new Date(t.received_at).toLocaleString()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* TAB CONTENT: LESSONS */}
                {activeTab === "lessons" && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h2 className="font-display text-3xl uppercase text-foreground">
                          Course Videos Console
                        </h2>
                        <p className="text-muted-foreground text-sm mt-1">
                          Upload, update, and manage recorded lessons, tutorials, and class
                          materials.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingLesson({
                            title: "",
                            description: "",
                            video_url: "",
                            link_url: "",
                            display_order: lessons.length + 1,
                          });
                          setLessonModalOpen(true);
                        }}
                        className="bg-azure hover:bg-azure/90 text-azure-foreground font-bold uppercase tracking-wider text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-azure/20"
                      >
                        <Plus className="size-4" /> Add Lesson
                      </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-3.5 size-4 text-muted-foreground/60" />
                      <input
                        type="text"
                        placeholder="Search lessons by title or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-card border border-border/60 rounded-xl py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-azure transition-all"
                      />
                    </div>

                    <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs md:text-sm">
                          <thead>
                            <tr className="bg-muted/40 border-b border-border/60 text-muted-foreground font-mono uppercase tracking-wider">
                              <th className="p-4 font-semibold">Title</th>
                              <th className="p-4 font-semibold">Description</th>
                              <th className="p-4 font-semibold">Video URL</th>
                              <th className="p-4 font-semibold">Resource Link</th>
                              <th className="p-4 font-semibold">Order</th>
                              <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/40">
                            {lessons
                              .filter(
                                (lesson) =>
                                  lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  (lesson.description || "")
                                    .toLowerCase()
                                    .includes(searchTerm.toLowerCase()),
                              )
                              .map((lesson) => (
                                <tr
                                  key={lesson.id}
                                  className="hover:bg-muted/10 text-foreground/85"
                                >
                                  <td className="p-4 font-semibold text-foreground">
                                    {lesson.title}
                                  </td>
                                  <td className="p-4 text-muted-foreground max-w-xs truncate">
                                    {lesson.description || "-"}
                                  </td>
                                  <td className="p-4 font-mono text-azure truncate max-w-xs">
                                    {lesson.video_url ? (
                                      <a
                                        href={lesson.video_url}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        className="hover:underline flex items-center gap-1"
                                      >
                                        {lesson.video_url}{" "}
                                        <ExternalLink className="size-3 shrink-0" />
                                      </a>
                                    ) : (
                                      "-"
                                    )}
                                  </td>
                                  <td className="p-4 font-mono text-emerald-400 truncate max-w-xs">
                                    {lesson.link_url ? (
                                      <a
                                        href={lesson.link_url}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        className="hover:underline flex items-center gap-1"
                                      >
                                        {lesson.link_url}{" "}
                                        <ExternalLink className="size-3 shrink-0" />
                                      </a>
                                    ) : (
                                      "-"
                                    )}
                                  </td>
                                  <td className="p-4 font-mono text-muted-foreground">
                                    {lesson.display_order}
                                  </td>
                                  <td className="p-4 text-right">
                                    <div className="inline-flex gap-2">
                                      <button
                                        onClick={() => {
                                          setEditingLesson(lesson);
                                          setLessonModalOpen(true);
                                        }}
                                        className="bg-muted hover:bg-muted/65 text-foreground/85 border border-border/80 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-all"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => deleteLesson(lesson.id)}
                                        className="bg-red-950/20 hover:bg-red-950 border border-red-900/30 text-red-400 hover:text-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-all"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: FEES */}
                {activeTab === "fees" && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h2 className="font-display text-3xl uppercase text-foreground">
                          Tuition Packages Console
                        </h2>
                        <p className="text-muted-foreground text-sm mt-1">
                          Create and update course packages, costs, features list, and page display
                          order.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingFee({
                            title: "",
                            fees: "Rs. 0",
                            raw_fees: 0,
                            duration: "1 Month",
                            mode: "Hybrid / Offline",
                            tagline: "",
                            features: [],
                            popular: false,
                            badge: "",
                            display_order: fees.length + 1,
                          });
                          setFeeModalOpen(true);
                        }}
                        className="bg-azure hover:bg-azure/90 text-azure-foreground font-bold uppercase tracking-wider text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-azure/20"
                      >
                        <Plus className="size-4" /> Add Fee Package
                      </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-3.5 size-4 text-muted-foreground/60" />
                      <input
                        type="text"
                        placeholder="Search packages by title or mode..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-card border border-border/60 rounded-xl py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-azure transition-all"
                      />
                    </div>

                    <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs md:text-sm">
                          <thead>
                            <tr className="bg-muted/40 border-b border-border/60 text-muted-foreground font-mono uppercase tracking-wider">
                              <th className="p-4 font-semibold">Title</th>
                              <th className="p-4 font-semibold">Total Fee</th>
                              <th className="p-4 font-semibold">Raw Fee</th>
                              <th className="p-4 font-semibold">Duration</th>
                              <th className="p-4 font-semibold">Mode</th>
                              <th className="p-4 font-semibold">Popular</th>
                              <th className="p-4 font-semibold">Order</th>
                              <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/40">
                            {fees
                              .filter(
                                (fee) =>
                                  fee.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  fee.mode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  (fee.tagline || "")
                                    .toLowerCase()
                                    .includes(searchTerm.toLowerCase()),
                              )
                              .map((fee) => (
                                <tr key={fee.id} className="hover:bg-muted/10 text-foreground/85">
                                  <td className="p-4 font-semibold text-foreground">
                                    {fee.title}
                                    {fee.badge && (
                                      <span className="ml-2 bg-azure/10 text-azure border border-azure/20 text-[8px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                                        {fee.badge}
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-4 text-foreground font-medium">{fee.fees}</td>
                                  <td className="p-4 font-mono text-muted-foreground">
                                    Rs. {fee.raw_fees.toLocaleString()}
                                  </td>
                                  <td className="p-4 text-muted-foreground">{fee.duration}</td>
                                  <td className="p-4 text-muted-foreground">{fee.mode}</td>
                                  <td className="p-4">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${fee.popular ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-muted text-muted-foreground border border-border/50"}`}
                                    >
                                      {fee.popular ? "Yes" : "No"}
                                    </span>
                                  </td>
                                  <td className="p-4 font-mono text-muted-foreground">
                                    {fee.display_order}
                                  </td>
                                  <td className="p-4 text-right">
                                    <div className="inline-flex gap-2">
                                      <button
                                        onClick={() => {
                                          setEditingFee(fee);
                                          setFeeModalOpen(true);
                                        }}
                                        className="bg-muted hover:bg-muted/65 text-foreground/85 border border-border/80 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-all"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => deleteFee(fee.id)}
                                        className="bg-red-950/20 hover:bg-red-950 border border-red-900/30 text-red-400 hover:text-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-all"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: POSTS */}
                {activeTab === "posts" && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h2 className="font-display text-3xl uppercase text-foreground">
                          Blog Posts Console
                        </h2>
                        <p className="text-muted-foreground text-sm mt-1">
                          Write, edit, and manage school announcements and blog articles.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingPost({
                            title: "",
                            slug: "",
                            excerpt: "",
                            body: [],
                            author: "Faculty Desk",
                            date: new Date().toISOString().split("T")[0],
                          });
                          setPostModalOpen(true);
                        }}
                        className="bg-azure hover:bg-azure/90 text-azure-foreground font-bold uppercase tracking-wider text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-azure/20"
                      >
                        <Plus className="size-4" /> Add Blog Post
                      </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-3.5 size-4 text-muted-foreground/60" />
                      <input
                        type="text"
                        placeholder="Search posts by title, author, or excerpt..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-card border border-border/60 rounded-xl py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-azure transition-all"
                      />
                    </div>

                    <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs md:text-sm">
                          <thead>
                            <tr className="bg-muted/40 border-b border-border/60 text-muted-foreground font-mono uppercase tracking-wider">
                              <th className="p-4 font-semibold">Title</th>
                              <th className="p-4 font-semibold">Slug</th>
                              <th className="p-4 font-semibold">Author</th>
                              <th className="p-4 font-semibold">Publish Date</th>
                              <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/40">
                            {posts
                              .filter(
                                (post) =>
                                  post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  (post.excerpt || "")
                                    .toLowerCase()
                                    .includes(searchTerm.toLowerCase()),
                              )
                              .map((post) => (
                                <tr key={post.id} className="hover:bg-muted/10 text-foreground/85">
                                  <td className="p-4 font-semibold text-foreground">
                                    {post.title}
                                  </td>
                                  <td className="p-4 font-mono text-muted-foreground">
                                    {post.slug}
                                  </td>
                                  <td className="p-4 text-muted-foreground">{post.author}</td>
                                  <td className="p-4 font-mono text-muted-foreground/60">
                                    {post.date}
                                  </td>
                                  <td className="p-4 text-right">
                                    <div className="inline-flex gap-2">
                                      <button
                                        onClick={() => {
                                          setEditingPost(post);
                                          setPostModalOpen(true);
                                        }}
                                        className="bg-muted hover:bg-muted/65 text-foreground/85 border border-border/80 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-all"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => deletePost(post.id)}
                                        className="bg-red-950/20 hover:bg-red-950 border border-red-900/30 text-red-400 hover:text-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-all"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* COURSE FORM DIALOG MODAL */}
      {courseModalOpen && editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-card border border-border/60 rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="bg-muted/60 px-6 py-4 border-b border-border/60 flex justify-between items-center">
              <h3 className="font-display text-lg uppercase text-foreground">
                {editingCourse.id ? "Edit Course Detail" : "Create New Course"}
              </h3>
              <button
                onClick={() => {
                  setCourseModalOpen(false);
                  setEditingCourse(null);
                }}
                className="text-muted-foreground hover:text-foreground font-mono text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveCourse} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Course Name */}
                <div className="grid gap-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCourse.name || ""}
                    onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
                    className="w-full bg-background border border-border/60 focus:border-azure rounded p-3 text-sm text-foreground focus:outline-none"
                    placeholder="e.g. Piano"
                  />
                </div>

                {/* Slug */}
                <div className="grid gap-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCourse.slug || ""}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                      })
                    }
                    className="w-full bg-background border border-border/60 focus:border-azure rounded p-3 text-sm text-foreground focus:outline-none"
                    placeholder="e.g. concert-piano"
                  />
                </div>

                {/* Tagline */}
                <div className="grid gap-2 md:col-span-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Tagline / Short description
                  </label>
                  <input
                    type="text"
                    value={editingCourse.tagline || ""}
                    onChange={(e) =>
                      setEditingCourse({ ...editingCourse, tagline: e.target.value })
                    }
                    className="w-full bg-background border border-border/60 focus:border-azure rounded p-3 text-sm text-foreground focus:outline-none"
                    placeholder="e.g. Master the masterworks: A comprehensive study from Bach to Debussy."
                  />
                </div>

                {/* Summary */}
                <div className="grid gap-2 md:col-span-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Overview / Full Summary
                  </label>
                  <textarea
                    rows={4}
                    value={editingCourse.summary || ""}
                    onChange={(e) =>
                      setEditingCourse({ ...editingCourse, summary: e.target.value })
                    }
                    className="w-full bg-background border border-border/60 focus:border-azure rounded p-3 text-sm text-foreground focus:outline-none"
                    placeholder="Describe the full course, syllabus structure, and goals..."
                  />
                </div>

                {/* Duration */}
                <div className="grid gap-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={editingCourse.duration || ""}
                    onChange={(e) =>
                      setEditingCourse({ ...editingCourse, duration: e.target.value })
                    }
                    className="w-full bg-background border border-border/60 focus:border-azure rounded p-3 text-sm text-foreground focus:outline-none"
                    placeholder="e.g. 12 Weeks (24 Sessions)"
                  />
                </div>

                {/* Certification */}
                <div className="grid gap-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Certification
                  </label>
                  <input
                    type="text"
                    value={editingCourse.certification || ""}
                    onChange={(e) =>
                      setEditingCourse({ ...editingCourse, certification: e.target.value })
                    }
                    className="w-full bg-background border border-border/60 focus:border-azure rounded p-3 text-sm text-foreground focus:outline-none"
                    placeholder="e.g. ABRSM Grade 4 Preparation"
                  />
                </div>

                {/* Hero Image */}
                <div className="grid gap-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Hero Image URL
                  </label>
                  <input
                    type="text"
                    value={editingCourse.hero_image || ""}
                    onChange={(e) =>
                      setEditingCourse({ ...editingCourse, hero_image: e.target.value })
                    }
                    className="w-full bg-background border border-border/60 focus:border-azure rounded p-3 text-sm text-foreground focus:outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Main Video URL (YouTube/Vimeo OR Upload) */}
                <div className="grid gap-2 md:col-span-2 border border-border/60 bg-background/25 p-4 rounded-xl">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-azure flex items-center gap-1.5 font-bold">
                    <Video className="size-4" />
                    Course Intro Video
                  </label>

                  <div className="grid md:grid-cols-2 gap-4 mt-2">
                    {/* Option A: Paste URL */}
                    <div className="space-y-2">
                      <span className="font-mono text-[9px] text-muted-foreground block">
                        OPTION A: PASTE VIDEO URL
                      </span>
                      <input
                        type="text"
                        value={editingCourse.video_url || ""}
                        onChange={(e) =>
                          setEditingCourse({ ...editingCourse, video_url: e.target.value })
                        }
                        className="w-full bg-background border border-border/60 focus:border-azure rounded p-3 text-sm text-foreground focus:outline-none"
                        placeholder="e.g. https://www.youtube.com/watch?v=..."
                      />
                      <p className="text-[9px] text-muted-foreground/60 font-mono">
                        YouTube, Vimeo, or direct video file link.
                      </p>
                    </div>

                    {/* Option B: Upload File */}
                    <div className="space-y-2">
                      <span className="font-mono text-[9px] text-muted-foreground block">
                        OPTION B: UPLOAD VIDEO FILE (MAX 100MB)
                      </span>
                      <div className="relative border border-dashed border-border/60 rounded-lg p-3 flex flex-col items-center justify-center bg-background/50 hover:bg-background hover:border-azure/40 transition-all duration-300 min-h-[75px]">
                        {uploadingCourseVideo ? (
                          <div className="flex flex-col items-center py-2 space-y-2 w-full">
                            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-azure h-1.5 transition-all duration-300"
                                style={{ width: `${courseVideoProgress}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono text-azure">
                              Uploading: {courseVideoProgress}%
                            </span>
                          </div>
                        ) : (
                          <>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) await handleVideoUpload(file, "course");
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Plus className="size-4 text-muted-foreground mb-1" />
                            <span className="text-[11px] font-semibold text-foreground/85">
                              Select MP4/MOV Video
                            </span>
                            <span className="text-[9px] text-muted-foreground/60 font-mono mt-0.5">
                              Drag & drop or click
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {editingCourse.video_url && (
                    <div className="mt-2 text-xs bg-muted/40 p-2.5 rounded border border-border/60 flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono text-[9px] text-azure font-bold border border-azure/20 bg-azure/5 px-1.5 py-0.5 rounded">
                          Active URL
                        </span>
                        <span className="truncate font-mono text-foreground/85 text-[11px]">
                          {editingCourse.video_url}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingCourse({ ...editingCourse, video_url: "" })}
                        className="text-red-400 hover:text-red-300 text-xs px-2 font-mono font-bold"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {/* Display Order */}
                <div className="grid gap-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={editingCourse.display_order || 0}
                    onChange={(e) =>
                      setEditingCourse({ ...editingCourse, display_order: Number(e.target.value) })
                    }
                    className="w-full bg-background border border-border/60 focus:border-azure rounded p-3 text-sm text-foreground focus:outline-none"
                  />
                </div>

                {/* Levels */}
                <div className="grid gap-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Levels (comma separated)
                  </label>
                  <input
                    type="text"
                    value={(editingCourse.levels || []).join(", ")}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        levels: e.target.value
                          .split(",")
                          .map((i) => i.trim())
                          .filter(Boolean),
                      })
                    }
                    className="w-full bg-background border border-border/60 focus:border-azure rounded p-3 text-sm text-foreground focus:outline-none"
                    placeholder="e.g. Beginner, Intermediate, Advanced"
                  />
                </div>

                {/* Outcomes */}
                <div className="grid gap-2 md:col-span-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Outcomes / Student Achievements (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={outcomesInput}
                    onChange={(e) => setOutcomesInput(e.target.value)}
                    className="w-full bg-background border border-border/60 focus:border-azure rounded p-3 text-sm text-foreground focus:outline-none"
                    placeholder="Understand sheet music theory&#10;Play complex scales smoothly&#10;Prepare for ABRSM Performance assessments"
                  />
                </div>

                {/* Curriculum JSONB List Builder */}
                <div className="grid gap-4 md:col-span-2 border-t border-border/60 pt-6">
                  <div className="flex justify-between items-center">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Syllabus Terms/Chapters
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = [
                          ...((editingCourse.curriculum as CurriculumTerm[] | null) || []),
                        ];
                        cur.push({ term: `Term ${cur.length + 1}: Title`, topics: [] });
                        handleCurriculumChange(cur);
                      }}
                      className="bg-muted hover:bg-muted/65 text-foreground/85 font-bold uppercase tracking-wider text-[10px] px-3 py-1.5 rounded flex items-center gap-1 border border-border/80"
                    >
                      <Plus className="size-3" /> Add Chapter / Term
                    </button>
                  </div>

                  {((editingCourse.curriculum as CurriculumTerm[] | null) || []).length === 0 ? (
                    <p className="text-xs text-muted-foreground/60 font-mono py-2 italic text-center bg-background/40 rounded border border-dashed border-border/60">
                      No chapters defined. Click the button above to start building the syllabus.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {((editingCourse.curriculum as CurriculumTerm[] | null) || []).map(
                        (term, tIdx) => (
                          <div
                            key={tIdx}
                            className="bg-background border border-border/60 p-4 rounded-xl space-y-3 relative"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                const cur = [
                                  ...((editingCourse.curriculum as CurriculumTerm[] | null) || []),
                                ];
                                cur.splice(tIdx, 1);
                                handleCurriculumChange(cur);
                              }}
                              className="absolute top-3 right-3 text-muted-foreground/60 hover:text-red-400"
                              title="Delete Chapter"
                            >
                              <Trash className="size-4" />
                            </button>

                            <div className="grid gap-1">
                              <span className="font-mono text-[9px] text-muted-foreground/60">
                                Chapter Title
                              </span>
                              <input
                                type="text"
                                value={term.term}
                                onChange={(e) => {
                                  const cur = [
                                    ...((editingCourse.curriculum as CurriculumTerm[] | null) ||
                                      []),
                                  ];
                                  cur[tIdx].term = e.target.value;
                                  handleCurriculumChange(cur);
                                }}
                                className="bg-card border border-border/60 focus:border-azure rounded px-3 py-1.5 text-xs text-foreground focus:outline-none w-[80%]"
                                placeholder="e.g. Term 1: Foundations"
                              />
                            </div>

                            <div className="space-y-2">
                              <span className="font-mono text-[9px] text-muted-foreground/60 block">
                                Topics / Lessons
                              </span>
                              {term.topics.map((topic: string, topIdx: number) => (
                                <div key={topIdx} className="flex gap-2 items-center">
                                  <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => {
                                      const cur = [
                                        ...((editingCourse.curriculum as CurriculumTerm[] | null) ||
                                          []),
                                      ];
                                      cur[tIdx].topics[topIdx] = e.target.value;
                                      handleCurriculumChange(cur);
                                    }}
                                    className="flex-1 bg-card border border-border/60 focus:border-azure rounded px-3 py-1 text-xs text-foreground focus:outline-none"
                                    placeholder="e.g. Introduction to Major Keys"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const cur = [
                                        ...((editingCourse.curriculum as CurriculumTerm[] | null) ||
                                          []),
                                      ];
                                      cur[tIdx].topics.splice(topIdx, 1);
                                      handleCurriculumChange(cur);
                                    }}
                                    className="text-red-400 hover:text-red-500 text-xs px-2"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  const cur = [
                                    ...((editingCourse.curriculum as CurriculumTerm[] | null) ||
                                      []),
                                  ];
                                  cur[tIdx].topics.push("");
                                  handleCurriculumChange(cur);
                                }}
                                className="text-azure hover:text-azure/85 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 pt-1.5"
                              >
                                <Plus className="size-3" /> Add Lesson
                              </button>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-border/60 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCourseModalOpen(false);
                    setEditingCourse(null);
                  }}
                  className="border border-border/80 hover:bg-muted text-foreground/85 font-bold uppercase tracking-wider text-xs px-5 py-2.5 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-azure hover:bg-azure/90 text-azure-foreground font-bold uppercase tracking-wider text-xs px-5 py-2.5 rounded-lg transition-all shadow-md shadow-azure/20"
                >
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LESSON FORM DIALOG MODAL */}
      {lessonModalOpen && editingLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-card border border-border/60 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden my-8 flex flex-col">
            <div className="bg-muted/60 px-6 py-4 border-b border-border/60 flex justify-between items-center">
              <h3 className="font-display text-lg uppercase text-foreground">
                {editingLesson.id ? "Edit Lesson Detail" : "Add New Lesson"}
              </h3>
              <button
                onClick={() => {
                  setLessonModalOpen(false);
                  setEditingLesson(null);
                }}
                className="text-muted-foreground hover:text-foreground font-mono text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveLesson} className="p-6 space-y-4">
              {/* Title */}
              <div className="grid gap-1">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingLesson.title || ""}
                  onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                  className="w-full bg-background border border-border/60 focus:border-azure rounded p-2.5 text-sm text-foreground focus:outline-none"
                  placeholder="e.g. Introduction to Scales"
                />
              </div>

              {/* Description */}
              <div className="grid gap-1">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingLesson.description || ""}
                  onChange={(e) =>
                    setEditingLesson({ ...editingLesson, description: e.target.value })
                  }
                  className="w-full bg-background border border-border/60 focus:border-azure rounded p-2.5 text-sm text-foreground focus:outline-none"
                  placeholder="Describe what is covered in this lesson..."
                />
              </div>

              {/* Video URL (YouTube OR Upload) */}
              <div className="grid gap-2 border border-border/60 bg-background/20 p-4 rounded-xl">
                <label className="font-mono text-[10px] uppercase tracking-widest text-azure flex items-center gap-1.5 font-bold">
                  <Video className="size-4" />
                  Lesson Video
                </label>

                <div className="grid gap-4 mt-1">
                  {/* Option A: Paste URL */}
                  <div className="space-y-1.5">
                    <span className="font-mono text-[9px] text-muted-foreground block">
                      OPTION A: PASTE VIDEO URL
                    </span>
                    <input
                      type="text"
                      value={editingLesson.video_url || ""}
                      onChange={(e) =>
                        setEditingLesson({ ...editingLesson, video_url: e.target.value })
                      }
                      className="w-full bg-background border border-border/60 focus:border-azure rounded p-2.5 text-sm text-foreground focus:outline-none"
                      placeholder="e.g. https://www.youtube.com/watch?v=..."
                    />
                  </div>

                  {/* Option B: Upload File */}
                  <div className="space-y-1.5">
                    <span className="font-mono text-[9px] text-muted-foreground block">
                      OPTION B: UPLOAD VIDEO FILE (MAX 100MB)
                    </span>
                    <div className="relative border border-dashed border-border/60 rounded-lg p-3 flex flex-col items-center justify-center bg-background/50 hover:bg-background hover:border-azure/40 transition-all duration-300 min-h-[75px]">
                      {uploadingLessonVideo ? (
                        <div className="flex flex-col items-center py-2 space-y-2 w-full">
                          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-azure h-1.5 transition-all duration-300"
                              style={{ width: `${lessonVideoProgress}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-azure">
                            Uploading: {lessonVideoProgress}%
                          </span>
                        </div>
                      ) : (
                        <>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) await handleVideoUpload(file, "lesson");
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Plus className="size-4 text-muted-foreground mb-1" />
                          <span className="text-[11px] font-semibold text-foreground/85">
                            Select MP4/MOV Video
                          </span>
                          <span className="text-[9px] text-muted-foreground/60 font-mono mt-0.5">
                            Drag & drop or click
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {editingLesson.video_url && (
                  <div className="mt-2 text-xs bg-muted/40 p-2.5 rounded border border-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-[9px] text-azure font-bold border border-azure/20 bg-azure/5 px-1.5 py-0.5 rounded">
                        Active URL
                      </span>
                      <span className="truncate font-mono text-foreground/85 text-[11px]">
                        {editingLesson.video_url}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingLesson({ ...editingLesson, video_url: "" })}
                      className="text-red-400 hover:text-red-300 text-xs px-2 font-mono font-bold"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Resource Link URL */}
              <div className="grid gap-1">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Resource PDF / Sheet Music Link
                </label>
                <input
                  type="text"
                  value={editingLesson.link_url || ""}
                  onChange={(e) => setEditingLesson({ ...editingLesson, link_url: e.target.value })}
                  className="w-full bg-background border border-border/60 focus:border-azure rounded p-2.5 text-sm text-foreground focus:outline-none"
                  placeholder="e.g. Google Drive Link / PDF URL"
                />
              </div>

              {/* Display Order */}
              <div className="grid gap-1">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Display Order
                </label>
                <input
                  type="number"
                  value={editingLesson.display_order || 0}
                  onChange={(e) =>
                    setEditingLesson({ ...editingLesson, display_order: Number(e.target.value) })
                  }
                  className="w-full bg-background border border-border/60 focus:border-azure rounded p-2.5 text-sm text-foreground focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-border/60 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setLessonModalOpen(false);
                    setEditingLesson(null);
                  }}
                  className="border border-border/80 hover:bg-muted text-foreground/85 font-bold uppercase tracking-wider text-xs px-4 py-2 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-azure hover:bg-azure/90 text-azure-foreground font-bold uppercase tracking-wider text-xs px-4 py-2 rounded-lg transition-all shadow-md"
                >
                  Save Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FEE PACKAGE FORM DIALOG MODAL */}
      {feeModalOpen && editingFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-card border border-border/60 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden my-8 flex flex-col">
            <div className="bg-muted/60 px-6 py-4 border-b border-border/60 flex justify-between items-center">
              <h3 className="font-display text-lg uppercase text-foreground">
                {editingFee.id ? "Edit Tuition Package" : "Create New Tuition Package"}
              </h3>
              <button
                onClick={() => {
                  setFeeModalOpen(false);
                  setEditingFee(null);
                }}
                className="text-muted-foreground hover:text-foreground font-mono text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveFee} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Title */}
              <div className="grid gap-1">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Package Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingFee.title || ""}
                  onChange={(e) => setEditingFee({ ...editingFee, title: e.target.value })}
                  className="w-full bg-background border border-border/60 focus:border-azure rounded p-2.5 text-sm text-foreground focus:outline-none"
                  placeholder="e.g. Level 1: Basic Three Months"
                />
              </div>

              {/* Tagline */}
              <div className="grid gap-1">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Tagline
                </label>
                <input
                  type="text"
                  value={editingFee.tagline || ""}
                  onChange={(e) => setEditingFee({ ...editingFee, tagline: e.target.value })}
                  className="w-full bg-background border border-border/60 focus:border-azure rounded p-2.5 text-sm text-foreground focus:outline-none"
                  placeholder="e.g. Structured entry-level skill booster"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Total Fee Label */}
                <div className="grid gap-1">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Total Fees (Display) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingFee.fees || ""}
                    onChange={(e) => setEditingFee({ ...editingFee, fees: e.target.value })}
                    className="w-full bg-background border border-border/60 focus:border-azure rounded p-2.5 text-sm text-foreground focus:outline-none"
                    placeholder="e.g. Rs. 12,000"
                  />
                </div>

                {/* Raw Fees Number */}
                <div className="grid gap-1">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Raw Fees (Number) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingFee.raw_fees || 0}
                    onChange={(e) =>
                      setEditingFee({ ...editingFee, raw_fees: Number(e.target.value) })
                    }
                    className="w-full bg-background border border-border/60 focus:border-azure rounded p-2.5 text-sm text-foreground focus:outline-none"
                    placeholder="e.g. 12000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Duration */}
                <div className="grid gap-1">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Duration *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingFee.duration || ""}
                    onChange={(e) => setEditingFee({ ...editingFee, duration: e.target.value })}
                    className="w-full bg-background border border-border/60 focus:border-azure rounded p-2.5 text-sm text-foreground focus:outline-none"
                    placeholder="e.g. 3 Months"
                  />
                </div>

                {/* Mode */}
                <div className="grid gap-1">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Study Mode *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingFee.mode || ""}
                    onChange={(e) => setEditingFee({ ...editingFee, mode: e.target.value })}
                    className="w-full bg-background border border-border/60 focus:border-azure rounded p-2.5 text-sm text-foreground focus:outline-none"
                    placeholder="e.g. Hybrid / Offline"
                  />
                </div>
              </div>

              {/* Features List */}
              <div className="grid gap-1">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Package Features (One per line) *
                </label>
                <textarea
                  rows={4}
                  required
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                  className="w-full bg-background border border-border/60 focus:border-azure rounded p-2.5 text-sm text-foreground focus:outline-none font-sans"
                  placeholder="1 class in a week (12 classes total)&#10;1 hour per class&#10;Classical Piano Beginner syllabus"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Popular Badge */}
                <div className="grid gap-1">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Popular / Highlighted?
                  </label>
                  <select
                    value={editingFee.popular ? "true" : "false"}
                    onChange={(e) =>
                      setEditingFee({ ...editingFee, popular: e.target.value === "true" })
                    }
                    className="w-full bg-background border border-border/60 focus:border-azure rounded p-2.5 text-sm text-foreground focus:outline-none"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>

                {/* Badge text */}
                <div className="grid gap-1">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    value={editingFee.badge || ""}
                    onChange={(e) => setEditingFee({ ...editingFee, badge: e.target.value })}
                    className="w-full bg-background border border-border/60 focus:border-azure rounded p-2.5 text-sm text-foreground focus:outline-none"
                    placeholder="e.g. Best Value / Recommended"
                  />
                </div>
              </div>

              {/* Display Order */}
              <div className="grid gap-1">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Display Order
                </label>
                <input
                  type="number"
                  value={editingFee.display_order || 0}
                  onChange={(e) =>
                    setEditingFee({ ...editingFee, display_order: Number(e.target.value) })
                  }
                  className="w-full bg-background border border-border/60 focus:border-azure rounded p-2.5 text-sm text-foreground focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-border/60 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFeeModalOpen(false);
                    setEditingFee(null);
                  }}
                  className="border border-border/80 hover:bg-muted text-foreground/85 font-bold uppercase tracking-wider text-xs px-4 py-2 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-azure hover:bg-azure/90 text-azure-foreground font-bold uppercase tracking-wider text-xs px-4 py-2 rounded-lg transition-all shadow-md"
                >
                  Save Fee Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LEAD DETAIL DIALOG MODAL */}
      {leadDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-card border border-border/60 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-muted/60 px-6 py-4 border-b border-border/60 flex justify-between items-center">
              <h3 className="font-display text-lg uppercase text-foreground">
                Lead Message Detail
              </h3>
              <button
                onClick={() => setLeadDetail(null)}
                className="text-muted-foreground hover:text-foreground font-mono text-lg"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm leading-relaxed">
              <div className="grid grid-cols-2 gap-4 border-b border-border/60 pb-4">
                <div>
                  <span className="font-mono text-[9px] text-muted-foreground/60 uppercase block">
                    Name
                  </span>
                  <span className="font-semibold text-foreground">{leadDetail.name}</span>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-muted-foreground/60 uppercase block">
                    Course Interest
                  </span>
                  <span className="font-semibold text-azure">
                    {leadDetail.course_interest || "General Inquiry"}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-muted-foreground/60 uppercase block">
                    Email
                  </span>
                  <span className="text-foreground/85 font-mono">{leadDetail.email}</span>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-muted-foreground/60 uppercase block">
                    Phone
                  </span>
                  <span className="text-foreground/85 font-mono">{leadDetail.phone || "—"}</span>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-muted-foreground/60 uppercase block">
                    Submitted Date
                  </span>
                  <span className="text-muted-foreground font-mono">
                    {new Date(leadDetail.created_at).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-muted-foreground/60 uppercase block">
                    Source
                  </span>
                  <span className="text-muted-foreground font-mono">
                    {leadDetail.source || "Website"}
                  </span>
                </div>
              </div>
              <div>
                <span className="font-mono text-[9px] text-muted-foreground/60 uppercase block mb-1">
                  Message Content
                </span>
                <div className="bg-background border border-border/60 p-4 rounded-lg text-foreground/85 font-sans whitespace-pre-wrap">
                  {leadDetail.message || (
                    <span className="italic text-muted-foreground/60">No message provided.</span>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-muted/40 px-6 py-4 border-t border-border/60 flex justify-end">
              <button
                onClick={() => setLeadDetail(null)}
                className="bg-muted hover:bg-muted/65 text-foreground font-bold uppercase tracking-wider text-xs px-5 py-2.5 rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POST FORM DIALOG MODAL */}
      {postModalOpen && editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-card border border-border/60 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 flex flex-col">
            <div className="bg-muted/60 px-6 py-4 border-b border-border/60 flex justify-between items-center">
              <h3 className="font-display text-lg uppercase text-foreground">
                {editingPost.id ? "Edit Blog Post" : "Create New Blog Post"}
              </h3>
              <button
                onClick={() => {
                  setPostModalOpen(false);
                  setEditingPost(null);
                }}
                className="text-muted-foreground hover:text-foreground font-mono text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={savePost} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Title */}
              <div className="grid gap-1">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Post Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingPost.title || ""}
                  onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                  className="w-full bg-background border border-border/60 focus:border-azure rounded p-2.5 text-sm text-foreground focus:outline-none"
                  placeholder="e.g. How to practice without quitting"
                />
              </div>

              {/* Slug */}
              <div className="grid gap-1">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={editingPost.slug || ""}
                  onChange={(e) =>
                    setEditingPost({
                      ...editingPost,
                      slug: e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9-]/g, ""),
                    })
                  }
                  className="w-full bg-background border border-border/60 focus:border-azure rounded p-2.5 text-sm text-foreground focus:outline-none"
                  placeholder="e.g. how-to-practice"
                />
              </div>

              {/* Excerpt */}
              <div className="grid gap-1">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Excerpt / Summary
                </label>
                <input
                  type="text"
                  value={editingPost.excerpt || ""}
                  onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                  className="w-full bg-background border border-border/60 focus:border-azure rounded p-2.5 text-sm text-foreground focus:outline-none"
                  placeholder="e.g. A brief overview of practice routines..."
                />
              </div>

              {/* Author & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Author
                  </label>
                  <input
                    type="text"
                    value={editingPost.author || "Faculty Desk"}
                    onChange={(e) => setEditingPost({ ...editingPost, author: e.target.value })}
                    className="w-full bg-background border border-border/60 focus:border-azure rounded p-2.5 text-sm text-foreground focus:outline-none"
                    placeholder="e.g. Faculty Desk"
                  />
                </div>
                <div className="grid gap-1">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Publish Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={editingPost.date || new Date().toISOString().split("T")[0]}
                    onChange={(e) => setEditingPost({ ...editingPost, date: e.target.value })}
                    className="w-full bg-background border border-border/60 focus:border-azure rounded p-2.5 text-sm text-foreground focus:outline-none"
                  />
                </div>
              </div>

              {/* Body Content */}
              <div className="grid gap-1">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Body Content (Double Enter for new paragraph) *
                </label>
                <textarea
                  rows={8}
                  required
                  value={blogBodyInput}
                  onChange={(e) => setBlogBodyInput(e.target.value)}
                  className="w-full bg-background border border-border/60 focus:border-azure rounded p-2.5 text-sm text-foreground focus:outline-none font-sans"
                  placeholder="Write post content here. Separate paragraphs with a blank line (double enter)."
                />
              </div>

              <div className="pt-4 border-t border-border/60 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPostModalOpen(false);
                    setEditingPost(null);
                  }}
                  className="border border-border/80 hover:bg-muted text-foreground/85 font-bold uppercase tracking-wider text-xs px-4 py-2 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-azure hover:bg-azure/90 text-azure-foreground font-bold uppercase tracking-wider text-xs px-4 py-2 rounded-lg transition-all shadow-md"
                >
                  Save Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
