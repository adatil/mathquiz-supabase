// Configuration MathQuiz - Supabase
window.MATHQUIZ_CONFIG = {
    // Supabase Configuration
    SUPABASE_URL: 'https://ctakwbfqkcfqfwkdqedl.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0YWt3YmZxa2NmcWZ3a2RxZWRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNzIwOTgsImV4cCI6MjA2NTY0ODA5OH0.HbqQNFm49c5W2vXVWWKPXlmJTXaSzBBF39FgWO7Q-KY',
    
    // Service URLs
    API_BASE_URL: 'https://ctakwbfqkcfqfwkdqedl.supabase.co/functions/v1',
    WEBSOCKET_URL: 'wss://ctakwbfqkcfqfwkdqedl.supabase.co/functions/v1/quiz-websocket',
    API_URL: 'https://ctakwbfqkcfqfwkdqedl.supabase.co/functions/v1/quiz-api',
    
    // Application URLs (GitHub Pages)
    APP_BASE_URL: 'https://adatil.github.io/mathquiz-supabase',
    STUDENT_URL: 'https://adatil.github.io/mathquiz-supabase/student.html',
    
    // Default Configuration
    DEFAULT_QUESTION_TIME: 30,
    DEFAULT_QUIZ_SUBJECT: 'Mathématiques',
    DEFAULT_QUIZ_LEVEL: 'Seconde',
    
    // Version Info
    VERSION: '1.0.0',
    BUILD_DATE: '2025-06-16'
};

// Export pour compatibilité
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.MATHQUIZ_CONFIG;
}