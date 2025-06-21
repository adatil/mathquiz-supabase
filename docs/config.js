// Configuration MathQuiz - Production v2 - Simplified Scoring
const CONFIG = {
    // Supabase Configuration - MathsQuizzv2
    SUPABASE_URL: 'https://klufdvhlkeaxoxucdnzv.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsdWZkdmhsa2VheG94dWNkbnp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxODMxNzQsImV4cCI6MjA2NTc1OTE3NH0.O-lE5dTIk620bJpawqrnn1QEfEUjI-Q_u70AkqhWCTs',
    
    // API Endpoints - Nouveau projet
    API_BASE_URL: 'https://klufdvhlkeaxoxucdnzv.supabase.co/functions/v1',
    SESSIONS_API: 'https://klufdvhlkeaxoxucdnzv.supabase.co/functions/v1/quiz-sessions',
    
    // Application URLs (GitHub Pages)
    APP_BASE_URL: 'https://adatil.github.io/mathquiz-supabase',
    STUDENT_URL: 'https://adatil.github.io/mathquiz-supabase/student.html',
    
    // Application Settings
    DEFAULT_QUESTION_TIME: 30, // seconds
    MAX_ROOM_CODE_LENGTH: 6,
    MIN_ROOM_CODE_LENGTH: 6,
    AUTO_ADVANCE_DELAY: 3000, // ms between questions
    
    // Scoring System - Simplified
    DEFAULT_SCORING: {
        basePoints: 1000,
        lateAnswerPercent: 75, // Pourcentage des points après mi-temps
        minPoints: 0
    },
    
    // Scoring Limits for UI validation
    SCORING_LIMITS: {
        basePoints: { min: 100, max: 5000, step: 100 },
        lateAnswerPercent: { min: 50, max: 100, step: 5 }
    },
    
    // Version Info
    VERSION: '2.2.0',
    BUILD_DATE: '2025-06-21',
    ENVIRONMENT: 'production',
    DEBUG: true // Activé pour diagnostic
};

// Initialize Supabase Client
let supabaseClient = null;

function initializeSupabase() {
    if (typeof window !== 'undefined' && window.supabase) {
        supabaseClient = window.supabase.createClient(
            CONFIG.SUPABASE_URL,
            CONFIG.SUPABASE_ANON_KEY
        );
        console.log('✅ Supabase client initialized - MathsQuizzv2');
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
    async createSession(quizId, teacherId, scoringConfig = null) {
        const body = { quizId, teacherId };
        
        // Ajouter les paramètres de scoring si fournis
        if (scoringConfig) {
            body.scoringConfig = scoringConfig;
        }
        
        return await apiCall('/create-session', {
            method: 'POST',
            body: JSON.stringify(body)
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
    
    // Start quiz with custom scoring
    async startQuiz(sessionId, scoringConfig = null) {
        const body = { sessionId };
        
        // Ajouter les paramètres de scoring si fournis
        if (scoringConfig) {
            body.scoringConfig = scoringConfig;
        }
        
        return await apiCall('/start-quiz', {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },
    
    // Submit answer with custom scoring support
    async submitAnswer(participantId, questionId, answerIndex, timeSpent, isCorrect, maxTime, scoringConfig = null) {
        const body = { 
            participantId, 
            questionId, 
            answerIndex, 
            timeSpent 
        };
        
        // Ajouter les nouveaux paramètres seulement s'ils sont fournis
        if (isCorrect !== undefined) body.isCorrect = isCorrect;
        if (maxTime !== undefined) body.maxTime = maxTime;
        if (scoringConfig) body.scoringConfig = scoringConfig;
        
        return await apiCall('/submit-answer', {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }
};

// Realtime Connection Manager (Supabase Realtime) - FIXED VERSION
class RealtimeManager {
    constructor() {
        this.connected = false;
        this.sessionId = null;
        this.userType = null;
        this.userId = null;
        this.listeners = new Map();
        this.subscriptions = [];
        this.supabase = null;
    }
    
    connect(sessionId, userType, userId) {
        this.sessionId = sessionId;
        this.userType = userType;
        this.userId = userId;
        
        if (!supabaseClient) {
            console.error('❌ Supabase client not initialized');
            return;
        }
        
        this.supabase = supabaseClient;
        
        try {
            console.log('🔗 Connecting to Supabase Realtime - MathsQuizzv2');
            console.log('👤 User:', this.userType, this.userId);
            
            // Écouter les événements de quiz
            this.subscribeToQuizEvents();
            
            // Écouter les changements de participants
            this.subscribeToParticipants();
            
            // Écouter les changements de session
            this.subscribeToSession();
            
            this.connected = true;
            this.emit('connected');
            
            console.log('✅ Supabase Realtime connected');
            
        } catch (error) {
            console.error('❌ Failed to connect to Supabase Realtime:', error);
            this.emit('error', error);
        }
    }
    
    subscribeToQuizEvents() {
        const eventsSubscription = this.supabase
            .channel('quiz_events_' + this.sessionId)
            .on('postgres_changes', 
                { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'quiz_events',
                    filter: `session_id=eq.${this.sessionId}`
                }, 
                (payload) => {
                    this.handleQuizEvent(payload.new);
                }
            )
            .subscribe();
            
        this.subscriptions.push(eventsSubscription);
        console.log('🎮 Subscribed to quiz events for session:', this.sessionId);
    }
    
    subscribeToParticipants() {
        const participantsSubscription = this.supabase
            .channel('participants_' + this.sessionId)
            .on('postgres_changes', 
                { 
                    event: '*', 
                    schema: 'public', 
                    table: 'participants',
                    filter: `session_id=eq.${this.sessionId}`
                }, 
                (payload) => {
                    this.handleParticipantChange(payload);
                }
            )
            .subscribe();
            
        this.subscriptions.push(participantsSubscription);
        console.log('👥 Subscribed to participants changes');
    }
    
    subscribeToSession() {
        const sessionSubscription = this.supabase
            .channel('session_' + this.sessionId)
            .on('postgres_changes', 
                { 
                    event: 'UPDATE', 
                    schema: 'public', 
                    table: 'sessions',
                    filter: `id=eq.${this.sessionId}`
                }, 
                (payload) => {
                    this.handleSessionChange(payload.new);
                }
            )
            .subscribe();
            
        this.subscriptions.push(sessionSubscription);
        console.log('🎯 Subscribed to session changes');
    }
    
    handleQuizEvent(event) {
        console.log('📨 Quiz event received:', event.event_type, 'target:', event.target_type, 'userType:', this.userType);
        
        // Vérifier si l'événement nous concerne
        const shouldHandle = (
            event.target_type === 'all' || 
            event.target_type === this.userType ||
            (event.target_type === 'specific' && event.target_user_id === this.userId)
        );
        
        console.log('🎯 Should handle event:', shouldHandle);
        
        if (shouldHandle) {
            console.log('✅ Processing event:', event.event_type);
            // Émettre l'événement avec ses données
            this.emit(event.event_type, event.event_data);
            this.emit('message', { type: event.event_type, ...event.event_data });
        } else {
            console.log('❌ Event not for us - target:', event.target_type, 'our type:', this.userType);
        }
    }
    
    handleParticipantChange(payload) {
        console.log('👤 Participant change:', payload.eventType);
        
        if (payload.eventType === 'INSERT') {
            this.emit('user_joined', { 
                userType: 'student', 
                userId: payload.new.id,
                studentName: payload.new.student_name 
            });
        } else if (payload.eventType === 'UPDATE') {
            this.emit('participant_updated', payload.new);
        } else if (payload.eventType === 'DELETE') {
            this.emit('user_left', { 
                userType: 'student', 
                userId: payload.old.id 
            });
        }
    }
    
    handleSessionChange(session) {
        console.log('🎯 Session change:', session.status);
        this.emit('session_updated', session);
    }
    
    async send(data) {
        if (!this.connected || !this.supabase) {
            console.warn('Realtime not connected, message not sent:', data);
            return;
        }
        
        try {
            // Déterminer le type de cible selon le type de message
            let targetType = 'all';
            let targetUserId = null;
            
            if (data.type === 'student_answer' && this.userType === 'student') {
                targetType = 'teacher';
                console.log('🎯 Student answer -> targeting teachers');
            } else if (['start_quiz', 'next_question', 'quiz_finished'].includes(data.type) && this.userType === 'teacher') {
                targetType = 'student';
                console.log('🎯 Teacher command -> targeting students');
            } else if (data.type === 'answer_confirmed') {
                targetType = 'specific';
                targetUserId = this.userId;
                console.log('🎯 Answer confirmation -> targeting specific student');
            } else {
                console.log('🎯 Default targeting -> all users');
            }
            
            console.log('📤 Sending event:', data.type, 'to target:', targetType);
            
            // Log des paramètres de scoring s'ils sont présents
            if (data.scoringConfig) {
                console.log('📊 Scoring config sent:', data.scoringConfig);
            }
            
            // Insérer l'événement dans la table quiz_events
            const { data: insertedEvent, error } = await this.supabase
                .from('quiz_events')
                .insert({
                    session_id: this.sessionId,
                    event_type: data.type,
                    event_data: data,
                    target_type: targetType,
                    target_user_id: targetUserId
                })
                .select()
                .single();
                
            if (error) {
                console.error('❌ Error sending realtime event:', error);
            } else {
                console.log('📤 Realtime event sent:', data.type, 'inserted with ID:', insertedEvent.id);
            }
            
        } catch (error) {
            console.error('❌ Error in realtime send:', error);
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
    
    disconnect() {
        console.log('📵 Disconnecting Supabase Realtime');
        
        // Unsubscribe from all channels
        this.subscriptions.forEach(subscription => {
            this.supabase.removeChannel(subscription);
        });
        
        this.subscriptions = [];
        this.connected = false;
        this.listeners.clear();
    }
}

// Global Realtime instance
const realtimeManager = new RealtimeManager();

// =============================================================================
// SYSTÈME DE SCORING UNIFIÉ - VERSION CORRIGÉE
// =============================================================================

const ScoringSystem = {
    // Fonction principale de calcul du score
    calculateScore(timeSpent, maxTime, config, isCorrect = true) {
        // Validation des paramètres
        if (!isCorrect || timeSpent < 0 || maxTime <= 0) {
            return 0;
        }

        // S'assurer que les paramètres sont valides
        const validConfig = this.validateConfig(config);
        const halfTime = maxTime / 2;
        
        // Limiter le temps passé au temps maximum
        const clampedTime = Math.min(timeSpent, maxTime);
        
        if (clampedTime <= halfTime) {
            // Première moitié : 100% des points
            return validConfig.basePoints;
        } else {
            // Seconde moitié : pourcentage configuré des points
            const scaledPoints = Math.round(validConfig.basePoints * validConfig.lateAnswerPercent / 100);
            // S'assurer qu'on ne donne jamais moins de points minimum
            return Math.max(scaledPoints, validConfig.minPoints || 0);
        }
    },

    // Validation et correction des paramètres de scoring
    validateConfig(config) {
        const defaultConfig = {
            basePoints: 1000,
            lateAnswerPercent: 75,
            minPoints: 0
        };

        if (!config) return defaultConfig;

        return {
            basePoints: Math.max(100, Math.min(5000, parseInt(config.basePoints) || defaultConfig.basePoints)),
            lateAnswerPercent: Math.max(50, Math.min(100, parseInt(config.lateAnswerPercent) || defaultConfig.lateAnswerPercent)),
            minPoints: Math.max(0, parseInt(config.minPoints) || defaultConfig.minPoints)
        };
    },

    // Générer des exemples pour l'aperçu
    generateExamples(config, questionTime = 30) {
        const validConfig = this.validateConfig(config);
        const halfTime = questionTime / 2;
        
        return {
            fast: this.calculateScore(5, questionTime, validConfig, true),           // Réponse rapide
            halfTime: this.calculateScore(halfTime, questionTime, validConfig, true), // Exactement à mi-temps
            slow: this.calculateScore(halfTime + 5, questionTime, validConfig, true), // Réponse lente
            incorrect: 0 // Réponse incorrecte
        };
    },

    // Fonction de debug pour identifier les problèmes
    debug(label, timeSpent, maxTime, config, isCorrect) {
        if (!CONFIG.DEBUG) return;
        
        console.group(`🔍 Debug Scoring: ${label}`);
        console.log('Temps passé:', timeSpent, 'secondes');
        console.log('Temps maximum:', maxTime, 'secondes');
        console.log('Configuration:', config);
        console.log('Réponse correcte:', isCorrect);
        console.log('Mi-temps:', maxTime / 2, 'secondes');
        
        const score = this.calculateScore(timeSpent, maxTime, config, isCorrect);
        console.log('Score calculé:', score, 'points');
        console.groupEnd();
        
        return score;
    }
};

// Utility Functions
const Utils = {
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    },
    
    generateRoomCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    },
    
    // Fonction de scoring mise à jour pour utiliser ScoringSystem
    calculateScore(timeSpent, maxTime, customConfig = null, isCorrect = true) {
        const config = customConfig || CONFIG.DEFAULT_SCORING;
        return ScoringSystem.calculateScore(timeSpent, maxTime, config, isCorrect);
    },
    
    // Valider la configuration de scoring simplifiée
    validateScoringConfig(config) {
        const limits = CONFIG.SCORING_LIMITS;
        const errors = [];
        
        // Vérifier basePoints
        if (config.basePoints < limits.basePoints.min || config.basePoints > limits.basePoints.max) {
            errors.push(`Points par question doivent être entre ${limits.basePoints.min} et ${limits.basePoints.max}`);
        }
        
        // Vérifier lateAnswerPercent
        if (config.lateAnswerPercent < limits.lateAnswerPercent.min || config.lateAnswerPercent > limits.lateAnswerPercent.max) {
            errors.push(`Pourcentage après mi-temps doit être entre ${limits.lateAnswerPercent.min}% et ${limits.lateAnswerPercent.max}%`);
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },
    
    // Créer des exemples de scoring pour prévisualisation
    generateScoringExamples(config, questionTime = 30) {
        const halfTime = questionTime / 2;
        return {
            fast: this.calculateScore(5, questionTime, config),           // Première moitié
            slow: this.calculateScore(halfTime + 5, questionTime, config), // Seconde moitié
            exactHalf: this.calculateScore(halfTime, questionTime, config) // Exactement à mi-temps
        };
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

// Scoring Configuration Manager
const ScoringManager = {
    // Charger la configuration depuis localStorage
    loadConfig() {
        try {
            const saved = localStorage.getItem('mathquiz_scoring_config');
            if (saved) {
                const config = JSON.parse(saved);
                const validation = Utils.validateScoringConfig(config);
                if (validation.isValid) {
                    return config;
                } else {
                    console.warn('Configuration de scoring invalide:', validation.errors);
                }
            }
        } catch (error) {
            console.error('Erreur de chargement de la configuration:', error);
        }
        
        // Retourner la configuration par défaut
        return { ...CONFIG.DEFAULT_SCORING };
    },
    
    // Sauvegarder la configuration dans localStorage
    saveConfig(config) {
        const validation = Utils.validateScoringConfig(config);
        if (!validation.isValid) {
            throw new Error('Configuration invalide: ' + validation.errors.join(', '));
        }
        
        try {
            localStorage.setItem('mathquiz_scoring_config', JSON.stringify(config));
            console.log('📊 Configuration de scoring sauvegardée:', config);
            return true;
        } catch (error) {
            console.error('Erreur de sauvegarde:', error);
            return false;
        }
    },
    
    // Réinitialiser aux valeurs par défaut
    resetToDefault() {
        const defaultConfig = { ...CONFIG.DEFAULT_SCORING };
        this.saveConfig(defaultConfig);
        return defaultConfig;
    },
    
    // Obtenir les limites pour l'interface utilisateur
    getLimits() {
        return CONFIG.SCORING_LIMITS;
    }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        SessionAPI,
        RealtimeManager,
        realtimeManager,
        Utils,
        ScoringManager,
        initializeSupabase
    };
}

// =============================================================================
// FONCTIONS DE DIAGNOSTIC ET INITIALISATION
// =============================================================================

const ScoringDebug = {
    // Tester le calcul de scoring avec différents scénarios
    testScoring(config = null) {
        const testConfig = config || { basePoints: 1000, lateAnswerPercent: 75, minPoints: 0 };
        const questionTime = 30;
        
        console.group('🧪 Test du système de scoring');
        console.log('Configuration:', testConfig);
        console.log('Temps de question:', questionTime + 's');
        
        const tests = [
            { time: 5, expected: 'Points complets (première moitié)' },
            { time: 15, expected: 'Points complets (exactement mi-temps)' },
            { time: 20, expected: 'Points réduits (seconde moitié)' },
            { time: 30, expected: 'Points réduits (temps écoulé)' },
            { time: 35, expected: 'Points réduits (dépassement limité)' }
        ];
        
        tests.forEach(test => {
            const score = ScoringSystem.calculateScore(test.time, questionTime, testConfig, true);
            console.log(`⏱️ ${test.time}s: ${score} pts (${test.expected})`);
        });
        
        console.log('❌ Réponse incorrecte:', ScoringSystem.calculateScore(10, questionTime, testConfig, false));
        console.groupEnd();
    },
    
    // Vérifier la cohérence entre les différentes parties du système
    checkConsistency() {
        console.group('🔍 Vérification de cohérence');
        
        // Vérifier que ScoringSystem est disponible partout
        console.log('ScoringSystem global:', !!window.ScoringSystem);
        
        // Vérifier les configurations
        if (typeof appState !== 'undefined') {
            console.log('Config professeur:', appState.scoringConfig);
        }
        
        if (typeof studentState !== 'undefined') {
            console.log('Config élève:', studentState.scoringConfig);
        }
        
        console.groupEnd();
    }
};

// Fonction d'initialisation globale du système de scoring
function initializeScoringSystemGlobal() {
    // Ajouter ScoringSystem au scope global
    window.ScoringSystem = ScoringSystem;
    window.ScoringDebug = ScoringDebug;
    
    // Vérifier et corriger les paramètres existants
    if (typeof appState !== 'undefined' && appState.scoringConfig) {
        appState.scoringConfig = ScoringSystem.validateConfig(appState.scoringConfig);
    }
    
    if (typeof studentState !== 'undefined' && studentState.scoringConfig) {
        studentState.scoringConfig = ScoringSystem.validateConfig(studentState.scoringConfig);
    }
    
    console.log('✅ Système de scoring initialisé et unifié');
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        SessionAPI,
        RealtimeManager,
        realtimeManager,
        Utils,
        ScoringManager,
        ScoringSystem,
        ScoringDebug,
        initializeSupabase,
        initializeScoringSystemGlobal
    };
}

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
    window.SessionAPI = SessionAPI;
    window.realtimeManager = realtimeManager;
    window.Utils = Utils;
    window.ScoringManager = ScoringManager;
    window.ScoringSystem = ScoringSystem;
    window.ScoringDebug = ScoringDebug;
    window.initializeSupabase = initializeSupabase;
    window.initializeScoringSystemGlobal = initializeScoringSystemGlobal;
    
    // Backward compatibility
    window.MATHQUIZ_CONFIG = CONFIG;
    window.wsManager = realtimeManager; // Alias pour compatibilité
    
    // Initialize when Supabase is ready
    document.addEventListener('DOMContentLoaded', () => {
        // Wait for Supabase to load
        const checkSupabase = () => {
            if (window.supabase) {
                initializeSupabase();
                // Initialiser le système de scoring unifié
                initializeScoringSystemGlobal();
            } else {
                setTimeout(checkSupabase, 100);
            }
        };
        checkSupabase();
    });
    
    console.log('🎯 MathQuiz Configuration Loaded v' + CONFIG.VERSION);
    console.log('📡 API Endpoint:', CONFIG.SESSIONS_API);
    console.log('🔗 Realtime System: Supabase Realtime (Simplified Scoring)');
    console.log('📊 Default Scoring:', CONFIG.DEFAULT_SCORING);
}