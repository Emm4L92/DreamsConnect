import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage, t } from "@/hooks/use-language";
import { LanguageSelector } from "@/components/ui/language-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, LogOut, User, Shield, Camera } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ProfileImageUpload } from "@/components/user/profile-image-upload";

export default function SettingsPage() {
  const { user, logoutMutation } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("general");

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: t("Logged out", language),
          description: t("You have been successfully logged out.", language),
        });
        navigate("/auth");
      },
      onError: (error) => {
        toast({
          title: t("Logout failed", language),
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8">
        <h1 className="font-pixel text-3xl mb-2">{t("Settings", language)}</h1>
        <p className="text-muted-foreground">
          {t("Manage your account preferences and application settings.", language)}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{t("Account", language)}</span>
          </TabsTrigger>
          <TabsTrigger value="language" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>{t("Language", language)}</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>{t("Privacy", language)}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle>{t("Account Information", language)}</CardTitle>
              <CardDescription>
                {t("Manage your account details and preferences.", language)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-[100px_1fr] gap-4">
                <div className="font-semibold">{t("Username", language)}:</div>
                <div>{user?.username}</div>
              </div>
              <Separator className="my-4" />
              <Button 
                variant="destructive"
                className="w-full sm:w-auto btn-brutal bg-destructive text-white"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {logoutMutation.isPending ? t("Logging out...", language) : t("Logout", language)}
              </Button>
            </CardContent>
          </Card>
          
          {/* Aggiungiamo qui il componente per la gestione della foto profilo */}
          <ProfileImageUpload />
        </TabsContent>

        <TabsContent value="language" className="space-y-4">
          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle>{t("Language Settings", language)}</CardTitle>
              <CardDescription>
                {t("Set your preferred language for the application interface.", language)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-md font-semibold mb-2">{t("Select Language", language)}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("Choose the language you want to use for the application interface. This will affect all text in the application.", language)}
                </p>
                <LanguageSelector />
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <h3 className="text-md font-semibold mb-2">{t("Translation Settings", language)}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("Dreams will be auto-translated to your selected language when using the translate feature.", language)}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle>{t("Privacy Settings", language)}</CardTitle>
              <CardDescription>
                {t("Manage your privacy settings and preferences.", language)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t("DreamConnect is committed to protecting your privacy. We only use your data to provide and improve our service.", language)}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("Your dreams are private by default and will only be shared with users you connect with.", language)}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}