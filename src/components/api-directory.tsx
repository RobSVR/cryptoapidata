"use client"

import { useEffect, useMemo, useState, type SVGProps } from "react"
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  HandCoins,
  LockOpen,
  Search,
  Sparkles,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { CryptoApi } from "@/lib/types"

type Props = {
  apis: CryptoApi[]
  categories: string[]
  protocols: string[]
  builderUrl: string
  donationAddress: string
  donationNetwork: string
}

const PAGE_SIZE = 20

export function ApiDirectory({
  apis,
  categories,
  protocols,
  builderUrl,
  donationAddress,
  donationNetwork,
}: Props) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [protocol, setProtocol] = useState("all")
  const [publicOnly, setPublicOnly] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedApiSlug, setCopiedApiSlug] = useState<string | null>(null)
  const [aiDirectoryCopied, setAiDirectoryCopied] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const categoryCounts = useMemo(
    () => apis.reduce<Record<string, number>>((counts, api) => {
      api.categories.forEach((item) => {
        counts[item] = (counts[item] ?? 0) + 1
      })
      return counts
    }, {}),
    [apis],
  )

  useEffect(() => {
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (category !== "all") params.set("category", category)
    if (protocol !== "all") params.set("protocol", protocol)
    if (publicOnly) params.set("access", "public")
    if (currentPage > 1) params.set("page", String(currentPage))
    const next = params.size ? `?${params.toString()}` : window.location.pathname
    window.history.replaceState(null, "", next)
  }, [query, category, protocol, publicOnly, currentPage])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return apis.filter((api) => {
      const matchesQuery =
        !needle ||
        [api.name, api.description, api.usedFor, ...api.categories, ...api.protocols]
          .join(" ")
          .toLowerCase()
          .includes(needle)
      const matchesCategory = category === "all" || api.categories.includes(category)
      const matchesProtocol = protocol === "all" || api.protocols.some((item) => item === protocol)
      const matchesAccess = !publicOnly || api.access === "Public"
      return matchesQuery && matchesCategory && matchesProtocol && matchesAccess
    })
  }, [apis, category, protocol, publicOnly, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [currentPage, filtered],
  )
  const firstVisible = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const lastVisible = Math.min(currentPage * PAGE_SIZE, filtered.length)
  const paginationItems = getPaginationItems(currentPage, totalPages)

  const changePage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages))
    window.requestAnimationFrame(() => {
      const targetId = window.matchMedia("(min-width: 768px)").matches
        ? "directory-results"
        : "directory-results-mobile"
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }

  const resetFilters = () => {
    setQuery("")
    setCategory("all")
    setProtocol("all")
    setPublicOnly(false)
    setCurrentPage(1)
  }

  const copyDonation = async () => {
    if (!donationAddress) return
    await navigator.clipboard.writeText(donationAddress)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  const copyForAi = async (api: CryptoApi) => {
    const context = `I want to work with the ${api.name} API.

API profile:
- Description: ${api.description}
- Primary API base URL: ${api.apiBaseUrl}
- Official documentation: ${api.documentationUrl}
- Website: ${api.websiteUrl}
- Categories: ${api.categories.join(", ")}
- Protocols: ${api.protocols.join(", ")}
- Access: ${api.access}
- Free public access available: ${api.freeAccess ? "Yes" : "No"}
- Common use in this directory: ${api.usedFor}
- Directory entry last verified: ${api.lastVerifiedAt}
- Static directory source: ${window.location.origin}/catalog.json

Before suggesting code or making requests, consult the official documentation above. Do not invent endpoints, parameters, authentication methods, or rate limits. Clearly distinguish public market-data endpoints from authenticated trading endpoints. Help me choose the correct endpoint and produce an integration for my task.`

    await navigator.clipboard.writeText(context)
    setCopiedApiSlug(api.slug)
    window.setTimeout(() => setCopiedApiSlug(null), 1800)
  }

  const copyDirectoryForAi = async () => {
    const context = `Use this cryptocurrency API catalogue to help me find the right API for my task:
${window.location.origin}/catalog.json

The file contains static directory metadata, including provider names, descriptions, API base URLs, official documentation, protocols, access types, use cases, and verification dates. Compare relevant providers, prefer official documentation, and do not invent endpoints, authentication requirements, pricing, or rate limits.`

    await navigator.clipboard.writeText(context)
    setAiDirectoryCopied(true)
    window.setTimeout(() => setAiDirectoryCopied(false), 1800)
  }

  return (
    <main className="min-h-screen">
      <section id="top" className="mx-auto max-w-[1440px] px-4 pb-10 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
            Crypto APIs Catalogue
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
            Verified APIs for market data, perpetual DEXs, and DeFi. Fast discovery for people,
            structured access for AI agents.
          </p>
        </div>

        <div className="mt-9 flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            onClick={copyDirectoryForAi}
            className="w-fit text-muted-foreground"
            aria-label="Copy catalogue instructions for AI"
          >
            {aiDirectoryCopied ? "Copied" : "For AI"}
            {aiDirectoryCopied ? <Check className="text-emerald-600" /> : <Copy />}
          </Button>
          <span className="px-1 text-border" aria-hidden="true">|</span>
          <a
            href={builderUrl}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "ghost" }), "w-fit text-muted-foreground")}
          >
            <XLogo /> Built by robsvr
          </a>
          <span className="px-1 text-border" aria-hidden="true">|</span>
          <Button variant="ghost" className="text-muted-foreground" onClick={() => setSupportOpen(true)}>
            <HandCoins /> Support
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-20 sm:px-6 lg:px-8">
        <div className="border-y py-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_220px_180px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Search APIs, data, or protocols…"
                className="pl-9"
              />
            </div>
            <FilterSelect
              value={category}
              onChange={(value) => {
                setCategory(value)
                setCurrentPage(1)
              }}
              label="All categories"
              options={categories}
              optionCounts={categoryCounts}
            />
            <FilterSelect
              value={protocol}
              onChange={(value) => {
                setProtocol(value)
                setCurrentPage(1)
              }}
              label="All protocols"
              options={protocols}
            />
            <Button
              variant={publicOnly ? "secondary" : "outline"}
              className="h-10 justify-start lg:justify-center"
              onClick={() => {
                setPublicOnly((value) => !value)
                setCurrentPage(1)
              }}
            >
              <LockOpen /> No authentication
            </Button>
          </div>
          <div className="mt-4 flex items-center justify-between gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-emerald-500" />
              Open directory · {apis.length} APIs
            </span>
            {(query || category !== "all" || protocol !== "all" || publicOnly) && (
              <button onClick={resetFilters} className="hover:text-foreground">Reset filters</button>
            )}
          </div>
        </div>

        <div id="directory-results" className="scroll-mt-4 hidden overflow-hidden border-b md:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[19%] pl-0 text-center">API</TableHead>
                <TableHead className="w-[18%] text-center">Use case</TableHead>
                <TableHead className="w-[17%] text-center">Category</TableHead>
                <TableHead className="w-[13%] text-center">Access</TableHead>
                <TableHead className="w-[14%] text-center">Protocol</TableHead>
                <TableHead className="w-[19%] pr-0 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((api) => (
                <TableRow key={api.slug}>
                  <TableCell className="pl-0">
                    <a href={api.websiteUrl} target="_blank" rel="noreferrer" className="font-medium hover:underline">
                      {api.name}
                    </a>
                    <p className="mt-1 line-clamp-2 max-w-xs text-xs leading-5 text-muted-foreground">
                      {api.description}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{api.usedFor}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {api.categories.slice(0, 2).map((item) => <Badge key={item} variant="outline">{item}</Badge>)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <span className="size-1.5 rounded-full bg-emerald-500" /> {api.access}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {api.protocols.map((item) => <Badge key={item} variant="secondary">{item}</Badge>)}
                    </div>
                  </TableCell>
                  <TableCell className="pr-0 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => copyForAi(api)} className="px-2">
                        {copiedApiSlug === api.slug ? <Check className="text-emerald-600" /> : <Sparkles />}
                        {copiedApiSlug === api.slug ? "Copied" : "Copy for AI"}
                      </Button>
                      <a
                        href={api.documentationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "px-2")}
                      >
                        Docs <ExternalLink />
                      </a>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div id="directory-results-mobile" className="scroll-mt-4 divide-y md:hidden">
          {paginated.map((api) => (
            <article key={api.slug} className="py-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <a href={api.websiteUrl} target="_blank" rel="noreferrer" className="font-semibold hover:underline">
                    {api.name}
                  </a>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{api.description}</p>
                </div>
                <a href={api.documentationUrl} target="_blank" rel="noreferrer" aria-label={`${api.name} documentation`}>
                  <ExternalLink className="size-4 text-muted-foreground" />
                </a>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {api.categories.slice(0, 2).map((item) => <Badge key={item} variant="outline">{item}</Badge>)}
                {api.protocols.map((item) => <Badge key={item} variant="secondary">{item}</Badge>)}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">{api.usedFor} · Verified {api.lastVerifiedAt}</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => copyForAi(api)}>
                {copiedApiSlug === api.slug ? <Check className="text-emerald-600" /> : <Sparkles />}
                {copiedApiSlug === api.slug ? "Copied for AI" : "Copy for AI"}
              </Button>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="font-medium">No APIs found</p>
            <p className="mt-2 text-sm text-muted-foreground">Try another search or reset the filters.</p>
            <Button variant="outline" className="mt-5" onClick={resetFilters}>Reset filters</Button>
          </div>
        )}

        {filtered.length > PAGE_SIZE && (
          <nav
            className="flex flex-col gap-4 border-b py-5 sm:flex-row sm:items-center sm:justify-between"
            aria-label="API directory pagination"
          >
            <p className="text-sm text-muted-foreground">
              Showing {firstVisible}&ndash;{lastVisible} of {filtered.length} APIs
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <ChevronLeft /> Previous
              </Button>
              {paginationItems.map((item) =>
                typeof item === "number" ? (
                  <Button
                    key={item}
                    variant={item === currentPage ? "secondary" : "ghost"}
                    size="icon"
                    className="size-8 text-xs"
                    onClick={() => changePage(item)}
                    aria-label={`Page ${item}`}
                    aria-current={item === currentPage ? "page" : undefined}
                  >
                    {item}
                  </Button>
                ) : (
                  <span key={item} className="grid size-8 place-items-center text-sm text-muted-foreground">
                    &hellip;
                  </span>
                ),
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                Next <ChevronRight />
              </Button>
            </div>
          </nav>
        )}
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>An open directory of cryptocurrency APIs.</p>
          <div className="flex gap-5">
            <a href={builderUrl} target="_blank" rel="noreferrer" className="hover:text-foreground">Built by robsvr</a>
          </div>
        </div>
      </footer>

      {supportOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4 backdrop-blur-sm" onMouseDown={() => setSupportOpen(false)}>
          <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Support the directory</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Donations help cover hosting, monitoring, and API verification.
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSupportOpen(false)} aria-label="Close">
                <X />
              </Button>
            </div>
            {donationAddress ? (
              <div className="mt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{donationNetwork}</p>
                <button
                  onClick={copyDonation}
                  className="mt-2 flex w-full items-center justify-between gap-3 rounded-lg border bg-muted/40 p-3 text-left font-mono text-xs hover:bg-muted"
                >
                  <span className="truncate">{donationAddress}</span>
                  {copied ? <Check className="size-4 shrink-0 text-emerald-600" /> : <Copy className="size-4 shrink-0" />}
                </button>
                <p className="mt-3 text-xs text-muted-foreground">Only send funds using the network shown above.</p>
              </div>
            ) : (
              <div className="mt-6 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                The donation wallet will be published after launch.
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

function FilterSelect({
  value,
  onChange,
  label,
  options,
  optionCounts,
}: {
  value: string
  onChange: (value: string) => void
  label: string
  options: string[]
  optionCounts?: Record<string, number>
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full appearance-none rounded-md border border-input bg-background px-3 pr-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="all">{label}</option>
        {options.map((option) => (
          <option value={option} key={option}>
            {optionCounts ? `${option} (${optionCounts[option] ?? 0})` : option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}

function getPaginationItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1)

  const items: Array<number | "ellipsis-left" | "ellipsis-right"> = [1]
  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  if (start > 2) items.push("ellipsis-left")
  for (let page = start; page <= end; page += 1) items.push(page)
  if (end < totalPages - 1) items.push("ellipsis-right")
  items.push(totalPages)

  return items
}

function XLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.487-9.702L0 1.153h7.594l5.243 6.932 6.064-6.933Zm-1.293 19.491h2.039L6.486 3.24H4.298l13.31 17.404Z" />
    </svg>
  )
}
