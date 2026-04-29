import React from "react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-cyan-500 selection:text-white overflow-x-hidden">
      {/* ===== SEO Meta (handled by index.html, but semantic structure here) ===== */}

      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/70 border-b border-white/5">
        <div className="flex items-center justify-between px-6 md:px-12 py-4 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center font-black text-lg shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow">
              S
            </div>
            <span className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
              SmartPrep
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="hidden sm:inline-flex text-sm font-medium text-slate-300 hover:text-white transition-colors px-4 py-2"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-sm font-bold shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all transform hover:-translate-y-0.5"
            >
              Get Started — It's Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <header className="relative max-w-7xl mx-auto px-6 md:px-12 pt-36 pb-28 text-center">
        {/* Background glow effects */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-r from-violet-600/20 to-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 text-violet-300 text-xs font-semibold mb-8 border border-violet-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            AI-Powered Learning Platform
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-[1.1]">
            Master Tech Skills <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400">
              The Smart Way.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 mb-12 leading-relaxed">
            Your all-in-one learning companion for placement preparation.
            Structured roadmaps, AI-generated quizzes, video lessons, and
            gamified progress tracking — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-lg shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all transform hover:-translate-y-1"
            >
              Start Learning for Free →
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-lg transition-all"
            >
              Explore Features
            </a>
          </div>

          {/* Trust badges */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> 100% Free to Use
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> 10+ Technical Subjects
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> AI-Powered Assessments
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> No Credit Card
              Required
            </div>
          </div>
        </div>
      </header>

      {/* ===== FEATURE HIGHLIGHTS SECTION ===== */}
      <section id="features" className="relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-28">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Everything You Need to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                Ace Your Placements
              </span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              SmartPrep combines the best learning tools into a single platform
              designed for engineering students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="group p-8 rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] hover:border-violet-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/15 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                🗺️
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                Curated Learning Roadmaps
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Follow expert-structured roadmaps for DSA, Java, DBMS, React,
                SQL, Spring Boot, System Design, and more. Never miss a critical
                concept again.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                🤖
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                AI-Generated Quizzes
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Powered by Google Gemini, each topic generates dynamic
                multiple-choice quizzes tailored to the theory content you just
                studied. Instant feedback, every time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                🎬
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                Video Lessons
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Every topic comes with a handpicked YouTube video lesson from
                top educators, embedded right inside the platform so you can
                learn without distractions.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] hover:border-orange-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/15 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                🔥
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                Streaks & XP System
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Build daily learning streaks and earn 10 XP for every perfect
                quiz score. Stay consistent, stay motivated, and watch your
                progress compound over time.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-8 rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] hover:border-yellow-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-yellow-500/15 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                🏆
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                Global Leaderboard
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Compete with fellow learners across the platform. Climb the
                global leaderboard by earning XP and see how you rank against
                the community.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-8 rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] hover:border-pink-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-pink-500/15 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                📝
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                Daily Review & Flashcards
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                At the end of each day, get an AI-generated summary of
                everything you studied along with interactive flashcards to
                reinforce your learning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== LIVE QUIZ CALLOUT ===== */}
      <section className="relative overflow-hidden border-t border-white/5 bg-slate-900/30">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 text-pink-400 text-xs font-black mb-6 border border-pink-500/20 uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                </span>
                Every Night at 8:00 PM
              </div>
              <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                The Daily <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-violet-400 to-cyan-400">
                  AI Live Challenge
                </span>
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-xl">
                Don't just learn alone. Join the community every night at 8:00
                PM for a high-stakes, AI-generated live quiz. Compete in
                real-time, climb the live leaderboard, and earn exclusive bonus
                XP to boost your global ranking.
              </p>
              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-white">100%</span>
                  <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                    AI Questions
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-cyan-400">
                    Live
                  </span>
                  <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                    Leaderboard
                  </span>
                </div>
              </div>
              <Link
                to="/signup"
                className="inline-flex px-8 py-4 rounded-2xl bg-white text-slate-950 font-black hover:scale-105 transition-all shadow-xl shadow-white/5"
              >
                Ready for tonight? Join Now
              </Link>
            </div>
            <div className="flex-1 relative">
              {/* Mockup of the Quiz Room */}
              <div className="relative z-10 bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex justify-between items-center mb-8">
                  <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center">
                    👤
                  </div>
                  <div className="text-pink-500 font-black animate-pulse">
                    ⏱️ 12s
                  </div>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full mb-8 overflow-hidden">
                  <div className="h-full w-2/3 bg-gradient-to-r from-violet-500 to-pink-500" />
                </div>
                <h4 className="text-xl font-bold mb-6">
                  What is the time complexity of a binary search?
                </h4>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-white/5 bg-white/5 text-slate-400 text-sm font-medium">
                    O(n)
                  </div>
                  <div className="p-4 rounded-xl border border-cyan-500/50 bg-cyan-500/10 text-cyan-400 text-sm font-bold">
                    O(log n)
                  </div>
                  <div className="p-4 rounded-xl border border-white/5 bg-white/5 text-slate-400 text-sm font-medium">
                    O(n²)
                  </div>
                </div>
              </div>
              {/* Background decorative elements */}
              <div className="absolute -bottom-6 -right-6 w-full h-full bg-violet-600/20 rounded-[2.5rem] -z-10" />
              <div className="absolute -top-10 -left-10 text-8xl opacity-20 rotate-[-15deg] select-none">
                🏆
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS SECTION ===== */}
      <section className="border-t border-white/5 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-28">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              How It{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                Works
              </span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Get started in under 30 seconds. No setup, no hassle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 rounded-3xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center text-4xl font-extrabold text-violet-400 mx-auto mb-6 group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Create Your Account</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                Sign up for free with your name, email and password. No credit
                card or verification needed.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 rounded-3xl bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center text-4xl font-extrabold text-cyan-400 mx-auto mb-6 group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Pick a Subject</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                Choose from 10+ subjects like Java, DBMS, React, Spring Boot,
                System Design, Machine Learning, and more.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-4xl font-extrabold text-emerald-400 mx-auto mb-6 group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Learn, Quiz & Grow</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                Watch videos, read theory, take AI quizzes, earn XP, and track
                your progress — all in one seamless flow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SUBJECTS SHOWCASE ===== */}
      <section className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-28">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
                10+ Subjects
              </span>{" "}
              Ready to Explore
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Each subject includes a structured roadmap with video lessons,
              detailed theory, and AI-powered assessments.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              { name: "Data Structures & Algorithms", emoji: "🧠" },
              { name: "Java Programming", emoji: "☕" },
              { name: "Database Management System", emoji: "🗄️" },
              { name: "React", emoji: "⚛️" },
              { name: "SQL", emoji: "📊" },
              { name: "Spring Boot", emoji: "🚀" },
              { name: "Spring Core", emoji: "🌱" },
              { name: "System Design", emoji: "🏗️" },
              { name: "Machine Learning", emoji: "🤖" },
              { name: "Computer Networks", emoji: "🌐" },
              { name: "Software Engineering", emoji: "📝" },
            ].map((subject) => (
              <div
                key={subject.name}
                className="px-5 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-violet-500/30 hover:bg-violet-500/5 transition-all cursor-default flex items-center gap-2.5"
              >
                <span className="text-xl">{subject.emoji}</span>
                <span className="text-sm font-semibold text-slate-300">
                  {subject.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-28">
          <div className="relative rounded-3xl bg-gradient-to-br from-violet-600/20 via-cyan-500/10 to-emerald-500/10 border border-white/10 p-12 md:p-20 text-center overflow-hidden">
            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-violet-500/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
                Ready to Start Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                  Preparation Journey?
                </span>
              </h2>
              <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10">
                Join thousands of students who are learning smarter, not harder.
                Create your free account and begin today.
              </p>
              <Link
                to="/signup"
                className="inline-flex px-10 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-lg shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all transform hover:-translate-y-1"
              >
                Create Free Account →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/5 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center font-bold text-sm">
                S
              </div>
              <span className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                SmartPrep
              </span>
            </div>
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} SmartPrep. Built with ❤️ for students
              preparing for campus placements.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link to="/login" className="hover:text-white transition-colors">
                Log In
              </Link>
              <Link to="/signup" className="hover:text-white transition-colors">
                Sign Up
              </Link>
              <a
                href="#features"
                className="hover:text-white transition-colors"
              >
                Features
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
