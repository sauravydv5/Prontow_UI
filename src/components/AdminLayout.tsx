import { ReactNode, useEffect, useState } from "react";
import { AppSidebar } from './AppSidebar';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const [userName, setUserName] = useState<string>("");
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    } else {
      setUserName("Admin");
    }

    // Check if mobile on mount
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "A";
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex min-h-screen w-full bg-background">
        <div className="bg-[#0A4338] text-white">
          <AppSidebar />
        </div>

        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 border-b border-border bg-white px-3 sm:px-4 md:px-6 lg:px-8 py-3 md:py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
              <SidebarTrigger className="flex-shrink-0">
                <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-[#0A4338]" />
              </SidebarTrigger>
              <h1 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-[#0A4338] truncate">
                {title}
              </h1>
            </div>

            {/* notification */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0" onClick={() => navigate('/notifications')}>
              <div className="relative cursor-pointer">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-[#0A4338]" />
                <span className="absolute -top-0.5 -right-0.5 sm:top-0 sm:right-0 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full" />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 hover:bg-muted rounded-full transition">
                    <Avatar className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10">
                      <AvatarFallback className="text-xs sm:text-sm">
                        {getInitials(userName)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white w-40 sm:w-48">
                  <DropdownMenuItem asChild>
                    <a href="/settings/general" className="text-xs sm:text-sm">Profile</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/settings" className="text-xs sm:text-sm">Settings</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      localStorage.removeItem("userName");
                      localStorage.removeItem("token");
                      localStorage.removeItem("tempToken");
                      window.location.href = "/login";
                    }}
                    className="text-xs sm:text-sm"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <div className="p-3 sm:p-4 md:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}