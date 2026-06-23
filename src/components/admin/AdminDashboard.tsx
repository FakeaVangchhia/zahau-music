import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  BookOpen,
  Calendar,
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
  Trash
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Course = Database["public"]["Tables"]["courses"]["Row"];
type Lead = Database["public"]["Tables"]["leads"]["Row"];
type Subscriber = Database["public"]["Tables"]["newsletter_subscribers"]["Row"];
type SchoolEvent = Database["public"]["Tables"]["events"]["Row"];

function getYouTubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return url;
}

export function AdminDashboard({ email, signOut }: { email: string; signOut: () => void }) {
  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "leads" | "subscribers" | "events">("overview");
  
  // Data States
  const [courses, setCourses] = useState<Course[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  
  // Loading & Search States
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal / Form States
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);
  
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<SchoolEvent> | null>(null);

  const [leadDetail, setLeadDetail] = useState<Lead | null>(null);

  // Fetch all data on mount
  useEffect(() => {
    fetchData();
  }, []);

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

      // Fetch Events
      const { data: eventsData, error: eventsErr } = await supabase
        .from("events")
        .select("*")
        .order("starts_at", { ascending: true });
      if (eventsErr) throw eventsErr;
      setEvents(eventsData || []);

    } catch (err: any) {
      toast.error(err.message || "Failed to load admin data");
    } finally {
      setLoading(false);
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
        outcomes: editingCourse.outcomes || [],
        display_order: Number(editingCourse.display_order || 0),
      };

      if (editingCourse.id) {
        const { error } = await supabase
          .from("courses")
          .update(payload)
          .eq("id", editingCourse.id);
        if (error) throw error;
        toast.success("Course updated successfully");
      } else {
        const { error } = await supabase
          .from("courses")
          .insert([payload]);
        if (error) throw error;
        toast.success("Course created successfully");
      }

      setCourseModalOpen(false);
      setEditingCourse(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save course");
    }
  }

  async function deleteCourse(id: string) {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;
    try {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
      toast.success("Course deleted successfully");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete course");
    }
  }

  // Event Actions
  async function saveEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!editingEvent?.title || !editingEvent?.starts_at || !editingEvent?.event_type) {
      toast.error("Title, Type, and Date are required");
      return;
    }

    try {
      const payload = {
        title: editingEvent.title,
        event_type: editingEvent.event_type,
        starts_at: new Date(editingEvent.starts_at).toISOString(),
        description: editingEvent.description || "",
        location: editingEvent.location || "",
        image_url: editingEvent.image_url || "",
      };

      if (editingEvent.id) {
        const { error } = await supabase
          .from("events")
          .update(payload)
          .eq("id", editingEvent.id);
        if (error) throw error;
        toast.success("Event updated successfully");
      } else {
        const { error } = await supabase
          .from("events")
          .insert([payload]);
        if (error) throw error;
        toast.success("Event created successfully");
      }

      setEventModalOpen(false);
      setEditingEvent(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save event");
    }
  }

  async function deleteEvent(id: string) {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
      toast.success("Event deleted successfully");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete event");
    }
  }

  // Curriculum State Management helper
  const handleCurriculumChange = (updatedCurriculum: any) => {
    setEditingCourse(prev => prev ? { ...prev, curriculum: updatedCurriculum } : null);
  };

  const handleOutcomesChange = (text: string) => {
    const arr = text.split("\n").map(item => item.trim()).filter(Boolean);
    setEditingCourse(prev => prev ? { ...prev, outcomes: arr } : null);
  };

  return (
    <div className="min-h-screen bg-[#060B18] text-[#E2E8F0] font-sans flex flex-col">
      {/* Top Banner/Header */}
      <header className="border-b border-slate-800 bg-[#0A1124] px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="font-display text-2xl uppercase tracking-wider text-azure">
            Zahau Admin
          </div>
          <span className="bg-azure/10 text-azure border border-azure/20 text-[9px] font-mono uppercase px-2 py-0.5 tracking-wider rounded">
            Console
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-xs text-slate-400 font-mono">Logged in as</p>
            <p className="text-sm text-white font-medium">{email}</p>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 border border-slate-700 bg-slate-800/50 hover:bg-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-300 rounded transition-all"
          >
            <LogOut className="size-3.5" /> Sign out
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Nav */}
        <nav className="w-full md:w-64 border-r border-slate-800 bg-[#0A1124] p-4 flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible">
          {[
            { id: "overview", label: "Overview", icon: <FileText className="size-4" /> },
            { id: "courses", label: "Courses", icon: <BookOpen className="size-4" /> },
            { id: "leads", label: "Leads", icon: <User className="size-4" /> },
            { id: "subscribers", label: "Subscribers", icon: <Mail className="size-4" /> },
            { id: "events", label: "Events", icon: <Calendar className="size-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSearchTerm("");
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all whitespace-nowrap md:w-full ${
                activeTab === tab.id
                  ? "bg-azure text-white shadow-md shadow-azure/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/30"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content Panel */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {loading ? (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-azure border-t-transparent" />
              <p className="text-sm font-mono text-slate-400">Syncing database console...</p>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
              {/* TAB CONTENT: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="font-display text-3xl uppercase text-white">System Metrics</h2>
                    <p className="text-slate-400 text-sm mt-1">Real-time status of school data and submissions.</p>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {[
                      { label: "Active Courses", val: courses.length, color: "from-blue-600/20 to-blue-800/5", icon: <BookOpen className="text-blue-400" /> },
                      { label: "Student Leads", val: leads.length, color: "from-emerald-600/20 to-emerald-800/5", icon: <User className="text-emerald-400" /> },
                      { label: "Newsletter Subscribers", val: subscribers.length, color: "from-purple-600/20 to-purple-800/5", icon: <Mail className="text-purple-400" /> },
                      { label: "Published Events", val: events.length, color: "from-amber-600/20 to-amber-800/5", icon: <Calendar className="text-amber-400" /> },
                    ].map((s, idx) => (
                      <div key={idx} className={`bg-gradient-to-br ${s.color} border border-slate-800/80 p-6 rounded-xl relative overflow-hidden flex flex-col justify-between h-32 hover:scale-[1.02] hover:border-azure/30 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.15)] group`}>
                        <div className="flex justify-between items-start">
                          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 group-hover:text-azure transition-colors">{s.label}</span>
                          {s.icon}
                        </div>
                        <span className="font-display text-4xl text-white group-hover:text-azure transition-colors">{s.val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Recent Activity Mini-Tables */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Recent Leads */}
                    <div className="bg-[#0A1124] border border-slate-800 rounded-xl p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-display text-lg uppercase text-white">Recent Leads</h3>
                        <button onClick={() => setActiveTab("leads")} className="text-xs text-azure hover:underline">View all</button>
                      </div>
                      {leads.length === 0 ? (
                        <p className="text-sm text-slate-500 py-4 font-mono">No incoming inquiries.</p>
                      ) : (
                        <div className="divide-y divide-slate-800">
                          {leads.slice(0, 5).map(lead => (
                            <div key={lead.id} className="py-3 flex justify-between items-center text-xs">
                              <div>
                                <p className="font-semibold text-slate-200">{lead.name}</p>
                                <p className="text-slate-400 font-mono mt-0.5">{lead.course_interest || "General Inquiry"}</p>
                              </div>
                              <span className="text-slate-500 font-mono">
                                {new Date(lead.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Recent Subscribers */}
                    <div className="bg-[#0A1124] border border-slate-800 rounded-xl p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-display text-lg uppercase text-white">Recent Subscriptions</h3>
                        <button onClick={() => setActiveTab("subscribers")} className="text-xs text-azure hover:underline">View all</button>
                      </div>
                      {subscribers.length === 0 ? (
                        <p className="text-sm text-slate-500 py-4 font-mono">No subscribers yet.</p>
                      ) : (
                        <div className="divide-y divide-slate-800">
                          {subscribers.slice(0, 5).map(sub => (
                            <div key={sub.id} className="py-3 flex justify-between items-center text-xs">
                              <span className="font-mono text-slate-200">{sub.email}</span>
                              <span className="text-slate-500 font-mono">
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

              {/* TAB CONTENT: COURSES */}
              {activeTab === "courses" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="font-display text-3xl uppercase text-white">Courses & Curriculum</h2>
                      <p className="text-slate-400 text-sm mt-1">Add video lessons, manage curriculum details, and customize certifications.</p>
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
                          display_order: courses.length + 1
                        });
                        setCourseModalOpen(true);
                      }}
                      className="bg-azure hover:bg-azure/90 text-white font-bold uppercase tracking-wider text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-azure/20"
                    >
                      <Plus className="size-4" /> Add Course
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                      <div key={course.id} className="bg-[#0A1124] border border-slate-800 rounded-xl overflow-hidden shadow-md hover:border-slate-700 transition-all flex flex-col">
                        {course.hero_image ? (
                          <div className="h-40 w-full overflow-hidden bg-slate-900 relative">
                            <img src={course.hero_image} alt={course.name} className="w-full h-full object-cover" />
                            {course.video_url && (
                              <div className="absolute top-3 right-3 bg-red-600/90 text-white p-1.5 rounded-full shadow-md" title="Has Video Embed">
                                <Video className="size-4" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="h-40 w-full bg-slate-950 flex items-center justify-center border-b border-slate-900 relative">
                            <BookOpen className="size-8 text-slate-700" />
                            {course.video_url && (
                              <div className="absolute top-3 right-3 bg-red-600/90 text-white p-1.5 rounded-full shadow-md">
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
                              <span className="text-slate-500 text-xs font-mono">Order: {course.display_order}</span>
                            </div>
                            <h3 className="font-display text-xl uppercase mt-3 text-white leading-tight">{course.name}</h3>
                            <p className="text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed">{course.tagline || course.summary}</p>
                            
                            {course.video_url && (
                              <div className="mt-4 p-2 bg-[#060B18] border border-slate-800 rounded flex items-center gap-2 text-xs text-slate-300 font-mono">
                                <Youtube className="size-4 text-red-500" />
                                <span className="truncate flex-1">{course.video_url}</span>
                                <a href={course.video_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
                                  <ExternalLink className="size-3" />
                                </a>
                              </div>
                            )}
                          </div>

                          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center gap-3">
                            <button
                              onClick={() => {
                                setEditingCourse({
                                  ...course,
                                  curriculum: Array.isArray(course.curriculum) ? course.curriculum : []
                                });
                                setCourseModalOpen(true);
                              }}
                              className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold uppercase tracking-wider text-[10px] py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all"
                            >
                              <Edit className="size-3" /> Edit / Add Video
                            </button>
                            <button
                              onClick={() => deleteCourse(course.id)}
                              className="bg-red-950/30 hover:bg-red-950/80 border border-red-900/40 text-red-400 hover:text-white p-2 rounded-lg transition-all"
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
                  <div>
                    <h2 className="font-display text-3xl uppercase text-white">Student Leads</h2>
                    <p className="text-slate-400 text-sm mt-1">Track admissions trial requests and contact inquiries.</p>
                  </div>

                  {/* Search and Filters */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3.5 size-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search leads by name, email, or course interest..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full bg-[#0A1124] border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-azure transition-all"
                    />
                  </div>

                  {/* Leads Table */}
                  <div className="bg-[#0A1124] border border-slate-800 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs md:text-sm">
                        <thead>
                          <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
                            <th className="p-4 font-semibold">Name</th>
                            <th className="p-4 font-semibold">Email</th>
                            <th className="p-4 font-semibold">Phone</th>
                            <th className="p-4 font-semibold">Course Interest</th>
                            <th className="p-4 font-semibold">Source</th>
                            <th className="p-4 font-semibold">Date</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {leads
                            .filter(lead => 
                              lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (lead.course_interest || "").toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map(lead => (
                              <tr key={lead.id} className="hover:bg-slate-800/10 text-slate-300">
                                <td className="p-4 font-semibold text-white">{lead.name}</td>
                                <td className="p-4 font-mono">{lead.email}</td>
                                <td className="p-4 font-mono">{lead.phone || "—"}</td>
                                <td className="p-4 font-semibold text-azure">{lead.course_interest || "General Inquiry"}</td>
                                <td className="p-4 font-mono text-slate-500">{lead.source || "Website"}</td>
                                <td className="p-4 font-mono text-slate-500">{new Date(lead.created_at).toLocaleDateString()}</td>
                                <td className="p-4 text-right">
                                  <button
                                    onClick={() => setLeadDetail(lead)}
                                    className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold uppercase tracking-wider text-[10px] px-3 py-1.5 rounded transition-all"
                                  >
                                    View Message
                                  </button>
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
                  <div>
                    <h2 className="font-display text-3xl uppercase text-white">Newsletter Subscribers</h2>
                    <p className="text-slate-400 text-sm mt-1">List of readers signed up to receive monthly recitals and workshop alerts.</p>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-3.5 size-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search subscribers by email..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full bg-[#0A1124] border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-azure transition-all"
                    />
                  </div>

                  <div className="bg-[#0A1124] border border-slate-800 rounded-xl overflow-hidden max-w-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs md:text-sm">
                        <thead>
                          <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
                            <th className="p-4 font-semibold">Email Address</th>
                            <th className="p-4 font-semibold">Subscribed Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {subscribers
                            .filter(sub => sub.email.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map(sub => (
                              <tr key={sub.id} className="hover:bg-slate-800/10 text-slate-300">
                                <td className="p-4 font-mono text-white">{sub.email}</td>
                                <td className="p-4 font-mono text-slate-500">{new Date(sub.created_at).toLocaleDateString()}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: EVENTS */}
              {activeTab === "events" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="font-display text-3xl uppercase text-white">Events Console</h2>
                      <p className="text-slate-400 text-sm mt-1">Create, update, and manage upcoming school recitals, workshops, and concerts.</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingEvent({
                          title: "",
                          event_type: "Recital",
                          starts_at: new Date().toISOString().substring(0, 16),
                          description: "",
                          location: "",
                          image_url: ""
                        });
                        setEventModalOpen(true);
                      }}
                      className="bg-azure hover:bg-azure/90 text-white font-bold uppercase tracking-wider text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-azure/20"
                    >
                      <Plus className="size-4" /> Create Event
                    </button>
                  </div>

                  <div className="bg-[#0A1124] border border-slate-800 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs md:text-sm">
                        <thead>
                          <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
                            <th className="p-4 font-semibold">Title</th>
                            <th className="p-4 font-semibold">Type</th>
                            <th className="p-4 font-semibold">Starts At</th>
                            <th className="p-4 font-semibold">Location</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {events.map(event => (
                            <tr key={event.id} className="hover:bg-slate-800/10 text-slate-300">
                              <td className="p-4 font-semibold text-white">{event.title}</td>
                              <td className="p-4">
                                <span className="bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono uppercase">
                                  {event.event_type}
                                </span>
                              </td>
                              <td className="p-4 font-mono text-slate-400">
                                {new Date(event.starts_at).toLocaleString()}
                              </td>
                              <td className="p-4 text-slate-400 flex items-center gap-1.5 mt-1.5">
                                <MapPin className="size-3.5 text-slate-500" />
                                {event.location || "Online"}
                              </td>
                              <td className="p-4 text-right">
                                <div className="inline-flex gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingEvent({
                                        ...event,
                                        starts_at: new Date(event.starts_at).toISOString().substring(0, 16)
                                      });
                                      setEventModalOpen(true);
                                    }}
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-all"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => deleteEvent(event.id)}
                                    className="bg-red-950/20 hover:bg-red-950 border border-red-900/30 text-red-400 hover:text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-all"
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
          )}
        </main>
      </div>

      {/* COURSE FORM DIALOG MODAL */}
      {courseModalOpen && editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0A1124] border border-slate-800 rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="bg-slate-900/80 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-display text-lg uppercase text-white">
                {editingCourse.id ? "Edit Course Detail" : "Create New Course"}
              </h3>
              <button
                onClick={() => {
                  setCourseModalOpen(false);
                  setEditingCourse(null);
                }}
                className="text-slate-400 hover:text-white font-mono text-lg"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={saveCourse} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Course Name */}
                <div className="grid gap-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Course Name *</label>
                  <input
                    type="text"
                    required
                    value={editingCourse.name || ""}
                    onChange={e => setEditingCourse({ ...editingCourse, name: e.target.value })}
                    className="w-full bg-[#060B18] border border-slate-800 focus:border-azure rounded p-3 text-sm text-white focus:outline-none"
                    placeholder="e.g. Intermediate Concert Piano"
                  />
                </div>

                {/* Slug */}
                <div className="grid gap-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={editingCourse.slug || ""}
                    onChange={e => setEditingCourse({ ...editingCourse, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                    className="w-full bg-[#060B18] border border-slate-800 focus:border-azure rounded p-3 text-sm text-white focus:outline-none"
                    placeholder="e.g. concert-piano"
                  />
                </div>

                {/* Tagline */}
                <div className="grid gap-2 md:col-span-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Tagline / Short description</label>
                  <input
                    type="text"
                    value={editingCourse.tagline || ""}
                    onChange={e => setEditingCourse({ ...editingCourse, tagline: e.target.value })}
                    className="w-full bg-[#060B18] border border-slate-800 focus:border-azure rounded p-3 text-sm text-white focus:outline-none"
                    placeholder="e.g. Master the masterworks: A comprehensive study from Bach to Debussy."
                  />
                </div>

                {/* Summary */}
                <div className="grid gap-2 md:col-span-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Overview / Full Summary</label>
                  <textarea
                    rows={4}
                    value={editingCourse.summary || ""}
                    onChange={e => setEditingCourse({ ...editingCourse, summary: e.target.value })}
                    className="w-full bg-[#060B18] border border-slate-800 focus:border-azure rounded p-3 text-sm text-white focus:outline-none"
                    placeholder="Describe the full course, syllabus structure, and goals..."
                  />
                </div>

                {/* Duration */}
                <div className="grid gap-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Duration</label>
                  <input
                    type="text"
                    value={editingCourse.duration || ""}
                    onChange={e => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                    className="w-full bg-[#060B18] border border-slate-800 focus:border-azure rounded p-3 text-sm text-white focus:outline-none"
                    placeholder="e.g. 12 Weeks (24 Sessions)"
                  />
                </div>

                {/* Certification */}
                <div className="grid gap-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Certification</label>
                  <input
                    type="text"
                    value={editingCourse.certification || ""}
                    onChange={e => setEditingCourse({ ...editingCourse, certification: e.target.value })}
                    className="w-full bg-[#060B18] border border-slate-800 focus:border-azure rounded p-3 text-sm text-white focus:outline-none"
                    placeholder="e.g. ABRSM Grade 4 Preparation"
                  />
                </div>

                {/* Hero Image */}
                <div className="grid gap-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Hero Image URL</label>
                  <input
                    type="text"
                    value={editingCourse.hero_image || ""}
                    onChange={e => setEditingCourse({ ...editingCourse, hero_image: e.target.value })}
                    className="w-full bg-[#060B18] border border-slate-800 focus:border-azure rounded p-3 text-sm text-white focus:outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Main Video URL (YouTube, Vimeo, etc.) */}
                <div className="grid gap-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400 text-azure flex items-center gap-1.5">
                    <Video className="size-3.5" />
                    Video Link (YouTube/Vimeo Embed)
                  </label>
                  <input
                    type="text"
                    value={editingCourse.video_url || ""}
                    onChange={e => setEditingCourse({ ...editingCourse, video_url: e.target.value })}
                    className="w-full bg-[#060B18] border border-slate-800 focus:border-azure rounded p-3 text-sm text-white focus:outline-none"
                    placeholder="e.g. https://www.youtube.com/watch?v=..."
                  />
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Supports regular YouTube links or direct embed URLs.</p>
                </div>

                {/* Display Order */}
                <div className="grid gap-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Display Order</label>
                  <input
                    type="number"
                    value={editingCourse.display_order || 0}
                    onChange={e => setEditingCourse({ ...editingCourse, display_order: Number(e.target.value) })}
                    className="w-full bg-[#060B18] border border-slate-800 focus:border-azure rounded p-3 text-sm text-white focus:outline-none"
                  />
                </div>

                {/* Levels */}
                <div className="grid gap-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Levels (comma separated)</label>
                  <input
                    type="text"
                    value={(editingCourse.levels || []).join(", ")}
                    onChange={e => setEditingCourse({ ...editingCourse, levels: e.target.value.split(",").map(i => i.trim()).filter(Boolean) })}
                    className="w-full bg-[#060B18] border border-slate-800 focus:border-azure rounded p-3 text-sm text-white focus:outline-none"
                    placeholder="e.g. Beginner, Intermediate, Advanced"
                  />
                </div>

                {/* Outcomes */}
                <div className="grid gap-2 md:col-span-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Outcomes / Student Achievements (One per line)</label>
                  <textarea
                    rows={3}
                    defaultValue={(editingCourse.outcomes || []).join("\n")}
                    onChange={e => handleOutcomesChange(e.target.value)}
                    className="w-full bg-[#060B18] border border-slate-800 focus:border-azure rounded p-3 text-sm text-white focus:outline-none"
                    placeholder="Understand sheet music theory&#10;Play complex scales smoothly&#10;Prepare for ABRSM Performance assessments"
                  />
                </div>

                {/* Curriculum JSONB List Builder */}
                <div className="grid gap-4 md:col-span-2 border-t border-slate-800 pt-6">
                  <div className="flex justify-between items-center">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Curriculum Syllabus Terms/Chapters</label>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = [...(editingCourse.curriculum as any[] || [])];
                        cur.push({ term: `Term ${cur.length + 1}: Title`, topics: [] });
                        handleCurriculumChange(cur);
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold uppercase tracking-wider text-[10px] px-3 py-1.5 rounded flex items-center gap-1 border border-slate-700"
                    >
                      <Plus className="size-3" /> Add Chapter / Term
                    </button>
                  </div>
                  
                  {((editingCourse.curriculum as any[]) || []).length === 0 ? (
                    <p className="text-xs text-slate-500 font-mono py-2 italic text-center bg-slate-950/40 rounded border border-dashed border-slate-800">
                      No chapters defined. Click the button above to start building the syllabus.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {((editingCourse.curriculum as any[]) || []).map((term, tIdx) => (
                        <div key={tIdx} className="bg-[#060B18] border border-slate-800 p-4 rounded-xl space-y-3 relative">
                          <button
                            type="button"
                            onClick={() => {
                              const cur = [...(editingCourse.curriculum as any[] || [])];
                              cur.splice(tIdx, 1);
                              handleCurriculumChange(cur);
                            }}
                            className="absolute top-3 right-3 text-slate-500 hover:text-red-400"
                            title="Delete Chapter"
                          >
                            <Trash className="size-4" />
                          </button>
                          
                          <div className="grid gap-1">
                            <span className="font-mono text-[9px] text-slate-500">Chapter Title</span>
                            <input
                              type="text"
                              value={term.term}
                              onChange={e => {
                                const cur = [...(editingCourse.curriculum as any[] || [])];
                                cur[tIdx].term = e.target.value;
                                handleCurriculumChange(cur);
                              }}
                              className="bg-[#0A1124] border border-slate-850 focus:border-azure rounded px-3 py-1.5 text-xs text-white focus:outline-none w-[80%]"
                              placeholder="e.g. Term 1: Foundations"
                            />
                          </div>

                          <div className="space-y-2">
                            <span className="font-mono text-[9px] text-slate-500 block">Topics / Lessons</span>
                            {term.topics.map((topic: string, topIdx: number) => (
                              <div key={topIdx} className="flex gap-2 items-center">
                                <input
                                  type="text"
                                  value={topic}
                                  onChange={e => {
                                    const cur = [...(editingCourse.curriculum as any[] || [])];
                                    cur[tIdx].topics[topIdx] = e.target.value;
                                    handleCurriculumChange(cur);
                                  }}
                                  className="flex-1 bg-[#0A1124] border border-slate-850 focus:border-azure rounded px-3 py-1 text-xs text-white focus:outline-none"
                                  placeholder="e.g. Introduction to Major Keys"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const cur = [...(editingCourse.curriculum as any[] || [])];
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
                                const cur = [...(editingCourse.curriculum as any[] || [])];
                                cur[tIdx].topics.push("");
                                handleCurriculumChange(cur);
                              }}
                              className="text-azure hover:text-azure/85 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 pt-1.5"
                            >
                              <Plus className="size-3" /> Add Lesson
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCourseModalOpen(false);
                    setEditingCourse(null);
                  }}
                  className="border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold uppercase tracking-wider text-xs px-5 py-2.5 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-azure hover:bg-azure/90 text-white font-bold uppercase tracking-wider text-xs px-5 py-2.5 rounded-lg transition-all shadow-md shadow-azure/20"
                >
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EVENT FORM DIALOG MODAL */}
      {eventModalOpen && editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0A1124] border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden my-8 flex flex-col">
            <div className="bg-slate-900/80 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-display text-lg uppercase text-white">
                {editingEvent.id ? "Edit Event Detail" : "Create New Event"}
              </h3>
              <button
                onClick={() => {
                  setEventModalOpen(false);
                  setEditingEvent(null);
                }}
                className="text-slate-400 hover:text-white font-mono text-lg"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={saveEvent} className="p-6 space-y-4">
              {/* Title */}
              <div className="grid gap-1">
                <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Event Title *</label>
                <input
                  type="text"
                  required
                  value={editingEvent.title || ""}
                  onChange={e => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className="w-full bg-[#060B18] border border-slate-800 focus:border-azure rounded p-2.5 text-sm text-white focus:outline-none"
                  placeholder="e.g. Annual Spring recital 2026"
                />
              </div>

              {/* Event Type */}
              <div className="grid gap-1">
                <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Event Type *</label>
                <select
                  value={editingEvent.event_type || "Recital"}
                  onChange={e => setEditingEvent({ ...editingEvent, event_type: e.target.value })}
                  className="w-full bg-[#060B18] border border-slate-800 focus:border-azure rounded p-2.5 text-sm text-white focus:outline-none"
                >
                  <option value="Recital">Recital</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Masterclass">Masterclass</option>
                  <option value="Concert">Concert</option>
                </select>
              </div>

              {/* Starts At */}
              <div className="grid gap-1">
                <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={editingEvent.starts_at || ""}
                  onChange={e => setEditingEvent({ ...editingEvent, starts_at: e.target.value })}
                  className="w-full bg-[#060B18] border border-slate-800 focus:border-azure rounded p-2.5 text-sm text-white focus:outline-none"
                />
              </div>

              {/* Location */}
              <div className="grid gap-1">
                <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Location</label>
                <input
                  type="text"
                  value={editingEvent.location || ""}
                  onChange={e => setEditingEvent({ ...editingEvent, location: e.target.value })}
                  className="w-full bg-[#060B18] border border-slate-800 focus:border-azure rounded p-2.5 text-sm text-white focus:outline-none"
                  placeholder="e.g. Kamani Auditorium / Zoom Link"
                />
              </div>

              {/* Description */}
              <div className="grid gap-1">
                <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Description</label>
                <textarea
                  rows={3}
                  value={editingEvent.description || ""}
                  onChange={e => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="w-full bg-[#060B18] border border-slate-800 focus:border-azure rounded p-2.5 text-sm text-white focus:outline-none"
                  placeholder="Describe the event contents..."
                />
              </div>

              {/* Image URL */}
              <div className="grid gap-1">
                <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Image URL</label>
                <input
                  type="text"
                  value={editingEvent.image_url || ""}
                  onChange={e => setEditingEvent({ ...editingEvent, image_url: e.target.value })}
                  className="w-full bg-[#060B18] border border-slate-800 focus:border-azure rounded p-2.5 text-sm text-white focus:outline-none"
                  placeholder="https://example.com/event.jpg"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEventModalOpen(false);
                    setEditingEvent(null);
                  }}
                  className="border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold uppercase tracking-wider text-xs px-4 py-2 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-azure hover:bg-azure/90 text-white font-bold uppercase tracking-wider text-xs px-4 py-2 rounded-lg transition-all shadow-md"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LEAD DETAIL DIALOG MODAL */}
      {leadDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0A1124] border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-slate-900/80 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-display text-lg uppercase text-white">Lead Message Detail</h3>
              <button onClick={() => setLeadDetail(null)} className="text-slate-400 hover:text-white font-mono text-lg">✕</button>
            </div>
            <div className="p-6 space-y-4 text-sm leading-relaxed">
              <div className="grid grid-cols-2 gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="font-mono text-[9px] text-slate-500 uppercase block">Name</span>
                  <span className="font-semibold text-white">{leadDetail.name}</span>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-slate-500 uppercase block">Course Interest</span>
                  <span className="font-semibold text-azure">{leadDetail.course_interest || "General Inquiry"}</span>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-slate-500 uppercase block">Email</span>
                  <span className="text-slate-300 font-mono">{leadDetail.email}</span>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-slate-500 uppercase block">Phone</span>
                  <span className="text-slate-300 font-mono">{leadDetail.phone || "—"}</span>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-slate-500 uppercase block">Submitted Date</span>
                  <span className="text-slate-400 font-mono">{new Date(leadDetail.created_at).toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-slate-500 uppercase block">Source</span>
                  <span className="text-slate-400 font-mono">{leadDetail.source || "Website"}</span>
                </div>
              </div>
              <div>
                <span className="font-mono text-[9px] text-slate-500 uppercase block mb-1">Message Content</span>
                <div className="bg-[#060B18] border border-slate-850 p-4 rounded-lg text-slate-300 font-sans whitespace-pre-wrap">
                  {leadDetail.message || <span className="italic text-slate-500">No message provided.</span>}
                </div>
              </div>
            </div>
            <div className="bg-slate-900/60 px-6 py-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setLeadDetail(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold uppercase tracking-wider text-xs px-5 py-2.5 rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
