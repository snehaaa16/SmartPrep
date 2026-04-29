import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const LiveNotification = () => {
    const navigate = useNavigate();
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        let stompClient = null;
        
        try {
            // Connect to the WebSocket endpoint
            const socket = new SockJS('http://localhost:8080/ws');
            stompClient = Stomp.over(socket);

            // Turn off console logs from Stomp
            stompClient.debug = () => {};

            stompClient.connect({}, () => {
                console.log('Connected to WebSocket');
                
                stompClient.subscribe('/topic/notifications', (message) => {
                    try {
                        const data = JSON.parse(message.body);
                        setNotification(data);
                        setTimeout(() => setNotification(null), 10000);
                    } catch (e) {
                        console.error("Error parsing notification:", e);
                    }
                });
            }, (error) => {
                console.warn('WebSocket connection failed. Live notifications disabled.');
            });
        } catch (err) {
            console.error("WebSocket setup error:", err);
        }

        return () => {
            if (stompClient && stompClient.connected) {
                stompClient.disconnect();
            }
        };
    }, []);

    if (!notification) return null;

    return (
        <div className="fixed top-24 right-6 z-[9999] animate-fade-in-up">
            <div className={`p-6 rounded-2xl shadow-2xl border backdrop-blur-md max-w-sm flex items-start gap-4 transform hover:scale-105 transition-transform ${
                notification.type === 'QUIZ_START' 
                ? 'bg-violet-600/90 border-violet-400 text-white' 
                : 'bg-slate-800/90 border-white/10 text-slate-200'
            }`}>
                <div className="text-3xl">
                    {notification.type === 'QUIZ_START' ? '🏆' : '⏰'}
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-lg mb-1">{notification.title}</h4>
                    <p className="text-sm opacity-90 leading-relaxed">{notification.message}</p>
                    {notification.type === 'QUIZ_START' && (
                        <button 
                            onClick={() => {
                                navigate('/live-quiz');
                                setNotification(null);
                            }}
                            className="mt-4 px-4 py-2 bg-white text-violet-600 rounded-lg font-bold text-xs hover:bg-slate-100 transition-colors"
                        >
                            JOIN NOW
                        </button>
                    )}
                </div>
                <button 
                    onClick={() => setNotification(null)}
                    className="text-white/50 hover:text-white"
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

export default LiveNotification;
