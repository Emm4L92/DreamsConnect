import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { DreamFeed } from "@/components/dream/dream-feed";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Hash } from "lucide-react";

export default function ExplorePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const popularTags = [
    { name: "flying", count: 87 },
    { name: "falling", count: 72 },
    { name: "water", count: 65 },
    { name: "chase", count: 53 },
    { name: "alien", count: 47 },
    { name: "time", count: 42 },
    { name: "buildings", count: 38 },
    { name: "forest", count: 34 },
    { name: "family", count: 29 },
    { name: "animals", count: 26 },
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onMenuClick={() => setMobileMenuOpen(true)} />
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 py-6">
        <h1 className="font-pixel text-2xl md:text-3xl mb-8">
          <span className="text-primary">Explore</span> Dreams
        </h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="card-brutal bg-white p-4 mb-6 rotate-neg-1">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search dreams..."
                  className="input-brutal pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button className="w-full btn-brutal bg-primary text-white">
                Search
              </Button>
            </div>
            
            <Card className="card-brutal rotate-1 mb-6">
              <CardHeader>
                <CardTitle className="font-pixel text-lg">Popular Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <div 
                      key={tag.name}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold border-2 border-black rotate-neg-1 bg-accent cursor-pointer hover:scale-105 transition-transform"
                    >
                      <Hash className="h-3 w-3" />
                      <span>{tag.name}</span>
                      <span className="ml-1 bg-black text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                        {tag.count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-brutal rotate-neg-1">
              <CardHeader>
                <CardTitle className="font-pixel text-lg">Languages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {["All Languages", "English", "Italian", "Spanish", "French", "German"].map((lang) => (
                    <div 
                      key={lang} 
                      className="flex items-center space-x-2 p-2 hover:bg-gray-100 cursor-pointer rounded-sm"
                    >
                      <div className="h-3 w-3 border-2 border-black flex justify-center items-center bg-background">
                        {lang === "All Languages" && (
                          <div className="h-2 w-2 bg-primary"></div>
                        )}
                      </div>
                      <span>{lang}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="md:w-3/4">
            <Tabs defaultValue="recent" className="w-full mb-8">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="matching">Matching</TabsTrigger>
              </TabsList>
              
              <TabsContent value="recent">
                <DreamFeed filter="recent" />
              </TabsContent>
              
              <TabsContent value="popular">
                <DreamFeed filter="popular" />
              </TabsContent>
              
              <TabsContent value="matching">
                <DreamFeed filter="matching" />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
