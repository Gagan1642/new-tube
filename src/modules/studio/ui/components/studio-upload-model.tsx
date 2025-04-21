"use client";

import { Button } from "@/components/ui/button"
import { Loader2Icon, PlusIcon } from "lucide-react"
import { trpc } from "@/trpc/client"
import { toast } from "sonner";
import { ResponsiveModel } from "@/components/responsive-model";
import { StudioUploader } from "./studio-uploader";

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
        <>
        <ResponsiveModel
            title="Upload a video"
            open={!!create.data?.url}
            onOpenChange={() => create.reset()}
        >
            { create.data?.url 
            ? <StudioUploader endpoint={create.data.url} onSuccess={() => {}}/> 
            : <Loader2Icon /> }

        </ResponsiveModel>
        <Button variant="secondary" onClick={() => create.mutate()} disabled={create.isPending}>
            {create.isPending ? <Loader2Icon className="animate-spin" /> : <PlusIcon/>}
            Create
        </Button>
        </>
    )
}