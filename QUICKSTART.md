# Quick Start Guide

Get your Cryptowinufm Sepolia Faucet up and running in minutes!

## For Local Development

### Prerequisites Check
```bash
# Check Node.js version (need 18+)
node --version

# Check npm
npm --version

# Check PostgreSQL (should be running)
psql --version
```

### Automated Setup

Make the setup script executable and run it:
```bash
chmod +x setup.sh
./setup.sh
```

This will:
- Create `.env` files from examples
- Install all dependencies for frontend and backend
- Set up project structure

### Manual Configuration

1. **Backend Environment** (`backend/.env`):
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/cryptowin_faucet
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=0xYOUR_METAMASK_PRIVATE_KEY
FRONTEND_URL=http://localhost:5173
PORT=3000
NODE_ENV=development
```

2. **Frontend Environment** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3000
```

### Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Health Check: http://localhost:3000/health

## For Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Quick Deploy Checklist

Backend (Railway):
- [ ] Create Railway project
- [ ] Add PostgreSQL database
- [ ] Set environment variables
- [ ] Deploy from GitHub

Frontend (Vercel):
- [ ] Import GitHub repository
- [ ] Configure build settings
- [ ] Set VITE_API_URL
- [ ] Deploy

## Testing the Faucet

1. Get a Sepolia wallet address (MetaMask)
2. Enter the address in the input field
3. Click "Obtener Recompensa"
4. Wait for transaction confirmation
5. Check your wallet or Sepolia Etherscan

## Common Issues

### "Cannot connect to database"
```bash
# Make sure PostgreSQL is running
# On Mac:
brew services start postgresql@14

# On Linux:
sudo systemctl start postgresql
```

### "Insufficient funds in faucet wallet"
Get Sepolia ETH from:
- https://sepoliafaucet.com/
- https://faucet.quicknode.com/ethereum/sepolia

### "Frontend can't connect to backend"
- Check backend is running on port 3000
- Verify VITE_API_URL in frontend/.env
- Check CORS settings

## Need Help?

- Check [README.md](./README.md) for full documentation
- Review [SECURITY.md](./SECURITY.md) for security best practices
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment guides

## Project Structure

```
Cryptowin/
├── frontend/          # React app
│   ├── src/
│   │   ├── App.jsx
│   │   ├── utils/
│   │   └── ...
│   └── package.json
│
├── backend/           # Express API
│   ├── config/
│   ├── services/
│   ├── routes/
│   └── server.js
│
└── README.md
```

## What's Next?

1. Customize the UI colors and branding
2. Adjust the claim amount or time interval
3. Add analytics and monitoring
4. Deploy to production
5. Share with the community!

---

Happy building! 🚀

