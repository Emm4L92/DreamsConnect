import { useAuth } from "@/hooks/use-auth";
import { useUserDreams } from "@/hooks/use-dreams";
import { useLanguage } from "@/hooks/use-language";
import { Navbar } from "@/components/layout/navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DreamCard } from "@/components/dream/dream-card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { CreateDreamForm } from "@/components/dream/create-dream-form";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { t } from "@/hooks/use-language";

export default function MyDreamsPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { dreams, isLoading } = useUserDreams(user?.id as number);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  if (!user) return null;
  
  const publicDreams = dreams?.filter(dream => dream.visibility === "public") || [];
  const privateDreams = dreams?.filter(dream => dream.visibility === "private") || [];
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar onMenuClick={() => {}} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-display font-bold">{t("My Dreams", language)}</h1>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="font-display">
                <Plus className="mr-2 h-4 w-4" />
                {t("New Dream", language)}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  {t("Share a new dream", language)}
                </DialogTitle>
              </DialogHeader>
              <CreateDreamForm onSuccess={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">{t("All", language)}</TabsTrigger>
            <TabsTrigger value="public">{t("Public", language)}</TabsTrigger>
            <TabsTrigger value="private">{t("Private", language)}</TabsTrigger>
          </TabsList>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <TabsContent value="all" className="space-y-4">
                {dreams?.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                    <p className="text-lg text-muted-foreground">
                      {t("You haven't shared any dreams yet.", language)}
                    </p>
                    <Button 
                      variant="secondary" 
                      className="mt-4 font-display"
                      onClick={() => setIsCreateOpen(true)}
                    >
                      {t("Create your first dream", language)}
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dreams?.map(dream => (
                      <DreamCard 
                        key={dream.id} 
                        dream={dream}
                        showManage={true} 
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="public" className="space-y-4">
                {publicDreams.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                    <p className="text-lg text-muted-foreground">
                      {t("You don't have any public dreams yet.", language)}
                    </p>
                    <Button 
                      variant="secondary" 
                      className="mt-4 font-display"
                      onClick={() => setIsCreateOpen(true)}
                    >
                      {t("Share a public dream", language)}
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {publicDreams.map(dream => (
                      <DreamCard 
                        key={dream.id} 
                        dream={dream}
                        showManage={true} 
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="private" className="space-y-4">
                {privateDreams.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                    <p className="text-lg text-muted-foreground">
                      {t("You don't have any private dreams yet.", language)}
                    </p>
                    <Button 
                      variant="secondary" 
                      className="mt-4 font-display"
                      onClick={() => setIsCreateOpen(true)}
                    >
                      {t("Create a private dream", language)}
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {privateDreams.map(dream => (
                      <DreamCard 
                        key={dream.id} 
                        dream={dream}
                        showManage={true} 
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
    </div>
  );
}