import { useState } from "react";
import { useLanguage, t } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dream } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { PixelAvatar } from "@/components/ui/pixel-avatar";

interface StartChatDialogProps {
  dream: Dream;
  onStartChat: () => void;
}

export function StartChatDialog({ dream, onStartChat }: StartChatDialogProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  
  const startChatMutation = useMutation({
    mutationFn: async () => {
      try {
        // First, see if a match already exists
        const matchesResponse = await apiRequest("GET", "/api/matches");
        const matchesData = await matchesResponse.json();
        
        let matchId;
        const existingMatch = matchesData.matches?.find(
          (m: any) => m.dreamId === dream.id || m.dreamTitle === dream.title
        );
        
        if (existingMatch) {
          matchId = existingMatch.id;
        } else {
          // Create a new match by requesting match creation
          const matchResponse = await apiRequest("POST", `/api/matches/request`, {
            dreamId: dream.id,
            message: `Interested in talking about your dream: "${dream.title}"`
          });
          
          if (!matchResponse.ok) {
            throw new Error("Failed to create match");
          }
          
          const matchData = await matchResponse.json();
          matchId = matchData.id;
        }
        
        // Send initial message
        if (message.trim()) {
          await apiRequest("POST", `/api/matches/${matchId}/messages`, {
            content: message
          });
        }
        
        return matchId;
      } catch (error) {
        console.error("Error starting chat:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      toast({
        title: t("Chat started!", language),
        description: t("You can now communicate with this dreamer", language)
      });
      onStartChat();
    },
    onError: (error: Error) => {
      toast({
        title: t("Failed to start chat", language),
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-display text-xl">
          {t("Start a conversation about this dream", language)}
        </DialogTitle>
        <DialogDescription>
          {t("Send a message to connect with the dreamer", language)}
        </DialogDescription>
      </DialogHeader>
      
      <div className="mt-4 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <PixelAvatar id={dream.author?.id || 0} size="md" />
          <div>
            <h3 className="font-medium">{dream.author?.username}</h3>
            <p className="text-sm text-muted-foreground">{t("Dreamer", language)}</p>
          </div>
        </div>
        
        <div className="p-3 bg-accent/20 rounded-lg mb-4">
          <h4 className="font-medium mb-1">{dream.title}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2">{dream.content}</p>
        </div>
        
        <Textarea
          placeholder={t("Write a message to start the conversation...", language)}
          className="min-h-[100px]"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      
      <DialogFooter>
        <Button
          onClick={() => startChatMutation.mutate()}
          disabled={startChatMutation.isPending}
          className="font-display"
        >
          {startChatMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {t("Start Conversation", language)}
        </Button>
      </DialogFooter>
    </>
  );
}