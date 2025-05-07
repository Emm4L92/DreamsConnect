import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage, t } from "@/hooks/use-language";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Upload, RefreshCw, Camera } from "lucide-react";

export function ProfileImageUpload() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mutation per aggiornare l'immagine profilo
  const updateProfileImageMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiRequest("POST", "/api/user/profile-image", formData, {
        rawBody: true, // Per inviare FormData invece di JSON
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: t("Success!", language),
        description: t("Your profile image has been updated.", language),
      });
      setIsLoading(false);
      setPreviewUrl(null);
    },
    onError: (error: Error) => {
      toast({
        title: t("Upload failed", language),
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    },
  });

  // Gestisce il caricamento del file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verifica dimensione e tipo file
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t("File too large", language),
        description: t("Please select an image smaller than 5MB.", language),
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: t("Invalid file type", language),
        description: t("Please select an image file.", language),
        variant: "destructive",
      });
      return;
    }

    // Crea un'anteprima dell'immagine
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Invia l'immagine al server
  const handleUpload = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append("profileImage", file);
    
    updateProfileImageMutation.mutate(formData);
  };

  // Trigger del selettore file
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Annulla l'upload corrente
  const cancelUpload = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="border-2 border-black">
      <CardContent className="pt-6 space-y-4">
        <div className="flex flex-col items-center text-center">
          <h3 className="text-lg font-semibold mb-2">{t("Profile Picture", language)}</h3>
          
          {/* Immagine profilo corrente o anteprima */}
          <div className="relative mb-4 inline-block">
            <Avatar className="w-24 h-24 border-2 border-black">
              {previewUrl ? (
                <AvatarImage src={previewUrl} alt={t("Preview", language)} />
              ) : user?.profileImage ? (
                <AvatarImage src={user.profileImage} alt={user.username} />
              ) : (
                <AvatarFallback className="bg-primary-foreground text-primary text-xl">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              )}
            </Avatar>
            
            <Button 
              size="icon" 
              variant="outline" 
              className="absolute bottom-0 right-0 rounded-full h-8 w-8 border-2 border-black"
              onClick={triggerFileInput}
            >
              <Camera className="h-4 w-4" />
              <span className="sr-only">{t("Change profile picture", language)}</span>
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {t("Upload a new profile picture", language)}
          </p>
          
          {/* Input file nascosto */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          
          {/* Pulsanti azione */}
          <div className="flex gap-2 mt-4">
            {previewUrl ? (
              <>
                <Button 
                  className="font-display"
                  onClick={handleUpload} 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {t("Save", language)}
                </Button>
                <Button 
                  variant="outline" 
                  className="font-display"
                  onClick={cancelUpload} 
                  disabled={isLoading}
                >
                  {t("Cancel", language)}
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                className="font-display"
                onClick={triggerFileInput}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("Change Picture", language)}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}