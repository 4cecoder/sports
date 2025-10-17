"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trophy, Zap, TrendingUp } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/dashboard");
      router.refresh();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* Hero Section */}
      <div className="text-center space-y-3 mb-2 animate-slide-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-2xl shadow-primary/50 mb-4">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-5xl font-display font-bold text-foreground drop-shadow-lg">
          Fastbreak
        </h1>
        <p className="text-lg text-foreground/80 font-medium">
          Welcome back, champion!
        </p>
      </div>

      <Card className="border-border/50 bg-card backdrop-blur-xl shadow-2xl animate-slide-up">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-3xl font-display bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Login
          </CardTitle>
          <CardDescription className="text-base">
            Get back in the game
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-5">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm font-semibold">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="champion@fastbreak.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 border-2 focus-visible:ring-primary focus-visible:border-primary"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-sm font-semibold">
                    Password
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 border-2 focus-visible:ring-primary focus-visible:border-primary"
                />
              </div>
              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    {error}
                  </p>
                </div>
              )}
              <Button
                type="submit"
                className="w-full h-12 gradient-blue-green hover:opacity-90 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Logging in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Login
                  </span>
                )}
              </Button>
            </div>
          </form>

          {/* Features */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Trophy className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-xs font-semibold text-foreground">
                  Track Events
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-accent/10 border border-accent/20">
                <TrendingUp className="w-5 h-5 mx-auto mb-1 text-accent" />
                <p className="text-xs font-semibold text-foreground">
                  Discover Games
                </p>
              </div>
            </div>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Don&apos;t have an account?{" "}
              </span>
              <Link
                href="/auth/sign-up"
                className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hover:opacity-80 transition-all"
              >
                Sign up now
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
