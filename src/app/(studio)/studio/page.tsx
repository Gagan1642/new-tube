// import { DEFAULT_LIMIT } from "@/contants";
// import { StudioView } from "@/modules/studio/ui/view/studio-view";
// import { trpc } from "@/trpc/client";
// import { HydrateClient } from "@/trpc/server";

// const Page = async () => {
//     await trpc.studio.getMany.prefetch({
//         limit: DEFAULT_LIMIT,
//     }, {
//         getNextPageParam: (lastPage) => lastPage.nextCursor
//     });

//     return (
//         <HydrateClient>
//             <StudioView />
//         </HydrateClient>
//     )
// }

// export default Page;









import { DEFAULT_LIMIT } from "@/contants";
import { StudioView } from "@/modules/studio/ui/views/studio-view";
import { trpc } from "@/trpc/server";
import { HydrateClient } from "@/trpc/server";

const Page = async () => {
    // Using the RSC-compatible way to call the procedure
    await trpc.studio.getMany.prefetch({
        limit: DEFAULT_LIMIT,
    });

    return (
        <HydrateClient>
            <StudioView />
        </HydrateClient>
    )
}

export default Page;