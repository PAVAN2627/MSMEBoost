# 🏭 Udyog AI - MSME Modernization Platform

A comprehensive digital platform designed to support Micro, Small, and Medium Enterprises (MSMEs) in India with tools for production planning, performance analytics, infrastructure assessment, and AI-powered business advisory.

## 🌟 Features

### 📊 Production Management
- Real-time production order tracking
- Machine monitoring and efficiency metrics
- Status management (Pending, In Progress, Completed)
- Due date tracking and alerts

### 📈 Performance Analytics
- Daily, weekly, and monthly production insights
- Machine utilization tracking
- Revenue vs operational cost analysis
- KPI dashboards with trend visualization

### 🏗️ Infrastructure Assessment
- Equipment inventory management
- Health and efficiency monitoring
- Maintenance scheduling
- Infrastructure scoring system

### 💡 Innovation Tracker
- R&D project management
- Technology adoption tracking
- Progress monitoring with milestones
- Innovation score calculation

### 🤖 AI Business Advisor
- Powered by Google Gemini AI
- Real-time business consultation
- Personalized recommendations
- 24/7 availability

### 🏛️ Government Schemes Finder
- AI-powered scheme discovery
- Personalized recommendations based on:
  - Business type
  - Industry sector
  - Location
- Detailed eligibility and application information

### 🌱 Sustainability & Reports
- Environmental impact tracking
- Compliance monitoring
- Custom report generation

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: React Router v6
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Backend**: Firebase (Authentication + Firestore)
- **AI**: Google Gemini API
- **Build Tool**: Vite
- **Testing**: Vitest

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase account
- Google AI API key

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd udyog-ai-assistant
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google Gemini AI Configuration
VITE_GOOGLE_AI_API_KEY=your_google_ai_api_key
```

4. **Configure Firebase**

- Go to [Firebase Console](https://console.firebase.google.com)
- Create a new project or select existing
- Enable **Authentication** (Email/Password provider)
- Enable **Firestore Database**
- Copy your config values to `.env`

5. **Get Google AI API Key**

- Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
- Create a new API key
- Add it to `.env` as `VITE_GOOGLE_AI_API_KEY`

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```
Access the app at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Run Tests
```bash
npm run test
```

## 📁 Project Structure

```
udyog-ai-assistant/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── dashboard/       # Dashboard-specific components
│   │   ├── landing/         # Landing page sections
│   │   └── ui/              # shadcn/ui components
│   ├── pages/               # Page components
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── Production.tsx   # Production management
│   │   ├── Analytics.tsx    # Performance analytics
│   │   ├── Infrastructure.tsx
│   │   ├── Innovation.tsx
│   │   ├── AIAdvisor.tsx    # AI chat interface
│   │   ├── Schemes.tsx      # Government schemes
│   │   └── ...
│   ├── services/            # API and business logic
│   │   ├── productionService.ts
│   │   ├── analyticsService.ts
│   │   ├── innovationService.ts
│   │   ├── infrastructureService.ts
│   │   └── googleAIService.ts
│   ├── hooks/               # Custom React hooks
│   │   └── useAuth.ts       # Authentication hook
│   ├── lib/                 # Utilities and configs
│   │   ├── firebase.ts      # Firebase initialization
│   │   └── utils.ts         # Helper functions
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── public/                  # Static assets
├── .env                     # Environment variables (not in git)
├── .env.example             # Environment template
├── package.json
├── vite.config.ts
└── README.md
```

## 🔐 Authentication

The platform uses Firebase Authentication with email/password:

1. **Register**: Create a new account with business details
2. **Login**: Access your dashboard
3. **Protected Routes**: All dashboard pages require authentication

## 💾 Database Structure

### Firestore Collections

**production_orders**
```javascript
{
  userId: string,
  orderId: string,
  customer: string,
  product: string,
  quantity: number,
  status: 'pending' | 'in-progress' | 'completed',
  dueDate: Timestamp,
  createdAt: Timestamp
}
```

**analytics**
```javascript
{
  userId: string,
  date: Timestamp,
  revenue: number,
  production: number,
  efficiency: number,
  costs: number,
  type: 'daily' | 'weekly' | 'monthly'
}
```

**machines**
```javascript
{
  userId: string,
  machineName: string,
  efficiency: number,
  capacity: number,
  used: number,
  status: 'operational' | 'maintenance' | 'offline',
  lastUpdated: Timestamp
}
```

**innovation_projects**
```javascript
{
  userId: string,
  name: string,
  status: 'Planning' | 'In Progress' | 'R&D' | 'Completed',
  category: string,
  progress: number,
  startDate: Timestamp,
  targetDate: Timestamp,
  createdAt: Timestamp
}
```

**equipment**
```javascript
{
  userId: string,
  name: string,
  age: string,
  condition: string,
  efficiency: number,
  status: 'operational' | 'needs-maintenance' | 'upgrade-needed'
}
```

## 🎨 Customization

### Theme Colors
Edit `tailwind.config.ts` to customize the color scheme:
```typescript
colors: {
  primary: "...",
  secondary: "...",
  // ... more colors
}
```

### Components
All UI components are in `src/components/ui/` and can be customized using Tailwind classes.

## 🐛 Troubleshooting

### Firebase Errors
- **"Missing or insufficient permissions"**: Enable Firestore and set up security rules
- **"Auth domain not authorized"**: Add your domain to Firebase authorized domains

### API Key Issues
- **"API key not valid"**: Check if the key is correctly set in `.env`
- **"Quota exceeded"**: Check your Google AI API usage limits

### Build Issues
- Clear cache: `rm -rf node_modules package-lock.json && npm install`
- Check Node version: `node --version` (should be 18+)

### Browser Cache
If you see old data after updates:
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear browser cache completely

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Lint code

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built for PS10 - Integrated Digital Platform for MSME Modernization
- Powered by Google Gemini AI
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check existing documentation
- Review troubleshooting guide

---

**Made with ❤️ for Indian MSMEs**
