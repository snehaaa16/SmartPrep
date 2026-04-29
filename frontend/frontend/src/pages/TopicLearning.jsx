import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import api from "../services/api";

const TopicLearning = () => {
  const { id } = useParams();
  const [topic, setTopic] = useState(null);
  const [activeTab, setActiveTab] = useState("video");
  const [userStats, setUserStats] = useState(null);
  const navigate = useNavigate();

  // --- AI Quiz States ---
  const [preloadedQuiz, setPreloadedQuiz] = useState(null); // Stores the quiz silently
  const [showQuiz, setShowQuiz] = useState(false); // Controls when to reveal it
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizError, setQuizError] = useState(false);

  useEffect(() => {
    const fetchTopicAndPreloadQuiz = async () => {
      try {
        // Fetch user info for greeting
        api.get("/users/me").then(res => setUserStats(res.data)).catch(err => console.error(err));

        // 1. Fetch the topic data (Video & Notes)
        const topicResponse = await api.get(`/topics/${id}`);
        setTopic(topicResponse.data);

        // 2. MAGIC TRICK: Secretly ask Gemini to generate the quiz in the background right now!
        api
          .post(`/ai/generate-quiz/${id}`)
          .then((quizResponse) => {
            const parsedQuiz =
              typeof quizResponse.data === "string"
                ? JSON.parse(quizResponse.data)
                : quizResponse.data;
            setPreloadedQuiz(parsedQuiz); // Save it secretly in memory
            setQuizError(false);
          })
          .catch((err) => {
            console.error("Silent prefetch failed", err);
            setQuizError(true);
          });
      } catch (err) {
        if (err.response?.status === 403 || err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };
    fetchTopicAndPreloadQuiz();
  }, [id, navigate]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // When they click the button, it reveals instantly!
  const handleGenerateClick = () => {
    if (preloadedQuiz) {
      setShowQuiz(true);
      setCurrentQuestionIndex(0);
      setScore(0);
      setQuizCompleted(false);
    } else if (quizError) {
      // RETRY LOGIC: Try fetching again
      setQuizError(false);
      api.post(`/ai/generate-quiz/${id}`)
        .then((quizResponse) => {
          const parsedQuiz = typeof quizResponse.data === "string" ? JSON.parse(quizResponse.data) : quizResponse.data;
          setPreloadedQuiz(parsedQuiz);
          setQuizError(false);
        })
        .catch((err) => {
          console.error("Retry failed", err);
          setQuizError(true);
        });
    } else {
      setLoadingQuiz(true);
      setTimeout(() => {
        setShowQuiz(true);
        setLoadingQuiz(false);
      }, 2000);
    }
  };

  const handleAnswerClick = (selectedOption) => {
    const currentQuestion = preloadedQuiz[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.answer;
    if (isCorrect) {
      setScore(score + 1);
    }
    const finalScore = isCorrect ? score + 1 : score;

    if (currentQuestionIndex < preloadedQuiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizCompleted(true);
      // Mark topic as completed in backend
      const earnedXp = finalScore === preloadedQuiz.length;
      api.post(`/progress/topic/${id}?earnedXp=${earnedXp}`)
         .catch(err => console.error("Failed to save progress", err));
    }
  };

  const handleManualComplete = () => {
    api.post(`/progress/topic/${id}`)
       .then(() => {
         alert("Topic marked as completed! ✅");
       })
       .catch(err => console.error("Failed to save progress", err));
  };

  if (!topic)
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      {/* Top Navbar */}
      <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-cyan-400 w-10 h-10 flex items-center justify-center bg-white/5 rounded-full transition-colors"
          >
            &larr;
          </button>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-white">{topic.title}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={handleManualComplete}
            className="px-4 py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 font-bold transition-all border border-green-500/20"
          >
            Mark as Completed ✅
          </button>
          
          {userStats && (
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center font-bold text-white shadow-lg border-2 border-slate-800">
              {userStats.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-8 px-4">
        {/* Greeting in the middle */}
        {userStats && (
          <div className="text-center mb-8 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {getGreeting()}, <span className="text-cyan-400">{userStats.name}</span> 👋
            </h2>
            <p className="text-slate-400 text-lg">
              Let's dive into <span className="font-bold text-slate-300">{topic.title}</span> today!
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl mb-8 w-fit mx-auto shadow-lg">
          <button
            onClick={() => setActiveTab("video")}
            className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === "video" ? "bg-cyan-500 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
          >
            ▶️ Video
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === "notes" ? "bg-cyan-500 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
          >
            📝 Theory
          </button>
          <button
            onClick={() => setActiveTab("practice")}
            className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === "practice" ? "bg-cyan-500 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
          >
            💻 Practice
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === "quiz" ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" : "text-slate-400 hover:text-white"}`}
          >
            🤖 AI Quiz
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 min-h-[500px]">
          {/* VIDEO TAB */}
          {activeTab === "video" && (
            <div className="flex flex-col items-center">
              {topic.videoUrl ? (
                <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                  <iframe
                    width="100%"
                    height="100%"
                    src={topic.videoUrl.includes("watch?v=") ? topic.videoUrl.replace("watch?v=", "embed/") : topic.videoUrl}
                    title="YouTube Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="p-12 text-center bg-white/5 border border-white/10 rounded-2xl w-full flex flex-col items-center justify-center">
                   <div className="text-5xl mb-4">📺</div>
                   <h3 className="text-xl font-bold mb-2">No direct video available</h3>
                   <p className="text-slate-400 mb-6 max-w-sm">We couldn't find a direct link, but you can find the best tutorials for this topic on YouTube.</p>
                   <a 
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(topic.title + " tutorial")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-2 transition-all transform hover:-translate-y-1 shadow-lg shadow-red-600/20"
                   >
                     <span>▶️</span> Search on YouTube
                   </a>
                </div>
              )}
              <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl w-full">
                <h4 className="text-blue-400 font-bold mb-2">💡 Study Tip</h4>
                <p className="text-slate-300 text-sm italic">"Watch the video first to get a conceptual overview, then dive into the theory notes for details."</p>
              </div>
            </div>
          )}

          {/* NOTES TAB */}
          {activeTab === "notes" && (
            <div className="max-w-none">
              <ReactMarkdown
                components={{
                  h3: ({ node, ...props }) => (
                    <h3
                      className="text-2xl font-bold text-cyan-400 mt-6 mb-4"
                      {...props}
                    />
                  ),
                  p: ({ node, ...props }) => (
                    <p
                      className="text-slate-300 leading-relaxed mb-4"
                      {...props}
                    />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul
                      className="list-disc list-inside text-slate-300 space-y-2 mb-6"
                      {...props}
                    />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="ml-4" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-bold text-white" {...props} />
                  ),
                  a: ({ node, ...props }) => (
                    <a
                      className="text-blue-400 hover:text-blue-300 underline font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    />
                  ),
                  hr: ({ node, ...props }) => (
                    <hr className="border-white/10 my-8" {...props} />
                  ),
                }}
              >
                {topic.theoryContent}
              </ReactMarkdown>
            </div>
          )}

          {/* PRACTICE TAB */}
          {activeTab === "practice" && (
            <div className="animate-fade-in">
              {topic.roadmap?.type === "PREDEFINED" ? (
                <div className="p-12 text-center bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-white/10 rounded-2xl flex flex-col items-center">
                  <div className="text-6xl mb-6">🔒</div>
                  <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 mb-4">
                    Exclusive Custom Feature
                  </h3>
                  <p className="text-slate-400 text-lg max-w-md mb-8 leading-relaxed">
                    Personalized coding practice and advanced problem sets are reserved for 
                    <span className="text-white font-bold"> Custom AI Roadmaps</span>.
                  </p>
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="px-8 py-4 rounded-xl bg-white text-slate-950 font-black hover:scale-105 transition-all shadow-xl shadow-white/5"
                  >
                    Unlock this feature in Custom Roadmap 🚀
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-8 p-6 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl">
                    <h3 className="text-2xl font-bold text-cyan-400 mb-2">💻 Coding Practice</h3>
                    <p className="text-slate-400 text-sm">Solve these problems to master this topic for your target company.</p>
                  </div>

                  <div className="space-y-6">
                    {topic.codingQuestions ? (
                      <div className="prose prose-invert max-w-none">
                        <ReactMarkdown
                          components={{
                            a: ({ node, ...props }) => (
                              <a
                                className="block p-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-cyan-400 font-bold no-underline mb-4"
                                target="_blank"
                                rel="noopener noreferrer"
                                {...props}
                              >
                                🔗 Solve on Platform &rarr;
                              </a>
                            ),
                          }}
                        >
                          {topic.codingQuestions}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="p-20 text-center text-slate-500 italic border border-dashed border-white/10 rounded-2xl">
                        No coding questions found for this specific topic.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* AI QUIZ TAB */}
          {activeTab === "quiz" && (
            <div className="min-h-[400px]">
              {/* Step 1: Start Screen */}
              {!showQuiz && !loadingQuiz && (
                <div className="flex flex-col items-center justify-center h-[400px] text-center animate-fade-in">
                  <div className="w-20 h-20 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-4xl mb-6 shadow-lg shadow-purple-500/20">
                    🤖
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    Ready to test your knowledge?
                  </h2>
                  <p className="text-slate-400 max-w-md mb-8">
                    Antigravity AI has read the theory notes and dynamically
                    generated a custom quiz just for you.
                  </p>

                  <button
                    onClick={handleGenerateClick}
                    disabled={!preloadedQuiz && !quizError}
                    className={`px-8 py-4 rounded-xl font-bold shadow-lg transition-all transform flex items-center gap-2 ${preloadedQuiz ? "bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white hover:-translate-y-1 shadow-purple-500/30" : quizError ? "bg-red-500/20 text-red-400 border border-red-500/50" : "bg-slate-700 text-slate-400 cursor-not-allowed"}`}
                  >
                    {preloadedQuiz
                      ? "✨ Start AI Quiz Instantly"
                      : quizError 
                        ? "🔄 AI is Busy. Try Again?"
                        : "⏳ AI is thinking..."}
                  </button>
                  {quizError && (
                    <p className="mt-4 text-red-400/80 text-sm italic">
                      Google AI servers are under high demand. Please click retry!
                    </p>
                  )}
                </div>
              )}

              {/* Step 2: Loading State (Only if they clicked too fast) */}
              {loadingQuiz && !preloadedQuiz && (
                <div className="flex flex-col items-center justify-center h-[400px] text-center">
                  <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-6"></div>
                  <h3 className="text-xl font-bold text-purple-400 animate-pulse">
                    Just a second, AI is finishing up...
                  </h3>
                </div>
              )}

              {/* Step 3: Quiz Playing */}
              {showQuiz && !quizCompleted && preloadedQuiz && (
                <div className="max-w-2xl mx-auto py-8 animate-fade-in-up">
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-purple-400 font-bold">
                      Question {currentQuestionIndex + 1} of{" "}
                      {preloadedQuiz.length}
                    </span>
                    <span className="text-slate-400">Score: {score}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-8 leading-relaxed">
                    {preloadedQuiz[currentQuestionIndex].question}
                  </h3>
                  <div className="space-y-4">
                    {preloadedQuiz[currentQuestionIndex].options.map(
                      (option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAnswerClick(option)}
                          className="w-full text-left p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-purple-500/10 hover:border-purple-500/50 transition-all font-medium text-lg"
                        >
                          {option}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Quiz Finished */}
              {/* {showQuiz && quizCompleted && (
                <div className="flex flex-col items-center justify-center h-[400px] text-center animate-fade-in">
                  <div className="text-6xl mb-6">🏆</div>
                  <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
                  <p className="text-xl text-slate-300 mb-8">
                    You scored{" "}
                    <span className="text-purple-400 font-bold">{score}</span>{" "}
                    out of {preloadedQuiz.length}
                  </p>
                  <button
                    onClick={() => setShowQuiz(false)}
                    className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                  >
                    Restart Quiz
                  </button>
                </div>
              )} */}

              {/* Step 4: Quiz Finished */}
              {showQuiz && quizCompleted && (
                <div className="flex flex-col items-center justify-center h-[400px] text-center animate-fade-in">
                  <div className="text-6xl mb-6">🏆</div>
                  <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
                  <p className="text-xl text-slate-300 mb-8">
                    You scored{" "}
                    <span className="text-purple-400 font-bold">{score}</span>{" "}
                    out of {preloadedQuiz.length}
                  </p>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowQuiz(false)}
                      className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all font-medium"
                    >
                      Restart Quiz
                    </button>

                    {/* NEW: Go to next topic / Dashboard */}
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold shadow-lg shadow-cyan-500/20 transition-transform transform hover:-translate-y-1"
                    >
                      Return to Roadmap &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicLearning;
