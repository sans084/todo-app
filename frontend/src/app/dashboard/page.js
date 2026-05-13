"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getTodos, createTodo, updateTodo, deleteTodo } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, loading: authLoading, logout } = useAuth();
  const [todos, setTodos] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [updatingIds, setUpdatingIds] = useState(new Set());
  const [deletingIds, setDeletingIds] = useState(new Set());

  const fetchTodos = useCallback(async () => {
    if (!token) return;
    setFetchLoading(true);
    setFetchError("");
    try {
      const data = await getTodos(token);
      setTodos(data || []);
    } catch {
      setFetchError("Failed to load your tasks. Please refresh.");
    } finally {
      setFetchLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading && user) fetchTodos();
  }, [authLoading, user, fetchTodos]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    setAddLoading(true);
    try {
      const todo = await createTodo(token, { title });
      setTodos((prev) => [todo, ...prev]);
      setNewTitle("");
    } catch {
    } finally {
      setAddLoading(false);
    }
  };

  const handleToggle = async (id, isCompleted) => {
    setUpdatingIds((p) => new Set([...p, id]));
    setTodos((prev) => prev.map((t) => t.id === id ? { ...t, attributes: { ...t.attributes, isCompleted }, isCompleted } : t));
    try { await updateTodo(token, id, isCompleted); }
    catch { setTodos((prev) => prev.map((t) => t.id === id ? { ...t, attributes: { ...t.attributes, isCompleted: !isCompleted }, isCompleted: !isCompleted } : t)); }
    finally { setUpdatingIds((p) => { const n = new Set(p); n.delete(id); return n; }); }
  };

  const handleDelete = async (id) => {
    setDeletingIds((p) => new Set([...p, id]));
    try { await deleteTodo(token, id); setTodos((prev) => prev.filter((t) => t.id !== id)); }
    finally { setDeletingIds((p) => { const n = new Set(p); n.delete(id); return n; }); }
  };

  const handleLogout = () => { logout(); router.push("/signin"); };

  const getVal = (todo, key) => todo?.attributes?.[key] ?? todo?.[key];

  const filtered = todos.filter((t) => {
    const done = getVal(t, "isCompleted");
    if (filter === "pending") return !done;
    if (filter === "completed") return done;
    return true;
  });

  const total = todos.length;
  const completed = todos.filter((t) => getVal(t, "isCompleted")).length;
  const pending = total - completed;

  if (authLoading) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#2a2a38] border-t-[#e8462a] rounded-full animate-spin" />
    </main>
  );

  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div>
            <span className="font-display font-bold text-2xl">task<span className="text-[#e8462a]">y</span></span>
            <p className="text-[#8a8880] text-xs mt-0.5">Hey, <span className="text-[#f5f3ee]">{user?.username}</span></p>
          </div>
          <button onClick={handleLogout} className="btn-ghost">Sign out</button>
        </header>

        {/* Stats */}
        <div className="flex gap-px mb-8">
          {[{ label: "Total", value: total }, { label: "Pending", value: pending }, { label: "Done", value: completed }].map((s) => (
            <div key={s.label} className="flex-1 bg-[#1a1a24] border border-[#2a2a38] px-4 py-3">
              <p className="font-display text-2xl font-bold">{s.value}</p>
              <p className="text-[#8a8880] text-xs uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Add todo */}
        <form onSubmit={handleAdd} className="flex gap-0 mb-6">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a new task…"
            className="input-field flex-1 border-r-0"
            disabled={addLoading}
          />
          <button type="submit" disabled={addLoading || !newTitle.trim()} className="btn-primary px-5">
            {addLoading ? "…" : "+"}
          </button>
        </form>

        {/* Filters */}
        <div className="flex gap-1 mb-4">
          {["all", "pending", "completed"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs font-display font-semibold uppercase tracking-widest px-3 py-1.5 transition-colors ${filter === f ? "bg-[#e8462a] text-white" : "text-[#8a8880] hover:text-[#f5f3ee]"}`}>
              {f}
            </button>
          ))}
        </div>

        {/* Todo list */}
        <div className="space-y-px">
          {fetchLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-5 h-5 border-2 border-[#2a2a38] border-t-[#e8462a] rounded-full animate-spin" />
            </div>
          ) : fetchError ? (
            <div className="border border-[#e8462a]/30 bg-[#e8462a]/5 text-[#e8462a] text-sm px-5 py-4">{fetchError}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-[#8a8880] text-sm">
                {filter === "all" ? "No tasks yet. Add one above." : filter === "pending" ? "No pending tasks." : "No completed tasks yet."}
              </p>
            </div>
          ) : (
            filtered.map((todo) => {
              const title = getVal(todo, "title");
              const isCompleted = getVal(todo, "isCompleted") ?? false;
              return (
                <div key={todo.id} className={`group flex items-center gap-4 px-5 py-4 border transition-all ${isCompleted ? "border-[#2a2a38]/40 bg-[#1a1a24]/40 opacity-60" : "border-[#2a2a38] bg-[#1a1a24] hover:border-[#f5f3ee]/20"}`}>
                  <button onClick={() => handleToggle(todo.id, !isCompleted)} disabled={updatingIds.has(todo.id)}
                    className={`flex-shrink-0 w-5 h-5 border-2 flex items-center justify-center transition-all ${isCompleted ? "border-[#e8462a] bg-[#e8462a] text-white" : "border-[#2a2a38] hover:border-[#e8462a]/60"}`}>
                    {isCompleted && (
                      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <span className={`flex-1 text-sm ${isCompleted ? "line-through text-[#8a8880]" : "text-[#f5f3ee]"}`}>{title}</span>
                  <span className={`hidden sm:block text-xs px-2 py-0.5 border ${isCompleted ? "text-[#8a8880] border-[#2a2a38]/40" : "text-[#e8462a]/70 border-[#e8462a]/20"}`}>
                    {isCompleted ? "done" : "pending"}
                  </span>
                  <button onClick={() => handleDelete(todo.id)} disabled={deletingIds.has(todo.id)}
                    className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-[#8a8880] hover:text-[#e8462a] transition-colors opacity-0 group-hover:opacity-100">
                    {deletingIds.has(todo.id) ? (
                      <div className="w-3 h-3 border border-[#8a8880] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                        <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9h8l1-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {total > 0 && !fetchLoading && (
          <p className="text-center text-[#8a8880]/50 text-xs mt-8">{completed}/{total} tasks completed</p>
        )}
      </div>
    </main>
  );
}
