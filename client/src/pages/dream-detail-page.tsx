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
import { useEffect, useState } from "react";
import { DreamCommentList } from "@/components/dream/dream-comment-list";
import { CreateCommentForm } from "@/components/dream/create-comment-form";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { StartChatDialog } from "@/components/dream/start-chat-dialog";

export default function DreamDetailPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [dreamId, setDreamId] = useState<number | undefined>(undefined);
  const [showComments, setShowComments] = useState(false);
  const [showStartChat, setShowStartChat] = useState(false);
  
  // Extract dream ID from URL
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/dreams\/(\d+)/);
    if (match && match[1]) {
      setDreamId(parseInt(match[1]));
    }
  }, []);
  
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
        targetLanguage: language
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
          <div className="mt-8">
            <h2 className="text-xl font-display font-bold mb-4">
              {t("Comments", language)}
            </h2>
            <DreamCommentList dreamId={dream.id} />
            
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