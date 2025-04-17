"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/contants";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";

export const VideosSection = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
                <VideosSectionQuery />
            </ErrorBoundary>
        </Suspense>
    )
}

const VideosSectionQuery = () => {
    const [ videos, query ]= trpc.studio.getMany.useSuspenseInfiniteQuery({
        
        limit: DEFAULT_LIMIT,
    },{
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

    return <div className="flex flex-col gap-4">
        <div className="border-y">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="pl-6 w-[510px]">Video</TableHead>
                        <TableHead>Visibility</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Views</TableHead>
                        <TableHead className="text-right">Comments</TableHead>
                        <TableHead className="text-right pr-6">Likes</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {videos.pages.flatMap((page) => page.items).map((video) => (
                        <Link href={`/studio/videos/${video.id}`}  key={video.id} legacyBehavior>
                            <TableRow className="cursor-pointer hover:bg-muted/50 data-[state=selected]:bg-muted">
                               <TableCell>{video.title}</TableCell>
                               <TableCell>Visibility</TableCell>
                               <TableCell>Status</TableCell>
                               <TableCell>Date</TableCell>
                               <TableCell>Views</TableCell>
                               <TableCell>Comments</TableCell>
                               <TableCell>Likes</TableCell>
                            </TableRow>
                        </Link>
                    ))}
                </TableBody>
            </Table>
        </div>
        <InfiniteScroll 
        isManual
        hasNextPage={query.hasNextPage} 
        isFetchingNextPage={query.isFetchingNextPage} 
        fetchNextPage={query.fetchNextPage}/>
    </div>;
};