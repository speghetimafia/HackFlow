"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Loader2, UserPlus } from "lucide-react"

interface InterestButtonProps {
    ideaId: string
    hasRequested?: boolean
}

export function InterestButton({ ideaId, hasRequested = false }: InterestButtonProps) {
    const queryClient = useQueryClient()
    const [requested, setRequested] = useState(hasRequested)

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/ideas/${ideaId}/interest`, {
                method: "POST",
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || "Failed to send request")
            }

            return res.json()
        },
        onSuccess: () => {
            toast.success("Request sent successfully!")
            setRequested(true)
            queryClient.invalidateQueries({ queryKey: ["idea", ideaId] })
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })

    if (requested) {
        return (
            <Button disabled variant="secondary" className="w-full md:w-auto">
                Request Sent
            </Button>
        )
    }

    return (
        <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="w-full md:w-auto gap-2"
        >
            {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <UserPlus className="h-4 w-4" />
            )}
            I&apos;m Interested
        </Button>
    )
}
