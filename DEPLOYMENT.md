# Deployment Guide

## Prerequisites

- GitHub account
- Vercel account
- Railway account
- Sepolia testnet wallet with ETH
- Infura or Alchemy API key

## Step-by-Step Deployment

### 1. Prepare Repository

1. Initialize git repository (if not already):
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Create GitHub repository and push:
```bash
git remote add origin https://github.com/yourusername/cryptowinufm.git
git branch -M main
git push -u origin main
```

### 2. Deploy Backend to Railway

1. Go to [Railway.app](https://railway.app)

2. Click "New Project"

3. Select "Deploy from GitHub repo"

4. Choose your repository

5. Add PostgreSQL:
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway will automatically set `DATABASE_URL`

6. Configure Service:
   - Click on the service
   - Go to "Settings"
   - Set Root Directory: `backend`
   - Add environment variables:
     ```
     SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
     PRIVATE_KEY=your_metamask_private_key
     FRONTEND_URL=https://your-app.vercel.app
     NODE_ENV=production
     PORT=3000
     ```

7. Deploy:
   - Railway will automatically deploy
   - Note your deployment URL (e.g., `https://your-app.railway.app`)

8. Verify deployment:
   - Visit `https://your-app.railway.app/health`
   - Should show healthy status

### 3. Deploy Frontend to Vercel

1. Go to [Vercel.com](https://vercel.com)

2. Click "Add New..." → "Project"

3. Import your GitHub repository

4. Configure Project:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. Add Environment Variables:
   ```
   VITE_API_URL=https://your-app.railway.app
   ```

6. Deploy:
   - Click "Deploy"
   - Wait for deployment to complete
   - Note your deployment URL (e.g., `https://your-app.vercel.app`)

### 4. Update CORS Configuration

1. Go back to Railway

2. Update `FRONTEND_URL` environment variable with your Vercel URL:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```

3. Redeploy backend if needed

### 5. Test Production Deployment

1. Visit your Vercel URL

2. Enter a Sepolia wallet address

3. Click "Obtener Recompensa"

4. Verify transaction on [Sepolia Etherscan](https://sepolia.etherscan.io/)

## Environment Variables Reference

### Backend (Railway)

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | Auto-set by Railway |
| SEPOLIA_RPC_URL | Ethereum RPC endpoint | https://sepolia.infura.io/v3/YOUR_KEY |
| PRIVATE_KEY | Wallet private key | 0x... (from MetaMask) |
| FRONTEND_URL | Frontend URL for CORS | https://your-app.vercel.app |
| NODE_ENV | Environment | production |
| PORT | Server port | 3000 |

### Frontend (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | https://your-app.railway.app |

## Monitoring

### Backend Health Check
- URL: `https://your-app.railway.app/health`
- Should return status, database connection, and wallet balance

### Railway Logs
- Go to Railway project
- Click on service
- View logs for errors or issues

### Vercel Logs
- Go to Vercel project
- Click on deployment
- View function logs and build logs

## Troubleshooting

### Backend won't start
- Check Railway logs
- Verify all environment variables are set
- Check database connection

### CORS errors
- Verify `FRONTEND_URL` in Railway matches Vercel URL
- Check CORS configuration in backend

### Transaction failures
- Check wallet has sufficient SepoliaETH
- Verify `SEPOLIA_RPC_URL` is correct
- Check Infura/Alchemy API limits

### Database errors
- Verify PostgreSQL is running in Railway
- Check `DATABASE_URL` is set correctly
- Review database logs in Railway

## Security Checklist

- ✅ Private key stored securely in Railway secrets
- ✅ No sensitive data in repository
- ✅ CORS configured with frontend URL whitelist
- ✅ Rate limiting enabled
- ✅ Helmet security headers enabled
- ✅ Input validation on all endpoints
- ✅ SQL injection prevention with parameterized queries

## Maintenance

### Update Dependencies
```bash
# Backend
cd backend
npm update

# Frontend
cd frontend
npm update
```

### Monitor Wallet Balance
- Check `/health` endpoint regularly
- Set up alerts for low balance
- Refill wallet as needed

### Database Backups
- Railway provides automatic backups
- Export data periodically for additional safety

## Scaling

### If traffic increases:
1. Upgrade Railway plan for better performance
2. Implement Redis caching for eligibility checks
3. Add CDN for frontend assets
4. Consider load balancing for multiple backend instances

---

For issues or questions, refer to the main README.md

