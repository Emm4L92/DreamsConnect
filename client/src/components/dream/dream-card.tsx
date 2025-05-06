import { useState } from "react";
import { Dream } from "@shared/schema";
import { PixelAvatar } from "@/components/ui/pixel-avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Languages } from "lucide-react";
import { useLikeDream, useUnlikeDream, useCreateComment, useTranslateDream } from "@/hooks/use-dreams";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";

interface DreamCardProps {
  dream: Dream;
  className?: string;
}

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(500, "Comment is too long")
});

export function DreamCard({ dream, className = "" }: DreamCardProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(dream?.isLikedByUser || false);
  const [likeCount, setLikeCount] = useState(dream?.likeCount || 0);
  const [commentCount, setCommentCount] = useState(dream?.commentCount || 0);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [translatedContent, setTranslatedContent] = useState("");
  
  const likeMutation = useLikeDream();
  const unlikeMutation = useUnlikeDream();
  const commentMutation = useCreateComment();
  const translateMutation = useTranslateDream();
  
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
            <PixelAvatar id={(dream.author?.id || 0) % 6} />
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
        </div>
      </CardHeader>
      
      <CardContent className="p-0 pb-4">
        <h3 className="font-pixel text-lg mb-3">{dream?.title || "Untitled Dream"}</h3>
        
        <p className="mb-4">
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
    </Card>
  );
}
