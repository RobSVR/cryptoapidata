import { ApiDirectory } from "@/components/api-directory"
import { catalog, categories, protocols } from "@/lib/catalog"

export default function Home() {
  return (
    <ApiDirectory
      apis={catalog}
      categories={categories}
      protocols={protocols}
      builderUrl={process.env.NEXT_PUBLIC_BUILDER_X_URL || "https://x.com/Robsvr"}
      donationAddress={process.env.NEXT_PUBLIC_DONATION_ADDRESS || ""}
      donationNetwork={process.env.NEXT_PUBLIC_DONATION_NETWORK || "USDT — TRON (TRC-20)"}
    />
  )
}
