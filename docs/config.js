// Configuration MathQuiz - Production v2 - LTI Integration
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
    
    // Scoring System
    BASE_POINTS: 1000,
    TIME_BONUS_MULTIPLIER: 20,
    PERFECT_SCORE_BONUS: 500,
    
    // LTI Configuration
    LTI_ENABLED: true,
    LTI_LAUNCH_URL: 'https://klufdvhlkeaxoxucdnzv.supabase.co/functions/v1/lti-launch',
    LTI_GRADE_URL: 'https://klufdvhlkeaxoxucdnzv.supabase.co/functions/v1/lti-grade',
    LTI_SESSION_URL: 'https://klufdvhlkeaxoxucdnzv.supabase.co/functions/v1/lti-session',
    
    // Version Info
    VERSION: '2.2.0',
    BUILD_DATE: '2025-06-18',
    ENVIRONMENT: 'production',
    DEBUG: true // Activé pour diagnostic
};

// ==========================================
// MODE DETECTION & INITIALIZATION
// ==========================================

/**
 * Détecte le mode de lancement (LTI vs Standalone)
 * @returns {string} 'LTI_MODE' ou 'STANDALONE_MODE'
 */
function detectLaunchMode() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Vérifier les paramètres LTI typiques
    const hasLTIParam = urlParams.has('lti');
    const hasLTIVersion = urlParams.has('lti_version');
    const hasResourceLinkId = urlParams.has('resource_link_id');
    const hasContextId = urlParams.has('context_id');
    
    if (hasLTIParam || hasLTIVersion || hasResourceLinkId || hasContextId) {
        console.log('🎯 Mode détecté: LTI');
        return 'LTI_MODE';
    } else {
        console.log('🎯 Mode détecté: Standalone');
        return 'STANDALONE_MODE';
    }
}

/**
 * Initialise l'application selon le mode détecté
 */
function initializeAppMode() {
    const mode = detectLaunchMode();
    
    if (mode === 'LTI_MODE') {
        return initLTIMode();
    } else {
        return initStandaloneMode();
    }
}

/**
 * Initialisation en mode LTI
 */
function initLTIMode() {
    console.log('🚀 Initialisation Mode LTI');
    
    // Extraire les données LTI depuis l'URL
    const ltiData = extractLTIData();
    
    // Configuration spécifique LTI
    const ltiConfig = {
        mode: 'LTI_MODE',
        context: ltiData,
        features: {
            studentAccess: false,  // Géré par Elea
            quizManagement: false, // Quiz du cours Elea
            directSession: true,   // Session directe
            gradePassback: true    // Retour de notes
        }
    };
    
    // Stocker la configuration LTI
    window.LTI_CONFIG = ltiConfig;
    
    return ltiConfig;
}

/**
 * Initialisation en mode Standalone
 */
function initStandaloneMode() {
    console.log('🚀 Initialisation Mode Standalone');
    
    const standaloneConfig = {
        mode: 'STANDALONE_MODE',
        context: null,
        features: {
            studentAccess: true,   // Accès élèves complet
            quizManagement: true,  // Gestion complète des quiz
            directSession: true,   // Sessions live
            gradePassback: false   // Pas de retour de notes
        }
    };
    
    // Stocker la configuration Standalone
    window.STANDALONE_CONFIG = standaloneConfig;
    
    return standaloneConfig;
}

/**
 * Extrait les données LTI depuis les paramètres URL
 */
function extractLTIData() {
    const urlParams = new URLSearchParams(window.location.search);
    
    return {
        lti_version: urlParams.get('lti_version'),
        resource_link_id: urlParams.get('resource_link_id'),
        context_id: urlParams.get('context_id'),
        context_title: urlParams.get('context_title'),
        user_id: urlParams.get('user_id'),
        roles: urlParams.get('roles'),
        lis_person_name_given: urlParams.get('lis_person_name_given'),
        lis_person_name_family: urlParams.get('lis_person_name_family'),
        lis_outcome_service_url: urlParams.get('lis_outcome_service_url'),
        lis_result_sourcedid: urlParams.get('lis_result_sourcedid'),
        launch_presentation_return_url: urlParams.get('launch_presentation_return_url')
    };
}

// ==========================================
// LTI-SPECIFIC API FUNCTIONS
// ==========================================

const LTIAPI = {
    /**
     * Traite un lancement LTI
     */
    async handleLTILaunch(ltiData) {
        return await apiCall('/lti-launch', {
            method: 'POST',
            body: JSON.stringify(ltiData)
        });
    },
    
    /**
     * Crée une session LTI
     */
    async createLTISession(contextId, resourceLinkId, teacherId) {
        return await apiCall('/lti-session', {
            method: 'POST',
            body: JSON.stringify({ contextId, resourceLinkId, teacherId })
        });
    },
    
    /**
     * Envoie une note via LTI
     */
    async sendGrade(participantId, score, maxScore) {
        return await apiCall('/lti-grade', {
            method: 'POST',
            body: JSON.stringify({ participantId, score, maxScore })
        });
    }
};

// ==========================================
// SECURITY & ACCESS CONTROL
// ==========================================

class SecurityManager {
    /**
     * Valide l'accès selon le mode
     */
    static validateAccess(userId, resource, mode) {
        if (mode === 'LTI_MODE') {
            return this.validateLTIAccess(userId, resource);
        } else {
            return this.validateStandaloneAccess(userId, resource);
        }
    }
    
    /**
     * Validation d'accès LTI
     */
    static validateLTIAccess(userId, resource) {
        // Vérifier que l'utilisateur est dans le contexte LTI approprié
        const ltiConfig = window.LTI_CONFIG;
        if (!ltiConfig || !ltiConfig.context) {
            return false;
        }
        
        // Logique de validation LTI spécifique
        return true;
    }
    
    /**
     * Validation d'accès Standalone
     */
    static validateStandaloneAccess(userId, resource) {
        // Validation pour mode standalone (existant)
        return true;
    }
    
    /**
     * Obtient la portée des données selon le mode
     */
    static getDataScope(sessionId, mode) {
        if (mode === 'LTI_MODE') {
            return this.getLTIContextData(sessionId);
        } else {
            return this.getPublicData(sessionId);
        }
    }
    
    static getLTIContextData(sessionId) {
        // Données limitées au contexte LTI
        const ltiConfig = window.LTI_CONFIG;
        return {
            contextId: ltiConfig?.context?.context_id,
            resourceLinkId: ltiConfig?.context?.resource_link_id,
            sessionId: sessionId
        };
    }
    
    static getPublicData(sessionId) {
        // Données publiques pour mode standalone
        return {
            sessionId: sessionId,
            public: true
        };
    }
}

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
    
    // Submit answer (VERSION COMPATIBLE - ancienne et nouvelle API)
    async submitAnswer(participantId, questionId, answerIndex, timeSpent, isCorrect, maxTime) {
        // Pour compatibilité, utiliser l'ancienne API si les nouveaux paramètres ne sont pas fournis
        const body = { participantId, questionId, answerIndex, timeSpent };
        
        // Ajouter les nouveaux paramètres seulement s'ils sont fournis
        if (isCorrect !== undefined) body.isCorrect = isCorrect;
        if (maxTime !== undefined) body.maxTime = maxTime;
        
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
        LTIAPI,
        SecurityManager,
        RealtimeManager,
        realtimeManager,
        Utils,
        initializeSupabase,
        detectLaunchMode,
        initializeAppMode
    };
}

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
    window.SessionAPI = SessionAPI;
    window.LTIAPI = LTIAPI;
    window.SecurityManager = SecurityManager;
    window.realtimeManager = realtimeManager;
    window.Utils = Utils;
    window.initializeSupabase = initializeSupabase;
    window.detectLaunchMode = detectLaunchMode;
    window.initializeAppMode = initializeAppMode;
    
    // Backward compatibility
    window.MATHQUIZ_CONFIG = CONFIG;
    window.wsManager = realtimeManager; // Alias pour compatibilité
    
    // Initialize when Supabase is ready
    document.addEventListener('DOMContentLoaded', () => {
        // Wait for Supabase to load
        const checkSupabase = () => {
            if (window.supabase) {
                initializeSupabase();
                // Initialiser le mode de l'application
                initializeAppMode();
            } else {
                setTimeout(checkSupabase, 100);
            }
        };
        checkSupabase();
    });
    
    console.log('🎯 MathQuiz Configuration Loaded v' + CONFIG.VERSION);
    console.log('📡 API Endpoint:', CONFIG.SESSIONS_API);
    console.log('🔗 Realtime System: Supabase Realtime (Debug Mode)');
    console.log('🚀 LTI Integration: Enabled');
}
