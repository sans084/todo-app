"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { login as apiLogin } from "@/lib/api";

export default function SignInPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.identifier.trim()) e.identifier = "Email or username is required";
    if (!form.password) e.password = "Password is required";
    return e;
  };

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: "" }));
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const data = await apiLogin(form);
      login(data.jwt, data.user);
      router.push("/dashboard");
    } catch (err) {
      setServerError(err?.response?.data?.error?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <span className="font-display font-bold text-3xl">task<span className="text-[#e8462a]">y</span></span>
          <p className="text-[#8a8880] text-sm mt-1">Welcome back</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {serverError && <div className="border border-[#e8462a]/40 bg-[#e8462a]/10 text-[#e8462a] text-sm px-4 py-3">{serverError}</div>}
          <div>
            <label className="block text-xs font-display font-semibold text-[#8a8880] uppercase tracking-widest mb-2">Email or Username</label>
            <input type="text" name="identifier" value={form.identifier} onChange={handleChange}
              placeholder="john@example.com" className={`input-field ${errors.identifier ? "border-[#e8462a]/60" : ""}`} />
            {errors.identifier && <p className="text-[#e8462a] text-xs mt-1">{errors.identifier}</p>}
          </div>
          <div>
            <label className="block text-xs font-display font-semibold text-[#8a8880] uppercase tracking-widest mb-2">Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange}
              placeholder="Your password" className={`input-field ${errors.password ? "border-[#e8462a]/60" : ""}`} />
            {errors.password && <p className="text-[#e8462a] text-xs mt-1">{errors.password}</p>}
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Signing in…" : "Sign in →"}
          </button>
        </form>
        <p className="text-center text-[#8a8880] text-sm mt-8">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#f5f3ee] hover:text-[#e8462a] transition-colors">Sign up</Link>
        </p>
      </div>
    </main>
  );
}
