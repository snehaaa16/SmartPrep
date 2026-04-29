import React from "react";

const ProfileView = ({ userStats }) => {
  if (!userStats) return null;

  // Level System Logic: 1 Level for every 100 XP
  const level = Math.floor(userStats.points / 100) + 1;
  const progressPercentage = userStats.points % 100; // 0 to 99%
  const xpToNextLevel = 100 - progressPercentage;

  // Get user's initials for the Avatar
  const getInitials = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      
      {/* Identity Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-3xl p-10 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>

        {/* Avatar */}
        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-5xl font-bold text-white shadow-lg shadow-cyan-500/30 z-10 shrink-0">
          {getInitials(userStats.name)}
        </div>

        {/* Info & Level */}
        <div className="flex-1 text-center md:text-left z-10 w-full">
          <h1 className="text-4xl font-bold text-white mb-2">{userStats.name}</h1>
          <p className="text-slate-400 mb-8">{userStats.email}</p>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-1">Current Level</p>
                <div className="text-3xl font-black text-white">Level {level}</div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Next level in <span className="text-white font-bold">{xpToNextLevel} XP</span></p>
              </div>
            </div>
            
            {/* Level Progress Bar */}
            <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-white/5 relative">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <h2 className="text-2xl font-bold text-white mb-6 px-2">Your Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total XP */}
        <div className="bg-white/5 border border-white/10 hover:border-yellow-500/30 rounded-3xl p-6 transition-all group shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
            🏆
          </div>
          <p className="text-slate-400 text-sm font-bold mb-1">Total XP Earned</p>
          <div className="text-4xl font-black text-white">{userStats.points}</div>
        </div>

        {/* Current Streak */}
        <div className="bg-white/5 border border-white/10 hover:border-orange-500/30 rounded-3xl p-6 transition-all group shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
            🔥
          </div>
          <p className="text-slate-400 text-sm font-bold mb-1">Current Streak</p>
          <div className="text-4xl font-black text-white">{userStats.currentStreak} <span className="text-lg text-slate-500 font-medium">Days</span></div>
        </div>

        {/* Highest Streak */}
        <div className="bg-white/5 border border-white/10 hover:border-purple-500/30 rounded-3xl p-6 transition-all group shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
            👑
          </div>
          <p className="text-slate-400 text-sm font-bold mb-1">Longest Streak</p>
          <div className="text-4xl font-black text-white">{userStats.highestStreak} <span className="text-lg text-slate-500 font-medium">Days</span></div>
        </div>

        {/* Total Topics Completed */}
        <div className="bg-white/5 border border-white/10 hover:border-green-500/30 rounded-3xl p-6 transition-all group shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
            📚
          </div>
          <p className="text-slate-400 text-sm font-bold mb-1">Topics Completed</p>
          <div className="text-4xl font-black text-white">{userStats.totalTopicsCompleted}</div>
        </div>

      </div>
    </div>
  );
};

export default ProfileView;
