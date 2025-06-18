# 🎯 MathQuiz Live

**Quiz interactifs de mathématiques en temps réel pour l'enseignement**

[![Démo Live](https://img.shields.io/badge/Démo-Live-brightgreen)](https://adatil.github.io/mathquiz-supabase/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-green)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 📋 Description

MathQuiz Live est une application web permettant de créer et animer des quiz de mathématiques en temps réel. Les élèves rejoignent la session avec un simple code à 6 caractères et répondent aux questions depuis leur smartphone, tandis que le professeur suit les résultats en direct.

### ✨ Fonctionnalités principales

- 🎮 **Sessions live** avec codes de salle à 6 caractères
- 📱 **Interface élève** optimisée mobile
- 🖥️ **Interface professeur** avec tableau de bord en temps réel
- 📊 **Scores calculés** automatiquement avec bonus de rapidité
- 🔄 **Synchronisation temps réel** via Supabase Realtime
- 📐 **Support LaTeX** avec MathJax pour les formules mathématiques
- 📂 **Import/Export XML** pour les questions
- 🏆 **Classements** et statistiques détaillées

## 🚀 Démo

- **Interface Professeur** : [https://adatil.github.io/mathquiz-supabase/](https://adatil.github.io/mathquiz-supabase/)
- **Interface Élève** : [https://adatil.github.io/mathquiz-supabase/student.html](https://adatil.github.io/mathquiz-supabase/student.html)

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Interface     │    │    Supabase      │    │   Interface     │
│   Professeur    │◄──►│   Database +     │◄──►│    Élève        │
│   (index.html)  │    │  Edge Functions  │    │ (student.html)  │
└─────────────────┘    │   + Realtime     │    └─────────────────┘
                       └──────────────────┘
```

### 🔧 Stack technique

- **Frontend** : HTML5, CSS3, JavaScript vanilla
- **Backend** : Supabase Edge Functions (Deno/TypeScript)
- **Base de données** : PostgreSQL (Supabase)
- **Temps réel** : Supabase Realtime
- **Formules** : MathJax 3
- **Déploiement** : GitHub Pages

## 📊 Base de données

### Tables principales

```sql
-- Sessions de quiz
sessions (
  id, room_code, teacher_id, quiz_id, 
  status, created_at, started_at
)

-- Participants (élèves)
participants (
  id, session_id, student_name, score, 
  correct_answers, total_answers, is_connected
)

-- Réponses des élèves
student_answers (
  id, participant_id, question_index, 
  answer_index, is_correct, points_earned, time_spent
)

-- Événements temps réel
quiz_events (
  id, session_id, event_type, event_data,
  target_type, target_user_id
)
```

## 🎮 Utilisation

### Pour le professeur

1. **Créer une session**
   - Ouvrir l'interface professeur
   - Cliquer sur "Créer un Quiz" ou utiliser un quiz existant
   - La session génère automatiquement un code à 6 caractères

2. **Gérer la session**
   - Partager le code avec les élèves
   - Voir les participants se connecter en temps réel
   - Démarrer le quiz quand tous sont prêts
   - Suivre les scores en direct

### Pour les élèves

1. **Rejoindre la session**
   - Aller sur l'interface élève
   - Entrer le code à 6 caractères
   - Saisir son prénom

2. **Participer au quiz**
   - Attendre le démarrage par le professeur
   - Répondre aux questions dans le temps imparti
   - Voir son score et son classement à la fin

## ⚙️ Installation et configuration

### 1. Cloner le projet

```bash
git clone https://github.com/adatil/mathquiz-supabase.git
cd mathquiz-supabase
```

### 2. Configuration Supabase

1. Créer un projet sur [Supabase](https://supabase.com)
2. Importer le schéma de base de données depuis `schema.sql`
3. Déployer les Edge Functions depuis le dossier `supabase/functions/`

### 3. Configuration des variables

Modifier `config.js` avec vos paramètres Supabase :

```javascript
const CONFIG = {
    SUPABASE_URL: 'https://votre-projet.supabase.co',
    SUPABASE_ANON_KEY: 'votre-clé-anonyme',
    // ...
};
```

### 4. Déploiement

#### Option A : GitHub Pages (recommandé)
- Pousser sur GitHub
- Activer GitHub Pages dans les paramètres du repo
- L'application sera disponible sur `https://username.github.io/mathquiz-supabase/`

#### Option B : Serveur local
```bash
# Avec Python
python -m http.server 8000

# Avec Node.js
npx serve .
```

## 📝 Format des questions

### Création manuelle
Utilisez l'interface de création intégrée avec support LaTeX :
```
Question : Résoudre $$x^2 - 5x + 6 = 0$$
Options : $$x = 2$$ ou $$x = 3$$, $$x = 1$$ ou $$x = 6$$, etc.
```

### Import XML
```xml
<?xml version="1.0" encoding="UTF-8"?>
<quiz title="Équations du Second Degré">
    <question time="45" correct="0">
        <text>Résoudre : $$x^2 - 5x + 6 = 0$$</text>
        <option>$$x = 2$$ ou $$x = 3$$</option>
        <option>$$x = 1$$ ou $$x = 6$$</option>
        <option>$$x = -2$$ ou $$x = -3$$</option>
        <option>$$x = 0$$ ou $$x = 5$$</option>
    </question>
</quiz>
```

## 🎯 Système de scoring

Le score est calculé selon la formule :
```
Score = Points_Base + Bonus_Temps
Points_Base = 1000 points
Bonus_Temps = max(0, 1000 - (temps_réponse × 20))
```

**Exemple** : Réponse correcte en 5 secondes = 1000 + (1000 - 5×20) = 1900 points

## 🔄 API et Temps réel

### Endpoints principaux
- `POST /create-session` - Créer une session
- `POST /join-session` - Rejoindre une session
- `POST /submit-answer` - Soumettre une réponse
- `GET /session/{id}/participants` - Liste des participants

### Événements temps réel
- `start_quiz` - Démarrage du quiz
- `next_question` - Nouvelle question
- `student_answer` - Réponse d'élève
- `participant_updated` - Mise à jour des scores
- `quiz_finished` - Fin du quiz

## 🛠️ Développement

### Structure du projet
```
mathquiz-supabase/
├── index.html          # Interface professeur
├── student.html        # Interface élève  
├── config.js          # Configuration et API
├── schema.sql         # Schéma base de données
├── supabase/
│   └── functions/
│       └── quiz-sessions/
│           └── index.ts   # Edge Functions
└── README.md
```

### Tests locaux
```bash
# Test avec données fictives
npm run test

# Test Edge Functions
supabase functions serve
```

## 🐛 Dépannage

### Problèmes courants

**Les élèves ne peuvent pas rejoindre**
- Vérifier que la session est en statut "waiting"
- Contrôler la connectivité Supabase

**Scores non mis à jour**
- Vérifier les logs Edge Functions
- S'assurer que Realtime est activé

**Formules mathématiques non affichées**
- Contrôler le chargement de MathJax
- Vérifier la syntaxe LaTeX

### Logs et debug
```javascript
// Activer les logs détaillés
window.CONFIG.DEBUG = true;

// Vérifier la version
console.log(window.CONFIG.VERSION);
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -am 'Ajouter nouvelle fonctionnalité'`)
4. Push la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

## 📄 License

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙋‍♂️ Support

- **Issues** : [GitHub Issues](https://github.com/adatil/mathquiz-supabase/issues)
- **Documentation** : [Wiki du projet](https://github.com/adatil/mathquiz-supabase/wiki)
- **Email** : [Votre email]

## 🎓 Utilisation pédagogique

MathQuiz Live est conçu pour l'enseignement des mathématiques au collège et lycée :

- ✅ **Évaluation formative** en temps réel
- ✅ **Engagement des élèves** avec leurs appareils
- ✅ **Feedback immédiat** pour ajuster l'enseignement
- ✅ **Différenciation** possible selon les résultats
- ✅ **Traces numériques** pour le suivi des progrès

---

**Développé avec ❤️ pour l'éducation**

*Version 2.1.0 - Dernière mise à jour : Juin 2025*