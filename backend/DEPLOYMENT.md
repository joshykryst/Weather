# Deployment Guide 🚀

This guide covers deploying the ACSci Thunderstorm Alert System to production.

## 📋 Prerequisites

- GitHub account
- MongoDB Atlas account (free tier available)
- OpenWeather API key
- Deployment platform accounts:
  - **Frontend**: Vercel or Netlify (recommended)
  - **Backend**: Railway, Render, or Heroku

## 🗄️ MongoDB Atlas Setup

### 1. Create Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account or sign in
3. Create a new cluster (free M0 tier)
4. Wait for cluster to be created (2-5 minutes)

### 2. Configure Network Access

1. In Atlas dashboard, go to **Network Access**
2. Click **Add IP Address**
3. Select **Allow Access from Anywhere** (0.0.0.0/0)
   - For production, restrict to your backend server IPs
4. Confirm

### 3. Create Database User

1. Go to **Database Access**
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Set username and strong password
5. Set privileges to **Read and write to any database**
6. Add user

### 4. Get Connection String

1. Go to **Database** → **Connect**
2. Choose **Connect your application**
3. Copy the connection string:
   \`\`\`
   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/acsci-weather?retryWrites=true&w=majority
   \`\`\`
4. Replace \`<password>\` with your database user password
5. Replace \`acsci-weather\` with your database name

## 🔧 Backend Deployment (Railway)

### 1. Prepare Backend

Ensure your [backend/.env.example](backend/.env.example) is complete.

### 2. Deploy to Railway

1. Go to [Railway.app](https://railway.app)
2. Sign in with GitHub
3. Click **New Project** → **Deploy from GitHub repo**
4. Select your repository
5. Railway will auto-detect Node.js

### 3. Configure Environment Variables

In Railway dashboard, go to **Variables** and add:

\`\`\`env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/acsci-weather
PORT=5001
VAPID_PUBLIC_KEY=<your_vapid_public_key>
VAPID_PRIVATE_KEY=<your_vapid_private_key>
VAPID_EMAIL=mailto:admin@angelescity-weather.com
OPENWEATHER_API_KEY=<your_openweather_api_key>
NODE_ENV=production
\`\`\`

**Generate VAPID Keys:**
\`\`\`bash
node -e "const webpush = require('web-push'); const keys = webpush.generateVAPIDKeys(); console.log('VAPID_PUBLIC_KEY=' + keys.publicKey); console.log('VAPID_PRIVATE_KEY=' + keys.privateKey);"
\`\`\`

### 4. Set Root Directory

1. In Railway Settings → **Build**
2. Set **Root Directory**: \`backend\`
3. Set **Start Command**: \`node server.js\`

### 5. Get Backend URL

After deployment, Railway provides a URL like:
\`\`\`
https://your-app-name.up.railway.app
\`\`\`

Save this URL for frontend configuration.

## 🎨 Frontend Deployment (Vercel)

### 1. Prepare Frontend

1. Update [frontend/.env.example](frontend/.env.example)
2. Remove any hardcoded API URLs (already done if you followed setup)

### 2. Deploy to Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **Add New** → **Project**
4. Import your GitHub repository
5. Vercel auto-detects create-react-app

### 3. Configure Project

- **Framework Preset**: Create React App
- **Root Directory**: \`frontend\`
- **Build Command**: \`npm run build\`
- **Output Directory**: \`build\`

### 4. Add Environment Variable

In Vercel project settings → **Environment Variables**, add:

\`\`\`
REACT_APP_API_URL=https://your-backend.up.railway.app
\`\`\`

### 5. Deploy

Click **Deploy**. Vercel will build and deploy your frontend.

Your app will be available at:
\`\`\`
https://your-app-name.vercel.app
\`\`\`

## 🔄 Alternative Deployment Options

### Backend Alternatives

#### Render
1. Go to [Render.com](https://render.com)
2. Create **New Web Service**
3. Connect GitHub repo
4. Set **Root Directory**: \`backend\`
5. **Build Command**: \`npm install\`
6. **Start Command**: \`node server.js\`
7. Add environment variables
8. Deploy (free tier available)

#### Heroku
1. Install Heroku CLI: \`brew install heroku\`
2. Login: \`heroku login\`
3. Create app: \`heroku create acsci-backend\`
4. Add MongoDB addon: \`heroku addons:create mongolab\`
5. Set env vars: \`heroku config:set VAPID_PUBLIC_KEY=...\`
6. Deploy: \`git push heroku main\`

### Frontend Alternatives

#### Netlify
1. Go to [Netlify.com](https://netlify.com)
2. **Add new site** → **Import from Git**
3. Connect repository
4. **Base directory**: \`frontend\`
5. **Build command**: \`npm run build\`
6. **Publish directory**: \`frontend/build\`
7. Add environment variable: \`REACT_APP_API_URL\`
8. Deploy

## 📱 iOS Push Notifications Setup

### Requirements
- App must be served over HTTPS (automatic with Vercel/Netlify)
- Backend must be HTTPS (automatic with Railway/Render)
- Users must use Safari on iOS 16.4+

### Testing
1. Open your Vercel URL in Safari on iPhone
2. Add to Home Screen
3. Login and enable notifications
4. Admin can send test notification from admin panel

### Common Issues
- **Notifications not appearing**: Check VAPID keys are correct
- **Can't install PWA**: Ensure HTTPS and manifest.json is accessible
- **Vibration not working**: iOS Safari limitation (not fixable)

## 🧪 Post-Deployment Testing

### Backend Health Check
\`\`\`bash
curl https://your-backend.up.railway.app/health
\`\`\`

Expected response:
\`\`\`json
{
  "status": "ok",
  "database": "MongoDB Connected",
  "users": 0
}
\`\`\`

### Frontend Test
1. Visit your Vercel URL
2. Register a new account
3. Enable notifications
4. Test siren button
5. Admin: Send broadcast notification

## 🔐 Security Checklist

- [ ] All API keys in environment variables (not hardcoded)
- [ ] .env files added to .gitignore
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Strong passwords for database users
- [ ] HTTPS enforced on all endpoints
- [ ] CORS properly configured in backend

## 🔄 Continuous Deployment

Both Vercel and Railway support automatic deployment:

1. Push to GitHub main branch
2. Platform auto-detects changes
3. Rebuilds and redeploys automatically
4. Zero-downtime deployment

## 📊 Monitoring

### Railway Logs
\`\`\`bash
railway logs
\`\`\`

### Vercel Logs
Available in Vercel dashboard → **Deployments** → Select deployment → **Logs**

## 🆘 Troubleshooting

### Backend Won't Start
- Check Railway logs for errors
- Verify all environment variables are set
- Test MongoDB connection string locally
- Ensure \`package.json\` has correct start script

### Frontend Can't Connect to Backend
- Verify \`REACT_APP_API_URL\` is correct
- Check CORS configuration in backend
- Test backend URL directly in browser
- Clear browser cache and rebuild

### Push Notifications Fail
- Generate new VAPID keys
- Update both backend env vars and service worker
- Verify HTTPS on both frontend and backend
- Check browser console for service worker errors

## 💰 Cost Estimates

### Free Tier Limits
- **MongoDB Atlas M0**: 512 MB storage, shared cluster
- **Railway**: 500 hours/month, 512 MB RAM
- **Vercel**: Unlimited bandwidth, 100 GB/month
- **Render**: 750 hours/month free tier

### When to Upgrade
- MongoDB: >500 concurrent users or >512 MB data
- Backend: >1000 requests/hour or need more memory
- Frontend: Enterprise features or team collaboration

## 📚 Additional Resources

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)
- [Web Push Protocol](https://web.dev/push-notifications-overview/)

---

**Need Help?** Open an issue on GitHub or contact the development team.
