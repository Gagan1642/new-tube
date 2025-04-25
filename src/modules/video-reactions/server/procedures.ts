import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { videoReactions } from "@/db/schema";

export const videoReactionsRouter = createTRPCRouter({
    like: protectedProcedure
        .input(z.object({ videoId: z.string().uuid() }))
        .mutation(async ({ input, ctx }) => {
            const { videoId } = input;
            const { id: userId } = ctx.user;

            const [existingVideoReactionLike] = await db
                .select()
                .from(videoReactions)
                .where(and(
                    eq(videoReactions.videoId, videoId),
                    eq(videoReactions.userId, userId),
                    eq(videoReactions.type, "like"),
                ));

            if (existingVideoReactionLike) {
                const [deletedViewwerReaction] = await db
                    .delete(videoReactions)
                    .where(and(
                        eq(videoReactions.videoId, videoId),
                        eq(videoReactions.userId, userId),
                    ))
                    .returning();

                return deletedViewwerReaction;
            }


            const [createdVideoReaction] = await db
                .insert(videoReactions)
                .values({
                    userId,
                    videoId,
                    type: "like",
                })
                .onConflictDoUpdate({
                    target: [videoReactions.userId, videoReactions.videoId],
                    set: {
                        type: "like",
                    },
                })
                .returning();

            return createdVideoReaction;
        }),


    dislike: protectedProcedure
        .input(z.object({ videoId: z.string().uuid() }))
        .mutation(async ({ input, ctx }) => {
            const { videoId } = input;
            const { id: userId } = ctx.user;

            const [existingVideoReactionDislike] = await db
                .select()
                .from(videoReactions)
                .where(and(
                    eq(videoReactions.videoId, videoId),
                    eq(videoReactions.userId, userId),
                    eq(videoReactions.type, "dislike"),
                ));

            if (existingVideoReactionDislike) {
                const [deletedViewwerReaction] = await db
                    .delete(videoReactions)
                    .where(and(
                        eq(videoReactions.videoId, videoId),
                        eq(videoReactions.userId, userId),
                    ))
                    .returning();

                return deletedViewwerReaction;
            }


            const [createdVideoReaction] = await db
                .insert(videoReactions)
                .values({
                    userId,
                    videoId,
                    type: "dislike",
                })
                .onConflictDoUpdate({
                    target: [videoReactions.userId, videoReactions.videoId],
                    set: {
                        type: "dislike",
                    },
                })
                .returning();

            return createdVideoReaction;
        })
});