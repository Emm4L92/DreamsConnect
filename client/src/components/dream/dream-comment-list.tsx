import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { PixelAvatar } from "@/components/ui/pixel-avatar";
import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { DreamComment } from "@shared/schema";
import { useLanguage, t } from "@/hooks/use-language";

interface DreamCommentListProps {
  dreamId: number;
}

export function DreamCommentList({ dreamId }: DreamCommentListProps) {
  const { language } = useLanguage();
  const [page, setPage] = useState(1);
  const limit = 5;
  const [highlightedCommentId, setHighlightedCommentId] = useState<number | null>(null);
  const commentRefs = useRef<{[key: number]: HTMLDivElement | null}>({});
  
  const {
    data: comments,
    isLoading,
    isFetching,
    isError,
    error
  } = useQuery<{ comments: DreamComment[], total: number }, Error>({
    queryKey: [`/api/dreams/${dreamId}/comments`, page, limit],
  });
  
  const totalPages = comments ? Math.ceil(comments.total / limit) : 0;
  
  // Controlla i parametri di query per l'evidenziazione dei commenti
  useEffect(() => {
    if (!comments) return;
    
    const params = new URLSearchParams(window.location.search);
    const commentId = params.get('commentId');
    const highlight = params.get('highlight');
    
    if (commentId && highlight === 'comment') {
      const commentIdNum = parseInt(commentId);
      setHighlightedCommentId(commentIdNum);
      
      // Trova il commento nella lista corrente
      const targetComment = comments.comments.find(c => c.id === commentIdNum);
      
      // Se il commento non è nella pagina attuale, potremmo dover cambiare pagina
      // Questa è una implementazione semplificata che funziona solo per la prima pagina
      // In una implementazione reale dovresti calcolare la pagina corretta
      
      // Scorre al commento evidenziato con un piccolo ritardo
      setTimeout(() => {
        const commentElement = commentRefs.current[commentIdNum];
        if (commentElement) {
          commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Rimuovi l'evidenziazione dopo alcuni secondi
          setTimeout(() => {
            setHighlightedCommentId(null);
          }, 5000);
        }
      }, 500);
    }
  }, [comments]);
  
  if (isLoading) {
    return <CommentSkeleton count={3} />;
  }
  
  if (isError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error.message || t("Failed to load comments", language)}
      </div>
    );
  }
  
  if (!comments || comments.comments.length === 0) {
    return (
      <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-md">
        <p className="text-muted-foreground">{t("No comments yet. Be the first to share your thoughts!", language)}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {comments.comments.map((comment) => (
        <Card 
          key={comment.id} 
          id={`comment-${comment.id}`}
          className={`border-2 border-black transition-all ${
            highlightedCommentId === comment.id 
              ? 'ring-4 ring-primary shadow-lg animate-pulse' 
              : ''
          }`}
          ref={(el) => {
            if (el) commentRefs.current[comment.id] = el;
          }}
        >
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 mb-3">
              <PixelAvatar id={comment.userId % 6} size="sm" />
              <div className="flex-1">
                <div className="flex justify-between">
                  <h4 className="font-semibold">{comment.username || "User"}</h4>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1 || isFetching}
            className="font-display"
          >
            {t("Previous", language)}
          </Button>
          
          <span className="text-sm text-muted-foreground">
            {t("Page", language)} {page} {t("of", language)} {totalPages}
          </span>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page === totalPages || isFetching}
            className="font-display"
          >
            {t("Next", language)}
          </Button>
        </div>
      )}
    </div>
  );
}

function CommentSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border-2 border-black">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-3/4 mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}