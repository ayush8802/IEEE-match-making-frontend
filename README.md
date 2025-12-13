# IEEE Matchmaking Frontend

Frontend React application for the IEEE Matchmaking Platform, providing an intuitive interface for researchers to connect, chat, and find collaboration opportunities.

## 🚀 Features

- **User Authentication** - Sign up, login, password reset via Supabase Auth
- **Questionnaire** - Pre-fillable research profile questionnaire
- **Researcher Matching** - AI-powered researcher recommendations
- **Session Recommendations** - Personalized conference session suggestions
- **Real-time Chat** - WhatsApp-style messaging with status indicators
- **Message Moderation** - Visual feedback for blocked messages
- **Contact Support** - Integrated contact form
- **Responsive Design** - Modern, dark-themed UI
- **Protected Routes** - Authentication-based route guards

## 📋 Prerequisites

- Node.js >= 20.x
- npm >= 9.x
- Supabase account and project
- Backend API server (local or deployed)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/IEEE-Metaverse/IEEE-matchmaking-frontend.git
   cd IEEE-matchmaking-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_project_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   REACT_APP_API_URL=http://localhost:5000/api/v1
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will run on `http://localhost:3000`

## 🚂 Railway Deployment

This frontend is configured for deployment on [Railway](https://railway.app).

### Step 1: Connect Repository

1. Go to [Railway Dashboard](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account
5. Select `IEEE-Metaverse/IEEE-matchmaking-frontend`

### Step 2: Configure Service

1. Railway will auto-detect the React project
2. Set the **Root Directory** to `/` (root of the repo)
3. Railway will use `railway.json` for configuration

### Step 3: Set Environment Variables

In Railway dashboard, add these environment variables:

**Required:**
```
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_API_URL=https://your-backend.up.railway.app/api/v1
```

**Note:** 
- Replace `your-backend.up.railway.app` with your actual backend Railway URL
- Railway automatically sets `PORT` - the start script uses it automatically

### Step 4: Deploy

1. Railway will automatically:
   - Install dependencies (`npm install`)
   - Build the React app (`npm run build`)
   - Start the server (`npm start`)
2. Railway will assign a public URL (e.g., `https://your-frontend.up.railway.app`)

### Step 5: Update Backend CORS

Update your backend's `FRONTEND_URL` environment variable to your frontend Railway URL:
```
FRONTEND_URL=https://your-frontend.up.railway.app
```

## 🏗️ Project Structure

```
frontend/
├── public/              # Static assets
│   ├── index.html
│   └── ...
├── src/
│   ├── components/      # Reusable components
│   │   ├── Chat/        # Chat components
│   │   │   ├── ChatWindow.js
│   │   │   ├── ConversationList.js
│   │   │   └── ...
│   │   ├── Navbar.js
│   │   ├── Footer.js
│   │   └── ...
│   ├── config/          # Configuration
│   │   ├── api.js       # API endpoints
│   │   └── supabase.js  # Supabase client
│   ├── contexts/        # React contexts
│   │   ├── AuthContext.js
│   │   └── ThemeContext.js
│   ├── pages/           # Page components
│   │   ├── Chat.js
│   │   ├── Questionnaire.js
│   │   ├── ResearcherRecommendation.js
│   │   └── ...
│   ├── services/        # API services
│   │   ├── api.js
│   │   ├── conversationService.js
│   │   └── questionnaireService.js
│   ├── styles/          # CSS files
│   ├── utils/           # Utilities
│   ├── App.js           # Main app component
│   └── index.js         # Entry point
├── .env.example         # Environment variables template
├── .gitignore
├── package.json
├── railway.json         # Railway deployment config
└── README.md
```

## 📚 Available Scripts

- `npm start` - Serve production build (uses PORT from Railway)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REACT_APP_SUPABASE_URL` | Yes | - | Supabase project URL |
| `REACT_APP_SUPABASE_ANON_KEY` | Yes | - | Supabase anonymous key |
| `REACT_APP_API_URL` | Yes | - | Backend API base URL |

**Note:** All environment variables must be prefixed with `REACT_APP_` to be accessible in the React app.

## 🎨 Features Overview

### Authentication
- User registration and login
- Email verification
- Password reset via email
- Protected routes with automatic redirects

### Questionnaire
- Pre-fillable form with saved responses
- Editable fields
- Research profile data collection

### Researcher Matching
- AI-powered recommendations
- Mutual interest matching
- Profile viewing

### Real-time Chat
- WhatsApp-style interface
- Message status indicators (sent/delivered/read)
- Unread message counts
- Typing indicators
- Message moderation warnings

### Session Recommendations
- Personalized conference sessions
- Based on research interests

## 🔒 Security

- Environment variables are never committed to git
- Authentication tokens stored securely
- Protected routes prevent unauthorized access
- API calls include authentication headers
- CORS handled by backend

## 🐛 Troubleshooting

### Build fails

**Error: Missing environment variables**
- Ensure all `REACT_APP_*` variables are set
- Check `.env` file exists and is properly formatted
- Restart the dev server after changing `.env`

**Error: Module not found**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

### API calls failing

**Error: Network request failed**
- Verify `REACT_APP_API_URL` is correct
- Check that backend server is running
- Check browser console for CORS errors

**Error: 401 Unauthorized**
- User may not be logged in
- Token may have expired - try logging out and back in
- Check Supabase authentication status

### Socket.io connection issues

**WebSocket connection failed**
- Verify backend is running
- Check `REACT_APP_API_URL` points to correct backend
- Check browser console for connection errors

### Styling issues

**Styles not loading**
- Clear browser cache
- Check that CSS files are imported correctly
- Verify build completed successfully

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📞 Support

For issues and questions:
- Create an issue in the GitHub repository
- Contact: ieeemetaverse@gmail.com

## 📄 License

ISC

## 🙏 Acknowledgments

- Built with React, React Router, and Socket.io Client
- Styled with modern CSS
- Deployed on Railway

