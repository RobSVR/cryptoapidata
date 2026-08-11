export type ApiProtocol = "REST" | "WebSocket" | "GraphQL" | "JSON-RPC"

export type CryptoApi = {
  slug: string
  name: string
  description: string
  categories: string[]
  protocols: ApiProtocol[]
  access: "Public" | "Public + auth"
  freeAccess: boolean
  apiBaseUrl: string
  documentationUrl: string
  websiteUrl: string
  usedFor: string
  lastVerifiedAt: string
}
