# 💰 Budgettracker

A modern, intuitive personal finance tracker built with React, TypeScript, and Supabase. Take control of your finances with powerful budgeting tools, expense tracking, and insightful analytics.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)

## ✨ Features

- 📊 **Monthly Budget Planning** - Set and manage budgets for different categories
- 💸 **Expense Tracking** - Quick and easy expense recording with categories
- 📈 **Visual Analytics** - Beautiful charts and graphs to understand spending patterns
- 🏦 **Multi-Category Support** - Customize categories for your lifestyle (rent, groceries, entertainment, etc.)
- 📱 **Responsive Design** - Works perfectly on desktop and mobile devices
- 🔒 **Secure Authentication** - Personal data protection with Supabase Auth
- 📅 **Historical Data** - Track trends and compare months over time
- 🎯 **Savings Goals** - Monitor your progress toward financial goals

## 🚀 Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **UI Framework:** shadcn/ui + Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Real-time)
- **Charts:** Recharts
- **Routing:** React Router
- **State Management:** React Context + Custom Hooks

## 📦 Installation

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- Supabase account

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/[your-username]/budgettracker.git
   cd budgettracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   - Run the SQL scripts in the `migrations/` folder in your Supabase SQL editor
   - Or use the Supabase CLI: `supabase db push`

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🗃️ Database Schema

The application uses the following main tables:

- `categories` - Budget categories (rent, food, entertainment, etc.)
- `monthly_budgets` - Planned budget amounts per category per month
- `monthly_income` - Monthly income tracking
- `expenses` - Individual expense records

Detailed schema and migrations are available in the `/migrations` folder.

## 🛠️ Development

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── forms/          # Form components
│   ├── charts/         # Chart components
│   └── layout/         # Layout components
├── pages/              # Page components
│   ├── dashboard/      # Dashboard page
│   ├── categories/     # Categories management
│   ├── budget/         # Budget setup
│   ├── expenses/       # Expense tracking
│   └── analytics/      # Analytics and reports
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
└── lib/                # External library configurations
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Git Workflow

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes and commit: `git commit -m "feat: add new feature"`
3. Push to your branch: `git push origin feature/your-feature-name`
4. Create a Pull Request

We follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a Pull Request.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

- [ ] **Phase 1:** Core functionality (budget setup, expense tracking)
- [ ] **Phase 2:** Advanced analytics and reporting
- [ ] **Phase 3:** Mobile app (React Native)
- [ ] **Phase 4:** Collaborative budgeting (family/shared accounts)
- [ ] **Phase 5:** Bank integration and automatic categorization

## 📞 Support

If you have any questions or need help, please:

1. Check the [Issues](https://github.com/[your-username]/budgettracker/issues) for existing discussions
2. Create a new issue with detailed information
3. Join our [Discussions](https://github.com/[your-username]/budgettracker/discussions) for general questions

## 📸 Screenshots

*Screenshots will be added as the application develops*

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Recharts](https://recharts.org/) for the data visualization
- [Lucide Icons](https://lucide.dev/) for the icon set

---

Made with ❤️ for better financial management
