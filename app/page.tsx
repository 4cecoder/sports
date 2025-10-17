import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeSwitcher } from "@/components/theme-switcher";
import {
  Calendar,
  MapPin,
  Trophy,
  Users,
  Filter,
  Zap,
  Shield,
  Search,
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: Calendar,
      title: "Event Management",
      description:
        "Create and manage sports events with detailed information including dates, times, and descriptions",
    },
    {
      icon: MapPin,
      title: "Multiple Venues",
      description:
        "Add multiple venues to each event with complete address and location details",
    },
    {
      icon: Search,
      title: "Smart Search",
      description:
        "Powerful search and filtering by event name, description, or sport type",
    },
    {
      icon: Trophy,
      title: "Sport Categories",
      description:
        "Organize events by sport type for easy management and discovery",
    },
    {
      icon: Filter,
      title: "Advanced Filters",
      description:
        "Filter events by sport type and search criteria with server-side performance",
    },
    {
      icon: Shield,
      title: "Secure Authentication",
      description:
        "Supabase-powered authentication with email and Google OAuth sign-in",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Fastbreak
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Button asChild variant="outline">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild className="gradient-blue-green hover:opacity-90">
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <div className="border-b bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="mx-auto max-w-4xl text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                  Manage Your Sports Events{" "}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    With Ease
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
                  The complete platform for creating, organizing, and managing
                  sports events with multiple venues. Built for teams, leagues,
                  and event organizers.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="gradient-blue-green hover:opacity-90 px-8 py-6 text-lg"
                >
                  <Link href="/auth/sign-up">
                    <Zap className="mr-2 h-5 w-5" />
                    Get Started Free
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 text-lg hover:bg-primary hover:text-primary-foreground hover:border-primary"
                >
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border/50">
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-primary">Fast</div>
                  <div className="text-sm text-muted-foreground">
                    Server Actions
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-accent">Secure</div>
                  <div className="text-sm text-muted-foreground">
                    Auth Protected
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-primary">Modern</div>
                  <div className="text-sm text-muted-foreground">
                    Next.js 15
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold md:text-4xl">
                Everything You Need
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Powerful features to help you manage sports events efficiently
                and effectively
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={index}
                    className="glow-hover border-border/50 hover:border-primary/50 transition-all"
                  >
                    <CardContent className="p-6 space-y-4">
                      <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="border-t">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="mx-auto max-w-3xl text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold md:text-4xl">
                  Ready to Get Started?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Join today and start managing your sports events like a pro.
                  No credit card required.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="gradient-blue-green hover:opacity-90 px-8"
                >
                  <Link href="/auth/sign-up">
                    <Users className="mr-2 h-5 w-5" />
                    Create Free Account
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="font-semibold">Fastbreak Event Dashboard</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Built with Next.js 15, Supabase, and TypeScript
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
