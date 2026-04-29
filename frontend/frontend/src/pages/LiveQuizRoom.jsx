import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const LiveQuizRoom = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isJoined, setIsJoined] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // Quiz States: 'LOBBY', 'QUESTION', 'LEADERBOARD', 'FINAL'
    const [gameState, setGameState] = useState('LOBBY');
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [score, setScore] = useState(0);
    const [leaderboard, setLeaderboard] = useState([]);
    const [winner, setWinner] = useState(null);
    const [stompClient, setStompClient] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/users/me');
                setName(response.data.name);
                setEmail(response.data.email);
            } catch (err) {
                console.error("Failed to fetch user", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        if (!isJoined) return;

        const socket = new SockJS('http://localhost:8080/ws');
        const client = Stomp.over(socket);
        client.debug = () => {};

        client.connect({}, () => {
            console.log('Quiz Room Connected');
            setStompClient(client);
            
            client.subscribe('/topic/live-quiz/stream', (message) => {
                const data = JSON.parse(message.body);
                
                if (data.type === 'QUESTION') {
                    setGameState('QUESTION');
                    setCurrentQuestion(data.payload);
                    setSelectedOption(null);
                    setTimeLeft(data.payload.timer || 15);
                } else if (data.type === 'LEADERBOARD') {
                    setGameState('LEADERBOARD');
                    setLeaderboard(data.payload);
                } else if (data.type === 'FINAL_RESULTS') {
                    setGameState('FINAL');
                    setLeaderboard(data.payload);
                    if (data.payload.length > 0) setWinner(data.payload[0]);
                }
            });
        });

        return () => {
            if (client) client.disconnect();
        };
    }, [isJoined]);

    useEffect(() => {
        if (gameState === 'QUESTION' && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft, gameState]);

    const handleJoin = (e) => {
        e.preventDefault();
        setIsJoined(true);
    };

    const handleOptionSelect = (index) => {
        if (selectedOption !== null || timeLeft === 0) return;
        setSelectedOption(index);
        
        if (index === currentQuestion.correctIndex) {
            const newScore = score + 5;
            setScore(newScore);
            
            // Send score update to backend
            if (stompClient && stompClient.connected) {
                stompClient.send("/app/quiz.updateScore", {}, JSON.stringify({
                    email: email,
                    points: newScore
                }));
            }
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div></div>;

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-violet-900/20 via-slate-900 to-slate-900 overflow-hidden">
            
            {/* FINAL RESULTS CEREMONY */}
            {gameState === 'FINAL' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl animate-fade-in">
                    <div className="max-w-xl w-full p-8 text-center">
                        {/* Winner Card */}
                        <div className="bg-gradient-to-br from-violet-600 to-pink-500 rounded-[3rem] p-10 shadow-[0_0_80px_rgba(139,92,246,0.3)] border border-white/20 relative mb-12 animate-bounce-in">
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-7xl animate-pulse">👑</div>
                            <h3 className="text-sm uppercase tracking-[0.3em] font-black opacity-80 mb-2">Grand Champion</h3>
                            <h1 className="text-4xl font-black mb-6 truncate">{winner?.name || "The Best"}</h1>
                            
                            {winner?.name === name ? (
                                <div className="animate-fade-in">
                                    <h2 className="text-2xl font-bold text-yellow-300 mb-6">Congratulations!!! You are the winner</h2>
                                    <div className="bg-white/10 py-4 px-8 rounded-2xl inline-block border border-white/10">
                                        <p className="text-4xl font-black text-white">+50 XP BONUS</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="opacity-90">
                                    <p className="text-xl font-medium">Amazing Effort! You finished strong.</p>
                                    <p className="text-sm mt-4 text-white/60">Better luck in the next daily challenge!</p>
                                </div>
                            )}
                        </div>

                        {/* Final Standing Table */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md mb-8">
                            <h4 className="text-left text-xs uppercase tracking-widest text-slate-500 mb-4 px-2">Final Standings</h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                {leaderboard.map((p, idx) => (
                                    <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${p.name === name ? 'bg-violet-500/20 border-violet-500/50' : 'bg-white/5 border-white/5'}`}>
                                        <div className="flex items-center gap-4">
                                            <span className="text-slate-500 font-mono text-sm">{idx + 1}</span>
                                            <span className={`font-bold ${p.name === name ? 'text-violet-400' : 'text-slate-300'}`}>{p.name}</span>
                                        </div>
                                        <span className="font-black text-cyan-400">{p.score} XP</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="w-full py-5 rounded-2xl bg-white text-slate-900 font-black text-lg hover:scale-[1.02] transition-transform shadow-xl"
                        >
                            RETURN TO DASHBOARD
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-2xl w-full">
                {!isJoined ? (
                    /* ENTRY FORM */
                    <div className="max-w-md mx-auto bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl animate-fade-in">
                        <div className="text-center mb-8">
                            <div className="text-6xl mb-4">🏆</div>
                            <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-violet-400 to-pink-500 bg-clip-text text-transparent">Live Quiz Entry</h1>
                            <p className="text-slate-400">Join the mixed CSE challenge.</p>
                        </div>
                        <form onSubmit={handleJoin} className="space-y-6">
                            <input type="text" value={name} onChange={(e)=>setName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-violet-500 focus:outline-none" required />
                            <input type="email" value={email} readOnly className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed" />
                            <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 font-bold text-lg hover:shadow-lg transition-all">Enter Quiz Room</button>
                        </form>
                    </div>
                ) : (
                    <div className="animate-fade-in space-y-6">
                        {/* HEADER STATS */}
                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">👤</div>
                                <div><p className="text-xs text-slate-400">Player</p><p className="font-bold">{name}</p></div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400">Your Session XP</p>
                                <p className="text-2xl font-black text-cyan-400">{score} XP</p>
                            </div>
                        </div>

                        {/* GAME CONTENT */}
                        {gameState === 'LOBBY' && (
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center backdrop-blur-xl shadow-2xl">
                                <div className="flex justify-center mb-6">
                                    <div className="relative">
                                        <div className="text-6xl animate-pulse">📡</div>
                                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Connected to Lobby</h2>
                                <p className="text-slate-400 mb-8 font-medium italic text-sm">Waiting for the daily quiz to begin...</p>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-3 h-3 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}></div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {gameState === 'QUESTION' && currentQuestion && (
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 h-1 bg-cyan-400 transition-all duration-1000" style={{ width: `${(timeLeft / (currentQuestion.timer || 15)) * 100}%` }}></div>
                                <div className="flex justify-between mb-8"><span className="px-3 py-1 bg-violet-500/20 text-violet-400 text-xs font-bold rounded-full">QUESTION</span><div className="flex items-center gap-2 text-pink-500 font-black"><span>⏱️</span><span>{timeLeft}s</span></div></div>
                                <h2 className="text-2xl font-bold mb-8 leading-relaxed">{currentQuestion.question}</h2>
                                <div className="grid grid-cols-1 gap-4">
                                    {currentQuestion.options.map((option, idx) => {
                                        let style = "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10";
                                        if (selectedOption === idx) style = idx === currentQuestion.correctIndex ? "bg-green-500/20 border-green-500 text-green-400" : "bg-red-500/20 border-red-500 text-red-400";
                                        else if (timeLeft === 0 && idx === currentQuestion.correctIndex) style = "bg-green-500/20 border-green-500 text-green-400";
                                        return <button key={idx} onClick={() => handleOptionSelect(idx)} disabled={selectedOption !== null || timeLeft === 0} className={`p-5 rounded-2xl border text-left font-medium transition-all ${style}`}>{option}</button>;
                                    })}
                                </div>
                            </div>
                        )}

                        {gameState === 'LEADERBOARD' && (
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl animate-slide-in">
                                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">📊 Current Rankings</h2>
                                <div className="space-y-3">
                                    {leaderboard.map((player, idx) => (
                                        <div key={idx} className={`flex items-center justify-between p-4 rounded-xl border ${player.name === name ? 'bg-violet-500/20 border-violet-500' : 'bg-white/5 border-white/10'}`}>
                                            <div className="flex items-center gap-4">
                                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${idx === 0 ? 'bg-yellow-500 text-black' : 'bg-white/10'}`}>{idx + 1}</span>
                                                <span className="font-bold">{player.name}</span>
                                            </div>
                                            <span className="text-cyan-400 font-black">{player.score} XP</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {gameState !== 'LOBBY' && (
                            <div className="text-center">
                                <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-white text-sm">Exit Quiz</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveQuizRoom;
