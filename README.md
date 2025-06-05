# 💰 BudgetPlanner

Ein moderner, intuitiver Finanztracker für persönliches Budgetmanagement. Entwickelt mit React, TypeScript, Vite und Supabase. Behalte die Kontrolle über deine Finanzen mit leistungsstarken Budgetierungs-Tools, Ausgabenverfolgung und aussagekräftigen Analytics.

![BudgetPlanner](https://img.shields.io/badge/Status-Active-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)

## ✨ Features

### 📊 **Dashboard & Übersicht**

- Monatliche Budgetübersicht auf einen Blick
- Aktuelle Ausgaben vs. geplantes Budget
- Spar-Rate Berechnung mit detaillierter Aufschlüsselung
- Schnellzugriff auf wichtigste Funktionen

### 💸 **Ausgabenverfolgung**

- Einfache und schnelle Ausgabenerfassung
- Kategoriezuordnung mit individuellen Farben
- Datum und Beschreibung für jede Transaktion
- Bearbeitung und Löschung bestehender Ausgaben

### 📂 **Kategorie-Management**

- Erstelle benutzerdefinierte Ausgabenkategorien
- Individuelle Farbcodierung für bessere Übersicht
- Standard-Budgets pro Kategorie
- Aktivierung/Deaktivierung von Kategorien

### 💰 **Budget-Planung**

- Monatliche Einkommensplanung
- Budget-Zuteilung pro Kategorie
- Geplant vs. Ist-Vergleich
- Automatische Berechnung verbleibendes Budget

### 📈 **Analytics & Auswertungen**

- **Ausgaben-Trend**: Liniendiagramm der monatlichen Entwicklung
- **Kategorie-Vergleich**: Balkendiagramm Geplant vs. Tatsächlich
- **Top-Kategorien**: Ranking der höchsten Ausgabenbereiche
- **Historischer Vergleich**: Gestapeltes Balkendiagramm über 12 Monate
- Detaillierte Statistiken und Trend-Analysen

### 🔒 **Sicherheit & Authentifizierung**

- Sichere Benutzeranmeldung über Supabase Auth
- Row Level Security (RLS) für Datenschutz
- Persönliche Daten nur für eigenen Account sichtbar

## 🛠️ Tech Stack

### **Frontend**

- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool & Dev Server
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI Component Library
- **Recharts** - Datenvisualisierung

### **Backend & Database**

- **Supabase** - Backend-as-a-Service
  - PostgreSQL Database
  - Authentication
  - Row Level Security
  - Real-time subscriptions

### **Routing & State**

- **React Router** - Client-side Routing
- **React Context** - State Management
- **Custom Hooks** - Geschäftslogik

## 🚀 Installation & Setup

### **Voraussetzungen**

- Node.js (Version 18 oder höher)
- npm oder yarn
- Supabase Account

### **1. Repository klonen**

```bash
git clone https://github.com/ReSchn/BudgetPlanner.git
cd BudgetPlanner
```

### **2. Dependencies installieren**

```bash
npm install
```

### **3. Umgebungsvariablen konfigurieren**

```bash
cp .env.example .env.local
```

Fülle deine Supabase Credentials ein:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **4. Datenbank Setup**

Führe die SQL-Scripte in deinem Supabase SQL Editor aus:

```sql
-- Erstelle die Tabellen (siehe migrations/ Ordner)
-- Oder verwende Supabase CLI:
supabase db push
```

### **5. Development Server starten**

```bash
npm run dev
```

### **6. Öffne die Anwendung**

Navigiere zu `http://localhost:5173`

## 📁 Projektstruktur

```
src/
├── components/          # Wiederverwendbare UI Komponenten
│   ├── ui/             # shadcn/ui Basis-Komponenten
│   ├── forms/          # Formular-Komponenten
│   └── layout/         # Layout-Komponenten (Sidebar, AppLayout)
├── pages/              # Hauptseiten-Komponenten
│   ├── Dashboard.tsx   # Dashboard-Übersicht
│   ├── Categories.tsx  # Kategorie-Management
│   ├── Budget.tsx      # Budget-Planung
│   ├── Expenses.tsx    # Ausgaben-Tracking
│   └── Analytics.tsx   # Auswertungen & Charts
├── hooks/              # Custom React Hooks
│   ├── useCategories.ts    # Kategorie-Management
│   ├── useExpenses.ts      # Ausgaben-Verwaltung
│   └── useMonthlyBudgets.ts # Budget-Logik
├── context/            # React Context für Auth
├── lib/                # Externe Library-Konfigurationen
├── utils/              # Utility-Funktionen
└── types/              # TypeScript Type-Definitionen
```

## 📊 Datenbank Schema

Die Anwendung verwendet folgende Haupttabellen:

- **`categories`** - Ausgabenkategorien (Miete, Lebensmittel, etc.)
- **`monthly_budgets`** - Monatliche Budget-Planung mit Einkommen
- **`budget_items`** - Geplante Beträge pro Kategorie pro Monat
- **`expenses`** - Einzelne Ausgaben-Datensätze

Detailliertes Schema findest du im `/migrations` Ordner.

## 🎯 Hauptfunktionen im Detail

### **Dashboard**

- Übersicht aktueller Monat
- Spar-Rate mit intelligenter Berechnung
- Schnelle Ausgaben-Erfassung
- Top-Kategorien Anzeige

### **Ausgaben-Management**

- Drag & Drop für einfache Bedienung
- Kategoriefilter und Sortierung
- Bearbeitung einzelner Transaktionen
- Monatliche Übersichten

### **Budget-Planung**

- Flexibles Einkommens-Management
- Kategorie-basierte Budget-Verteilung
- Automatische Berechnungen
- Überschreitungs-Warnungen

### **Analytics-Dashboard**

- **Ausgaben-Trend**: 6-Monats-Verlauf mit echten vs. Sparen-Ausgaben
- **Kategorie-Vergleich**: Detaillierte Soll/Ist-Analyse mit Tooltips
- **Historische Auswertung**: 12-Monats-Vergleich nach Kategorien
- Responsive Charts mit Recharts-Integration

## 🔧 Verfügbare Scripts

```bash
npm run dev          # Development Server starten
npm run build        # Produktions-Build erstellen
npm run preview      # Produktions-Build lokal testen
npm run lint         # ESLint ausführen
npm run type-check   # TypeScript Typen prüfen
```

## 🤝 Contributing

Beiträge sind willkommen! Bitte beachte:

1. Fork das Repository
2. Erstelle einen Feature Branch: `git checkout -b feature/new-feature`
3. Committe deine Änderungen: `git commit -m "feat: add new feature"`
4. Push den Branch: `git push origin feature/new-feature`
5. Erstelle einen Pull Request

Wir folgen [Conventional Commits](https://www.conventionalcommits.org/) für Commit-Nachrichten.

## 📄 Lizenz

Dieses Projekt steht unter der MIT Lizenz - siehe [LICENSE](LICENSE) Datei für Details.

## 🚧 Roadmap

### **Phase 1** ✅ **Fertig**

- Core Funktionalität (Budget-Setup, Ausgaben-Tracking)
- Basis Analytics mit Recharts
- Responsive Design

### **Phase 2** 🔄 **Geplant**

- PDF Export für Reports
- Erweiterte Filteroptionen
- Bank-CSV Import

### **Phase 3** 📋 **Zukunft**

- Mobile App (React Native)
- Geteilte Budgets (Familie/WG)
- KI-basierte Ausgaben-Kategorisierung

## 💬 Support

Falls du Fragen hast oder Hilfe benötigst:

- Erstelle ein [Issue](https://github.com/ReSchn/BudgetPlanner/issues) für Bugs oder Feature-Requests
- Starte eine [Discussion](https://github.com/ReSchn/BudgetPlanner/discussions) für allgemeine Fragen

## 🙏 Credits

- [shadcn/ui](https://ui.shadcn.com/) für die wunderschönen UI Komponenten
- [Supabase](https://supabase.com/) für die Backend-Infrastruktur
- [Recharts](https://recharts.org/) für die Datenvisualisierung
- [Lucide Icons](https://lucide.dev/) für das Icon-Set

---

_Made with ❤️ for better financial management_
