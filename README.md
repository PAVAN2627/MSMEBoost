# MSMEBoost 🚀

**AI-Powered Business Management Platform for Indian MSMEs**

MSMEBoost is a comprehensive, real-time business management platform designed specifically for Micro, Small, and Medium Enterprises (MSMEs) in India. Built with React, TypeScript, Firebase, and Google Gemini AI, it provides intelligent insights and automation to help MSMEs grow efficiently.

---

## 🌟 Key Features

### 1. **Operations Management**
- Track production orders and service projects
- Real-time order status monitoring (Pending, In Progress, Completed)
- Capacity planning and resource allocation
- Auto-generate analytics from order data
- Edit and delete functionality with full CRUD operations

### 2. **Performance Analytics**
- Real-time dashboards with interactive charts
- Financial metrics (Revenue, Costs, Profit Margins)
- Production efficiency tracking
- Machine utilization monitoring
- Trend analysis and forecasting

### 3. **AI Business Advisor** 🤖
- Powered by Google Gemini AI
- Personalized business advice based on your actual data
- Context-aware recommendations
- Chat history saved to Firebase
- Understands your complete business profile:
  - Business type, industry, location
  - Orders, revenue, costs
  - Equipment efficiency
  - Innovation projects
  - Sustainability metrics

### 4. **Infrastructure Assessment**
- Dynamic equipment tracking
- Real-time infrastructure score calculation
- Equipment health monitoring
- Maintenance alerts
- Condition-based recommendations
- Edit/delete equipment records

### 5. **Innovation Tracker**
- R&D project management
- Progress tracking with visual indicators
- Technology adoption monitoring
- Innovation score calculation
- Project categorization

### 6. **Sustainability & Resources**
- Energy consumption tracking (kWh)
- Water usage monitoring (Liters)
- Waste management (Generated vs Recycled)
- Carbon footprint calculation (auto-computed)
- Renewable energy percentage tracking
- Comprehensive data table with edit/delete
- Eco-friendly recommendations

### 7. **Government Schemes Finder**
- AI-powered scheme discovery
- Filtered by business type, industry, and location
- Detailed scheme information:
  - Eligibility criteria
  - Financial benefits
  - Application process
  - Official website links
- Save and view search history
- 100+ government schemes database

### 8. **Reports & Notifications**
- Comprehensive business reports
- Download reports as text files
- Smart notifications based on real data:
  - Overdue orders
  - Equipment maintenance needs
  - Low efficiency alerts
  - Financial performance insights
  - Sustainability recommendations

### 9. **Settings & Profile Management**
- User profile management
- Business information configuration
- Notification preferences
- Appearance settings
- Account security

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling
- **shadcn/ui** - UI components
- **Recharts** - Data visualization
- **Framer Motion** - Animations
- **React Router** - Navigation

### Backend & Services
- **Firebase Authentication** - User management
- **Cloud Firestore** - Real-time database
- **Google Gemini AI** - AI-powered advisor
- **Firebase Security Rules** - Data protection

### Development Tools
- **ESLint** - Code linting
- **Vitest** - Unit testing
- **PostCSS** - CSS processing

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Firebase Account** (free tier works)
- **Google AI API Key** (for Gemini AI)

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd msmeboost
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Firebase Setup

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Authentication** → Email/Password
4. Enable **Firestore Database**

#### Get Firebase Configuration
1. Go to Project Settings → General
2. Scroll to "Your apps" → Web app
3. Copy the Firebase configuration

#### Configure Environment Variables
Create a `.env` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google AI Configuration
VITE_GOOGLE_AI_API_KEY=your_gemini_api_key_here
```

### 4. Set Up Firestore Security Rules

1. Go to Firebase Console → Firestore Database → Rules
2. Copy the content from `firestore.rules` file
3. Paste into Firebase Console
4. Click **Publish**

The rules ensure:
- Users can only access their own data
- All operations require authentication
- Proper security for all 10 collections

### 5. Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file

---

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```
Access at: `http://localhost:5173`

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

---

## 📊 Database Collections

MSMEBoost uses 10 Firestore collections:

| Collection | Purpose |
|------------|---------|
| `production_orders` | Production/service orders |
| `analytics` | Performance metrics |
| `machines` | Machine/resource data |
| `equipment` | Infrastructure equipment |
| `infrastructure_scores` | Infrastructure assessments |
| `innovation_projects` | R&D projects |
| `sustainability` | Environmental data |
| `users` | User profiles |
| `chat_history` | AI advisor conversations |
| `government_schemes` | Saved scheme searches |

---

## 🔐 Security Features

- **Firebase Authentication** - Secure user login
- **Row-level Security** - Users can only access their own data
- **Environment Variables** - Sensitive keys protected
- **Firestore Rules** - Server-side validation
- **HTTPS Only** - Secure data transmission

---

## 🎯 User Workflow

### 1. Registration & Login
- Sign up with email and password
- Provide business details (type, industry, size, location)
- Profile saved to Firestore

### 2. Dashboard Overview
- View key metrics and KPIs
- Quick access to all modules
- Real-time data updates

### 3. Operations Management
- Add production orders or service projects
- Track status and deadlines
- Auto-generate analytics data
- Edit/delete orders as needed

### 4. Analytics & Insights
- View financial performance
- Monitor production efficiency
- Analyze trends with charts
- Download reports

### 5. AI Advisor Consultation
- Ask business questions
- Get personalized recommendations
- Save important conversations
- Review chat history

### 6. Infrastructure Management
- Add equipment and resources
- Track efficiency and condition
- Get maintenance alerts
- View dynamic infrastructure score

### 7. Innovation Tracking
- Create R&D projects
- Monitor progress
- Track technology adoption
- Measure innovation score

### 8. Sustainability Monitoring
- Log resource usage
- Track carbon footprint
- Monitor recycling rates
- Get eco-friendly tips
- Edit/delete records

### 9. Government Schemes
- Search for relevant schemes
- Filter by business criteria
- Save useful searches
- Access scheme history

---

## 🌐 Supported Business Types

- **Manufacturing** - Production-based businesses
- **Service-based** - Service providers
- **Hybrid** - Manufacturing + Services
- **Trading** - Buy and sell businesses
- **Retail** - Retail stores

---

## 📱 Responsive Design

MSMEBoost is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review Firebase setup guide

---

## 🎉 Acknowledgments

- **Firebase** - Backend infrastructure
- **Google Gemini AI** - AI capabilities
- **shadcn/ui** - UI components
- **Recharts** - Data visualization
- **Indian MSME Community** - Inspiration and feedback

---

## 📈 Future Enhancements

- [ ] Multi-language support (Hindi, Tamil, etc.)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics with ML predictions
- [ ] Integration with accounting software
- [ ] Inventory management module
- [ ] Employee management
- [ ] Customer relationship management (CRM)
- [ ] Invoice generation
- [ ] Payment gateway integration

---

## 🔗 Important Links

- [Firebase Console](https://console.firebase.google.com/)
- [Google AI Studio](https://makersuite.google.com/)
- [Ministry of MSME](https://msme.gov.in/)
- [Udyam Registration](https://udyamregistration.gov.in/)

---

**Built with ❤️ for Indian MSMEs**

*Empowering small businesses with AI-powered insights and automation*
