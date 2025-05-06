import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useCreateComment } from "@/hooks/use-dreams";
import { useLanguage, t } from "@/hooks/use-language";
import { LoaderCircle } from "lucide-react";

interface CreateCommentFormProps {
  dreamId: number;
}

const commentSchema = z.object({
  content: z.string()
    .min(1, "Comment cannot be empty")
    .max(500, "Comment is too long (maximum 500 characters)")
});

export function CreateCommentForm({ dreamId }: CreateCommentFormProps) {
  const { language } = useLanguage();
  const commentMutation = useCreateComment();
  
  const form = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  });
  
  function onSubmit(values: z.infer<typeof commentSchema>) {
    commentMutation.mutate(
      { dreamId, content: values.content },
      {
        onSuccess: () => {
          form.reset();
        }
      }
    );
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea 
                  placeholder={t("Write your comment...", language)}
                  className="border-2 border-black min-h-[120px] font-sans resize-none"
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
            className="btn-brutal font-display"
            disabled={commentMutation.isPending}
          >
            {commentMutation.isPending ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                {t("Submitting...", language)}
              </>
            ) : (
              t("Submit Comment", language)
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}