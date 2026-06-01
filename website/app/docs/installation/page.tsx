import CodeBlock from '@/components/CodeBlock'
import { npmPackageUrl } from '@/lib/links'

export default function InstallationPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-4xl font-bold mb-4">Installation</h1>
      <p className="text-lg text-dark/60 mb-12">
        Get Gist Plus packages installed and configured
      </p>

      {/* For AI Agents */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">For AI Agent Developers</h2>
        
        <CodeBlock
          language="bash"
          title="Install Client SDK"
          code="npm install @gistplus/client @solana/web3.js"
        />

        <div className="mt-4 text-sm text-dark/70">
          This gives you everything needed to build autonomous AI agents that can negotiate pricing and pay for API access.
        </div>
      </div>

      {/* For Providers */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">For API Providers</h2>
        
        <CodeBlock
          language="bash"
          title="Install Server SDK"
          code="npm install @gistplus/server express @solana/web3.js"
        />

        <div className="mt-4 text-sm text-dark/70">
          This gives you Express middleware to automatically monetize your API endpoints.
        </div>
      </div>

      {/* All Packages */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">All Packages</h2>
        
        <div className="space-y-4">
          {[
            { name: '@gistplus/core', desc: 'Protocol foundation (required by all others)' },
            { name: '@gistplus/client', desc: 'Client SDK for AI agents' },
            { name: '@gistplus/server', desc: 'Server middleware for providers' },
            { name: '@gistplus/gateway', desc: 'Verification and SLA resolution service' },
            { name: '@gistplus/indexer', desc: 'Analytics and reputation tracking' },
          ].map((pkg, i) => (
            <div key={i} className="border-2 border-dark/20 bg-panel-2 p-4 hover:border-purple transition-all">
              <div className="flex items-center justify-between mb-2">
                <code className="font-mono text-sm font-bold">{pkg.name}</code>
                <a 
                  href={npmPackageUrl(pkg.name)}
                  target="_blank"
                  className="text-xs text-purple hover:underline"
                >
                  npm →
                </a>
              </div>
              <div className="text-xs text-dark/60">{pkg.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Network Setup */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Network Configuration</h2>
        
        <p className="text-dark/70 mb-4">
          Gist Plus supports all Solana networks:
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <h4 className="font-bold mb-2 text-sm">Development</h4>
            <CodeBlock
              language="typescript"
              code={`// Devnet (testing)
const connection = new Connection(
  'https://api.devnet.solana.com'
);`}
            />
          </div>

          <div>
            <h4 className="font-bold mb-2 text-sm">Production</h4>
            <CodeBlock
              language="typescript"
              code={`// Mainnet (production)
const connection = new Connection(
  'https://rpc.helius.xyz/?api-key=YOUR_KEY'
);`}
            />
          </div>
        </div>
      </div>

      {/* Get SOL */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Getting SOL for Testing</h2>
        
        <CodeBlock
          language="bash"
          title="Devnet Airdrop (Free)"
          code={`# Get your wallet address
solana address

# Request free SOL
solana airdrop 2 YOUR_ADDRESS --url devnet

# Or use faucet: https://solfaucet.com/`}
        />
      </div>

      {/* Verify Installation */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Verify Installation</h2>
        
        <CodeBlock
          language="typescript"
          title="test.ts"
          code={`import { createIntent } from '@gistplus/core';
import { Keypair } from '@solana/web3.js';

const intent = createIntent({
  capability: 'test',
  maxPricePerRequest: 0.01,
  token: 'USDC',
  agentPubkey: Keypair.generate().publicKey
});

console.log('✓ Installation successful!');
console.log('Intent ID:', intent.intentId);`}
        />

        <div className="mt-4">
          <CodeBlock language="bash" code="ts-node test.ts" />
        </div>
      </div>
    </div>
  )
}

