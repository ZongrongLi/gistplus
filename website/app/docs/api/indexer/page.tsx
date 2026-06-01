import CodeBlock from '@/components/CodeBlock'
import NpmPackageLink from '@/components/NpmPackageLink'

export default function IndexerAPIPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-4xl font-bold mb-4">@gistplus/indexer</h1>
      <p className="text-lg text-dark/60 mb-3">
        Analytics and reputation tracking for providers
      </p>
      <div className="mb-12">
        <NpmPackageLink name="@gistplus/indexer" />
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">GistIndexer</h2>
        
        <CodeBlock
          language="typescript"
          title="Initialize Indexer"
          code={`import { GistIndexer } from '@gistplus/indexer';

const indexer = new GistIndexer({
  connection: new Connection('https://api.devnet.solana.com')
});`}
        />
      </div>

      <div className="mb-12">
        <h3 className="text-xl font-bold mb-4">Index Receipts</h3>
        
        <CodeBlock
          language="typescript"
          code={`// Index a receipt
indexer.indexReceipt(receipt);

// Index a session
indexer.indexSession(session);`}
        />
      </div>

      <div className="mb-12">
        <h3 className="text-xl font-bold mb-4">Get Provider Reputation</h3>
        
        <CodeBlock
          language="typescript"
          code={`const reputation = indexer.getProviderReputation(providerPubkey);

console.log(reputation);
// {
//   providerPubkey: "...",
//   score: 95,                    // 0-100
//   totalRequests: 1000,
//   slaComplianceRate: 0.95,
//   averageLatency: 1234,
//   disputeRate: 0.02
// }`}
        />
      </div>

      <div className="mb-12">
        <h3 className="text-xl font-bold mb-4">Get Market Analytics</h3>
        
        <CodeBlock
          language="typescript"
          code={`const analytics = indexer.getMarketAnalytics('gpt-4-inference');

console.log(analytics);
// {
//   capability: "gpt-4-inference",
//   averagePrice: 0.015,
//   priceRange: { min: 0.008, max: 0.025 },
//   totalVolume: 1000.50,
//   providerCount: 12
// }`}
        />
      </div>
    </div>
  )
}

