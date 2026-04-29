import React, { useEffect, useState } from "react";
import api from "../services/api";

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get("/users/leaderboard");
        setLeaders(response.data);
      } catch (error) {
        console.error("Failed to fetch leaderboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-white mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            Leaderboard
          </span>
        </h2>
        <p className="text-slate-400">
          See how you rank against other SmartPrep learners!
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-800/50 border-b border-white/5 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div className="col-span-2 text-center">Rank</div>
          <div className="col-span-6">Student Name</div>
          <div className="col-span-2 text-center">Streak</div>
          <div className="col-span-2 text-right">XP Earned</div>
        </div>

        {/* List */}
        <div className="divide-y divide-white/5">
          {leaders.map((user, index) => {
            // Special styling for Top 3
            const isFirst = index === 0;
            const isSecond = index === 1;
            const isThird = index === 2;

            let rankBadge = (
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-300 mx-auto">
                {index + 1}
              </div>
            );

            if (isFirst) {
              rankBadge = (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center font-black text-white mx-auto shadow-[0_0_15px_rgba(253,224,71,0.5)] text-lg">
                  1
                </div>
              );
            } else if (isSecond) {
              rankBadge = (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center font-bold text-white mx-auto shadow-[0_0_10px_rgba(203,213,225,0.4)]">
                  2
                </div>
              );
            } else if (isThird) {
              rankBadge = (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center font-bold text-white mx-auto shadow-[0_0_10px_rgba(217,119,6,0.4)]">
                  3
                </div>
              );
            }

            return (
              <div
                key={index}
                className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-all hover:bg-white/5 ${
                  isFirst ? "bg-yellow-500/5" : ""
                }`}
              >
                <div className="col-span-2">{rankBadge}</div>

                <div className="col-span-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center font-bold text-white shadow-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div
                    className={`font-bold text-lg ${isFirst ? "text-yellow-400" : "text-white"}`}
                  >
                    {user.name}
                  </div>
                </div>

                <div className="col-span-2 flex justify-center items-center gap-1 font-bold text-orange-400">
                  {user.currentStreak > 0 ? (
                    <>🔥 {user.currentStreak}</>
                  ) : (
                    <span className="text-slate-500 font-medium">-</span>
                  )}
                </div>

                <div className="col-span-2 text-right font-black text-cyan-400 text-xl">
                  {user.points}{" "}
                  <span className="text-sm font-medium text-slate-500">XP</span>
                </div>
              </div>
            );
          })}

          {leaders.length === 0 && (
            <div className="p-10 text-center text-slate-400">
              No users found. Be the first to earn XP!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
