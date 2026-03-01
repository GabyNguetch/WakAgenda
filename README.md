# WakAgenda – Frontend Next.js

Agenda interactif des stagiaires de la SABC (DSI).

## 🚀 Installation

```bash
npm install
```

## ⚙️ Configuration

Copiez le fichier `.env.local.example` en `.env.local` et ajustez l'URL de l'API :

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🖥️ Lancement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

## 📁 Architecture du projet

```
wakagenda/
├── app/                      # Pages Next.js (App Router)
│   ├── auth/page.tsx         # Connexion & Onboarding
│   ├── dashboard/page.tsx    # Tableau de bord
│   ├── tasks/page.tsx        # Gestion des tâches
│   ├── calendar/page.tsx     # Vue calendrier
│   ├── notifications/page.tsx
│   ├── reports/page.tsx
│   ├── profile/page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                   # Composants UI réutilisables (Button, Input, Card, Modal…)
│   ├── layout/               # Sidebar, Header, DashboardLayout
│   └── features/             # Composants métier (TaskCard, TaskForm, StatsCharts…)
├── hooks/                    # Hooks React (useAuth, useNotifications)
├── lib/                      # apiClient, utils
├── services/                 # Couche API (authService, taskService, userService, notificationService, reportService)
├── types/                    # TypeScript types
└── tailwind.config.ts
```

## 🎨 Design

- **Couleurs SABC** : Rouge `#C8102E`, Orange `#E8600A`
- **Dark/Light mode** : Automatique selon le thème du navigateur
- **Animations** : Fade-in, slide-up, scale-in, stagger pour les listes
- **Typographie** : DM Sans (Google Fonts)
- **Icons** : Lucide React

## 🔐 Sécurité

Le token JWT est stocké dans `localStorage` et envoyé automatiquement dans le header `Authorization: Bearer ...` de chaque requête API.