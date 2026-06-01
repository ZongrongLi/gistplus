import { npmPackageUrl } from '@/lib/links'

export default function NpmPackageLink({ name }: { name: string }) {
  return (
    <a
      href={npmPackageUrl(name)}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm font-medium text-purple hover:underline"
    >
      View on npm →
    </a>
  )
}
