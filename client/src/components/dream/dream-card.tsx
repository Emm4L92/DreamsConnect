import { useState } from "react";
import { Dream } from "@shared/schema";
import { PixelAvatar } from "@/components/ui/pixel-avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  MessageCircle, 
  Languages, 
  Eye, 
  MoreHorizontal, 
  Edit,
  Trash2,
  Globe,
  Lock,
  Share2 
} from "lucide-react";
import { useLikeDream, useUnlikeDream, useCreateComment, useTranslateDream, useDeleteDream } from "@/hooks/use-dreams";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage, t } from "@/hooks/use-language";
import { Badge } from "@/components/ui/badge";

interface DreamCardProps {
  dream: Dream;
  className?: string;
  showManage?: boolean;
}

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(500, "Comment is too long")
});

export function DreamCard({ dream, className = "", showManage = false }: DreamCardProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const [isLiked, setIsLiked] = useState(dream?.isLikedByUser || false);
  const [likeCount, setLikeCount] = useState(dream?.likeCount || 0);
  const [commentCount, setCommentCount] = useState(dream?.commentCount || 0);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [translatedContent, setTranslatedContent] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const likeMutation = useLikeDream();
  const unlikeMutation = useUnlikeDream();
  const commentMutation = useCreateComment();
  const translateMutation = useTranslateDream();
  const deleteMutation = useDeleteDream();
  
  const form = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  });
  
  const handleLikeToggle = () => {
    if (!dream?.id) return;
    
    if (isLiked) {
      setIsLiked(false);
      setLikeCount(prev => prev - 1);
      unlikeMutation.mutate({ dreamId: dream.id });
    } else {
      setIsLiked(true);
      setLikeCount(prev => prev + 1);
      likeMutation.mutate({ dreamId: dream.id });
    }
  };
  
  const handleCommentSubmit = (values: z.infer<typeof commentSchema>) => {
    if (!dream?.id) return;
    
    commentMutation.mutate(
      { dreamId: dream.id, content: values.content },
      {
        onSuccess: () => {
          setCommentCount(prev => prev + 1);
          form.reset();
          setIsCommenting(false);
        }
      }
    );
  };
  
  const handleTranslate = () => {
    if (!dream?.id) return;
    
    if (isTranslated) {
      setIsTranslated(false);
      return;
    }
    
    translateMutation.mutate(
      { dreamId: dream.id, targetLang: 'en' },
      {
        onSuccess: (data) => {
          setTranslatedContent(data.translatedContent);
          setIsTranslated(true);
        }
      }
    );
  };
  
  const rotationClass = (dream?.id || 0) % 2 === 0 ? "rotate-1" : "rotate-neg-1";
  
  return (
    <Card className={`card-brutal bg-white p-5 ${rotationClass} ${className}`}>
      <CardHeader className="p-0 pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <PixelAvatar 
              id={(dream.author?.id || 0) % 6} 
              profileImage={dream.author?.profileImage}
              username={dream.author?.username}
            />
            <div>
              <h3 className="font-semibold">{dream.author?.username || "Anonymous"}</h3>
              <p className="text-xs text-gray-600">
                {dream.createdAt ? new Date(dream.createdAt).toLocaleString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : "Unknown date"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Visibility badge */}
            {dream.visibility && (
              <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 font-medium border-2 border-black">
                {dream.visibility === 'public' ? (
                  <Globe className="h-3 w-3 mr-1" />
                ) : (
                  <Lock className="h-3 w-3 mr-1" />
                )}
                {t(dream.visibility === 'public' ? "Public" : "Private", language)}
              </Badge>
            )}
            
            {/* Management dropdown */}
            {showManage && user?.id === dream.author?.id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border-2 border-black">
                  <DropdownMenuItem 
                    className="cursor-pointer font-semibold"
                    onClick={() => setLocation(`/dreams/${dream.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {t("View", language)}
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    className="cursor-pointer font-semibold"
                    onClick={() => setLocation(`/dreams/edit/${dream.id}`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {t("Edit", language)}
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    className="cursor-pointer font-semibold text-destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t("Delete", language)}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 pb-4">
        <h3 className="font-pixel text-lg mb-3">
          <Link 
            href={`/dreams/${dream.id}`} 
            className="hover:text-primary transition-colors"
          >
            {dream?.title || "Untitled Dream"}
          </Link>
        </h3>
        
        <p className="mb-4 line-clamp-4">
          {isTranslated ? translatedContent : dream?.content || "No content available"}
        </p>
        
        {dream?.imageUrl && (
          <img 
            src={dream.imageUrl} 
            alt={dream?.title || "Dream image"}
            className="w-full h-auto mb-4 border-2 border-black"
          />
        )}
        
        {/* Tags */}
        {dream?.tags && dream.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {dream.tags.map((tag, index) => {
              const bgColors = ["bg-accent", "bg-primary text-white", "bg-secondary text-white"];
              const rotation = index % 2 === 0 ? "rotate-neg-1" : "rotate-1";
              return (
                <span 
                  key={tag}
                  className={`${bgColors[index % 3]} px-2 py-1 text-xs font-semibold border-2 border-black ${rotation}`}
                >
                  #{tag}
                </span>
              );
            })}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-0 pt-3 flex justify-between border-t-2 border-black">
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center gap-1 hover:bg-transparent"
          onClick={handleLikeToggle}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-secondary text-secondary' : ''}`} />
          <span>{likeCount}</span>
        </Button>
        
        <Dialog open={isCommenting} onOpenChange={setIsCommenting}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-1 hover:bg-transparent">
              <MessageCircle className="h-4 w-4" />
              <span>{commentCount}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="card-brutal">
            <DialogHeader>
              <DialogTitle className="font-pixel">Add Comment</DialogTitle>
              <DialogDescription>
                Share your thoughts about this dream
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCommentSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Write your comment..."
                          className="input-brutal min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    className="btn-brutal bg-primary text-white"
                    disabled={commentMutation.isPending}
                  >
                    {commentMutation.isPending ? "Submitting..." : "Submit Comment"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1 hover:bg-transparent"
          onClick={handleTranslate}
          disabled={translateMutation.isPending}
        >
          <Languages className="h-4 w-4" />
          <span>{isTranslated ? "Original" : "Translate"}</span>
        </Button>
      </CardFooter>
      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="border-2 border-black">
            <DialogHeader>
              <DialogTitle className="font-pixel text-lg text-destructive">
                {t("Delete Dream", language)}
              </DialogTitle>
              <DialogDescription>
                {t("Are you sure you want to delete this dream? This action cannot be undone.", language)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-2 pt-4 pb-2">
              <h3 className="font-medium">{dream.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{dream.content}</p>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                className="font-display"
              >
                {t("Cancel", language)}
              </Button>
              <Button
                variant="destructive"
                className="font-display"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  deleteMutation.mutate(dream.id);
                  setShowDeleteDialog(false);
                }}
              >
                {deleteMutation.isPending ? t("Deleting...", language) : t("Delete", language)}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
