// import { ResponsiveModel } from "@/components/responsive-model";
// import { UploadDropzone } from "@/lib/uploadthing";

// interface ThumbnailUploadModelProps {
//     videoId: string;
//     open: boolean;
//     onOpenChange: (open: boolean) => void;
// }

// export const ThumbnailUploadModel = ({
//     videoId,
//     open,
//     onOpenChange
// }: ThumbnailUploadModelProps) => {
//     return (
//         <ResponsiveModel
//             title="Upload Thumbnail"
//             open={open}
//             onOpenChange={onOpenChange}
//         >
//             <div className="flex flex-col items-center justify-center p-4">
//                 <UploadDropzone
//                     endpoint="imageUploader"
//                     onClientUploadComplete={(res) => {
//                         console.log("Files: ", res);
//                         alert("Upload Completed");
//                         onOpenChange(false);
//                     }}
//                     onUploadError={(error: Error) => {
//                         alert(`ERROR! ${error.message}`);
//                     }}
//                     onUploadBegin={(name) => {
//                         console.log("Uploading: ", name);
//                     }}
//                     className="w-full max-w-md border-2 border-dashed border-gray-300 rounded-lg p-6 ut-button:bg-blue-500 ut-button:hover:bg-blue-600 ut-label:text-gray-600"
//                 />
//             </div>
//         </ResponsiveModel>
//     )
// }













import { ResponsiveModel } from "@/components/responsive-model";
import { UploadDropzone } from "@/lib/uploadthing";
import { trpc } from "@/trpc/client";
import { useState } from "react";

interface ThumbnailUploadModelProps {
    videoId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ThumbnailUploadModel = ({
    videoId,
    open,
    onOpenChange
}: ThumbnailUploadModelProps) => {
    const utils = trpc.useUtils();
    const onUploadComplete = () => {
        utils.studio.getMany.invalidate();
        utils.studio.getOne.invalidate({ id: videoId });
        onOpenChange(false);
    }

    const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState<string>("");

    return (
        <ResponsiveModel
            title="Upload Thumbnail"
            open={open}
            onOpenChange={onOpenChange}
        >
            <div className="flex flex-col items-center justify-center p-4">
                {uploadStatus === "success" ? (
                    <div className="w-full max-w-md text-center p-6 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-green-700 font-medium">Thumbnail uploaded successfully!</p>
                        <button 
                            onClick={() => onOpenChange(false)} 
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        <UploadDropzone
                            endpoint="thumbnailUploader"
                            input={{ videoId }}
                            onClientUploadComplete={onUploadComplete}
                            onUploadError={(error: Error) => {
                                setUploadStatus("error");
                                setErrorMessage(error.message);
                            }}
                            onUploadBegin={(name) => {
                                console.log("Uploading: ", name);
                                setUploadStatus("uploading");
                            }}
                            className="w-full max-w-md border-2 border-dashed border-gray-300 rounded-lg p-6 ut-button:bg-blue-500 ut-button:hover:bg-blue-600 ut-label:text-gray-600"
                        />
                        {uploadStatus === "error" && (
                            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded border border-red-200">
                                Error: {errorMessage}
                            </div>
                        )}
                    </>
                )}
            </div>
        </ResponsiveModel>
    )
}