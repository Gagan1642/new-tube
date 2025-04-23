import { formatDuration } from "@/lib/utils";
import Image from "next/image"
import { THUMBNAIL_FALLBACK } from "../../constants";

interface VideoThumbnailProps {
    imageUrl?: string | null;
    title: string;
    previewUrl: string | null;
    duration: number;
}

export const VideoThumbnail = ({
    imageUrl,
    title,
    previewUrl,
    duration,
}: VideoThumbnailProps) => {

    console.log("Rendering thumbnail with URL:", imageUrl);
    
    return (
        <div className="relative group">
            {/* Thumbnail Wrapper */}
            <div className="relative w-full overflow-hidden rounded-xl aspect-video">
                <Image 
                src={imageUrl || THUMBNAIL_FALLBACK} 
                alt={title} 
                fill 
                className="h-full w-fullobject-cover group-hover:opacity-0" />
                <Image 
                unoptimized={!!previewUrl}
                src={previewUrl || THUMBNAIL_FALLBACK} 
                alt={title} 
                fill 
                className="h-full w-fullobject-cover opacity-0 group-hover:opacity-100" />
            </div>

            {/* Video Duration Box */}
            <div className="absolute bottom-2 right-2 px-1 py-0.5 bg-black/80 text-white text-xs rounded font-medium">
               {formatDuration(duration)}
            </div>
        </div>
    )
}