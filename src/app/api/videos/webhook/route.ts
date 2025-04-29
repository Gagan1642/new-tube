// import { eq } from "drizzle-orm";
// import { headers } from "next/headers";
// import { mux } from "@/lib/mux";
// import { videos } from "@/db/schema";
// import { db } from "@/db";
// import {
//   VideoAssetCreatedWebhookEvent,
//   VideoAssetErroredWebhookEvent,
//   VideoAssetReadyWebhookEvent,
//   VideoAssetTrackReadyWebhookEvent,
// } from "@mux/mux-node/resources/webhooks";

// const SIGNING_SECRET = process.env.MUX_WEBHOOK_SECRET!;

// type WebhookEvent =
//   | VideoAssetCreatedWebhookEvent
//   | VideoAssetErroredWebhookEvent
//   | VideoAssetReadyWebhookEvent
//   | VideoAssetTrackReadyWebhookEvent;

//   export const Post = async (request: Request) => {
//   if (!SIGNING_SECRET) {
//     throw new Error("Error: Please add MUX_WEBHOOK_SECRET from Mux Dashboard to .env or .env.local");
//   }

//   const headerPayload = await headers();
//   const muxSignature = headerPayload.get("Mux-Signature");

//   if (!muxSignature) {
//     return new Response("Error: Missing Mux-Signature", { status: 401 });
//   }

//   const payload = await request.json();

//   console.log("Received webhook:", payload.type);
//   console.log("Webhook data:", payload.data);

//   const body = JSON.stringify(payload);

//   mux.webhooks.verifySignature(
//     body,
//     {
//       "mux-signature": muxSignature,
//     },
//     SIGNING_SECRET,
//   );

//   switch (payload.type as WebhookEvent["type"]) {
//     case "video.asset.created": {
//       const data = payload.data as VideoAssetCreatedWebhookEvent["data"];

//       console.log("Asset ready data:", data);
//       console.log("Upload ID:", data.upload_id);

//       if (!data.upload_id) {
//         return new Response("Error: Missing upload_id", { status: 400 });
//       }

//       await db
//         .update(videos)
//         .set({
//           muxAssetId: data.id,
//           muxStatus: data.status,
//         })
//         .where(eq(videos.muxUploadId, data.upload_id));
//       break;
//     }

//     case "video.asset.ready": {
//       const data = payload.data as VideoAssetReadyWebhookEvent["data"];
//       const playbackId = data.playback_ids?.[0].id;

//       if (!data.upload_id) {
//         return new Response("Error: Missing upload_id", { status: 400 });
//       }

//       if (!playbackId) {
//         return new Response("Error: Missing playback_id", { status: 400 });
//       }

//       const thumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;
//       const previewUrl = `https://image.mux.com/${playbackId}/animated.gif`;

//       console.log("Setting thumbnail URL:", thumbnailUrl);

//       const result = await db
//         .update(videos)
//         .set({
//           muxStatus: data.status,
//           muxPlaybackId: playbackId,
//           muxAssetId: data.id,
//           thumbnailUrl,
//           previewUrl,
//         })
//         .where(eq(videos.muxUploadId, data.upload_id));

//         console.log("DB update completed:", result);

//       break;

//     }
//   }

//   return new Response("Webhook received", { status: 200 });
// }

















import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { mux } from "@/lib/mux";
import { videos } from "@/db/schema";
import { db } from "@/db";
import { UTApi } from "uploadthing/server";
import {
  VideoAssetCreatedWebhookEvent,
  VideoAssetErroredWebhookEvent,
  VideoAssetReadyWebhookEvent,
  VideoAssetTrackReadyWebhookEvent,
  VideoAssetDeletedWebhookEvent,
} from "@mux/mux-node/resources/webhooks";

const SIGNING_SECRET = process.env.MUX_WEBHOOK_SECRET!;

type WebhookEvent =
  | VideoAssetCreatedWebhookEvent
  | VideoAssetErroredWebhookEvent
  | VideoAssetReadyWebhookEvent
  | VideoAssetTrackReadyWebhookEvent
  | VideoAssetDeletedWebhookEvent;

export async function POST(request: Request) {


  try {
    if (!SIGNING_SECRET) {
      throw new Error("Error: Please add MUX_WEBHOOK_SECRET from Mux Dashboard to .env or .env.local");
    }

    const headerPayload = await headers();
    const muxSignature = headerPayload.get("Mux-Signature");

    if (!muxSignature) {
      return new Response("Error: Missing Mux-Signature", { status: 401 });
    }

    const payload = await request.json();

    console.log("Received webhook:", payload.type);
    console.log("Webhook data:", payload.data);

    const body = JSON.stringify(payload);

    mux.webhooks.verifySignature(
      body,
      {
        "mux-signature": muxSignature,
      },
      SIGNING_SECRET,
    );

    switch (payload.type as WebhookEvent["type"]) {

      case "video.asset.created": {
        const data = payload.data as VideoAssetCreatedWebhookEvent["data"];

        console.log("Asset ready data:", data);
        console.log("Upload ID:", data.upload_id);

        if (!data.upload_id) {
          return new Response("Error: Missing upload_id", { status: 400 });
        }

        // await db
        //   .update(videos)
        //   .set({
        //     muxAssetId: data.id,
        //     muxStatus: data.status,
        //   })
        //   .where(eq(videos.muxUploadId, data.upload_id));
        // break;


        await db
          .update(videos)
          .set({
            muxAssetId: data.id,
            muxStatus: data.status.toLowerCase(), // Force lowercase
          })
          .where(eq(videos.muxUploadId, data.upload_id));
        break;
      }

      case "video.asset.ready": {
        const data = payload.data as VideoAssetReadyWebhookEvent["data"];
        const playbackId = data.playback_ids?.[0].id;

        if (!data.upload_id) {
          console.error("Error: Missing upload_id in webhook payload");
          return new Response("Error: Missing upload_id", { status: 400 });
        }

        if (!playbackId) {
          return new Response("Error: Missing playback_id", { status: 400 });
        }

        const tempThumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;
        const tempPreviewUrl = `https://image.mux.com/${playbackId}/animated.gif`;
        const duration = data.duration ? Math.round(data.duration * 1000) : 0;

        const utapi = new UTApi();
        const [
          uploadedThumbnail,
          uploadedPreview,
        ] = await utapi.uploadFilesFromUrl([
          tempThumbnailUrl,
          tempPreviewUrl,
        ]);

        if (!uploadedThumbnail.data || !uploadedPreview.data) {
          return new Response("Error: Failed to upload thumbnail or preview", { status: 500 });
        }

        const { key: thumbnailKey, ufsUrl: thumbnailUrl } = uploadedThumbnail.data;
        const { key: previewKey, ufsUrl: previewUrl } = uploadedPreview.data;

        await db
          .update(videos)
          .set({
            muxStatus: data.status,
            muxPlaybackId: playbackId,
            muxAssetId: data.id,
            thumbnailUrl,
            thumbnailKey,
            previewUrl,
            previewKey,
            duration,
          })
          .where(eq(videos.muxUploadId, data.upload_id));
        break;



        // await db
        //   .update(videos)
        //   .set({
        //     muxStatus: data.status.toLowerCase(), // Force lowercase
        //     muxPlaybackId: playbackId,
        //     muxAssetId: data.id,
        //     thumbnailUrl,
        //     thumbnailKey,
        //     previewUrl,
        //     previewKey,
        //     duration,
        //   })
        //   .where(eq(videos.muxUploadId, data.upload_id));

        // break;
      }

      case "video.asset.errored": {
        const data = payload.data as VideoAssetErroredWebhookEvent["data"];

        if (!data.upload_id) {
          return new Response("Error: Missing upload_id", { status: 400 });
        }

        // await db
        //   .update(videos)
        //   .set({
        //     muxStatus: data.status,
        //   })
        //   .where(eq(videos.muxUploadId, data.upload_id));


        await db
          .update(videos)
          .set({
            muxStatus: data.status.toLowerCase(), // Force lowercase
          })
          .where(eq(videos.muxUploadId, data.upload_id));
        break;
      }

      case "video.asset.deleted": {
        const data = payload.data as VideoAssetDeletedWebhookEvent["data"];

        if (!data.upload_id) {
          return new Response("Error: Missing upload_id", { status: 400 });
        }

        await db
          .delete(videos)
          .where(eq(videos.muxUploadId, data.upload_id));
        break;
      }

      case "video.asset.track.ready": {
        const data = payload.data as VideoAssetTrackReadyWebhookEvent["data"] & {
          asset_id: string;
        };

        // TypeScript incorrectly says that asset_id does not exist on data
        const assetId = data.asset_id;
        const trackId = data.id;
        const status = data.status;

        if (!assetId) {
          return new Response("Error: Missing asset_id", { status: 400 });
        }

        await db
          .update(videos)
          .set({
            muxTrackId: trackId,
            muxTrackStatus: status,
          })
          .where(eq(videos.muxAssetId, assetId));
        break;
      }
    }

    return new Response("Webhook received", { status: 200 });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(`Error processing webhook: ${error}`, { status: 500 });
  }
}

