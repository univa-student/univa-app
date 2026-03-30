import usePageTitle from "@/shared/hooks/usePageTitle";
import { SearchIcon, UserPlusIcon, UsersIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/shadcn/ui/tabs";
import { useFriendsRealtime } from "@/modules/user/api/hooks";
import { FriendsList, FriendsSearchList, PendingRequestsList } from "@/modules/user/ui/friends-lists";

export function FriendsPage() {
    usePageTitle("Друзі", { suffix: true });
    useFriendsRealtime();

    return (
        <div className="mx-auto w-full іspace-y-6">
            <header className="mb-8">
                <h1 className="mb-2 text-3xl font-bold tracking-tight">Друзі</h1>
                <p className="text-sm text-muted-foreground">
                    Керуйте контактами, вхідними запитами і швидко знаходьте потрібних людей через пошук.
                </p>
            </header>

            <Tabs defaultValue="friends" className="w-full">
                <div className="mb-6 flex items-center justify-between">
                    <TabsList className="w-full h-20 justify-start space-x-6 bg-transparent p-0">
                        <TabsTrigger
                            value="friends"
                            className="h-12"
                        >
                            <UsersIcon className="size-4" />
                            Всі друзі
                        </TabsTrigger>
                        <TabsTrigger
                            value="pending"
                            className="h-12"
                        >
                            <UserPlusIcon className="size-4" />
                            Запити
                        </TabsTrigger>
                        <TabsTrigger
                            value="search"
                            className="h-12"
                        >
                            <SearchIcon className="size-4" />
                            Пошук
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="friends" className="mt-0 outline-none">
                    <FriendsList />
                </TabsContent>

                <TabsContent value="pending" className="mt-0 outline-none">
                    <PendingRequestsList />
                </TabsContent>

                <TabsContent value="search" className="mt-0 outline-none">
                    <FriendsSearchList />
                </TabsContent>
            </Tabs>
        </div>
    );
}
