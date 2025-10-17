import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeSwitcher } from "@/components/theme-switcher";
import {
  Calendar,
  MapPin,
  Trophy,
  Users,
  Zap,
  Shield,
  Search,
  Sparkles,
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: Calendar,
      title: "Streamlined Scheduling",
      description:
        "Create and manage events with precision—track dates, times, and every detail that matters for seamless execution",
    },
    {
      icon: MapPin,
      title: "Multi-Venue Operations",
      description:
        "Coordinate across multiple locations effortlessly with comprehensive venue management and address tracking",
    },
    {
      icon: Sparkles,
      title: "Official Event Integration",
      description:
        "Import live events from ESPN instantly—NBA, NFL, MLB, NHL games automatically synced to your dashboard",
    },
    {
      icon: Search,
      title: "Intelligent Discovery",
      description:
        "Find exactly what you need with powerful search and filtering—by sport type, name, or custom criteria",
    },
    {
      icon: Trophy,
      title: "Sport-Specific Organization",
      description:
        "Manage any sport with dedicated categorization systems designed for diverse athletic operations",
    },
    {
      icon: Shield,
      title: "Enterprise-Grade Security",
      description:
        "Protected by Supabase authentication with email and OAuth—your data stays secure, always",
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
        <div className="relative border-b overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.pexels.com/photos/1040157/pexels-photo-1040157.jpeg?auto=compress&cs=tinysrgb&w=1920"
              alt="Sports stadium background"
              fill
              className="object-cover opacity-10 dark:opacity-5"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
          </div>

          <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
            <div className="mx-auto max-w-4xl text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight md:text-6xl leading-tight">
                  The{" "}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Complete Platform
                  </span>
                  {" "}for Sports Event Management
                </h1>
                <p className="text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto leading-relaxed">
                  Streamline event operations from scheduling to venue management. Import
                  official events from ESPN or create custom events—all in one powerful dashboard.
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
                  <div className="text-3xl font-bold text-primary">Instant</div>
                  <div className="text-sm text-muted-foreground">
                    Event Creation
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-accent">Live</div>
                  <div className="text-sm text-muted-foreground">
                    ESPN Integration
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-primary">Unlimited</div>
                  <div className="text-sm text-muted-foreground">
                    Venues & Events
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
                Built for Modern Event Operations
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to run professional sports events—from local leagues
                to multi-venue tournaments
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

        {/* Sports Showcase Section */}
        <div className="border-y bg-muted/20">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="mx-auto max-w-6xl">
              <div className="text-center space-y-4 mb-12">
                <h2 className="text-3xl font-bold md:text-4xl">
                  Powering Events Across All Sports
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  From professional leagues to grassroots tournaments—manage basketball,
                  football, baseball, hockey, and beyond
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="relative aspect-square rounded-xl overflow-hidden group">
                  <Image
                    src="https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=500"
                    alt="Basketball"
                    fill
                    className="object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                    <span className="text-white font-bold text-xl">🏀 Basketball</span>
                  </div>
                </div>
                <div className="relative aspect-square rounded-xl overflow-hidden group">
                  <Image
                    src="https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=500"
                    alt="Football"
                    fill
                    className="object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                    <span className="text-white font-bold text-xl">🏈 Football</span>
                  </div>
                </div>
                <div className="relative aspect-square rounded-xl overflow-hidden group">
                  <Image
                    src="https://images.pexels.com/photos/1661950/pexels-photo-1661950.jpeg?auto=compress&cs=tinysrgb&w=500"
                    alt="Baseball"
                    fill
                    className="object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                    <span className="text-white font-bold text-xl">⚾ Baseball</span>
                  </div>
                </div>
                <div className="relative aspect-square rounded-xl overflow-hidden group">
                  <Image
                    src="https://images.pexels.com/photos/20025288/pexels-photo-20025288.jpeg?auto=compress&cs=tinysrgb&w=500"
                    alt="Hockey"
                    fill
                    className="object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                    <span className="text-white font-bold text-xl">🏒 Hockey</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.pexels.com/photos/3628100/pexels-photo-3628100.jpeg?auto=compress&cs=tinysrgb&w=1920"
              alt="Sports action background"
              fill
              className="object-cover opacity-10 dark:opacity-5"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-background" />
          </div>

          <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
            <div className="mx-auto max-w-3xl text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold md:text-4xl">
                  Transform Your Event Operations Today
                </h2>
                <p className="text-lg text-muted-foreground">
                  Join leagues and organizers streamlining their sports events.
                  Start free—no credit card required.
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
