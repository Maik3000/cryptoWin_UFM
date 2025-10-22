#!/bin/bash

# Setup script for local development

echo "🚀 Setting up Cryptowinufm Faucet..."

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Setup Backend
echo ""
echo "📦 Setting up Backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "📝 Creating backend .env file from example..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your configuration!"
else
    echo "✅ Backend .env already exists"
fi

echo "📦 Installing backend dependencies..."
npm install

cd ..

# Setup Frontend
echo ""
echo "📦 Setting up Frontend..."
cd frontend

if [ ! -f ".env" ]; then
    echo "📝 Creating frontend .env file from example..."
    cp .env.example .env
else
    echo "✅ Frontend .env already exists"
fi

echo "📦 Installing frontend dependencies..."
npm install

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure backend/.env with your:"
echo "   - DATABASE_URL (PostgreSQL connection)"
echo "   - SEPOLIA_RPC_URL (Infura/Alchemy endpoint)"
echo "   - PRIVATE_KEY (MetaMask wallet private key)"
echo ""
echo "2. Configure frontend/.env with your:"
echo "   - VITE_API_URL (backend URL, default: http://localhost:3000)"
echo ""
echo "3. Start PostgreSQL database"
echo ""
echo "4. Start the backend:"
echo "   cd backend && npm start"
echo ""
echo "5. Start the frontend (in another terminal):"
echo "   cd frontend && npm run dev"
echo ""
echo "🎉 Happy coding!"

