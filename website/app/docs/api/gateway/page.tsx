import CodeBlock from '@/components/CodeBlock'
import NpmPackageLink from '@/components/NpmPackageLink'

export default function GatewayAPIPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-4xl font-bold mb-4">@gistplus/gateway</h1>
      <p className="text-lg text-dark/60 mb-3">
        Independent verification and SLA dispute resolution service
      </p>
      <div className="mb-12">
        <NpmPackageLink name="@gistplus/gateway" />
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">GistGateway</h2>
        
        <p className="text-dark/70 mb-6">
          The Gateway provides third-party verification of receipts and helps resolve SLA disputes.
        </p>

        <CodeBlock
          language="typescript"
          title="Initialize Gateway"
          code={`import { GistGateway } from '@gistplus/gateway';
import { Connection } from '@solana/web3.js';

const gateway = new GistGateway({
  connection: new Connection('https://api.devnet.solana.com')
});`}
        />
      </div>

      <div className="mb-12">
        <h3 className="text-xl font-bold mb-4">Verify Receipt</h3>
        
        <CodeBlock
          language="typescript"
          code={`const verification = await gateway.verifyReceipt(receipt);

console.log(verification);
// {
//   valid: true,
//   errors: [],
//   warnings: [],
//   slaCompliant: true,
//   onChainVerified: false
// }`}
        />
      </div>

      <div className="mb-12">
        <h3 className="text-xl font-bold mb-4">Resolve SLA Dispute</h3>
        
        <CodeBlock
          language="typescript"
          code={`const resolution = await gateway.resolveSLADispute(
  session,
  receipts  // All receipts for this session
);

console.log(resolution);
// {
//   resolution: 'agent_favor' | 'provider_favor' | 'split',
//   refundAmount: number,
//   reasoning: string[],
//   evidence: any[]
// }`}
        />
      </div>
    </div>
  )
}

