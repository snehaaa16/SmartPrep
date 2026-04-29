import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";

const RoadmapView = () => {
  const { subjectId } = useParams();
  const [topics, setTopics] = useState([]);
  const [completedTopics, setCompletedTopics] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const response = await api.get(`/roadmaps/${subjectId}/predefined`);
        setTopics(response.data);
        
        if (response.data.length > 0) {
          const roadmapId = response.data[0].roadmap.id;
          
          // Fetch completed topics
          const completedResponse = await api.get(`/progress/completed-topics/${roadmapId}`);
          setCompletedTopics(completedResponse.data);
        }
      } catch (err) {
        console.error("Failed to fetch roadmap", err);
      }
    };
    fetchRoadmap();
  }, [subjectId]);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link
            to="/dashboard"
            className="text-slate-400 hover:text-cyan-400 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center transition-colors"
          >
            &larr;
          </Link>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Curated Roadmap
          </h1>
        </div>

        {/* Timeline of Topics */}
        <div className="space-y-6">
          {topics.length === 0 ? (
            <p className="text-slate-400">
              Loading topics... (We need to add some in the database!)
            </p>
          ) : (
            topics.map((topic, index) => (
              <div
                key={topic.id}
                onClick={() => navigate(`/topic/${topic.id}`)}
                className="flex items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-white/10 transition-all cursor-pointer group"
              >
                {/* Number Circle */}
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                  {index + 1}
                </div>

                {/* Topic Info */}
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {topic.title}
                  </h3>
                  <div className="flex gap-4 mt-2 text-xs font-medium text-slate-400">
                    <span className="flex items-center gap-1">
                      ▶️ Video Lesson
                    </span>
                    <span className="flex items-center gap-1">
                      📝 Theory Notes
                    </span>
                    <span className="flex items-center gap-1">🤖 AI Quiz</span>
                  </div>
                </div>

                <div className="ml-auto flex items-center gap-4">
                  {completedTopics.includes(topic.id) && (
                    <div className="text-green-400 font-bold flex items-center gap-1">
                      <span>✅</span> Completed
                    </div>
                  )}
                  <div className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Start &rarr;
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

export default RoadmapView;
