'use client';

export function AuthBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600">
      {/* Animated gradient overlay matching form colors */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/40 via-transparent to-teal-500/40 animate-pulse" />

      {/* Diagonal stripes pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 35px,
            rgba(255, 255, 255, 0.1) 35px,
            rgba(255, 255, 255, 0.1) 70px
          )`
        }}
      />

      {/* Floating orbs matching primary and accent colors */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-400/30 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-400/25 rounded-full blur-3xl animate-float-slow" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  );
}
