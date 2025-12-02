"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { IdeaCard } from "@/components/idea-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Plus } from "lucide-react"
import Link from "next/link"
import { useDebounce } from "@/hooks/use-debounce"

async function getIdeas(page: number, search: string) {
  const res = await fetch(`/api/ideas?page=${page}&limit=9&search=${encodeURIComponent(search)}`)
  if (!res.ok) throw new Error("Failed to fetch ideas")
  return res.json()
}

export default function Home() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 500)
  const [page, setPage] = useState(1)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["ideas", page, debouncedSearch],
    queryFn: () => getIdeas(page, debouncedSearch),
  })

  return (
    <div className="space-y-8">
      <section className="text-center space-y-4 py-12 bg-gradient-to-b from-primary/5 to-background rounded-3xl">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Build Your Dream Team
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover innovative hackathon ideas, find talented teammates, and bring your projects to life.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link href="/ideas/new">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Post an Idea
            </Button>
          </Link>
        </div>
      </section>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-14 md:top-0 z-10 bg-background/95 backdrop-blur py-4 border-b">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search ideas, tags, or descriptions..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {data?.pagination?.total || 0} ideas found
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-[200px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-red-500">
          Failed to load ideas. Please try again.
        </div>
      ) : data?.ideas?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No ideas found. Be the first to post one!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.ideas.map((idea: any) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}

      {data?.pagination && (
        <div className="flex justify-center gap-2 py-8">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm">
            Page {page} of {data.pagination.pages || 1}
          </span>
          <Button
            variant="outline"
            disabled={page >= (data.pagination.pages || 1)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
