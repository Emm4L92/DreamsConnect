import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useCreateDream } from "@/hooks/use-dreams";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";

const dreamSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }).max(100, {
    message: "Title must not exceed 100 characters."
  }),
  content: z.string().min(10, {
    message: "Dream description must be at least 10 characters.",
  }).max(2000, {
    message: "Dream description must not exceed 2000 characters."
  }),
  language: z.string(),
  visibility: z.enum(["public", "private"]),
  imageUrl: z.string().optional(),
});

export function CreateDreamForm() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  const createDreamMutation = useCreateDream();
  
  const form = useForm<z.infer<typeof dreamSchema>>({
    resolver: zodResolver(dreamSchema),
    defaultValues: {
      title: "",
      content: "",
      language: "en",
      visibility: "public",
      imageUrl: "",
    },
  });
  
  function onSubmit(values: z.infer<typeof dreamSchema>) {
    createDreamMutation.mutate(values, {
      onSuccess: () => {
        form.reset();
        setIsExpanded(false);
        toast({
          title: "Dream Shared",
          description: "Your dream has been shared successfully!",
        });
      }
    });
  }
  
  const toggleForm = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <section className="mb-12">
      <AnimatePresence>
        {!isExpanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-8">
              <Button 
                onClick={toggleForm}
                className="btn-brutal bg-primary text-white px-6 py-3 font-semibold rotate-1"
              >
                Share Your Dream
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="card-brutal bg-white p-6 max-w-3xl mx-auto rotate-neg-1">
              <CardHeader className="p-0 pb-6">
                <CardTitle className="font-pixel text-xl">Share Your Dream</CardTitle>
              </CardHeader>
              
              <CardContent className="p-0">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Dream Title</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Give your dream a title..." 
                              className="input-brutal w-full p-3 bg-background"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Dream Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your dream experience..."
                              className="input-brutal w-full p-3 min-h-[120px] bg-background"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <FormField
                        control={form.control}
                        name="language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold">Language</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="input-brutal w-full p-3 bg-background">
                                  <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="it">Italian</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                <SelectItem value="de">German</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="visibility"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="font-semibold">Visibility</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex gap-4 mt-3"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="public" id="public" className="hidden" />
                                  <div className="h-5 w-5 border-2 border-black flex justify-center items-center bg-background">
                                    {field.value === "public" && (
                                      <div className="h-3 w-3 bg-primary"></div>
                                    )}
                                  </div>
                                  <Label htmlFor="public" className="cursor-pointer">Public</Label>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="private" id="private" className="hidden" />
                                  <div className="h-5 w-5 border-2 border-black flex justify-center items-center bg-background">
                                    {field.value === "private" && (
                                      <div className="h-3 w-3 bg-primary"></div>
                                    )}
                                  </div>
                                  <Label htmlFor="private" className="cursor-pointer">Private</Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Add Image (Optional)</FormLabel>
                          <FormControl>
                            <div className="input-brutal bg-background border-dashed p-4 text-center cursor-pointer">
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-8 w-8 mx-auto mb-2" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                                />
                              </svg>
                              <p>Click to upload an image related to your dream</p>
                              <Input 
                                type="text" 
                                className="mt-2 input-brutal bg-white"
                                placeholder="Or paste an image URL"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end gap-3 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={toggleForm}
                        className="btn-brutal bg-background rotate-neg-1"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="btn-brutal bg-primary text-white rotate-1"
                        disabled={createDreamMutation.isPending}
                      >
                        {createDreamMutation.isPending ? "Publishing..." : "Publish Dream"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
