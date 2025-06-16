# 🧮 MathQuiz - Quiz Interactifs de Mathématiques

Application web interactive pour créer et jouer des quiz de mathématiques en temps réel, propulsée par **Supabase**.

[![Déploiement](https://img.shields.io/badge/Déployé-GitHub%20Pages-success)](https://adatil.github.io/mathquiz-supabase/)
[![Backend](https://img.shields.io/badge/Backend-Supabase-green)](https://supabase.com)
[![Frontend](https://img.shields.io/badge/Frontend-Vanilla%20JS-yellow)](https://developer.mozilla.org/fr/docs/Web/JavaScript)

## 🌐 Accès Direct

- **👨‍🏫 Interface Professeur :** https://adatil.github.io/mathquiz-supabase/
- **👨‍🎓 Interface Élève :** https://adatil.github.io/mathquiz-supabase/student.html

## ✨ Fonctionnalités

### 🎯 **Interface Professeur**
- ✅ Création de quiz interactifs
- ✅ Gestion de sessions en temps réel  
- ✅ Codes de salle automatiques (6 caractères)
- ✅ Suivi des participants en direct
- ✅ Support LaTeX pour formules mathématiques
- ✅ Import/Export XML compatible Moodle
- ✅ Tableau de bord intuitif

### 📱 **Interface Élève**  
- ✅ Connexion rapide par code de salle
- ✅ Interface responsive mobile-first
- ✅ Participation en temps réel
- ✅ Affichage des formules mathématiques
- ✅ Feedback immédiat
- ✅ Classements en direct

### 🔧 **Fonctionnalités Techniques**
- ✅ Base de données PostgreSQL (Supabase)
- ✅ Edge Functions pour WebSocket temps réel
- ✅ API REST complète
- ✅ Déploiement automatique GitHub Pages
- ✅ Support PWA ready
- ✅ Configuration centralisée

## 🚀 Utilisation Rapide

### **Pour les Professeurs :**

1. **Aller sur :** https://adatil.github.io/mathquiz-supabase/
2. **Créer un quiz** ou importer un fichier XML  
3. **Lancer une session** → Un code de salle est généré
4. **Partager le code** avec vos élèves
5. **Animer le quiz** en temps réel !

### **Pour les Élèves :**

1. **Aller sur :** https://adatil.github.io/mathquiz-supabase/student.html
2. **Entrer le code de salle** (6 caractères)
3. **Saisir votre prénom**
4. **Participer au quiz !**

*💡 **Code de test :** Utilisez `DEMO01` pour tester l'interface*

## 🛠️ Architecture Technique

### **Frontend**
- **HTML5/CSS3/JavaScript** - Interface utilisateur
- **MathJax 3** - Rendu des formules LaTeX
- **Supabase Client** - Connexion base de données
- **WebSocket** - Communication temps réel

### **Backend (Supabase)**
- **PostgreSQL** - Base de données relationnelle
- **Edge Functions** - API REST + WebSocket
- **Row Level Security** - Sécurité avancée
- **Triggers automatiques** - Cohérence des données

### **Hébergement**
- **GitHub Pages** - Hébergement gratuit et fiable
- **CDN Global** - Performance mondiale optimisée
- **HTTPS automatique** - Sécurité incluse

## 📊 Structure de la Base de Données

```sql
📋 Tables principales :
├── quizzes              # Quiz créés par les professeurs
├── quiz_questions       # Questions avec options multiples  
├── quiz_sessions        # Sessions de jeu en temps réel
├── session_participants # Élèves connectés
└── student_answers      # Réponses et scoring
```

## 🔗 APIs Disponibles

### **Supabase Edge Functions**

```javascript
// Configuration
const SUPABASE_URL = 'https://ctakwbfqkcfqfwkdqedl.supabase.co'

// API REST
GET    /functions/v1/quiz-api/quizzes        # Lister les quiz
POST   /functions/v1/quiz-api/quizzes        # Créer un quiz  
DELETE /functions/v1/quiz-api/quizzes/:id    # Supprimer un quiz

// WebSocket temps réel
WSS    /functions/v1/quiz-websocket          # Communication temps réel
```

## 📁 Structure du Projet

```
mathquiz-supabase/
├── docs/                    # GitHub Pages (frontend)
│   ├── index.html          # Interface Professeur
│   ├── student.html        # Interface Élève  
│   └── config.js           # Configuration Supabase
├── supabase/               # Backend (déployé séparément)
│   ├── migrations/         # Schema base de données
│   └── functions/          # Edge Functions
│       ├── quiz-api/       # API REST
│       └── quiz-websocket/ # WebSocket
└── README.md               # Documentation
```

## 🎓 Cas d'Usage Pédagogiques

### **Mathématiques Lycée**
- Équations du second degré
- Fonctions et dérivées  
- Géométrie analytique
- Probabilités et statistiques
- Suites numériques

### **Mathématiques Collège**  
- Calcul mental
- Fractions et pourcentages
- Géométrie plane
- Proportionnalité
- Équations du premier degré

### **Avantages Pédagogiques**
- **Engagement** : Gamification de l'apprentissage
- **Évaluation** : Feedback immédiat pour les élèves
- **Analyse** : Statistiques détaillées pour les professeurs
- **Accessibilité** : Fonctionne sur smartphones/tablettes
- **Flexibilité** : Import depuis Moodle/ELea

## 🔧 Installation Locale (Développeurs)

```bash
# Cloner le repository
git clone https://github.com/adatil/mathquiz-supabase.git
cd mathquiz-supabase

# Serveur local simple
python -m http.server 8000
# ou
npx serve docs

# Accès local
# Professeur: http://localhost:8000/
# Élève: http://localhost:8000/student.html
```

## 🚀 Déploiement

Le projet est automatiquement déployé sur **GitHub Pages** à chaque push sur la branche `main`.

**URLs de production :**
- Interface Professeur : https://adatil.github.io/mathquiz-supabase/
- Interface Élève : https://adatil.github.io/mathquiz-supabase/student.html

## 📋 Format XML Moodle

Exemple de fichier XML compatible :

```xml
<?xml version="1.0" encoding="UTF-8"?>
<quiz title="Équations - Seconde">
    <question time="45" correct="0">
        <text>Résoudre : $$x^2 - 5x + 6 = 0$$</text>
        <option>$$x = 2$$ ou $$x = 3$$</option>
        <option>$$x = 1$$ ou $$x = 6$$</option>
        <option>$$x = -2$$ ou $$x = -3$$</option>
        <option>$$x = 0$$ ou $$x = 5$$</option>
    </question>
</quiz>
```

## 🤝 Contribution

Les contributions sont les bienvenues ! 

1. **Fork** le repository
2. **Créer** une branche pour votre fonctionnalité
3. **Commiter** vos changements  
4. **Pusher** vers la branche
5. **Ouvrir** une Pull Request

## 📞 Support

- **Issues :** [GitHub Issues](https://github.com/adatil/mathquiz-supabase/issues)
- **Documentation :** Ce README + commentaires dans le code
- **Démo :** Testez avec le code `DEMO01`

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🎯 Roadmap

### **Version 1.1** (En cours)
- [ ] WebSocket temps réel complet
- [ ] Interface de création de quiz avancée
- [ ] Statistiques détaillées
- [ ] Export PDF des résultats

### **Version 1.2** (Planifié)  
- [ ] Authentification des professeurs
- [ ] Gestion des classes
- [ ] Mode évaluation avec notes
- [ ] Application mobile (PWA)

### **Version 1.3** (Futur)
- [ ] IA pour génération de questions
- [ ] Tableau de bord analytics avancé
- [ ] Multi-langues (EN, ES)
- [ ] API publique

---

**🎉 Développé avec ❤️ pour l'enseignement des mathématiques**

[![Supabase](https://img.shields.io/badge/Propulsé%20par-Supabase-success)](https://supabase.com)
[![GitHub Pages](https://img.shields.io/badge/Hébergé%20sur-GitHub%20Pages-blue)](https://pages.github.com)