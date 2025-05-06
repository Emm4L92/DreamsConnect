import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { PixelAvatar } from "@/components/ui/pixel-avatar";
import { Separator } from "@/components/ui/separator";
import { useLanguage, t } from "@/hooks/use-language";

interface DreamCommentListProps {
  dreamId: number;
}

export function DreamCommentList({ dreamId }: DreamCommentListProps) {
  const { language } = useLanguage();
  
  const { data: comments, isLoading, error } = useQuery({
    queryKey: [`/api/dreams/${dreamId}/comments`],
    enabled: Boolean(dreamId)
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        {t("Failed to load comments", language)}
      </div>
    );
  }
  
  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t("No comments yet. Be the first to comment!", language)}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {comments.map((comment: any, index: number) => (
        <div key={comment.id}>
          {index > 0 && <Separator className="my-6" />}
          <div className="flex">
            <PixelAvatar 
              id={comment.author?.id || 0} 
              size="sm" 
              className="mr-3 mt-0.5" 
            />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">{comment.author?.username}</h4>
                <span className="text-xs text-muted-foreground">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap">{comment.content}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}