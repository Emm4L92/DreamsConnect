import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Dream } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLanguage, t } from "@/hooks/use-language";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface StartChatDialogProps {
  dream: Dream;
  onStartChat: () => void;
}

export function StartChatDialog({ dream, onStartChat }: StartChatDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [message, setMessage] = useState(`${t("I had a similar dream about", language)} "${dream.title}"!`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleStartChat = async () => {
    if (!user || !dream.author?.id) return;
    
    setIsSubmitting(true);
    
    try {
      // Initialize a chat with the dream's author
      await apiRequest("POST", `/api/chats`, {
        recipientId: dream.author.id,
        dreamId: dream.id,
        initialMessage: message
      });
      
      toast({
        title: t("Chat started", language),
        description: t("Your message has been sent", language),
      });
      
      onStartChat();
    } catch (error: any) {
      toast({
        title: t("Failed to start chat", language),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-pixel">
          {t("Start Chat with", language)} {dream.author?.username}
        </DialogTitle>
        <DialogDescription>
          {t("Share your thoughts about this dream with the author.", language)}
        </DialogDescription>
      </DialogHeader>
      
      <div className="my-6">
        <h3 className="text-sm font-semibold mb-2">{t("About the Dream", language)}:</h3>
        <div className="bg-accent/20 p-3 rounded-md mb-4">
          <h4 className="font-semibold">{dream.title}</h4>
          <p className="text-sm line-clamp-2">{dream.content}</p>
        </div>
        
        <h3 className="text-sm font-semibold mb-2">{t("Your Message", language)}:</h3>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("Write your message...", language)}
          className="border-2 border-black min-h-[120px]"
        />
      </div>
      
      <DialogFooter>
        <Button
          variant="outline"
          onClick={onStartChat}
          className="font-display"
        >
          {t("Cancel", language)}
        </Button>
        <Button
          onClick={handleStartChat}
          className="btn-brutal font-display"
          disabled={isSubmitting || !message.trim()}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("Starting Chat...", language)}
            </>
          ) : (
            t("Start Chat", language)
          )}
        </Button>
      </DialogFooter>
    </>
  );
}