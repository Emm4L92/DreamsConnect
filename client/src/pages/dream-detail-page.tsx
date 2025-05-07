import { useAuth } from "@/hooks/use-auth";
import { useDream, useTranslateDream } from "@/hooks/use-dreams";
import { useLanguage, t } from "@/hooks/use-language";
import { Navbar } from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { PixelAvatar } from "@/components/ui/pixel-avatar";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Loader2, MessageCircle, GlobeIcon, LockIcon, HeartIcon, Share2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect, useState, useRef } from "react";
import { DreamCommentList } from "@/components/dream/dream-comment-list";
import { CreateCommentForm } from "@/components/dream/create-comment-form";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { StartChatDialog } from "@/components/dream/start-chat-dialog";
import { useToast } from "@/hooks/use-toast";

export default function DreamDetailPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [dreamId, setDreamId] = useState<number | undefined>(undefined);
  const [showComments, setShowComments] = useState(false);
  const [showStartChat, setShowStartChat] = useState(false);
  
  // Refs per lo scrolling e l'highlight
  const likesRef = useRef<HTMLButtonElement>(null);
  const commentsRef = useRef<HTMLDivElement>(null);
  const commentListRef = useRef<HTMLDivElement>(null);
  
  // Extract dream ID from URL and query params
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/dreams\/(\d+)/);
    if (match && match[1]) {
      setDreamId(parseInt(match[1]));
      
      // Controlla i parametri di query per le azioni di highlight
      const params = new URLSearchParams(window.location.search);
      const highlight = params.get('highlight');
      const userId = params.get('userId');
      const commentId = params.get('commentId');
      
      if (highlight) {
        // Mostra automaticamente la sezione commenti se stiamo evidenziando commenti
        if (highlight === 'comment') {
          setShowComments(true);
        }
        
        // Notifica l'utente
        let message = '';
        let userName = 'Qualcuno';
        
        if (userId) {
          // Per una vera implementazione, si potrebbe fare un fetch dei dettagli dell'utente
          // ma per ora usiamo un nome generico
          userName = 'Un utente';
        }
        
        switch (highlight) {
          case 'like':
            message = `${userName} ha messo like al tuo sogno`;
            break;
          case 'comment':
            message = `${userName} ha commentato il tuo sogno`;
            break;
          default:
            message = 'Hai una nuova notifica per questo sogno';
        }
        
        toast({
          title: 'Notifica',
          description: message,
          duration: 5000,
        });
      }
    }
  }, [toast]);
  
  // Effetto per evidenziare e scorrere agli elementi dopo che i dati sono caricati
  useEffect(() => {
    if (!dream) return;
    
    const params = new URLSearchParams(window.location.search);
    const highlight = params.get('highlight');
    const commentId = params.get('commentId');
    
    // Piccolo timeout per assicurarci che il DOM sia completamente renderizzato
    setTimeout(() => {
      if (highlight === 'like' && likesRef.current) {
        // Evidenzia il pulsante dei like
        likesRef.current.classList.add('ring-2', 'ring-offset-2', 'ring-primary', 'animate-pulse');
        likesRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Rimuovi l'evidenziazione dopo alcuni secondi
        setTimeout(() => {
          if (likesRef.current) {
            likesRef.current.classList.remove('ring-2', 'ring-offset-2', 'ring-primary', 'animate-pulse');
          }
        }, 5000);
      }
      
      if (highlight === 'comment') {
        // Se è specificato un commentId, dovremmo scorrere a quel commento specifico
        // Per ora scrolliamo alla sezione commenti in generale
        if (commentsRef.current) {
          commentsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 500);
  }, [dream]);
  
  const { dream, isLoading, error } = useDream(dreamId);
  const translationMutation = useTranslateDream();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onMenuClick={() => {}} />
        <div className="container mx-auto px-4 py-12 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  if (error || !dream) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onMenuClick={() => {}} />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-display mb-4">{t("Dream not found", language)}</h1>
          <p className="text-muted-foreground mb-6">
            {t("This dream doesn't exist or you don't have permission to view it.", language)}
          </p>
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("Back to Home", language)}
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  const isUserDream = user?.id === dream.author?.id;
  const canStartChat = !isUserDream && dream.visibility === 'public';
  
  // Handle translation
  const handleTranslate = () => {
    if (dream) {
      translationMutation.mutate({
        dreamId: dream.id,
        targetLang: language
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar onMenuClick={() => {}} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setLocation("/")}
            className="font-display"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("Back", language)}
          </Button>
        </div>
        
        <Card className="mb-8 overflow-hidden border-2 border-black shadow-brutalism">
          <CardHeader className="bg-accent/20 pb-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <PixelAvatar 
                  id={dream.author?.id || 0} 
                  size="md" 
                  className="mr-3"
                />
                <div>
                  <h2 className="text-lg font-semibold">{dream.author?.username}</h2>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(dream.createdAt)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                {dream.visibility === 'public' ? (
                  <Badge variant="outline" className="font-display flex items-center gap-1">
                    <GlobeIcon className="h-3 w-3" />
                    {t("Public", language)}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="font-display flex items-center gap-1">
                    <LockIcon className="h-3 w-3" />
                    {t("Private", language)}
                  </Badge>
                )}
              </div>
            </div>
            
            <h1 className="text-2xl font-display font-bold">{dream.title}</h1>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {dream.tags?.map(tag => (
                <Badge key={tag} variant="secondary" className="font-display">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardHeader>
          
          <CardContent className="pt-6 pb-4">
            <p className="whitespace-pre-wrap mb-4">{dream.content}</p>
            
            {language !== dream.language && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleTranslate}
                disabled={translationMutation.isPending}
                className="mt-2 font-display"
              >
                {translationMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("Translate to", language)} {language.toUpperCase()}
              </Button>
            )}
          </CardContent>
          
          <CardFooter className="border-t border-border pt-4 flex justify-between">
            <div className="flex gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-1 font-display"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageCircle className="h-4 w-4" />
                {dream.commentCount || 0} {t("Comments", language)}
              </Button>
              
              <Button
                ref={likesRef}
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 font-display"
              >
                <HeartIcon className="h-4 w-4" />
                {dream.likeCount || 0} {t("Likes", language)}
              </Button>
            </div>
            
            {canStartChat && (
              <Dialog open={showStartChat} onOpenChange={setShowStartChat}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    className="font-display"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    {t("Start Chat", language)}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <StartChatDialog 
                    dream={dream}
                    onStartChat={() => {
                      setShowStartChat(false);
                      setLocation(`/chat/${dream.author?.id}`);
                    }}
                  />
                </DialogContent>
              </Dialog>
            )}
          </CardFooter>
        </Card>
        
        {showComments && (
          <div ref={commentsRef} className="mt-8">
            <h2 className="text-xl font-display font-bold mb-4">
              {t("Comments", language)}
            </h2>
            <div ref={commentListRef}>
              <DreamCommentList dreamId={dream.id} />
            </div>
            
            {user && (
              <>
                <Separator className="my-6" />
                <h3 className="text-lg font-display font-bold mb-4">
                  {t("Add a Comment", language)}
                </h3>
                <CreateCommentForm dreamId={dream.id} />
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}