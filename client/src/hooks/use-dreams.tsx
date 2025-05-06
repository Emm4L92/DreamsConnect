import { useQuery, useMutation } from "@tanstack/react-query";
import { Dream, InsertDream, DreamComment, InsertDreamComment } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useDreams(params?: { language?: string; tag?: string }) {
  const queryParams = new URLSearchParams();
  
  if (params?.language) {
    queryParams.append("language", params.language);
  }
  
  if (params?.tag) {
    queryParams.append("tag", params.tag);
  }
  
  const queryString = queryParams.toString();
  const endpoint = `/api/dreams${queryString ? `?${queryString}` : ''}`;
  
  return useQuery<Dream[], Error>({
    queryKey: [endpoint],
  });
}

export function useUserDreams(userId: number) {
  return useQuery<Dream[], Error>({
    queryKey: [`/api/users/${userId}/dreams`],
  });
}

export function useDream(dreamId: number | undefined) {
  return useQuery<Dream, Error>({
    queryKey: [`/api/dreams/${dreamId}`],
    enabled: !!dreamId,
  });
}

export function useCreateDream() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (newDream: InsertDream) => {
      const res = await apiRequest("POST", "/api/dreams", newDream);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dreams'] });
      toast({
        title: "Dream shared",
        description: "Your dream has been shared successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to share dream",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useLikeDream() {
  return useMutation({
    mutationFn: async ({ dreamId }: { dreamId: number }) => {
      const res = await apiRequest("POST", `/api/dreams/${dreamId}/like`);
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/dreams'] });
      queryClient.invalidateQueries({ queryKey: [`/api/dreams/${variables.dreamId}`] });
    },
  });
}

export function useUnlikeDream() {
  return useMutation({
    mutationFn: async ({ dreamId }: { dreamId: number }) => {
      const res = await apiRequest("DELETE", `/api/dreams/${dreamId}/like`);
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/dreams'] });
      queryClient.invalidateQueries({ queryKey: [`/api/dreams/${variables.dreamId}`] });
    },
  });
}

export function useCreateComment() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ dreamId, content }: { dreamId: number, content: string }) => {
      const res = await apiRequest("POST", `/api/dreams/${dreamId}/comments`, { content });
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/dreams/${variables.dreamId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/dreams'] });
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useTranslateDream() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ dreamId, targetLang }: { dreamId: number, targetLang: string }) => {
      const res = await apiRequest("GET", `/api/dreams/${dreamId}/translate?targetLang=${targetLang}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Dream translated",
        description: "The dream has been translated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Translation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useMatches() {
  return useQuery<{ matches: { id: number, user: { id: number, username: string, avatarId: number } }[] }, Error>({
    queryKey: ['/api/matches'],
  });
}
