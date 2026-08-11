import catalogDocument from "../../public/catalog.json"
import type { CryptoApi } from "@/lib/types"

export const catalog = catalogDocument.data as CryptoApi[]
export const categories = [...new Set(catalog.flatMap((api) => api.categories))].sort()
export const protocols = [...new Set(catalog.flatMap((api) => api.protocols))].sort()
