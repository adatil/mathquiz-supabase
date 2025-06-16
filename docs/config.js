// Configuration MathQuiz - Production
const CONFIG = {
    // Supabase Configuration
    SUPABASE_URL: 'https://ctakwbfqkcfqfwkdqedl.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0YWt3YmZxa2NmcWZ3a2RxZWRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNzIwOTgsImV4cCI6MjA2NTY0ODA5OH0.HbqQNFm49c5W2vXVWWKPXlmJTXaSzBBF39FgWO7Q-KY',
    
    // API Endpoints
    API_BASE_URL: 'https://ctakwbfqkcfqfwkdqedl.supabase.co/functions/v1',
    SESSIONS_API: 'https://ctakwbfqkcfqfwkdqedl.supabase.co/functions/v1/quiz-sessions',
    WEBSOCKET_URL: 'wss://ctakwbfqkcfqfwkdqedl.supabase.co/functions/v1/quiz-websocket',
    
    // Application URLs (GitHub Pages)
    APP_BASE_URL: 'https://adatil.github.io/mathquiz-supabase',
    STUDENT_URL: 'https://adatil.github.io/mathquiz-supabase/student.html',
    
    // Application Settings
    DEFAULT_QUESTION_TIME: 30, // seconds
    MAX_ROOM_CODE_LENGTH: 6,
    MIN_ROOM_CODE_LENGTH: 6,
    AUTO_ADVANCE_DELAY: 3000, // ms between questions
    
    // Scoring System
    BASE_POINTS: 1000,
    TIME_BONUS_MULTIPLIER: 20,
    PERFECT_SCORE_BONUS: 500,
    
    // Version Info
    VERSION: '1.1.0',
    BUILD_DATE: '2025-06-16',
    ENVIRONMENT: 'production',
    DEBUG: false
};

// Initialize Supabase Client
let supabaseClient = null;

function initializeSupabase() {
    if (typeof window !== 'undefined' && window.supabase) {
        supabaseClient = window.supabase.createClient(
            CONFIG.SUPABASE_URL,
            CONFIG.SUPABASE_ANON_KEY
        );
        console.log('✅ Supabase client initialized');
        return supabaseClient;
    } else {
        console.error('❌ Supabase library not loaded');
        return null;
    }
}

// API Helper Functions
async function apiCall(endpoint, options = {}) {
    const url = `${CONFIG.SESSIONS_API}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`
        }
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    try {
        const response = await fetch(url, finalOptions);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
}

// Session Management Functions
const SessionAPI = {
    // Generate room code
    async generateRoomCode() {
        return await apiCall('/generate-code');
    },
    
    // Create new session
    async createSession(quizId, teacherId) {
        return await apiCall('/create-session', {
            method: 'POST',
            body: JSON.stringify({ quizId, teacherId })
        });
    },
    
    // Join session as student
    async joinSession(roomCode, studentName) {
        return await apiCall('/join-session', {
            method: 'POST',
            body: JSON.stringify({ roomCode, studentName })
        });
    },
    
    // Get session participants
    async getParticipants(sessionId) {
        return await apiCall(`/session/${sessionId}/participants`);
    },
    
    // Start quiz
    async startQuiz(sessionId) {
        return await apiCall('/start-quiz', {
            method: 'POST',
            body: JSON.stringify({ sessionId })
        });
    },
    
    // Submit answer
    async submitAnswer(participantId, questionId, answerIndex, timeSpent) {
        return await apiCall('/submit-answer', {
            method: 'POST',
            body: JSON.stringify({ participantId, questionId, answerIndex, timeSpent })
        });
    }
};

// WebSocket Connection Manager
class WebSocketManager {
    constructor() {
        this.ws = null;
        this.connected = false;
        this.sessionId = null;
        this.userType = null;
        this.userId = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.listeners = new Map();
    }
    
    connect(sessionId, userType, userId) {
        this.sessionId = sessionId;
        this.userType = userType;
        this.userId = userId;
        
        const wsUrl = `${CONFIG.WEBSOCKET_URL}?session=${sessionId}&type=${userType}&user=${userId}`;
        
        try {
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                console.log('🔗 WebSocket connected');
                this.connected = true;
                this.reconnectAttempts = 0;
                this.emit('connected');
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.emit('message', data);
                    this.emit(data.type, data);
                } catch (error) {
                    console.error('WebSocket message error:', error);
                }
            };
            
            this.ws.onclose = () => {
                console.log('📵 WebSocket disconnected');
                this.connected = false;
                this.emit('disconnected');
                this.attemptReconnect();
            };
            
            this.ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                this.emit('error', error);
            };
            
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
        }
    }
    
    send(data) {
        if (this.connected && this.ws) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.warn('WebSocket not connected, message not sent:', data);
        }
    }
    
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} listener:`, error);
                }
            });
        }
    }
    
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
            
            setTimeout(() => {
                console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
                this.connect(this.sessionId, this.userType, this.userId);
            }, delay);
        } else {
            console.error('❌ Max reconnection attempts reached');
            this.emit('reconnect_failed');
        }
    }
    
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.connected = false;
        this.listeners.clear();
    }
}

// Global WebSocket instance
const wsManager = new WebSocketManager();

// Utility Functions
const Utils = {
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    },
    
    generateRoomCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    },
    
    calculateScore(timeSpent, maxTime) {
        const timeBonus = Math.max(0, CONFIG.BASE_POINTS - (timeSpent * CONFIG.TIME_BONUS_MULTIPLIER));
        return Math.round(CONFIG.BASE_POINTS + timeBonus);
    },
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
    },
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        SessionAPI,
        WebSocketManager,
        wsManager,
        Utils,
        initializeSupabase
    };
}

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
    window.SessionAPI = SessionAPI;
    window.wsManager = wsManager;
    window.Utils = Utils;
    window.initializeSupabase = initializeSupabase;
    
    // Backward compatibility
    window.MATHQUIZ_CONFIG = CONFIG;
    
    // Initialize when Supabase is ready
    document.addEventListener('DOMContentLoaded', () => {
        // Wait for Supabase to load
        const checkSupabase = () => {
            if (window.supabase) {
                initializeSupabase();
            } else {
                setTimeout(checkSupabase, 100);
            }
        };
        checkSupabase();
    });
    
    console.log('🎯 MathQuiz Configuration Loaded v' + CONFIG.VERSION);
    console.log('📡 API Endpoint:', CONFIG.SESSIONS_API);
    console.log('🔗 WebSocket Endpoint:', CONFIG.WEBSOCKET_URL);
}
