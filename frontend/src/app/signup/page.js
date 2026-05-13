"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { register } from "@/lib/api";

export default function SignUpPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = "Username is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Min 6 characters";
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
      const data = await register(form);
      login(data.jwt, data.user);
      router.push("/dashboard");
    } catch (err) {
      setServerError(err?.response?.data?.error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <span className="font-display font-bold text-3xl">task<span className="text-[#e8462a]">y</span></span>
          <p className="text-[#8a8880] text-sm mt-1">Create your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {serverError && <div className="border border-[#e8462a]/40 bg-[#e8462a]/10 text-[#e8462a] text-sm px-4 py-3">{serverError}</div>}
          {[
            { name: "username", label: "Username", type: "text", placeholder: "johndoe" },
            { name: "email", label: "Email", type: "email", placeholder: "john@example.com" },
            { name: "password", label: "Password", type: "password", placeholder: "Min 6 characters" },
          ].map(({ name, label, type, placeholder }) => (
            <div key={name}>
              <label className="block text-xs font-display font-semibold text-[#8a8880] uppercase tracking-widest mb-2">{label}</label>
              <input type={type} name={name} value={form[name]} onChange={handleChange} placeholder={placeholder}
                className={`input-field ${errors[name] ? "border-[#e8462a]/60" : ""}`} />
              {errors[name] && <p className="text-[#e8462a] text-xs mt-1">{errors[name]}</p>}
            </div>
          ))}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Creating account…" : "Create account →"}
          </button>
        </form>
        <p className="text-center text-[#8a8880] text-sm mt-8">
          Already have an account?{" "}
          <Link href="/signin" className="text-[#f5f3ee] hover:text-[#e8462a] transition-colors">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
