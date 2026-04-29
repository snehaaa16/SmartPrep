import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import DailyReview from "../components/DailyReview";
import ProfileView from "../components/ProfileView";
import Leaderboard from "../components/Leaderboard";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

const Dashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [savedRoadmaps, setSavedRoadmaps] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [activeTab, setActiveTab] = useState("HOME");
  const [userStats, setUserStats] = useState(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customLevel, setCustomLevel] = useState("Placement Prep");
  const [targetCompany, setTargetCompany] = useState("Google");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isQuizLive, setIsQuizLive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for Live Quiz Status via WebSocket
    let stompClient = null;
    try {
      const socket = new SockJS("http://localhost:8080/ws");
      stompClient = Stomp.over(socket);
      stompClient.debug = () => {};

      stompClient.connect(
        {},
        () => {
          stompClient.subscribe("/topic/live-quiz/stream", (message) => {
            const data = JSON.parse(message.body);
            if (data.type === "QUESTION") {
              setIsQuizLive(true);
            } else if (data.type === "FINAL_RESULTS") {
              setIsQuizLive(false);
            }
          });
        },
        (error) => {
          console.log("WebSocket connection failed. Backend might be down.");
        },
      );
    } catch (err) {
      console.error("WebSocket initialization error", err);
    }

    return () => {
      if (stompClient && stompClient.connected) {
        stompClient.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await api.get("/roadmaps/subjects");
        setSubjects(response.data);
      } catch (err) {
        if (err.response?.status === 403 || err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };

    const fetchUserStats = async () => {
      try {
        const response = await api.get("/users/me");
        setUserStats(response.data);
      } catch (err) {
        console.error("Failed to fetch user stats", err);
      }
    };

    fetchSubjects();
    fetchUserStats();
  }, [navigate]);

  useEffect(() => {
    if (activeTab === "SAVED") {
      const fetchSavedRoadmaps = async () => {
        try {
          const response = await api.get("/progress/saved-roadmaps");
          setSavedRoadmaps(response.data);
        } catch (err) {
          console.error("Failed to fetch saved roadmaps", err);
        }
      };
      fetchSavedRoadmaps();
    }
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleSelectPredefined = async () => {
    try {
      // Auto-enroll the user in this curated roadmap so it appears in "Saved Paths" immediately
      await api.post(`/progress/enroll/${selectedSubject.id}`);
    } catch (err) {
      console.log("Already enrolled or error enrolling", err);
    }
    navigate(`/roadmap/predefined/${selectedSubject.id}`);
  };

  const handleSelectCustom = () => {
    setShowCustomForm(true);
  };

  const handleGenerateCustomRoadmap = async () => {
    setIsGenerating(true);
    try {
      const response = await api.post("/ai/generate-roadmap", {
        subjectId: String(selectedSubject.id),
        level: customLevel,
        goal: `Prepare for ${customLevel} at ${targetCompany}`,
        company: targetCompany,
      });
      const roadmapId = response.data.roadmapId;
      setSelectedSubject(null);
      setShowCustomForm(false);
      setCustomLevel("Placement Prep");
      navigate(`/roadmap/custom/${roadmapId}`);
    } catch (err) {
      console.error("Failed to generate custom roadmap", err);
      alert(
        "Failed to generate roadmap. AI may be rate-limited, please try again later.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      {/* SIDEBAR */}
      <div className="w-64 border-r border-white/10 p-6 flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center font-bold text-xl shadow-lg shadow-cyan-500/20">
            A
          </div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            SmartPrep
          </h1>
        </div>

        {/* SIDEBAR LIVE BADGE */}
        {isQuizLive && (
          <div className="mb-6 px-4 py-2 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-between animate-pulse">
            <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
              Live Now
            </span>
            <Link
              to="/live-quiz"
              className="text-[10px] font-bold text-white underline underline-offset-2"
            >
              Join
            </Link>
          </div>
        )}

        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveTab("HOME")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              activeTab === "HOME"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            📚 All Subjects
          </button>
          <button
            onClick={() => setActiveTab("SAVED")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              activeTab === "SAVED"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            ⭐ My Saved Paths
          </button>
          <button
            onClick={() => setActiveTab("DAILY_REVIEW")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              activeTab === "DAILY_REVIEW"
                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            ✨ Daily Review
          </button>
          <button
            onClick={() => setActiveTab("LEADERBOARD")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              activeTab === "LEADERBOARD"
                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            🏆 Leaderboard
          </button>
          <button
            onClick={() => setActiveTab("PROFILE")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              activeTab === "PROFILE"
                ? "bg-slate-700/50 text-white border border-slate-600/50"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            👤 Profile
          </button>
        </nav>

        {userStats && (
          <div className="mb-4 bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-bold text-slate-400 mb-3">
              Your Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 font-medium">
                  🔥 Streak
                </span>
                <span className="text-orange-400 font-bold">
                  {userStats.currentStreak} Days
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 font-medium">
                  🏆 XP
                </span>
                <span className="text-yellow-400 font-bold">
                  {userStats.points}
                </span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="mt-auto px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <span>🚪</span> Logout
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8">
        {/* Dynamic Greeting */}
        {userStats && (
          <div className="mb-8 animate-fade-in-up text-center relative">
            <h1 className="text-4xl font-bold text-white mb-2">
              {getGreeting()}, {userStats.name}
            </h1>
            <p className="text-lg text-slate-300 mb-6">
              Keep the momentum going — you're on a{" "}
              <span className="font-bold text-orange-400">
                {userStats.currentStreak}-day streak!
              </span>
            </p>

            {/* MAIN CONTENT LIVE PILL */}
            {isQuizLive && (
              <div className="flex justify-center animate-bounce-in">
                <button
                  onClick={() => navigate("/live-quiz")}
                  className="group relative flex items-center gap-3 px-8 py-3.5 rounded-full bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 shadow-[0_0_40px_rgba(139,92,246,0.3)] transition-all hover:scale-105 active:scale-95"
                >
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                  <span className="font-black text-sm uppercase tracking-widest text-white">
                    🔥 Daily Challenge is Live — Join Now
                  </span>
                  <span className="text-xl group-hover:translate-x-1 transition-transform">
                    🏆
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "HOME" && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold mb-8 text-white">
              Explore Learning Paths
            </h2>

            {subjects.length === 0 ? (
              <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10">
                <p className="text-slate-400">Loading subjects...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject) => (
                  <div
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject)}
                    className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group hover:scale-[1.02]"
                  >
                    <div className="text-4xl mb-4">
                      {subject.thumbnailUrl || "📚"}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                      {subject.name}
                    </h3>
                    <p className="text-sm text-slate-400 line-clamp-2">
                      {subject.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "SAVED" && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold mb-8 text-white">
              My Saved Paths
            </h2>

            {savedRoadmaps.length === 0 ? (
              <div className="p-12 text-center bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  No saved paths yet!
                </h3>
                <p className="text-slate-400 mb-6 max-w-md">
                  Go back to "All Subjects", select a roadmap, and it will be
                  saved here automatically so you can track your progress.
                </p>
                <button
                  onClick={() => setActiveTab("HOME")}
                  className="px-6 py-3 rounded-xl bg-cyan-500/20 text-cyan-400 font-bold hover:bg-cyan-500/30 transition-all"
                >
                  Explore Subjects
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedRoadmaps.map((item) => (
                  <div
                    key={item.roadmap.id}
                    className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-3xl">
                        {item.roadmap.subject?.thumbnailUrl || "🛣️"}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white">
                          {item.roadmap.subject?.name} Roadmap
                        </h3>
                        <p className="text-sm text-slate-400">
                          {item.roadmap.type}
                        </p>
                      </div>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (
                            window.confirm(
                              "Are you sure you want to remove this saved path?",
                            )
                          ) {
                            try {
                              await api.delete(
                                `/progress/saved-roadmaps/${item.roadmap.id}`,
                              );
                              setSavedRoadmaps(
                                savedRoadmaps.filter(
                                  (r) => r.roadmap.id !== item.roadmap.id,
                                ),
                              );
                            } catch (err) {
                              console.error(
                                "Failed to delete saved roadmap",
                                err,
                              );
                            }
                          }
                        }}
                        className="w-8 h-8 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 flex items-center justify-center transition-colors shadow-sm"
                        title="Remove Path"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-300 font-medium">
                          Progress
                        </span>
                        <span className="text-cyan-400 font-bold">
                          {item.percentage}%
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 text-right">
                        {item.completedTopics} of {item.totalTopics} topics
                        completed
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const type = item.roadmap.type;
                        if (type === "CUSTOM") {
                          navigate(`/roadmap/custom/${item.roadmap.id}`);
                        } else {
                          navigate(
                            `/roadmap/predefined/${item.roadmap.subject.id}`,
                          );
                        }
                      }}
                      className="mt-6 w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-cyan-500/20 hover:text-cyan-400 hover:border-cyan-500/30 transition-all font-medium"
                    >
                      Resume Learning &rarr;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "DAILY_REVIEW" && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold mb-8 text-white">
              Today's Wrap-up
            </h2>
            <DailyReview />
          </div>
        )}

        {activeTab === "PROFILE" && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <ProfileView userStats={userStats} />
          </div>
        )}

        {activeTab === "LEADERBOARD" && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <Leaderboard />
          </div>
        )}
      </div>

      {/* MODAL POPUP (for HOME tab) */}
      {selectedSubject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-white/10 rounded-2xl max-w-md w-full p-8 shadow-2xl relative animate-fade-in-up">
            <button
              onClick={() => {
                setSelectedSubject(null);
                setShowCustomForm(false);
                setCustomGoal("");
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            {!showCustomForm ? (
              <>
                <div className="text-center mb-6">
                  <div className="text-4xl mb-2">
                    {selectedSubject.thumbnailUrl}
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedSubject.name}
                  </h2>
                  <p className="text-slate-400 text-sm mt-2">
                    How would you like to proceed?
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleSelectPredefined}
                    className="w-full p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-left group transition-all"
                  >
                    <h3 className="font-bold text-cyan-400 group-hover:text-cyan-300">
                      Curated Roadmap
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Follow the recommended path structured by experts.
                    </p>
                  </button>

                  <button
                    onClick={handleSelectCustom}
                    className="w-full p-4 rounded-xl border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 text-left group transition-all"
                  >
                    <h3 className="font-bold text-violet-400 group-hover:text-violet-300">
                      🤖 Custom Roadmap
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Tell AI your level & goal — it generates a personalized
                      learning path just for you.
                    </p>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="text-4xl mb-2">🤖</div>
                  <h2 className="text-2xl font-bold text-white">
                    Generate Your Path
                  </h2>
                  <p className="text-slate-400 text-sm mt-2">
                    AI will create a personalized{" "}
                    <span className="text-violet-400 font-semibold">
                      {selectedSubject.name}
                    </span>{" "}
                    roadmap for you.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Target Level / Goal
                    </label>
                    <select
                      value={customLevel}
                      onChange={(e) => setCustomLevel(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-700 border border-white/10 text-white focus:outline-none focus:border-violet-500 transition-colors"
                    >
                      <option value="Internship Focused">
                        🎓 Internship Focused
                      </option>
                      <option value="Placement Prep">
                        💼 Placement Prep (Final Year)
                      </option>
                      <option value="College Level">
                        🏫 College Level / Exams
                      </option>
                      <option value="Experienced (1 Year)">
                        🔥 Experienced (1 Year)
                      </option>
                      <option value="Experienced (2 Years)">
                        🔥 Experienced (2 Years)
                      </option>
                      <option value="Experienced (3+ Years)">
                        🚀 Experienced (3+ Years)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Target Company
                    </label>
                    <select
                      value={targetCompany}
                      onChange={(e) => setTargetCompany(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-700 border border-white/10 text-white focus:outline-none focus:border-violet-500 transition-colors"
                    >
                      {/* Top Tech */}
                      <optgroup label="FAANG / Top Tier">
                        <option value="Google">Google</option>
                        <option value="Microsoft">Microsoft</option>
                        <option value="Amazon">Amazon</option>
                        <option value="Meta (Facebook)">Meta (Facebook)</option>
                        <option value="Apple">Apple</option>
                        <option value="Netflix">Netflix</option>
                      </optgroup>

                      {/* Product Based */}
                      <optgroup label="Top Product Companies">
                        <option value="Uber">Uber</option>
                        <option value="Adobe">Adobe</option>
                        <option value="Salesforce">Salesforce</option>
                        <option value="Atlassian">Atlassian</option>
                        <option value="Zomato">Zomato</option>
                        <option value="Swiggy">Swiggy</option>
                        <option value="Paytm">Paytm</option>
                        <option value="Razorpay">Razorpay</option>
                        <option value="Ola">Ola</option>
                      </optgroup>

                      {/* Service Based */}
                      <optgroup label="Service Based MNCs">
                        <option value="TCS">
                          TCS (Tata Consultancy Services)
                        </option>
                        <option value="Infosys">Infosys</option>
                        <option value="Wipro">Wipro</option>
                        <option value="HCL">HCL Technologies</option>
                        <option value="Cognizant">Cognizant</option>
                        <option value="Accenture">Accenture</option>
                      </optgroup>
                    </select>
                  </div>

                  <button
                    onClick={handleGenerateCustomRoadmap}
                    disabled={isGenerating}
                    className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
                      isGenerating
                        ? "bg-violet-500/30 cursor-wait"
                        : "bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transform hover:-translate-y-0.5"
                    }`}
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center gap-3">
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        AI is generating your roadmap...
                      </span>
                    ) : (
                      "✨ Generate My Roadmap"
                    )}
                  </button>

                  <button
                    onClick={() => setShowCustomForm(false)}
                    className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all font-medium"
                  >
                    ← Back
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
