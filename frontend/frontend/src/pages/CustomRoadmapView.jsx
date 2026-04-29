import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";

const CustomRoadmapView = () => {
  const { roadmapId } = useParams();
  const [topics, setTopics] = useState([]);
  const [completedTopics, setCompletedTopics] = useState([]);
  const [subjectName, setSubjectName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const response = await api.get(`/roadmaps/by-roadmap/${roadmapId}`);
        setTopics(response.data);

        if (response.data.length > 0) {
          setSubjectName(response.data[0].roadmap?.subject?.name || "Custom");

          // Fetch completed topics
          const completedResponse = await api.get(
            `/progress/completed-topics/${roadmapId}`
          );
          setCompletedTopics(completedResponse.data);
        }
      } catch (err) {
        console.error("Failed to fetch custom roadmap", err);
      }
    };
    fetchRoadmap();
  }, [roadmapId]);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link
            to="/dashboard"
            className="text-slate-400 hover:text-violet-400 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center transition-colors"
          >
            &larr;
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-500">
              Custom Roadmap
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              AI-generated path for{" "}
              <span className="text-violet-400 font-semibold">
                {subjectName}
              </span>
            </p>
          </div>
        </div>

        {/* Generated Badge */}
        <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium">
          <span>✨</span> This roadmap was personalized based on your
          preferences
        </div>

        {/* Timeline of Topics */}
        <div className="space-y-6">
          {topics.length === 0 ? (
            <div className="p-12 text-center bg-white/5 rounded-2xl border border-white/10">
              <div className="text-5xl mb-4">⏳</div>
              <p className="text-slate-400 text-lg">Loading your custom roadmap...</p>
            </div>
          ) : (
            topics.map((topic, index) => (
              <div
                key={topic.id}
                onClick={() => navigate(`/topic/${topic.id}`)}
                className="flex items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/50 hover:bg-white/10 transition-all cursor-pointer group"
              >
                {/* Number Circle */}
                <div className="w-14 h-14 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-2xl group-hover:scale-110 transition-transform shrink-0 border border-violet-500/20">
                  {index + 1}
                </div>

                {/* Topic Info */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white group-hover:text-violet-400 transition-colors">
                    {topic.title}
                  </h3>
                  <div className="flex flex-wrap gap-3 mt-3">
                    <span className="px-2.5 py-1 rounded-md bg-white/5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border border-white/5 flex items-center gap-1">
                      📝 Theory
                    </span>
                    {topic.videoUrl && (
                      <span className="px-2.5 py-1 rounded-md bg-red-500/10 text-[10px] font-bold uppercase tracking-wider text-red-400 border border-red-500/20 flex items-center gap-1">
                        🎥 Video
                      </span>
                    )}
                    {topic.codingQuestions && (
                      <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 text-[10px] font-bold uppercase tracking-wider text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
                        💻 Practice
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-md bg-violet-500/10 text-[10px] font-bold uppercase tracking-wider text-violet-400 border border-violet-500/20 flex items-center gap-1">
                      🤖 Quiz
                    </span>
                  </div>
                </div>

                <div className="ml-auto flex items-center gap-4">
                  {completedTopics.includes(topic.id) && (
                    <div className="text-green-400 font-bold flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-400/10 border border-green-400/20">
                      <span>✅</span> <span className="text-sm">Done</span>
                    </div>
                  )}
                  <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 shadow-lg shadow-violet-500/20">
                    &rarr;
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomRoadmapView;
