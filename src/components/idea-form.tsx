"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { X, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

const formSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters").max(100),
    description: z.string().min(20, "Description must be at least 20 characters"),
    tags: z.array(z.string()).min(1, "Add at least one tag").max(5, "Max 5 tags"),
})

interface IdeaFormProps {
    initialData?: {
        id?: string
        title: string
        description: string
        tags: string[]
    }
    isEditing?: boolean
}

export function IdeaForm({ initialData, isEditing = false }: IdeaFormProps) {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [tagInput, setTagInput] = useState("")

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: initialData?.title || "",
            description: initialData?.description || "",
            tags: initialData?.tags || [],
        },
    })

    const mutation = useMutation({
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            const url = isEditing && initialData?.id
                ? `/api/ideas/${initialData.id}`
                : "/api/ideas"

            const method = isEditing ? "PUT" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || "Failed to save idea")
            }

            return res.json()
        },
        onSuccess: (data) => {
            toast.success(isEditing ? "Idea updated!" : "Idea created!")
            queryClient.invalidateQueries({ queryKey: ["ideas"] })
            if (isEditing) {
                queryClient.invalidateQueries({ queryKey: ["idea", initialData?.id] })
            }
            router.push(isEditing ? `/ideas/${initialData?.id}` : "/")
            router.refresh()
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            const tag = tagInput.trim()
            if (tag && !form.getValues("tags").includes(tag)) {
                const currentTags = form.getValues("tags")
                if (currentTags.length >= 5) {
                    toast.error("Max 5 tags allowed")
                    return
                }
                form.setValue("tags", [...currentTags, tag])
                setTagInput("")
            }
        }
    }

    const removeTag = (tagToRemove: string) => {
        const currentTags = form.getValues("tags")
        form.setValue("tags", currentTags.filter((tag) => tag !== tagToRemove))
    }

    function onSubmit(values: z.infer<typeof formSchema>) {
        mutation.mutate(values)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., AI-Powered Recycling App" {...field} />
                            </FormControl>
                            <FormDescription>
                                Give your idea a catchy and descriptive title.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Describe your idea, the problem it solves, and the tech stack..."
                                    className="min-h-[150px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tags</FormLabel>
                            <FormControl>
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Type a tag (e.g., React)"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={handleAddTag}
                                        />
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => {
                                                const tag = tagInput.trim()
                                                if (tag && !form.getValues("tags").includes(tag)) {
                                                    const currentTags = form.getValues("tags")
                                                    if (currentTags.length >= 5) {
                                                        toast.error("Max 5 tags allowed")
                                                        return
                                                    }
                                                    form.setValue("tags", [...currentTags, tag])
                                                    setTagInput("")
                                                }
                                            }}
                                        >
                                            Add
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {(field.value || []).map((tag) => (
                                            <Badge key={tag} variant="secondary" className="gap-1">
                                                {tag}
                                                <X
                                                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                                                    onClick={() => removeTag(tag)}
                                                />
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </FormControl>
                            <FormDescription>
                                Add up to 5 tags to help others find your idea.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditing ? "Update Idea" : "Create Idea"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
