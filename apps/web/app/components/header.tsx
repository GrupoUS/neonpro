import { Bell, Search, Settings, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center space-x-4">
        <h1 className="font-semibold text-xl">NeonPro Dashboard</h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search */}
        <Button size="icon" variant="ghost">
          <Search className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <Button size="icon" variant="ghost">
          <Bell className="h-4 w-4" />
        </Button>

        {/* Settings */}
        <Button size="icon" variant="ghost">
          <Settings className="h-4 w-4" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="relative h-8 w-8 rounded-full" variant="ghost">
              <Avatar className="h-8 w-8">
                <AvatarImage alt="@user" src="/avatars/01.png" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="font-medium text-sm leading-none">User</p>
                <p className="text-muted-foreground text-xs leading-none">
                  user@example.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
