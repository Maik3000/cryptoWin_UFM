# Environment Variables Configuration Guide

This guide explains all environment variables needed for the Cryptowinufm faucet.

## Backend Environment Variables

Create a file named `.env` in the `backend/` directory with these variables:

### Required Variables

#### DATABASE_URL
PostgreSQL connection string.

**Format:**
```
DATABASE_URL=postgresql://username:password@host:port/database
```

**Examples:**
```bash
# Local development
DATABASE_URL=postgresql://postgres:password@localhost:5432/cryptowin_faucet

# Railway (auto-set by PostgreSQL plugin)
DATABASE_URL=postgresql://postgres:xxx@containers-us-west-xxx.railway.app:5432/railway

# Heroku (auto-set)
DATABASE_URL=postgres://user:pass@host:5432/dbname
```

#### SEPOLIA_RPC_URL
Ethereum Sepolia testnet RPC endpoint.

**Where to get:**
- [Infura](https://infura.io/) - Free tier available
- [Alchemy](https://www.alchemy.com/) - Free tier available
- [QuickNode](https://www.quicknode.com/) - Paid service

**Format:**
```
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
```

**Examples:**
```bash
# Infura
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/abc123def456

# Alchemy
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key

# Public (not recommended for production)
SEPOLIA_RPC_URL=https://rpc.sepolia.org
```

#### PRIVATE_KEY
Your MetaMask wallet private key (the wallet that will send ETH).

**⚠️ SECURITY WARNING:**
- Never share this key
- Never commit to version control
- Use a dedicated wallet (not your personal wallet)
- Keep minimum balance needed

**How to get from MetaMask:**
1. Open MetaMask
2. Click account menu (three dots)
3. Account Details → Export Private Key
4. Enter password
5. Copy the key

**Format:**
```
PRIVATE_KEY=0x1234567890abcdef...
```

**Example:**
```bash
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

#### FRONTEND_URL
Your frontend URL for CORS configuration.

**Development:**
```
FRONTEND_URL=http://localhost:5173
```

**Production:**
```
FRONTEND_URL=https://your-app.vercel.app
```

**Multiple URLs (comma-separated):**
```
FRONTEND_URL=https://your-app.vercel.app,https://www.your-domain.com
```

#### PORT
Server port number (optional, defaults to 3000).

```
PORT=3000
```

#### NODE_ENV
Environment mode.

```bash
# Development
NODE_ENV=development

# Production
NODE_ENV=production
```

### Complete Backend .env Example

```env
# Database
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/cryptowin_faucet

# Ethereum
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE

# Server
PORT=3000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173
```

## Frontend Environment Variables

Create a file named `.env` in the `frontend/` directory with these variables:

### Required Variables

#### VITE_API_URL
Backend API URL (must start with VITE_ for Vite to expose it).

**Development:**
```
VITE_API_URL=http://localhost:3000
```

**Production:**
```
VITE_API_URL=https://your-backend.railway.app
```

### Complete Frontend .env Example

```env
# Development
VITE_API_URL=http://localhost:3000

# Production (Vercel will use this)
VITE_API_URL=https://cryptowin-backend.railway.app
```

## Platform-Specific Setup

### Railway (Backend)

Set these in Railway dashboard → Variables:

```
DATABASE_URL=<auto-set-by-postgresql-plugin>
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=0xYOUR_KEY
FRONTEND_URL=https://your-app.vercel.app
NODE_ENV=production
PORT=3000
```

### Vercel (Frontend)

Set these in Vercel dashboard → Settings → Environment Variables:

```
VITE_API_URL=https://your-backend.railway.app
```

## Verification Checklist

After setting environment variables:

### Backend
- [ ] `DATABASE_URL` connects successfully
- [ ] `SEPOLIA_RPC_URL` is accessible
- [ ] `PRIVATE_KEY` wallet has Sepolia ETH
- [ ] `FRONTEND_URL` matches your frontend domain
- [ ] Server starts without errors
- [ ] `/health` endpoint returns healthy status

### Frontend
- [ ] `VITE_API_URL` points to running backend
- [ ] Frontend can connect to backend
- [ ] CORS allows frontend domain
- [ ] API calls work correctly

## Testing Connections

### Test Backend

```bash
cd backend
npm start

# In another terminal
curl http://localhost:3000/health
```

Should return:
```json
{
  "status": "healthy",
  "database": "connected",
  "ethereum": "connected",
  "balance": "X.XX ETH"
}
```

### Test Frontend

```bash
cd frontend
npm run dev
```

Visit http://localhost:5173 and check browser console for errors.

## Common Issues

### "Invalid private key"
- Ensure key starts with `0x`
- Check no extra spaces or quotes
- Verify it's a valid 64-character hex string (plus 0x prefix)

### "Database connection failed"
- Check PostgreSQL is running
- Verify username/password
- Ensure database exists
- Check firewall settings

### "Cannot connect to Ethereum network"
- Verify RPC URL is correct
- Check API key is valid
- Ensure you haven't exceeded rate limits
- Try alternative RPC provider

### "CORS error"
- Verify FRONTEND_URL matches exactly
- Include protocol (http:// or https://)
- No trailing slash
- Restart backend after changing

## Security Best Practices

1. **Never commit `.env` files**
   ```bash
   # Add to .gitignore
   .env
   .env.local
   .env.production
   ```

2. **Use different keys per environment**
   - Development: Use test wallet
   - Production: Use dedicated faucet wallet

3. **Rotate keys regularly**
   - Change private key every 3-6 months
   - Update immediately if compromised

4. **Monitor wallet balance**
   - Set up alerts for low balance
   - Check `/health` endpoint regularly

5. **Secure production secrets**
   - Use platform secret management
   - Enable 2FA on hosting accounts
   - Limit access to production variables

## Getting Help

If you're stuck:
1. Check console/logs for error messages
2. Verify each variable individually
3. Test connections separately
4. Review security settings (firewall, CORS)
5. Check platform-specific documentation

---

**Remember:** Keep your private key safe and never share it! 🔐

