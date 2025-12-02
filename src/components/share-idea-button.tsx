"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface ShareIdeaButtonProps {
    ideaId: string
    ideaTitle: string
}

export function ShareIdeaButton({ ideaId, ideaTitle }: ShareIdeaButtonProps) {
    const [copied, setCopied] = useState(false)

    const shareUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/ideas/${ideaId}`
        : ''

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            toast.success("Link copied to clipboard!")
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            toast.error("Failed to copy link")
        }
    }

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: ideaTitle,
                    text: `Check out this hackathon idea: ${ideaTitle}`,
                    url: shareUrl,
                })
            } catch (error) {
                // User cancelled or share failed
            }
        } else {
            handleCopy()
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Idea
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Share this idea</DialogTitle>
                    <DialogDescription>
                        Share this link with potential team members. They can view the idea and request to join.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            value={shareUrl}
                            readOnly
                            className="flex-1"
                        />
                        <Button
                            onClick={handleCopy}
                            variant="outline"
                            className="shrink-0"
                        >
                            {copied ? (
                                <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy
                                </>
                            )}
                        </Button>
                    </div>
                    {typeof navigator !== 'undefined' && 'share' in navigator && (
                        <Button onClick={handleShare} className="w-full">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share via...
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
