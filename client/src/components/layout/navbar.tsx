import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage, t } from "@/hooks/use-language";
import { PixelAvatar } from "@/components/ui/pixel-avatar";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/ui/language-selector";
import { NotificationPanel } from "@/components/ui/notification-panel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Menu } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type NavbarProps = {
  onMenuClick: () => void;
};

type Notification = {
  id: number;
  type: string;
  read: boolean;
};

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logoutMutation } = useAuth();
  const { language } = useLanguage();
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [location] = useLocation();
  const queryClient = useQueryClient();
  
  // Ottieni il numero reale di notifiche dal server
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    // Normalmente useremmo un vero endpoint, ma per ora simuliamo
    queryFn: () => {
      // Notifiche di esempio che verranno sostituite da dati reali
      return [
        { id: 1, type: 'like', read: false },
        { id: 2, type: 'comment', read: false },
        { id: 3, type: 'message', read: true },
        { id: 4, type: 'like', read: false }
      ];
    },
    // Aggiorna ogni 30 secondi
    refetchInterval: 30000,
  });
  
  // Calcola le notifiche non lette ogni volta che i dati cambiano
  useEffect(() => {
    if (notifications) {
      const count = notifications.filter(n => !n.read).length;
      setUnreadCount(count);
    }
  }, [notifications]);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleNotificationPanel = () => {
    setNotificationPanelOpen(!notificationPanelOpen);
  };
  
  // Funzione per aggiornare il contatore delle notifiche
  // Viene passata al componente NotificationPanel
  const updateNotificationCount = useCallback((count: number) => {
    setUnreadCount(count);
  }, []);
  
  return (
    <>
      <nav className="sticky top-0 z-50 bg-background border-b-4 border-black px-4 py-2">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link to="/">
              <div className="rotate-neg-1 cursor-pointer">
                <span className="font-pixel text-primary text-lg md:text-xl">Dream</span>
                <span className="font-pixel text-secondary text-lg md:text-xl">Connect</span>
              </div>
            </Link>
            <img 
              src="https://images.unsplash.com/photo-1566837945700-30057527ade0?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50" 
              alt="Pixel art logo" 
              className="w-8 h-8 rounded-sm shadow-brutal-sm hidden sm:block" 
            />
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/">
              <a className={`font-sans font-semibold ${location === '/' ? 'text-primary' : 'hover:text-primary'} transition-colors`}>
                {t("Home", language)}
              </a>
            </Link>
            <Link to="/explore">
              <a className={`font-sans font-semibold ${location === '/explore' ? 'text-primary' : 'hover:text-primary'} transition-colors`}>
                {t("Explore", language)}
              </a>
            </Link>
            <Link to="/my-dreams">
              <a className={`font-sans font-semibold ${location === '/my-dreams' ? 'text-primary' : 'hover:text-primary'} transition-colors`}>
                {t("My Dreams", language)}
              </a>
            </Link>
            <Link to="/matches">
              <a className={`font-sans font-semibold ${location === '/matches' ? 'text-primary' : 'hover:text-primary'} transition-colors`}>
                {t("Matches", language)}
              </a>
            </Link>
            <Link to="/chat">
              <a className={`font-sans font-semibold ${location.startsWith('/chat') ? 'text-primary' : 'hover:text-primary'} transition-colors`}>
                {t("Chat", language)}
              </a>
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <LanguageSelector size="sm" minimal />
            </div>
            
            <div className="relative" data-bind="notifications">
              <Button 
                variant="ghost" 
                size="icon" 
                className="btn-brutal bg-background p-2 rotate-1 relative"
                onClick={toggleNotificationPanel}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-black animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </div>
            
            <div className="hidden sm:block">
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer">
                      <PixelAvatar 
                        id={user.id % 6} 
                        className="rotate-neg-1" 
                        profileImage={user.profileImage}
                        username={user.username}
                      />
                      <span className="font-semibold hidden md:block">{user.username}</span>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="card-brutal">
                    <Link to="/settings">
                      <DropdownMenuItem>
                        {t("Settings", language)}
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-secondary">
                      {t("Logout", language)}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden btn-brutal bg-background p-2"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>
      
      {/* Pannello Notifiche */}
      <NotificationPanel 
        isOpen={notificationPanelOpen} 
        onClose={() => setNotificationPanelOpen(false)}
        onNotificationUpdate={updateNotificationCount}
      />
    </>
  );
}
