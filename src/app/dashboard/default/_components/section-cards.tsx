import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Folder, Users, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Manage Posts Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Content Management</CardDescription>
          <CardTitle className="text-2xl font-semibold @[250px]/card:text-3xl">
            Manage Posts
          </CardTitle>
          <CardAction>
            <Link href="/dashboard/posts" passHref>
              <FileText className="size-6 text-muted-foreground hover:text-primary transition-colors" />
            </Link>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Create, edit, and publish your articles and blog posts.
          </div>
          <div className="text-muted-foreground">
            Stay on top of your content strategy.
          </div>
        </CardFooter>
      </Card>

      {/* Manage Projects Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Project Overview</CardDescription>
          <CardTitle className="text-2xl font-semibold @[250px]/card:text-3xl">
            Manage Projects
          </CardTitle>
          <CardAction>
            <Link href="/dashboard/projects" passHref>
              <Folder className="size-6 text-muted-foreground hover:text-primary transition-colors" />
            </Link>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Oversee all ongoing and completed projects.
          </div>
          <div className="text-muted-foreground">
            Track progress and deadlines efficiently.
          </div>
        </CardFooter>
      </Card>

      {/* See Users Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>User Management</CardDescription>
          <CardTitle className="text-2xl font-semibold @[250px]/card:text-3xl">
            See Users
          </CardTitle>
          <CardAction>
            <Link href="/dashboard/users" passHref>
              <Users className="size-6 text-muted-foreground hover:text-primary transition-colors" />
            </Link>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            View and manage all registered users.
          </div>
          <div className="text-muted-foreground">
            Control access and user roles.
          </div>
        </CardFooter>
      </Card>

      {/* See Media Library Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Digital Assets</CardDescription>
          <CardTitle className="text-2xl font-semibold @[250px]/card:text-3xl">
            See Media Lib
          </CardTitle>
          <CardAction>
            <Link href="/dashboard/attachments" passHref>
              <ImageIcon className="size-6 text-muted-foreground hover:text-primary transition-colors" />
            </Link>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Access and organize your images, videos, and documents.
          </div>
          <div className="text-muted-foreground">
            Effortlessly manage your digital content.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
