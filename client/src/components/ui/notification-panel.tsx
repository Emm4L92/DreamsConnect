import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Heart, 
  MessageSquare, 
  MailCheck, 
  Clock, 
  X, 
  Trash2, 
  Check, 
  MoreHorizontal 
} from "lucide-react";
import { PixelAvatar } from "@/components/ui/pixel-avatar";
import { formatDate } from "@/lib/utils";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Notification = {
  id: number;
  type: "like" | "comment" | "message";
  userId: number;
  username: string;
  profileImage?: string | null;
  dreamId?: number;
  dreamTitle?: string;
  chatId?: number;
  commentId?: number;  // ID del commento, utile per la navigazione diretta al commento
  content?: string;
  createdAt: string;
  read: boolean;
};

export function NotificationPanel({
  isOpen,
  onClose,
  onNotificationUpdate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onNotificationUpdate?: (count: number) => void;
}) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);
  const queryClient = useQueryClient();

  // Simuliamo il recupero delle notifiche con TanStack Query
  // Nella realtà questo dovrebbe chiamare un endpoint API
  const { data: notificationsData = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    // Normalmente userei queryFn: getQueryFn({ on401: "throw" }),
    // ma visto che è simulato, ritorniamo direttamente i dati
    queryFn: () => {
      // Dati di esempio in attesa di un vero endpoint
      // Creiamo alcune notifiche di test con date valide
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      
      return [
        {
          id: 1,
          type: "like",
          userId: 2,
          username: "utente1",
          profileImage: "/uploads/test-profile-1.jpg",
          dreamId: 34,
          dreamTitle: "Esplorazione spaziale",
          createdAt: fiveMinutesAgo.toISOString(),
          read: false,
        },
        {
          id: 2,
          type: "comment",
          userId: 7,
          username: "utente1",
          profileImage: "/uploads/test-profile-2.jpg",
          dreamId: 34,
          dreamTitle: "Esplorazione spaziale",
          content: "Che sogno affascinante! L'ho avuto anche io.",
          createdAt: oneHourAgo.toISOString(),
          read: false,
        },
        {
          id: 3,
          type: "message",
          userId: 9,
          username: "testuser",
          profileImage: "/uploads/test-profile-3.jpg",
          chatId: 1,
          content: "Ciao, ho visto che abbiamo avuto un sogno simile!",
          createdAt: now.toISOString(),
          read: true,
        },
        {
          id: 4,
          type: "like",
          userId: 8,
          username: "utente2",
          profileImage: "/uploads/test-profile-4.jpg",
          dreamId: 36,
          dreamTitle: "Viaggio su Marte",
          createdAt: twoDaysAgo.toISOString(),
          read: true,
        },
      ];
    },
    enabled: isOpen,
  });

  // Aggiorna le notifiche locali quando arrivano nuovi dati
  useEffect(() => {
    if (notificationsData) {
      setLocalNotifications(notificationsData);
    }
  }, [notificationsData]);

  // Filtra le notifiche in base alla scheda attiva
  const filteredNotifications = localNotifications.filter(
    (notification) =>
      activeTab === "all" || notification.type === activeTab
  );

  // Conta le notifiche non lette e aggiorna il contatore nella navbar
  const unreadCount = localNotifications.filter(
    (notification) => !notification.read
  ).length;
  
  // Invia l'aggiornamento al componente padre ogni volta che cambia il conteggio
  useEffect(() => {
    if (onNotificationUpdate) {
      onNotificationUpdate(unreadCount);
    }
  }, [unreadCount, onNotificationUpdate]);

  // Ottiene l'URL di destinazione per una notifica
  const getNotificationUrl = (notification: Notification) => {
    switch (notification.type) {
      case "like":
        if (notification.dreamId) {
          return `/dreams/${notification.dreamId}?highlight=like&userId=${notification.userId}`;
        }
        return '/';
      case "comment":
        if (notification.dreamId) {
          return `/dreams/${notification.dreamId}?highlight=comment&userId=${notification.userId}${notification.commentId ? `&commentId=${notification.commentId}` : ''}`;
        }
        return '/';
      case "message":
        if (notification.chatId) {
          return `/chat/${notification.chatId}?highlight=message&userId=${notification.userId}${notification.content ? `&messageId=${notification.content}` : ''}`;
        }
        return '/chat';
      default:
        return '/';
    }
  };

  // Gestisce il clic su una notifica
  const handleNotificationClick = (notification: Notification) => {
    // Segna la notifica come letta
    markAsRead(notification.id);
    
    // Naviga all'URL appropriato
    window.location.href = getNotificationUrl(notification);
    
    onClose();
  };

  // Segna una notifica come letta
  const markAsRead = (notificationId: number) => {
    setLocalNotifications(prev => 
      prev.map(n => 
        n.id === notificationId 
          ? { ...n, read: true } 
          : n
      )
    );
    
    // In un'implementazione reale invieremmo una richiesta al server
    // apiRequest("POST", `/api/notifications/${notificationId}/read`);
  };

  // Elimina una notifica
  const deleteNotification = (notificationId: number, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    setLocalNotifications(prev => prev.filter(n => n.id !== notificationId));
    
    // In un'implementazione reale invieremmo una richiesta al server
    // apiRequest("DELETE", `/api/notifications/${notificationId}`);
  };

  // Segna tutte le notifiche come lette
  const markAllAsRead = () => {
    setLocalNotifications(prev => prev.map(n => ({ ...n, read: true })));
    
    // In un'implementazione reale invieremmo una richiesta al server
    // apiRequest("POST", "/api/notifications/read-all");
  };

  // Elimina tutte le notifiche
  const deleteAll = () => {
    setLocalNotifications([]);
    
    // In un'implementazione reale invieremmo una richiesta al server
    // apiRequest("DELETE", "/api/notifications");
  };

  // Renderizza un'icona in base al tipo di notifica
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "comment":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "message":
        return <MailCheck className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Ottiene il testo della notifica
  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case "like":
        return (
          <div>
            <span className="font-semibold">{notification.username}</span> ha
            messo like al tuo sogno{" "}
            <span className="font-semibold">{notification.dreamTitle}</span>
          </div>
        );
      case "comment":
        return (
          <div>
            <span className="font-semibold">{notification.username}</span> ha
            commentato il tuo sogno{" "}
            <span className="font-semibold">{notification.dreamTitle}</span>
            <div className="text-sm text-gray-600 mt-1">
              "{notification.content?.substring(0, 50)}
              {notification.content && notification.content.length > 50
                ? "..."
                : ""}
              "
            </div>
          </div>
        );
      case "message":
        return (
          <div>
            <span className="font-semibold">{notification.username}</span> ti ha
            inviato un messaggio
            <div className="text-sm text-gray-600 mt-1">
              "{notification.content?.substring(0, 50)}
              {notification.content && notification.content.length > 50
                ? "..."
                : ""}
              "
            </div>
          </div>
        );
      default:
        return <div>Notifica sconosciuta</div>;
    }
  };



  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-end items-start p-4"
      onClick={(e) => {
        // Chiudi il pannello quando si clicca fuori
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <Card className="w-full max-w-md h-[80vh] overflow-hidden flex flex-col bg-white card-brutal animate-in slide-in-from-right-10">
        <div className="flex justify-between items-center p-4 border-b-2 border-black">
          <h2 className="text-xl font-semibold flex items-center">
            Notifiche
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-red-500" variant="secondary">
                {unreadCount} nuove
              </Badge>
            )}
          </h2>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border border-gray-200 flex items-center gap-1"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Azioni</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="card-brutal">
                <DropdownMenuItem onClick={markAllAsRead}>
                  <Check className="mr-2 h-4 w-4" />
                  <span>Segna tutte come lette</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={deleteAll} className="text-red-500">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Elimina tutte</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <Tabs
          defaultValue="all"
          className="flex-1 flex flex-col"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-3 p-2">
            <TabsTrigger value="all" className="font-semibold">
              Tutte
            </TabsTrigger>
            <TabsTrigger value="like" className="font-semibold">
              Like
            </TabsTrigger>
            <TabsTrigger value="comment" className="font-semibold">
              Commenti
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <TabsContent value={activeTab} className="p-0 m-0 h-full">
              <div className="p-2">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center p-8 text-gray-500">
                    Nessuna notifica
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`relative flex items-start gap-3 p-3 mb-2 rounded-lg hover:bg-gray-50 transition-colors ${
                        !notification.read ? "bg-blue-50" : ""
                      }`}
                    >
                      <Link
                        to={getNotificationUrl(notification)}
                        onClick={() => handleNotificationClick(notification)}
                        className="flex-1 flex items-start gap-3"
                      >
                        <PixelAvatar
                          id={notification.userId % 6}
                          profileImage={notification.profileImage}
                          username={notification.username}
                          size="md"
                          className="flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getNotificationIcon(notification.type)}
                            <span className="text-xs text-gray-500">
                              {formatDate(notification.createdAt)}
                            </span>
                          </div>
                          <div className="text-sm">{getNotificationText(notification)}</div>
                        </div>
                      </Link>
                      
                      {/* Pulsanti per azioni sulla notifica */}
                      <div className="flex flex-col gap-1">
                        {!notification.read && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 rounded-full hover:bg-blue-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            title="Segna come letta"
                          >
                            <Check className="h-3 w-3 text-blue-500" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 rounded-full hover:bg-red-100"
                          onClick={(e) => deleteNotification(notification.id, e)}
                          title="Elimina notifica"
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </Card>
    </div>
  );
}