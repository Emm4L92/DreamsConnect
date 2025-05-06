import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateComment } from "@/hooks/use-dreams";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage, t } from "@/hooks/use-language";
import { Loader2 } from "lucide-react";

interface CreateCommentFormProps {
  dreamId: number;
}

export function CreateCommentForm({ dreamId }: CreateCommentFormProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [content, setContent] = useState("");
  const mutation = useCreateComment();
  
  if (!user) {
    return null;
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    mutation.mutate({
      dreamId,
      content: content.trim(),
    }, {
      onSuccess: () => {
        setContent("");
      }
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder={t("Write your comment...", language)}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[100px]"
        required
      />
      
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={mutation.isPending || !content.trim()}
          className="font-display"
        >
          {mutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {t("Post Comment", language)}
        </Button>
      </div>
    </form>
  );
}