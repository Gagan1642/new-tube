import { useUser } from "@clerk/nextjs"
import { SidebarHeader, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar"
import Link from "next/link";
import { UserAvatar } from "@/components/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";

export const StudioSidebarHeader = () => {
    const { user } = useUser();
    const { state } = useSidebar();

    if(!user) {
      return (
          <SidebarHeader className="flex flex-col items-center justify-center pb-4">
            <Skeleton className="size-[112px] rounded-full bg-gray-200"/>
            <div className="flex flex-col items-center mt-2 gap-y-2 w-full">
              <Skeleton className="h-4 w-[80px] bg-gray-200"/>
              <Skeleton className="h-4 w-[100px] bg-gray-200"/>
            </div>
          </SidebarHeader>
      );
  }


    if(state === "collapsed"){
      return(
      <SidebarMenuItem>
         <SidebarMenuButton tooltip="Your Profile" asChild>
          <Link href="/users/current">
            <UserAvatar 
              imageUrl={user?.imageUrl ?? ""}
              name={user?.fullName ?? "User"}
              size="xs"
            />
            <span className="text-sm">Your Profile</span>
          </Link>
         </SidebarMenuButton>
      </SidebarMenuItem>
      )
    }


    return(
        <SidebarHeader className="flex items-center justify-center pb-4">
            <Link href="/users/current">
               <UserAvatar 
                 imageUrl={user?.imageUrl ?? ""}
                 name={user?.fullName ?? "User"}
                 className="size-[112px] hover:opacity-80 transition-opacity"
               />
            </Link>
            <div className="flex flex-col items-center mt-2 gap-y-1">
                <p className="text-sm font-medium">
                    Your Profile
                </p>
                <p className="text-xs text-muted-foreground">{user?.fullName}</p>
            </div>
        </SidebarHeader>
    )
}