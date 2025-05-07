import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { useState, useEffect, useRef } from "react";
import { useRoute } from "wouter";
import { useWebSocket } from "@/hooks/use-websocket";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal, Info } from "lucide-react";
import { PixelAvatar } from "@/components/ui/pixel-avatar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type Message = {
  id: number;
  senderId: number;
  content: string;
  createdAt: string;
};

type ChatMatch = {
  id: number;
  user: {
    id: number;
    username: string;
    avatarId: number;
  };
  dreamId: number;
  dreamTitle: string;
};

export default function ChatPage() {
  // UI state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [highlightedMessageId, setHighlightedMessageId] = useState<number | null>(null);
  
  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Hooks
  const [match, params] = useRoute("/chat/:matchId");
  const matchId = match ? parseInt(params.matchId) : undefined;
  const { user } = useAuth();
  const { send, lastMessage, readyState } = useWebSocket();
  const { toast } = useToast();
  
  // Fetch match details
  const { data: matchData } = useQuery<ChatMatch, Error>({
    queryKey: matchId ? [`/api/matches/${matchId}`] : null,
    enabled: !!matchId,
  });
  
  // Fetch chat history
  const { data: chatHistory } = useQuery<Message[], Error>({
    queryKey: matchId ? [`/api/matches/${matchId}/messages`] : null,
    enabled: !!matchId,
    onSuccess: (data) => {
      setMessages(data);
    },
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ matchId, content }: { matchId: number, content: string }) => {
      const res = await apiRequest("POST", `/api/matches/${matchId}/messages`, { content });
      return res.json();
    },
  });
  
  // Controlla i parametri di query per l'evidenziazione dei messaggi
  useEffect(() => {
    if (!matchId) return;
    
    const params = new URLSearchParams(window.location.search);
    const messageId = params.get('messageId');
    const highlight = params.get('highlight');
    const userId = params.get('userId');
    
    if (messageId && highlight === 'message') {
      const msgId = parseInt(messageId);
      setHighlightedMessageId(msgId);
      
      // Mostra una notifica
      let userName = 'Qualcuno';
      if (userId) {
        // In una vera implementazione si potrebbe fare un fetch dei dettagli dell'utente
        userName = 'Un utente';
      }
      
      toast({
        title: 'Nuovo messaggio',
        description: `${userName} ti ha inviato un messaggio`,
        duration: 5000,
      });
    }
  }, [matchId, toast]);
  
  // Process incoming websocket messages
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'chat_message' && lastMessage.matchId === matchId) {
      setMessages(prev => [...prev, lastMessage.message]);
    }
  }, [lastMessage, matchId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Handle message sending
  const handleSendMessage = () => {
    if (!message.trim() || !matchId) return;
    
    // Send through WebSocket for real-time delivery
    send({
      type: 'chat_message',
      matchId,
      content: message
    });
    
    // Also send through REST API for persistence
    sendMessageMutation.mutate({ matchId, content: message });
    
    setMessage("");
  };
  
  // List of active matches for sidebar
  const { data: matches } = useQuery<ChatMatch[], Error>({
    queryKey: ['/api/matches'],
  });
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onMenuClick={() => setMobileMenuOpen(true)} />
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 py-6">
        <h1 className="font-pixel text-2xl md:text-3xl mb-8">
          Dream <span className="text-primary">Chat</span>
        </h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Matches sidebar */}
          <div className="md:w-1/4">
            <Card className="card-brutal rotate-neg-1">
              <CardHeader>
                <CardTitle className="font-pixel text-lg">Your Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {matches?.map((m) => (
                      <a 
                        key={m.id} 
                        href={`/chat/${m.id}`}
                        className={`flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 transition ${
                          m.id === matchId ? 'bg-gray-100 border-2 border-black' : ''
                        }`}
                      >
                        <PixelAvatar id={m.user.avatarId} />
                        <div>
                          <p className="font-medium">{m.user.username}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[150px]">
                            {m.dreamTitle}
                          </p>
                        </div>
                      </a>
                    ))}
                    
                    {!matches?.length && (
                      <div className="text-center p-4 text-gray-500">
                        <p>No matches yet</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
          
          {/* Chat area */}
          <div className="md:w-3/4">
            {matchId && matchData ? (
              <Card className="card-brutal">
                <CardHeader className="border-b-2 border-black">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <PixelAvatar id={matchData.user.avatarId} />
                      <div>
                        <CardTitle>{matchData.user.username}</CardTitle>
                        <p className="text-xs text-gray-500">
                          Matched on dream: {matchData.dreamTitle}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Info className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <div className="h-[400px] flex flex-col">
                    <ScrollArea ref={scrollRef} className="flex-1 p-4">
                      <div className="space-y-4">
                        {messages.length === 0 ? (
                          <div className="text-center py-10">
                            <p className="text-gray-500 mb-2">No messages yet</p>
                            <p className="text-sm text-gray-400">
                              Start the conversation by sending a message
                            </p>
                          </div>
                        ) : (
                          messages.map((msg) => {
                            const isOwn = msg.senderId === user?.id;
                            return (
                              <div 
                                key={msg.id} 
                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                              >
                                <div 
                                  id={`message-${msg.id}`}
                                  className={`max-w-[80%] p-3 border-2 border-black transition-all ${
                                    isOwn 
                                      ? 'bg-primary text-white rotate-1' 
                                      : 'bg-white rotate-neg-1'
                                  } ${
                                    highlightedMessageId === msg.id 
                                      ? 'ring-2 ring-offset-2 ring-primary shadow-lg animate-pulse' 
                                      : ''
                                  }`}
                                  ref={highlightedMessageId === msg.id ? (el) => {
                                    // Scorre all'elemento evidenziato
                                    if (el) {
                                      setTimeout(() => {
                                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        
                                        // Rimuovi l'evidenziazione dopo alcuni secondi
                                        setTimeout(() => {
                                          setHighlightedMessageId(null);
                                        }, 5000);
                                      }, 500);
                                    }
                                  } : undefined}
                                >
                                  <p>{msg.content}</p>
                                  <p className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'} mt-1`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </ScrollArea>
                    
                    <div className="p-4 border-t-2 border-black">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type your message..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="input-brutal"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button 
                          onClick={handleSendMessage}
                          className="btn-brutal bg-primary text-white"
                          disabled={!message.trim() || readyState !== WebSocket.OPEN}
                        >
                          <SendHorizontal className="h-5 w-5" />
                        </Button>
                      </div>
                      {readyState !== WebSocket.OPEN && (
                        <p className="text-xs text-red-500 mt-1">
                          Reconnecting to chat server...
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="card-brutal h-[600px] flex flex-col items-center justify-center">
                <CardContent className="text-center">
                  <div className="mb-4">
                    <img 
                      src="https://pixabay.com/get/g8f0fd43502b87224e9243719402c71682c9c9b0ad1f1dae8bf2979b6b59ca7e3e1d4e29e393e292daa65a6e8c270cd1084c5cd75ab19cb7adfbf47dea1610fc3_1280.jpg"
                      alt="Dream chat" 
                      className="w-40 h-40 mx-auto border-3 border-black shadow-brutal" 
                    />
                  </div>
                  <h2 className="font-pixel text-xl mb-4">Select a chat</h2>
                  <p className="text-gray-600 mb-4">
                    Choose a match from the sidebar to start chatting
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
