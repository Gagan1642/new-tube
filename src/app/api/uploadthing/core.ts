import { db } from "@/db";
import { users, videos } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import { z } from "zod";

const f = createUploadthing();

export const ourFileRouter = {
  thumbnailUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .input(z.object({
      videoId: z.string().uuid(),
    }))
    .middleware(async ({ input, req }) => {
      try {
        console.log("Request headers:", req.headers);

        const authResult = await auth();
        console.log("Auth result:", authResult);

        const { userId: clerkUserId } = authResult;

        // If auth fails in development, you can use a fallback for testing
        if (!clerkUserId) {
          console.log("No clerk user ID found - using dev fallback");
          // For development only - remove in production
          if (process.env.NODE_ENV === "development") {
            // Get the first user from the database for testing
            const [firstUser] = await db.select().from(users).limit(1);
            if (firstUser) {
              return { user: firstUser, ...input };
            }
          }

          throw new UploadThingError("Unauthorized");
        }

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.clerkId, clerkUserId));

        if (!user) {
          console.log("User not found in database");
          throw new UploadThingError("Unauthorized");
        }

        const [existingVideo] = await db
          .select({
            thumbnailKey: videos.thumbnailKey,
          })
          .from(videos)
          .where(and(
            eq(videos.id, input.videoId),
            eq(videos.userId, user.id),
          ));

        if (!existingVideo) {
          throw new UploadThingError("Not Found");
        }

        if (existingVideo.thumbnailKey) {
          const utapi = new UTApi();

          await utapi.deleteFiles(existingVideo.thumbnailKey);
          await db
            .update(videos)
            .set({
              thumbnailKey: null,
              thumbnailUrl: null,
            })
            .where(and(
              eq(videos.id, input.videoId),
              eq(videos.userId, user.id),
            ));
        }

        return { user, ...input };

      } catch (error) {
        console.error("Auth error:", error);
        throw new UploadThingError("Authentication failed");
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        await db
          .update(videos)
          .set({
            thumbnailUrl: file.ufsUrl,
            thumbnailKey: file.key
          })
          .where(and(
            eq(videos.id, metadata.videoId),
            eq(videos.userId, metadata.user.id),
          ));

        return { uploadedBy: metadata.user.id };
      } catch (error) {
        console.error("Database update error:", error);
        throw new UploadThingError("Failed to update video thumbnail");
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;