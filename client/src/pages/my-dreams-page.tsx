import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUserDreams, useDeleteDream } from "@/hooks/use-dreams";
import { useLanguage, t } from "@/hooks/use-language";
import { DreamCard } from "@/components/dream/dream-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PlusCircle, Info, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function MyDreamsPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const [showEmpty, setShowEmpty] = useState(false);
  const deleteMutation = useDeleteDream();
  
  const { 
    data: dreams, 
    isLoading, 
    isError, 
    error,
  } = useUserDreams(user?.id || 0);
  
  const handleCreateDream = () => {
    setLocation("/dreams/create");
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="font-pixel text-3xl mb-8">{t("My Dreams", language)}</h1>
          <div className="flex items-center justify-center min-h-[300px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="font-pixel text-3xl mb-8">{t("My Dreams", language)}</h1>
          <div className="bg-red-50 border-2 border-red-200 rounded-md p-4">
            <p className="text-red-600">{error?.message || t("Failed to load dreams", language)}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-pixel text-3xl">{t("My Dreams", language)}</h1>
          <Button 
            className="btn-brutal bg-primary text-white"
            onClick={handleCreateDream}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("Create Dream", language)}
          </Button>
        </div>
        
        {dreams && dreams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dreams.map(dream => (
              <DreamCard 
                key={dream.id} 
                dream={dream} 
                showManage={true} 
              />
            ))}
          </div>
        ) : (
          <div className="bg-accent/30 border-2 border-dashed border-accent rounded-md p-8 text-center">
            <Info className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-pixel text-xl mb-2">{t("No Dreams Yet", language)}</h3>
            <p className="mb-6 text-muted-foreground">
              {t("Start sharing your dream experiences and connect with others.", language)}
            </p>
            <Button 
              className="btn-brutal bg-primary text-white"
              onClick={handleCreateDream}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("Create Your First Dream", language)}
            </Button>
          </div>
        )}
      </div>
      
      <Dialog open={showEmpty} onOpenChange={setShowEmpty}>
        <DialogContent className="border-2 border-black">
          <DialogHeader>
            <DialogTitle className="font-pixel">{t("Create Your First Dream", language)}</DialogTitle>
            <DialogDescription>
              {t("Share your dream experiences with the world and find others with similar experiences.", language)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <p>{t("Your dreams help others connect with you through shared experiences.", language)}</p>
            <div className="flex justify-end">
              <Button 
                className="btn-brutal bg-primary text-white"
                onClick={handleCreateDream}
              >
                {t("Create Dream", language)}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}