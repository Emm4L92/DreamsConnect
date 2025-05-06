import { useState } from "react";
import { useDreams } from "@/hooks/use-dreams";
import { DreamCard } from "./dream-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, ArrowDown, AlertCircle, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface DreamFeedProps {
  filter?: "recent" | "popular" | "matching";
}

export function DreamFeed({ filter = "recent" }: DreamFeedProps) {
  const [language, setLanguage] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(4);
  
  const { data: dreams, isLoading, error } = useDreams(
    language ? { language } : undefined
  );
  
  const loadMore = () => {
    setVisibleCount(prev => prev + 4);
  };
  
  let filteredDreams = dreams || [];
  
  // Apply additional filtering based on the filter prop
  if (filter === "popular") {
    filteredDreams = [...filteredDreams].sort((a, b) => b.likeCount - a.likeCount);
  } else if (filter === "matching") {
    filteredDreams = filteredDreams.filter(dream => dream.matchPercentage > 70);
  }
  
  // Only show the visible count
  const visibleDreams = filteredDreams.slice(0, visibleCount);
  
  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-pixel text-xl">Dream Feed</h2>
        
        <div className="flex gap-3">
          {/* Filter Button */}
          <Button variant="outline" size="sm" className="btn-brutal bg-background p-2 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
          
          {/* Language Selector */}
          <Select onValueChange={setLanguage}>
            <SelectTrigger className="input-brutal bg-background p-2 text-sm">
              <SelectValue placeholder="All Languages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="it">Italian</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg">Loading dreams...</p>
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="card-brutal bg-white p-6 my-8 flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-secondary flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold mb-2">Error loading dreams</h3>
            <p className="text-gray-600">{error.message}</p>
            <Button variant="outline" className="mt-4 btn-brutal">
              Try Again
            </Button>
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {!isLoading && !error && filteredDreams.length === 0 && (
        <div className="card-brutal bg-white p-8 my-8 text-center">
          <img 
            src="https://images.unsplash.com/photo-1541344999736-83eca272f6fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300" 
            alt="Empty dreamscape" 
            className="w-full max-h-40 object-cover border-3 border-black mb-6" 
          />
          <h3 className="font-pixel text-xl mb-4">No Dreams Found</h3>
          <p className="text-gray-600 mb-6">
            {language 
              ? `No dreams found in the selected language.` 
              : `Be the first to share a dream!`
            }
          </p>
          <Button className="btn-brutal bg-primary text-white">
            Share Your Dream
          </Button>
        </div>
      )}
      
      {/* Dreams Grid */}
      {!isLoading && !error && filteredDreams.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {visibleDreams.map((dream, index) => (
                <motion.div
                  key={dream.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <DreamCard dream={dream} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {/* Load More Button */}
          {visibleCount < filteredDreams.length && (
            <div className="flex justify-center mt-10">
              <Button 
                onClick={loadMore}
                className="btn-brutal bg-accent px-8 py-3 font-semibold rotate-1 flex items-center gap-2"
              >
                <span>Load More Dreams</span>
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
