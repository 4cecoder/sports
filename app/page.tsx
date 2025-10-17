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
        <div className="relative border-b overflow-hidden min-h-[calc(100vh-4rem)]">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/sports/hero-bg.jpg"
              alt="Sports stadium background"
              fill
              className="object-cover opacity-20 dark:opacity-10"
              priority
            />
            {/* Animated Gradient Overlay */}
            <div className="absolute inset-0 animated-gradient" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
          </div>

          <div className="relative z-10 container mx-auto px-4 py-12 sm:py-16 md:py-20 lg:py-24 flex items-center min-h-[calc(100vh-4rem)]">
            <div className="mx-auto max-w-5xl text-center space-y-6 sm:space-y-8 md:space-y-10 w-full">
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-tight animate-fade-in">
                  The{" "}
                  <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse">
                    Complete Platform
                  </span>
                  <br className="hidden sm:block" />
                  <span className="block sm:inline"> for Sports Event Management</span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
                  Streamline event operations from scheduling to venue management. Import
                  official events from ESPN or create custom events—all in one powerful dashboard.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
                <Button
                  asChild
                  size="lg"
                  className="gradient-blue-green hover:opacity-90 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg w-full sm:w-auto shadow-lg hover:shadow-xl transition-all"
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
                  className="px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg w-full sm:w-auto hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all border-2"
                >
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 sm:gap-6 md:gap-8 pt-6 sm:pt-8 border-t border-border/50 max-w-4xl mx-auto">
                <div className="space-y-1 sm:space-y-2">
                  <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary">Instant</div>
                  <div className="text-xs sm:text-sm md:text-base text-muted-foreground">
                    Event Creation
                  </div>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-accent">Live</div>
                  <div className="text-xs sm:text-sm md:text-base text-muted-foreground">
                    ESPN Integration
                  </div>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary">Unlimited</div>
                  <div className="text-xs sm:text-sm md:text-base text-muted-foreground">
                    Venues & Events
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trusted By Section - Logo Carousel */}
        <div className="border-b bg-muted/10">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-8">
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">
                Trusted by leagues and organizations
              </p>
            </div>
            <div className="relative overflow-hidden">
              <div className="flex gap-12 animate-scroll-left">
                {/* Duplicate the logos for seamless loop */}
                {[...Array(2)].map((_, setIndex) => (
                  <div key={setIndex} className="flex gap-12 items-center justify-around min-w-full">
                    <div className="flex items-center justify-center px-8 py-4 bg-background/50 rounded-lg min-w-[150px]">
                      <Trophy className="h-8 w-8 text-primary" />
                      <span className="ml-2 font-bold text-lg">League Pro</span>
                    </div>
                    <div className="flex items-center justify-center px-8 py-4 bg-background/50 rounded-lg min-w-[150px]">
                      <Users className="h-8 w-8 text-accent" />
                      <span className="ml-2 font-bold text-lg">TeamSync</span>
                    </div>
                    <div className="flex items-center justify-center px-8 py-4 bg-background/50 rounded-lg min-w-[150px]">
                      <Calendar className="h-8 w-8 text-primary" />
                      <span className="ml-2 font-bold text-lg">EventHub</span>
                    </div>
                    <div className="flex items-center justify-center px-8 py-4 bg-background/50 rounded-lg min-w-[150px]">
                      <Sparkles className="h-8 w-8 text-accent" />
                      <span className="ml-2 font-bold text-lg">SportsTech</span>
                    </div>
                    <div className="flex items-center justify-center px-8 py-4 bg-background/50 rounded-lg min-w-[150px]">
                      <Zap className="h-8 w-8 text-primary" />
                      <span className="ml-2 font-bold text-lg">FastPlay</span>
                    </div>
                  </div>
                ))}
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

        {/* Product Cards Section - 50/50 Split Layout */}
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl font-bold md:text-4xl">
                Choose Your Platform
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Purpose-built solutions for every role in sports event management
              </p>
            </div>

            <div className="space-y-12">
              {/* Amateur/League Organizer Card */}
              <Card className="overflow-hidden border-border/50 hover:border-primary/50 transition-all glow-hover">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="p-8 md:p-12 flex flex-col justify-center order-2 md:order-1">
                    <div className="space-y-4">
                      <div className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                        FOR ORGANIZERS
                      </div>
                      <h3 className="text-3xl font-bold">Amateur & League Management</h3>
                      <p className="text-lg text-muted-foreground">
                        Everything you need to run local leagues, tournaments, and community events.
                        Schedule games, manage venues, and keep your league organized.
                      </p>
                      <ul className="space-y-3 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>Automated scheduling and conflict detection</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>Multi-venue coordination and management</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>Team rosters and player tracking</span>
                        </li>
                      </ul>
                      <Button className="gradient-blue-green hover:opacity-90 w-full md:w-auto mt-4">
                        Get Started Free
                      </Button>
                    </div>
                  </div>
                  <div className="relative h-64 md:h-auto image-zoom-subtle order-1 md:order-2">
                    <Image
                      src="/images/sports/basketball.jpg"
                      alt="League management"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-background/80 md:from-background/40 to-transparent" />
                  </div>
                </div>
              </Card>

              {/* Professional/Brand Card */}
              <Card className="overflow-hidden border-border/50 hover:border-accent/50 transition-all glow-hover">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="relative h-64 md:h-auto image-zoom-subtle">
                    <Image
                      src="/images/sports/football.jpg"
                      alt="Professional sports management"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-background/80 md:from-background/40 to-transparent" />
                  </div>
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="space-y-4">
                      <div className="inline-block px-4 py-1 bg-accent/10 text-accent rounded-full text-sm font-semibold">
                        FOR PROFESSIONALS
                      </div>
                      <h3 className="text-3xl font-bold">Professional & Brand Solutions</h3>
                      <p className="text-lg text-muted-foreground">
                        Enterprise-grade tools for professional leagues, teams, and brand activations.
                        Import official events from ESPN and manage at scale.
                      </p>
                      <ul className="space-y-3 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <Sparkles className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                          <span>Live ESPN event integration (NBA, NFL, MLB, NHL)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Trophy className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                          <span>Advanced analytics and reporting</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Shield className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                          <span>Enterprise security and compliance</span>
                        </li>
                      </ul>
                      <Button className="gradient-blue-green hover:opacity-90 w-full md:w-auto mt-4">
                        Contact Sales
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
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
                <div className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer image-scale-hover">
                  <Image
                    src="/images/sports/basketball.jpg"
                    alt="Basketball"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 flex items-end p-4 transition-all group-hover:from-black/95 group-hover:via-black/60">
                    <span className="text-white font-bold text-xl">Basketball</span>
                  </div>
                </div>
                <div className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer image-scale-hover">
                  <Image
                    src="/images/sports/football.jpg"
                    alt="Football"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 flex items-end p-4 transition-all group-hover:from-black/95 group-hover:via-black/60">
                    <span className="text-white font-bold text-xl">Football</span>
                  </div>
                </div>
                <div className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer image-scale-hover">
                  <Image
                    src="/images/sports/baseball.jpg"
                    alt="Baseball"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 flex items-end p-4 transition-all group-hover:from-black/95 group-hover:via-black/60">
                    <span className="text-white font-bold text-xl">Baseball</span>
                  </div>
                </div>
                <div className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer image-scale-hover">
                  <Image
                    src="/images/sports/hockey.jpg"
                    alt="Hockey"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 flex items-end p-4 transition-all group-hover:from-black/95 group-hover:via-black/60">
                    <span className="text-white font-bold text-xl">Hockey</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="border-y bg-muted/10">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="mx-auto max-w-6xl">
              <div className="text-center space-y-4 mb-12">
                <h2 className="text-3xl font-bold md:text-4xl">
                  Loved by Event Organizers
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  See what leagues and organizations are saying about our platform
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <Card className="border-border/50 hover:border-primary/50 transition-all glow-hover">
                  <CardContent className="p-8 space-y-4">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-primary text-xl">★</span>
                      ))}
                    </div>
                    <p className="text-muted-foreground italic">
                      &ldquo;This platform completely transformed how we manage our youth basketball league.
                      Scheduling conflicts are a thing of the past!&rdquo;
                    </p>
                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">Sarah Johnson</p>
                          <p className="text-sm text-muted-foreground">Metro Basketball League</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 hover:border-accent/50 transition-all glow-hover">
                  <CardContent className="p-8 space-y-4">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-accent text-xl">★</span>
                      ))}
                    </div>
                    <p className="text-muted-foreground italic">
                      &ldquo;The ESPN integration is a game-changer. We can sync official games
                      and manage our brand activations all in one place.&rdquo;
                    </p>
                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-accent/10 w-10 h-10 flex items-center justify-center">
                          <Sparkles className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-semibold">Mike Chen</p>
                          <p className="text-sm text-muted-foreground">ProSports Marketing</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 hover:border-primary/50 transition-all glow-hover">
                  <CardContent className="p-8 space-y-4">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-primary text-xl">★</span>
                      ))}
                    </div>
                    <p className="text-muted-foreground italic">
                      &ldquo;Managing tournaments across multiple venues used to be a nightmare.
                      This tool makes it effortless and professional.&rdquo;
                    </p>
                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">Lisa Martinez</p>
                          <p className="text-sm text-muted-foreground">Regional Soccer Association</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/sports/cta-bg.jpg"
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
