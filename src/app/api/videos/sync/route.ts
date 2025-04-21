// // Create a new file: src/app/api/videos/sync/route.ts
// import { db } from "@/db";
// import { videos } from "@/db/schema";
// import { mux } from "@/lib/mux";
// import { eq } from "drizzle-orm";

// export async function GET() {
//   try {
//     // Get all videos with status "Waiting"
//     const pendingVideos = await db.query.videos.findMany({
//       where: (video) => eq(video.muxStatus, "Waiting")
//     });

//     const results = [];

//     for (const video of pendingVideos) {
//       if (!video.muxAssetId) {
//         // If no asset ID, try to look it up by upload ID
//         if (video.muxUploadId) {
//           try {
//             // Find all assets and filter by upload ID
//             const assets = await mux.video.assets.list();
//             const matchingAsset = assets.find(
//               asset => asset.upload_id === video.muxUploadId
//             );
            
//             if (matchingAsset) {
//               // Found the asset, update the asset ID
//               await db
//                 .update(videos)
//                 .set({ muxAssetId: matchingAsset.id })
//                 .where(eq(videos.id, video.id));
              
//               // Continue with this asset
//               video.muxAssetId = matchingAsset.id;
//             }
//           } catch (error) {
//             console.error("Error looking up asset by upload ID:", error);
//           }
//         }
        
//         // If still no asset ID, skip this video
//         if (!video.muxAssetId) {
//           results.push({
//             id: video.id,
//             updated: false,
//             error: "No asset ID available"
//           });
//           continue;
//         }
//       }
      
//       // Get the asset from Mux
//       const asset = await mux.video.assets.get(video.muxAssetId);
      
//       // If the asset is ready, update the database
//       if (asset.status === "ready" && asset.playback_ids?.length > 0) {
//         const playbackId = asset.playback_ids[0].id;
//         const thumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;
        
//         // Update the video in the database
//         await db
//           .update(videos)
//           .set({
//             muxStatus: asset.status,
//             muxPlaybackId: playbackId,
//             thumbnailUrl
//           })
//           .where(eq(videos.id, video.id));
        
//         results.push({
//           id: video.id,
//           updated: true,
//           status: asset.status,
//           thumbnailUrl
//         });
//       } else {
//         results.push({
//           id: video.id,
//           updated: false,
//           status: asset.status
//         });
//       }
//     }

//     return Response.json({ success: true, results });
//   } catch (error) {
//     console.error("Error syncing videos:", error);
//     return Response.json(
//       { success: false, error: error.message },
//       { status: 500 }
//     );
//   }
// }







// src/app/api/videos/sync/route.ts
import { db } from "@/db";
import { videos } from "@/db/schema";
import { mux } from "@/lib/mux";
import { eq } from "drizzle-orm";
// import { Video } from "@/types"; // You'll need to create or import your Video type

export async function GET() {
  try {
    // Get all videos with status "Waiting"
    const pendingVideos = await db.select().from(videos).where(eq(videos.muxStatus, "Waiting"));

    const results = [];

    for (const video of pendingVideos) {
      if (!video.muxAssetId) {
        // If no asset ID, try to look it up by upload ID
        if (video.muxUploadId) {
          try {
            // Find all assets and filter by upload ID
            const { data: assets } = await mux.video.assets.list();
            const matchingAsset = assets.find(
              (asset) => asset.upload_id === video.muxUploadId
            );
            
            if (matchingAsset) {
              // Found the asset, update the asset ID
              await db
                .update(videos)
                .set({ muxAssetId: matchingAsset.id })
                .where(eq(videos.id, video.id));
              
              // Continue with this asset
              video.muxAssetId = matchingAsset.id;
            }
          } catch (error) {
            console.error("Error looking up asset by upload ID:", error);
          }
        }
        
        // If still no asset ID, skip this video
        if (!video.muxAssetId) {
          results.push({
            id: video.id,
            updated: false,
            error: "No asset ID available"
          });
          continue;
        }
      }
      
      try {
        // Get the asset from Mux
        const asset = await mux.video.assets.retrieve(video.muxAssetId);
        
        // If the asset is ready, update the database
        if (asset.status === "ready" && (asset.playback_ids ?? []).length > 0) {
          const playbackId = asset.playback_ids?.[0]?.id ?? "";
          const thumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;
          
          // Update the video in the database
          await db
            .update(videos)
            .set({
              muxStatus: asset.status,
              muxPlaybackId: playbackId,
              thumbnailUrl
            })
            .where(eq(videos.id, video.id));
          
          results.push({
            id: video.id,
            updated: true,
            status: asset.status,
            thumbnailUrl
          });
        } else {
          results.push({
            id: video.id,
            updated: false,
            status: asset.status
          });
        }
      } catch (err: unknown) {
        const error = err as Error;
        results.push({
          id: video.id, 
          updated: false,
          error: error.message
        });
      }
    }

    return Response.json({ success: true, results });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Error syncing videos:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}