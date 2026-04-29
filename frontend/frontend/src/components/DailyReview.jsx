import React, { useState, useEffect } from "react";
import api from "../services/api";

const DailyReview = () => {
  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const fetchDailyReview = async () => {
      try {
        const response = await api.get("/progress/daily-review");
        
        let parsedFlashcards = [];
        if (response.data.flashcardsJson) {
          try {
             parsedFlashcards = JSON.parse(response.data.flashcardsJson);
          } catch (e) {
             console.error("Failed to parse flashcards JSON", e);
             parsedFlashcards = [{front: "Error generating flashcards", back: "Try again later"}];
          }
        }
        
        setReviewData({
          ...response.data,
          flashcards: parsedFlashcards
        });
      } catch (err) {
        console.error("Failed to fetch daily review", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDailyReview();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 animate-fade-in">
        <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-6"></div>
        <h3 className="text-xl font-bold text-cyan-400 animate-pulse">
          AI is analyzing your progress today...
        </h3>
        <p className="text-slate-400 mt-2">Generating personalized summary and flashcards.</p>
      </div>
    );
  }

  if (!reviewData || reviewData.topicsCompletedToday === 0) {
    return (
      <div className="p-12 text-center bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center animate-fade-in">
        <div className="text-6xl mb-4">🌱</div>
        <h3 className="text-2xl font-bold text-white mb-2">No progress recorded today</h3>
        <p className="text-slate-400 mb-6 max-w-md">
          You haven't completed any topics today. Start learning to unlock your personalized AI daily review and flashcards!
        </p>
      </div>
    );
  }

  const flashcards = reviewData.flashcards || [];
  const currentCard = flashcards[currentCardIndex];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-10">
      
      {/* Summary Section */}
      <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-purple-500/30 rounded-3xl p-8 relative overflow-hidden shadow-2xl shadow-purple-500/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="text-4xl">✨</div>
            <div>
              <h2 className="text-2xl font-bold text-white">Daily AI Summary</h2>
              <p className="text-purple-300 font-medium">{reviewData.topicsCompletedToday} Topics Completed Today</p>
            </div>
          </div>
          <p className="text-lg text-slate-300 leading-relaxed whitespace-pre-wrap">
            {reviewData.summary}
          </p>
        </div>
      </div>

      {/* Flashcards Section */}
      {flashcards.length > 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span>🧠</span> Spaced Repetition Flashcards
          </h2>
          
          <div className="flex flex-col items-center">
            {/* The Flashcard */}
            <div 
              className="w-full max-w-lg h-80 relative cursor-pointer group"
              style={{ perspective: "1000px" }}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div 
                className="w-full h-full transition-transform duration-500 relative"
                style={{ 
                  transformStyle: "preserve-3d", 
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" 
                }}
              >
                
                {/* Front side */}
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-xl"
                  style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                >
                  <div className="absolute top-4 right-4 text-cyan-500/50 font-bold">Front</div>
                  <h3 className="text-2xl font-bold text-white leading-relaxed">
                    {currentCard?.front}
                  </h3>
                  <p className="text-cyan-400 mt-8 text-sm animate-pulse">Click to flip</p>
                </div>

                {/* Back side */}
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-cyan-900/80 to-blue-900/80 border border-cyan-400 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-xl shadow-cyan-500/20"
                  style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <div className="absolute top-4 right-4 text-cyan-200/50 font-bold">Back</div>
                  <p className="text-xl font-medium text-white leading-relaxed">
                    {currentCard?.back}
                  </p>
                </div>

              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6 mt-8">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(false);
                  setCurrentCardIndex(Math.max(0, currentCardIndex - 1));
                }}
                disabled={currentCardIndex === 0}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                &larr;
              </button>
              
              <div className="font-bold text-slate-400">
                {currentCardIndex + 1} / {flashcards.length}
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(false);
                  setCurrentCardIndex(Math.min(flashcards.length - 1, currentCardIndex + 1));
                }}
                disabled={currentCardIndex === flashcards.length - 1}
                className="w-12 h-12 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
              >
                &rarr;
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center animate-fade-in">
          <div className="text-5xl mb-4">📭</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            No Flashcards Generated
          </h2>
          <p className="text-slate-400 max-w-md mx-auto">
            Our AI couldn't generate flashcards for today's topics yet. Learn more complex topics to generate Spaced Repetition flashcards.
          </p>
        </div>
      )}
    </div>
  );
};

export default DailyReview;
