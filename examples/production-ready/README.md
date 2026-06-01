# Production-Ready Gist Plus Examples

Complete, production-ready examples that work on any Solana network.

## 🚀 Quick Start

### 1. Setup Environment

```bash
cd examples/production-ready
npm install

# Copy environment template
cp .env.example .env.devnet
```

### 2. Configure Wallet

```bash
# Generate a new wallet
node -e "const kp = require('@solana/web3.js').Keypair.generate(); console.log('Public:', kp.publicKey.toBase58()); console.log('Private (base64):', Buffer.from(kp.secretKey).toString('base64'));"

# Add to .env.devnet
echo "WALLET_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE" >> .env.devnet
```

### 3. Get Devnet SOL

```bash
# Your wallet address from step 2
solana airdrop 2 YOUR_WALLET_ADDRESS --url devnet
```

### 4. Run Provider

```bash
# Terminal 1
npm run provider:devnet
```

### 5. Run Agent

```bash
# Terminal 2  
npm run agent:devnet
```

## 🌐 Network Support

### Localnet (Development)

```bash
# Terminal 1: Start local validator
solana-test-validator

# Terminal 2: Run provider
npm run provider:local

# Terminal 3: Run agent
npm run agent:local
```

### Devnet (Testing)

```bash
# Provider
npm run provider:devnet

# Agent
npm run agent:devnet
```

### Testnet (Staging)

```bash
# Create .env.testnet
cp .env.example .env.testnet

# Update SOLANA_NETWORK=testnet

# Provider
npm run provider:testnet

# Agent
npm run agent:testnet
```

### Mainnet (Production)

```bash
# Create .env.mainnet
cp .env.example .env.mainnet

# Update SOLANA_NETWORK=mainnet-beta
# ⚠️ IMPORTANT: Set SOLANA_RPC to premium provider!
# SOLANA_RPC=https://rpc.helius.xyz/?api-key=YOUR_KEY

# Provider
npm run provider:mainnet

# Agent
npm run agent:mainnet
```

## 📋 Configuration

### Environment Variables

Create `.env.devnet`, `.env.testnet`, or `.env.mainnet`:

```bash
# Network
SOLANA_NETWORK=devnet
SOLANA_RPC=

# Wallet
WALLET_PRIVATE_KEY=base64_encoded_key

# Provider
PROVIDER_ENDPOINT=http://localhost:3000
PORT=3000

# Pricing
BASE_PRICE=0.001
TOKEN=USDC

# SLA
MAX_LATENCY=2000
MIN_UPTIME=99.5
```

### Network Switching

```bash
# Method 1: Use npm scripts
npm run provider:devnet
npm run provider:testnet
npm run provider:mainnet

# Method 2: Environment variable
SOLANA_NETWORK=testnet npm run provider:devnet

# Method 3: Load specific env file
dotenv -e .env.mainnet npm run provider:devnet
```

## 🔐 Security Best Practices

### Development (Devnet/Testnet)

✅ Use generated wallets  
✅ Store keys in `.env` files  
✅ Add `.env*` to `.gitignore`  

### Production (Mainnet)

✅ Use hardware wallets (Ledger)  
✅ Use AWS KMS or similar  
✅ Never commit keys to git  
✅ Use environment variables in deployment  
✅ Enable monitoring and alerts  
✅ Use premium RPC providers  

## 📊 Features Demonstrated

### Provider Features

- ✅ Multi-network support (all Solana networks)
- ✅ Automatic wallet loading from environment
- ✅ Health check endpoint
- ✅ Multiple protected APIs (weather, inference, data)
- ✅ Automatic Gist Plus negotiation
- ✅ Receipt generation and signing
- ✅ Session management
- ✅ Balance tracking
- ✅ SLA enforcement

### Agent Features

- ✅ Multi-network support
- ✅ Automatic wallet management
- ✅ Balance checking
- ✅ Auto-airdrop on devnet/testnet
- ✅ Intent creation
- ✅ Offer negotiation
- ✅ Session creation
- ✅ Multiple requests per session
- ✅ Receipt verification
- ✅ Session closure with refund
- ✅ Explorer links for transactions

## 🧪 Testing

### Test on Localnet

```bash
# Start validator
solana-test-validator

# Run full flow
npm run provider:local &
sleep 2
npm run agent:local
```

### Test on Devnet

```bash
# Run provider
npm run provider:devnet &

# Run agent
sleep 2
npm run agent:devnet
```

## 📈 Monitoring

Both examples include:

- Request logging
- Balance tracking
- SLA verification
- Error handling
- Explorer links

### Add Monitoring Services

```bash
# Install monitoring
npm install @sentry/node dd-trace

# Add to provider
import * as Sentry from '@sentry/node';
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

## 🚀 Deployment

### Deploy Provider to Production

```bash
# 1. Build
npm run build

# 2. Set production environment
export SOLANA_NETWORK=mainnet-beta
export SOLANA_RPC=https://rpc.helius.xyz/?api-key=YOUR_KEY
export WALLET_PRIVATE_KEY=your_key_here

# 3. Start with PM2
pm2 start dist/provider-devnet.js --name gistplus-provider

# 4. Monitor
pm2 logs gistplus-provider
pm2 monit
```

### Deploy to Cloud

**AWS/EC2:**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone your-repo
cd examples/production-ready
npm install
npm run build

# Configure
cp .env.example .env.mainnet
# Edit .env.mainnet with production values

# Start with PM2
npm install -g pm2
pm2 start dist/provider-devnet.js --name gistplus-provider
pm2 startup
pm2 save
```

**Docker:**
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["node", "dist/provider-devnet.js"]
```

## 📚 Learn More

- [Network Setup Guide](../../NETWORK_SETUP.md)
- [Publishing Guide](../../PUBLISHING_GUIDE.md)
- [Full Documentation](../../docs/GETTING_STARTED.md)

## 🆘 Troubleshooting

### "Insufficient Balance"
```bash
# Get SOL on devnet/testnet
solana airdrop 2 YOUR_ADDRESS --url devnet

# On mainnet, buy from exchange
```

### "Connection Refused"
```bash
# Check provider is running
curl http://localhost:3000/health

# Check network is correct
echo $SOLANA_NETWORK
```

### "Invalid Wallet"
```bash
# Regenerate wallet
node -e "const kp = require('@solana/web3.js').Keypair.generate(); console.log(Buffer.from(kp.secretKey).toString('base64'));"

# Update .env
WALLET_PRIVATE_KEY=new_key_here
```

## 🎯 Next Steps

1. ✅ Run examples on devnet
2. ✅ Test with real Solana transactions
3. ✅ Deploy Solana program
4. ✅ Test on testnet
5. ✅ Prepare for mainnet
6. 🚀 Launch on production!

---

**Your protocol is production-ready!** 🚀

