"use client";

import { Button } from "@/components/ui/button"
import { Loader2Icon, PlusIcon } from "lucide-react"
import { trpc } from "@/trpc/client"
import { toast } from "sonner";

export const StudioUploadModel = () => {
    const utils = trpc.useUtils();
    const create = trpc.videos.create.useMutation({
        onSuccess: () => {
            toast.success("Video created successfully");
            utils.studio.getMany.invalidate();
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    return (
        <Button variant="secondary" onClick={() => create.mutate()} disabled={create.isPending}>
            {create.isPending ? <Loader2Icon className="animate-spin" /> : <PlusIcon/>}
            Create
        </Button>
    )
}