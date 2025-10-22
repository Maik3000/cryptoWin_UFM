#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Cryptowinufm Faucet - Verification        ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo ""

# Check Node.js
echo -e "${YELLOW}Checking Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

# Check npm
echo -e "${YELLOW}Checking npm...${NC}"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓ npm installed: $NPM_VERSION${NC}"
else
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi

# Check PostgreSQL
echo -e "${YELLOW}Checking PostgreSQL...${NC}"
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version)
    echo -e "${GREEN}✓ PostgreSQL installed: $PSQL_VERSION${NC}"
else
    echo -e "${YELLOW}⚠ PostgreSQL not found (optional for development)${NC}"
fi

echo ""
echo -e "${BLUE}Checking project structure...${NC}"

# Check backend files
BACKEND_FILES=(
    "backend/server.js"
    "backend/package.json"
    "backend/config/database.js"
    "backend/services/ethereum.js"
    "backend/routes/faucet.js"
    "backend/middleware/rateLimiter.js"
)

for file in "${BACKEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file ${RED}(missing)${NC}"
    fi
done

# Check frontend files
FRONTEND_FILES=(
    "frontend/package.json"
    "frontend/src/App.jsx"
    "frontend/src/main.jsx"
    "frontend/src/index.css"
    "frontend/src/utils/validation.js"
    "frontend/index.html"
    "frontend/vite.config.js"
)

for file in "${FRONTEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file ${RED}(missing)${NC}"
    fi
done

echo ""
echo -e "${BLUE}Checking environment configuration...${NC}"

# Check backend .env
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓${NC} backend/.env exists"
    
    # Check for required variables
    if grep -q "DATABASE_URL" backend/.env; then
        echo -e "${GREEN}  ✓${NC} DATABASE_URL configured"
    else
        echo -e "${YELLOW}  ⚠${NC} DATABASE_URL not found"
    fi
    
    if grep -q "SEPOLIA_RPC_URL" backend/.env; then
        echo -e "${GREEN}  ✓${NC} SEPOLIA_RPC_URL configured"
    else
        echo -e "${YELLOW}  ⚠${NC} SEPOLIA_RPC_URL not found"
    fi
    
    if grep -q "PRIVATE_KEY" backend/.env; then
        echo -e "${GREEN}  ✓${NC} PRIVATE_KEY configured"
    else
        echo -e "${YELLOW}  ⚠${NC} PRIVATE_KEY not found"
    fi
else
    echo -e "${YELLOW}⚠${NC} backend/.env not found"
    echo -e "  ${YELLOW}Create it from the template:${NC}"
    echo -e "  cp backend/.env.example backend/.env"
fi

# Check frontend .env
if [ -f "frontend/.env" ]; then
    echo -e "${GREEN}✓${NC} frontend/.env exists"
    
    if grep -q "VITE_API_URL" frontend/.env; then
        echo -e "${GREEN}  ✓${NC} VITE_API_URL configured"
    else
        echo -e "${YELLOW}  ⚠${NC} VITE_API_URL not found"
    fi
else
    echo -e "${YELLOW}⚠${NC} frontend/.env not found"
    echo -e "  ${YELLOW}Create it from the template:${NC}"
    echo -e "  cp frontend/.env.example frontend/.env"
fi

echo ""
echo -e "${BLUE}Checking dependencies...${NC}"

# Check backend node_modules
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Backend dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} Backend dependencies not installed"
    echo -e "  ${YELLOW}Run:${NC} cd backend && npm install"
fi

# Check frontend node_modules
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Frontend dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} Frontend dependencies not installed"
    echo -e "  ${YELLOW}Run:${NC} cd frontend && npm install"
fi

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              Verification Complete            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}Next steps:${NC}"
echo -e "1. Configure environment variables (see ENV_GUIDE.md)"
echo -e "2. Install dependencies: ${YELLOW}./setup.sh${NC}"
echo -e "3. Start backend: ${YELLOW}cd backend && npm start${NC}"
echo -e "4. Start frontend: ${YELLOW}cd frontend && npm run dev${NC}"
echo -e "5. Visit: ${BLUE}http://localhost:5173${NC}"
echo ""
echo -e "For detailed instructions, see: ${BLUE}QUICKSTART.md${NC}"
echo ""

