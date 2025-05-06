import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { PixelAvatar } from "@/components/ui/pixel-avatar";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

type DreamMatch = {
  id: number;
  userId: number;
  username: string;
  dreamId: number;
  dreamTitle: string;
  matchPercentage: number;
  tag: string;
};

export function MatchNotification() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<DreamMatch | null>(null);
  
  // Query for new matches
  const { data: newMatches } = useQuery<DreamMatch[], Error>({
    queryKey: ['/api/matches/new'],
    refetchInterval: 30000, // Check for new matches every 30 seconds
  });
  
  useEffect(() => {
    // Show notification when a new match is received
    if (newMatches && newMatches.length > 0 && !isVisible) {
      setCurrentMatch(newMatches[0]);
      setIsVisible(true);
      
      // Auto-hide after 20 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 20000);
      
      return () => clearTimeout(timer);
    }
  }, [newMatches, isVisible]);
  
  // For testing purposes, show the notification after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isVisible && !newMatches?.length) {
        setCurrentMatch({
          id: 1,
          userId: 2,
          username: "CloudSurfer",
          dreamId: 3,
          dreamTitle: "Flying over mountains",
          matchPercentage: 85,
          tag: "flying"
        });
        setIsVisible(true);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleClose = () => {
    setIsVisible(false);
  };
  
  return (
    <AnimatePresence>
      {isVisible && currentMatch && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <Card className="card-brutal bg-white p-8 max-w-md w-full mx-4 rotate-1 relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-xl"
                onClick={handleClose}
              >
                <X className="h-5 w-5" />
              </Button>
              
              <CardContent className="p-0">
                <h2 className="font-pixel text-xl text-center mb-6">Dream Match Found!</h2>
                
                <img 
                  src="https://images.unsplash.com/photo-1541344999736-83eca272f6fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300" 
                  alt="Cosmic connection illustration" 
                  className="w-full h-auto mb-6 border-3 border-black"
                />
                
                <p className="mb-6 text-center">
                  We found someone who had a similar dream about <span className="font-semibold">{currentMatch.tag}</span>!
                </p>
                
                <div className="flex justify-center gap-4 mb-6">
                  <div className="text-center">
                    <PixelAvatar id={1} size="xl" className="mx-auto mb-2" />
                    <p className="font-semibold">You</p>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-0.5 bg-black"></div>
                    <div className="w-6 h-6 rotate-45 border-2 border-black bg-accent"></div>
                    <div className="w-10 h-0.5 bg-black"></div>
                  </div>
                  
                  <div className="text-center">
                    <PixelAvatar id={currentMatch.userId % 6} size="xl" className="mx-auto mb-2" />
                    <p className="font-semibold">{currentMatch.username}</p>
                  </div>
                </div>
                
                <div className="flex gap-4 justify-center">
                  <Link to={`/dreams/${currentMatch.dreamId}`}>
                    <Button className="btn-brutal bg-secondary text-white px-5 py-3 font-semibold rotate-neg-1">
                      View Dream
                    </Button>
                  </Link>
                  <Link to={`/chat/${currentMatch.id}`}>
                    <Button className="btn-brutal bg-primary text-white px-5 py-3 font-semibold rotate-1">
                      Start Chat
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
