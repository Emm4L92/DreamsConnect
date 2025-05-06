import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { useState } from "react";
import { useMatches } from "@/hooks/use-dreams";
import { Link } from "wouter";
import { PixelAvatar } from "@/components/ui/pixel-avatar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Eye, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MatchesPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: matchesData, isLoading, error } = useMatches();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onMenuClick={() => setMobileMenuOpen(true)} />
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 py-6">
        <h1 className="font-pixel text-2xl md:text-3xl mb-8">
          Your Dream <span className="text-primary">Matches</span>
        </h1>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="card-brutal">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="card-brutal bg-white p-6 max-w-md mx-auto">
            <div className="flex items-center gap-4 mb-4 text-secondary">
              <AlertCircle className="h-8 w-8" />
              <h2 className="font-pixel text-xl">Error</h2>
            </div>
            <p>Failed to load your matches. Please try again later.</p>
          </Card>
        ) : matchesData?.matches.length === 0 ? (
          <Card className="card-brutal bg-white p-8 max-w-md mx-auto text-center">
            <div className="mb-6">
              <img 
                src="https://pixabay.com/get/g6979fe3b7643e5db844f3f22af1672ce01a5159e44c3121c7b9fa4dc86ff6c4eea28d6e3fbecb020f4e00e883f72ba9aa12f65b4a4f529fa75aa6282ce43ee96_1280.jpg"
                alt="Dreams connecting" 
                className="w-full h-auto max-h-48 object-cover border-3 border-black mb-4" 
              />
              <h2 className="font-pixel text-xl mb-4">No Matches Yet</h2>
              <p className="mb-6">
                Share more dreams to increase your chances of finding people with similar dream experiences.
              </p>
              <Link to="/">
                <Button className="btn-brutal bg-primary text-white">Share a Dream</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {matchesData.matches.map((match) => (
              <Card key={match.id} className="card-brutal rotate-1 hover:rotate-0 transition-transform">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <PixelAvatar id={match.user.avatarId} size="lg" />
                    <div>
                      <CardTitle className="text-lg">{match.user.username}</CardTitle>
                      <p className="text-sm text-gray-600">Dream match</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    You and {match.user.username} had similar dreams about{" "}
                    <span className="font-semibold">flying over mountains</span>
                  </p>
                </CardContent>
                <CardFooter className="flex gap-2 border-t-2 border-black pt-4">
                  <Link to={`/chat/${match.id}`} className="flex-1">
                    <Button 
                      variant="default" 
                      className="w-full bg-primary text-white btn-brutal flex items-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Chat</span>
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="flex-1 btn-brutal flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Dream</span>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
