# Cryptowinufm - Sepolia Testnet Faucet

A secure and beautiful Sepolia testnet faucet that distributes 0.01 SepoliaETH every 24 hours per wallet address.

## Features

- 🎨 Modern, responsive UI with gradient design
- ⏱️ Real-time countdown timer showing time until next claim
- 🔒 Secure backend with rate limiting and input validation
- 💾 PostgreSQL database tracking claims and timestamps
- 🌐 Deployed on Vercel (frontend) and Railway (backend)
- ✅ 24-hour claim interval per wallet address
- 🔐 Security best practices (Helmet, CORS, parameterized queries)

## Tech Stack

### Frontend
- React 18
- Vite
- TailwindCSS
- Axios
- React Hot Toast

### Backend
- Node.js
- Express
- Ethers.js v6
- PostgreSQL
- Helmet (security)
- Express Rate Limit

## Project Structure

```
/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── App.jsx        # Main component
│   │   ├── main.jsx       # Entry point
│   │   ├── index.css      # Tailwind styles
│   │   └── utils/
│   │       └── validation.js
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── backend/               # Express API server
    ├── server.js          # Main server file
    ├── config/
    │   └── database.js    # PostgreSQL connection
    ├── services/
    │   └── ethereum.js    # Ethers.js integration
    ├── routes/
    │   └── faucet.js      # API routes
    ├── middleware/
    │   └── rateLimiter.js
    └── package.json
```

## Local Development Setup

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database
- Sepolia testnet wallet with ETH
- Infura or Alchemy API key for Sepolia RPC

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/cryptowin_faucet
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=your_metamask_private_key_here
FRONTEND_URL=http://localhost:5173
PORT=3000
NODE_ENV=development
```

5. Start the server:
```bash
npm start
```

The backend will automatically:
- Initialize the database schema
- Check Ethereum connection
- Display wallet balance
- Start listening on port 3000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
VITE_API_URL=http://localhost:3000
```

5. Start development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Database Schema

The application uses a single table to track claims:

```sql
CREATE TABLE claims (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  last_claim_timestamp TIMESTAMPTZ NOT NULL,
  transaction_hash VARCHAR(66),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wallet_address ON claims(wallet_address);
CREATE INDEX idx_last_claim_timestamp ON claims(last_claim_timestamp);
```

## API Endpoints

### POST /api/claim
Claims 0.01 SepoliaETH for a wallet address.

**Request Body:**
```json
{
  "walletAddress": "0x..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "transactionHash": "0x...",
  "amount": "0.01",
  "nextClaimTime": "2025-10-23T12:00:00.000Z",
  "message": "Recompensa enviada exitosamente"
}
```

**Response (Too Soon):**
```json
{
  "success": false,
  "error": "Debes esperar 24 horas desde tu última reclamación",
  "nextClaimTime": "2025-10-23T12:00:00.000Z",
  "lastClaimTime": "2025-10-22T12:00:00.000Z"
}
```

### GET /api/check-eligibility/:address
Check if a wallet address is eligible to claim.

**Response (Eligible):**
```json
{
  "eligible": true,
  "lastClaimTime": "2025-10-21T12:00:00.000Z",
  "message": "Wallet elegible para reclamar"
}
```

**Response (Not Eligible):**
```json
{
  "eligible": false,
  "lastClaimTime": "2025-10-22T12:00:00.000Z",
  "nextClaimTime": "2025-10-23T12:00:00.000Z",
  "timeRemainingMs": 43200000,
  "message": "Debes esperar antes de reclamar nuevamente"
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-22T12:00:00.000Z",
  "database": "connected",
  "ethereum": "connected",
  "balance": "1.5 ETH"
}
```

## Security Features

1. **Rate Limiting**
   - API endpoints: 5 requests per 15 minutes per IP
   - Claim endpoint: 3 attempts per hour per IP

2. **Input Validation**
   - Ethereum address format validation
   - SQL injection prevention with parameterized queries

3. **Security Headers**
   - Helmet.js for security headers
   - CORS configuration with whitelist

4. **Error Handling**
   - Generic error messages to avoid exposing system details
   - Comprehensive logging for debugging

5. **Private Key Security**
   - Never committed to repository
   - Stored in environment variables
   - Separate for production/development

## Deployment

### Frontend (Vercel)

1. Push code to GitHub repository

2. Import project in Vercel

3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `frontend`

4. Add environment variables:
   - `VITE_API_URL`: Your Railway backend URL

5. Deploy

### Backend (Railway)

1. Create new project in Railway

2. Add PostgreSQL plugin

3. Deploy from GitHub:
   - Root Directory: `backend`

4. Add environment variables:
   - `DATABASE_URL`: (automatically set by PostgreSQL plugin)
   - `SEPOLIA_RPC_URL`: Your Infura/Alchemy URL
   - `PRIVATE_KEY`: Your wallet private key
   - `FRONTEND_URL`: Your Vercel frontend URL
   - `NODE_ENV`: production

5. Deploy

### Important Security Notes for Production

⚠️ **CRITICAL**: Never commit your `.env` file or expose your private key!

- Use Railway's secret management for environment variables
- Regularly monitor wallet balance
- Set up alerts for low balance
- Keep private key secure and never share it
- Use a dedicated wallet for the faucet (not your personal wallet)

## How to Get Testnet Setup

1. **Get Sepolia ETH**:
   - Use existing faucets: [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
   - Fund your faucet wallet with at least 1 SepoliaETH

2. **Get Infura API Key**:
   - Sign up at [Infura](https://infura.io/)
   - Create a new project
   - Copy the Sepolia endpoint URL

3. **Export MetaMask Private Key**:
   - Open MetaMask
   - Click account menu → Account Details → Export Private Key
   - Enter password and copy the private key
   - ⚠️ Keep this secure!

## Monitoring

Monitor your faucet:

1. Check `/health` endpoint regularly
2. Monitor wallet balance
3. Check database for claim history
4. Review logs for errors

## Troubleshooting

### "Insufficient funds in faucet wallet"
- Fund your wallet with more SepoliaETH
- Check wallet address in logs matches your funded wallet

### "Failed to connect to Ethereum network"
- Verify `SEPOLIA_RPC_URL` is correct
- Check Infura/Alchemy API key is valid
- Ensure network connectivity

### "Database connection error"
- Verify `DATABASE_URL` is correct
- Check PostgreSQL is running
- Verify database credentials

### Frontend can't connect to backend
- Verify `VITE_API_URL` points to correct backend URL
- Check CORS settings in backend
- Verify backend is running

## License

MIT

## Support

For issues or questions, please open an issue in the GitHub repository.

---

Built with ❤️ for the Ethereum community

