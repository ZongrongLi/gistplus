import CodeBlock from '@/components/CodeBlock'

export default function DeploymentPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-4xl font-bold mb-4">Deployment Guide</h1>
      <p className="text-lg text-dark/60 mb-12">
        Deploy your Gist Plus provider to production
      </p>

      {/* Networks */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Deployment Path</h2>
        
        <div className="border-2 border-dark/20 bg-panel-2 p-6">
          <pre className="font-mono text-xs leading-relaxed">
{`Development → Testing → Staging → Production
────────────────────────────────────────────

1. LOCALNET (localhost:8899)
   ├─ solana-test-validator
   ├─ Test all features
   └─ Fast iteration

2. DEVNET (api.devnet.solana.com)
   ├─ Real blockchain
   ├─ Free SOL via airdrop
   └─ Integration testing

3. TESTNET (api.testnet.solana.com)
   ├─ Staging environment
   ├─ Production config
   └─ Load testing

4. MAINNET (api.mainnet-beta.solana.com)
   ├─ Production deployment
   ├─ Premium RPC required
   └─ Real funds`}
          </pre>
        </div>
      </div>

      {/* Environment Setup */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Environment Configuration</h2>

        <CodeBlock
          language="bash"
          title=".env.production"
          code={`SOLANA_NETWORK=mainnet-beta
SOLANA_RPC=https://rpc.helius.xyz/?api-key=YOUR_KEY
WALLET_PRIVATE_KEY=base64_encoded_key
PROVIDER_ENDPOINT=https://api.your-domain.com
BASE_PRICE=0.01
TOKEN=USDC
MAX_LATENCY=2000`}
        />
      </div>

      {/* Docker */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Docker Deployment</h2>

        <CodeBlock
          language="dockerfile"
          title="Dockerfile"
          code={`FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/server.js"]`}
        />

        <div className="mt-4">
          <CodeBlock
            language="bash"
            code={`# Build and run
docker build -t gistplus-provider .
docker run -p 3000:3000 --env-file .env.production gistplus-provider`}
          />
        </div>
      </div>

      {/* Deploy Commands */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Quick Deploy</h2>

        <div className="space-y-4">
          <div>
            <h4 className="font-bold mb-2">Devnet</h4>
            <CodeBlock
              language="bash"
              code={`export SOLANA_NETWORK=devnet
npm run build
npm start`}
            />
          </div>

          <div>
            <h4 className="font-bold mb-2">Mainnet</h4>
            <CodeBlock
              language="bash"
              code={`export SOLANA_NETWORK=mainnet-beta
export SOLANA_RPC=https://rpc.helius.xyz/?api-key=YOUR_KEY
npm run build
pm2 start dist/server.js --name gistplus`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

