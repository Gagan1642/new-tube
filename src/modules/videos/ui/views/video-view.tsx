import { CommentsSection } from "../sections/comments-section";
import { SuggestionsSection } from "../sections/suggestions-section";
import { VideoSection } from "../sections/video-section";

interface VideoViewProps {
    videoId: string;
}

export const VideoView = ({ videoId }: VideoViewProps) => {
    return (
        <div className="flex flex-col w-full max-w-[1700px] mx-auto pt-2.5 px-4 mb-10">
            <div className="flex flex-col xl:flex-row gap-6 w-full">
                <div className="flex-1 min-w-0 w-full">
                    <VideoSection videoId={videoId} />
                    <div className="xl:hidden block mt-4">
                        <SuggestionsSection />
                    </div>
                    <CommentsSection videoId={videoId} />
                </div>
                <div className="hidden xl:block w-full xl:w-[380px] 2xl:w-[460px] shrink-0">
                    <SuggestionsSection />
                </div>
            </div>
        </div>   
    )
}