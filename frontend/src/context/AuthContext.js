"use client";
import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { getMe } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = Cookies.get("jwt");
    if (savedToken) {
      setToken(savedToken);
      getMe(savedToken)
        .then((u) => setUser(u))
        .catch(() => { Cookies.remove("jwt"); setToken(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (jwt, userData) => {
    Cookies.set("jwt", jwt, { expires: 7 });
    setToken(jwt);
    setUser(userData);
  };

  const logout = () => {
    Cookies.remove("jwt");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
