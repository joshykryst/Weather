# Quick Setup Guide 🚀

Follow these steps to get your code ready for GitHub.

## Before Pushing to GitHub

### 1. Create Your Local .env Files

**Backend** - Create `backend/.env`:
\`\`\`bash
cd backend
cp .env.example .env
\`\`\`

Edit \`backend/.env\` with your actual values:
\`\`\`env
MONGODB_URI=mongodb://localhost:27017/acsci-weather
PORT=5001
VAPID_PUBLIC_KEY=<generate_with_command_below>
VAPID_PRIVATE_KEY=<generate_with_command_below>
VAPID_EMAIL=mailto:admin@angelescity-weather.com
OPENWEATHER_API_KEY=<your_key_here>
\`\`\`

Generate VAPID keys:
\`\`\`bash
node -e "const webpush = require('web-push'); const keys = webpush.generateVAPIDKeys(); console.log('VAPID_PUBLIC_KEY=' + keys.publicKey); console.log('VAPID_PRIVATE_KEY=' + keys.privateKey);"
\`\`\`

**Frontend** - Create \`frontend/.env\`:
\`\`\`bash
cd frontend
cp .env.example .env
\`\`\`

Edit \`frontend/.env\`:
\`\`\`env
REACT_APP_API_URL=http://localhost:5001
\`\`\`

### 2. Initialize Git Repository

If not already a Git repository:
\`\`\`bash
cd /Users/macbook/Desktop/Reaserch
git init
\`\`\`

### 3. Verify .gitignore Files

Check that these files exist:
- \`backend/.gitignore\` ✅
- \`frontend/.gitignore\` ✅

These will prevent your \`.env\` files from being committed.

### 4. Test Locally

\`\`\`bash
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend  
cd frontend
npm install
npm start
\`\`\`

Visit http://localhost:3000 and verify everything works.

## Pushing to GitHub

### 1. Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click **New Repository**
3. Name: \`acsci-thunderstorm-alert\` (or your choice)
4. Keep it **Public** or **Private**
5. Do NOT initialize with README (we already have one)
6. Create repository

### 2. Add Remote and Push

\`\`\`bash
cd /Users/macbook/Desktop/Reaserch

# Add all files
git add .

# Commit
git commit -m "Initial commit: ACSci Thunderstorm Alert System"

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/acsci-thunderstorm-alert.git

# Push to GitHub
git push -u origin main
\`\`\`

If you get "main branch doesn't exist" error:
\`\`\`bash
git branch -M main
git push -u origin main
\`\`\`

## ✅ What's Included

Your repository now has:

- ✅ Environment variable templates (\`.env.example\`)
- ✅ Proper \`.gitignore\` files (secrets won't be committed)
- ✅ Updated code using \`process.env\` variables
- ✅ Comprehensive README.md
- ✅ Deployment guide (DEPLOYMENT.md)
- ✅ All features working locally

## ⚠️ Important Reminders

1. **Never commit .env files** - They contain secrets!
2. **Generate new VAPID keys** for production (don't reuse local keys)
3. **Use MongoDB Atlas** for production (not local MongoDB)
4. **Update API URLs** in frontend .env when deploying

## 📖 Next Steps

After pushing to GitHub, see:
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deploy to production
- [README.md](README.md) - Full documentation

## 🆘 Troubleshooting

### "Permission denied (publickey)" Error
Use HTTPS instead:
\`\`\`bash
git remote set-url origin https://github.com/YOUR_USERNAME/repo-name.git
\`\`\`

### ".env file in commit history"
If you accidentally committed .env:
\`\`\`bash
git rm --cached backend/.env frontend/.env
git commit -m "Remove .env files"
git push
\`\`\`

Then rotate all your secrets (VAPID keys, API keys, etc.)

---

**Ready to deploy?** See [DEPLOYMENT.md](DEPLOYMENT.md) for production setup!
