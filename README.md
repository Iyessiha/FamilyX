# FamilyX — Réseau social multi-cercles

## Stack
- **React + Vite** (frontend)
- **Vercel** (déploiement)

## Cercles disponibles
| Cercle | Tag | Statut |
|--------|-----|--------|
| 👨‍👩‍👧‍👦 Famille | FamilyX | ✅ Complet |
| 🕌 Religieux | FaithX | ✅ Complet |
| 🏢 Entreprise | OrgX | 🚧 En cours |
| 🤝 Association | ClubX | 🚧 En cours |

## Pages développées par cercle

### FamilyX
- 🏠 **Accueil** — Feed familial, anniversaires, compositeur de post
- 🌳 **Arbre généalogique** — SVG interactif, 3 générations, fiche membre
- 💬 **Messages** — Chat en temps réel, liste de contacts
- 👥 **Groupes** — Groupes familiaux + événements
- 👤 **Profil** — Édition, sélecteur de rôle, paramètres

### FaithX
- 🕌 **Accueil** — Horaires de prière, verset du jour, feed communauté
- 👥 **Membres** — Liste, recherche, rôles religieux
- 💬 **Messages** — Chat partagé avec FamilyX
- 📅 **Événements** — Prières, cours, actions solidaires
- 👤 **Profil** — Rôle spirituel, statistiques de présence

## Installation locale

```bash
npm install
npm run dev
```

## Déploiement Vercel

### Option 1 — Vercel CLI
```bash
npm install -g vercel
vercel
```

### Option 2 — GitHub + Vercel Dashboard
1. Push ce dossier sur GitHub
2. Aller sur vercel.com → "New Project"
3. Importer le repo GitHub
4. **Framework Preset** : Vite
5. **Build Command** : `npm run build`
6. **Output Directory** : `dist`
7. Cliquer "Deploy" ✅

## Structure du projet
```
src/
├── data/
│   └── themes.js          # Config des 4 cercles
├── context/
│   └── AppContext.jsx      # State global
├── components/
│   └── shared/
│       ├── UI.jsx          # Composants réutilisables
│       └── Layout.jsx      # Sidebar + nav mobile
├── pages/
│   ├── Onboarding.jsx      # Landing → Slides → Choix → Auth
│   ├── CircleApp.jsx       # Router des cercles
│   ├── family/             # Pages FamilyX
│   └── faith/              # Pages FaithX
├── App.jsx
└── main.jsx
```
