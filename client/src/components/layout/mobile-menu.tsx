import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "wouter";
import { PixelAvatar } from "@/components/ui/pixel-avatar";

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  
  const handleLogout = () => {
    logoutMutation.mutate();
    onClose();
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-40 md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
          
          <motion.div 
            className="bg-background w-2/3 h-full shadow-lg border-r-4 border-black p-4"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-pixel text-lg">Menu</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                className="btn-brutal bg-background p-1"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {user && (
              <div className="flex items-center gap-3 mb-6 p-3 border-b-2 border-black">
                <PixelAvatar id={user.id % 6} size="md" />
                <div>
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-xs text-gray-500">DreamWalker</p>
                </div>
              </div>
            )}
            
            <div className="flex flex-col space-y-4">
              <Link href="/" onClick={onClose}>
                <a className={`font-sans font-medium text-lg px-2 py-3 border-b-2 border-black ${location === '/' ? 'text-primary' : ''}`}>
                  Home
                </a>
              </Link>
              
              <Link href="/explore" onClick={onClose}>
                <a className={`font-sans font-medium text-lg px-2 py-3 border-b-2 border-black ${location === '/explore' ? 'text-primary' : ''}`}>
                  Explore
                </a>
              </Link>
              
              <Link href="/matches" onClick={onClose}>
                <a className={`font-sans font-medium text-lg px-2 py-3 border-b-2 border-black ${location === '/matches' ? 'text-primary' : ''}`}>
                  Matches
                </a>
              </Link>
              
              <Link href="/chat" onClick={onClose}>
                <a className={`font-sans font-medium text-lg px-2 py-3 border-b-2 border-black ${location.startsWith('/chat') ? 'text-primary' : ''}`}>
                  Chat
                </a>
              </Link>
              
              <Link href="/profile" onClick={onClose}>
                <a className={`font-sans font-medium text-lg px-2 py-3 border-b-2 border-black ${location === '/profile' ? 'text-primary' : ''}`}>
                  Profile
                </a>
              </Link>
              
              <Link href="/settings" onClick={onClose}>
                <a className={`font-sans font-medium text-lg px-2 py-3 border-b-2 border-black ${location === '/settings' ? 'text-primary' : ''}`}>
                  Settings
                </a>
              </Link>
              
              <button 
                onClick={handleLogout}
                className="font-sans font-medium text-lg px-2 py-3 text-secondary text-left"
              >
                Logout
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
