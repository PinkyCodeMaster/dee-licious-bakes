"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { LogOut, Menu, type LucideIcon } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string | null | undefined;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface NavigationSection {
  title?: string;
  items: NavigationItem[];
}

interface BaseSidebarProps {
  user: User;
  title: string;
  titleIcon?: LucideIcon;
  navigation: NavigationSection[];
  userBadge?: {
    text: string;
    icon?: LucideIcon;
  };
}

export function BaseSidebar({ 
  user, 
  title, 
  titleIcon: TitleIcon, 
  navigation, 
  userBadge 
}: BaseSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
          }
        }
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* User Profile Section */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.image || undefined} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user.name}
              </p>
              {userBadge && (
                <Badge variant="secondary" className="text-xs">
                  {userBadge.icon && <userBadge.icon className="w-3 h-3 mr-1" />}
                  {userBadge.text}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6">
        {navigation.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {section.title && (
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            <div className={cn("space-y-1", section.title && "mt-2")}>
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t">
        <Button
          onClick={handleLogout}
          disabled={isLoggingOut}
          variant="outline"
          className="w-full justify-start"
        >
          <LogOut className="mr-3 h-4 w-4" />
          {isLoggingOut ? "Signing out..." : "Sign out"}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-sidebar border-r border-sidebar-border">
          <div className="flex items-center flex-shrink-0 px-6 py-4 border-b border-sidebar-border">
            {TitleIcon && <TitleIcon className="h-6 w-6 text-primary mr-2" />}
            <h1 className="text-xl font-bold text-sidebar-foreground">{title}</h1>
          </div>
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 bg-sidebar border-b border-sidebar-border">
          <div className="flex items-center">
            {TitleIcon && <TitleIcon className="h-5 w-5 text-primary mr-2" />}
            <h1 className="text-lg font-semibold text-sidebar-foreground">{title}</h1>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-sidebar">
              <div className="flex items-center flex-shrink-0 px-6 py-4 border-b border-sidebar-border">
                {TitleIcon && <TitleIcon className="h-6 w-6 text-primary mr-2" />}
                <h1 className="text-xl font-bold text-sidebar-foreground">{title}</h1>
              </div>
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>
        <div className="h-16" /> {/* Spacer for fixed header */}
      </div>
    </>
  );
}