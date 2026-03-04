"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import {
  Cpu,
  LayoutDashboard,
  LogOut,
  FileSearch,
  User,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-slate-200 tracking-tight hidden sm:block">
            ATS Benchmarker
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-2">
          <Link href="/evaluate">
            <Button variant="ghost" size="sm">
              <FileSearch className="w-4 h-4" />
              <span className="hidden sm:inline">Evaluate</span>
            </Button>
          </Link>

          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>

              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:ring-2 hover:ring-violet-500/40 transition-all"
                >
                  {user.email?.charAt(0).toUpperCase() ?? "U"}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-12 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl shadow-slate-950 p-1.5 z-50">
                    <div className="px-3 py-2 border-b border-slate-800 mb-1">
                      <p className="text-xs text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link href="/login">
              <Button variant="secondary" size="sm">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign in</span>
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
