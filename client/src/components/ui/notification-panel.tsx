import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Heart, MessageSquare, MailCheck, Clock, X } from "lucide-react";
import { PixelAvatar } from "@/components/ui/pixel-avatar";
import { formatDate } from "@/lib/utils";
import { Link } from "wouter";

type Notification = {
  id: number;
  type: "like" | "comment" | "message";
  userId: number;
  username: string;
  dreamId?: number;
  dreamTitle?: string;
  chatId?: number;
  content?: string;
  createdAt: string;
  read: boolean;
};

export function NotificationPanel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<string>("all");

  // Simuliamo il recupero delle notifiche con TanStack Query
  // Nella realtà questo dovrebbe chiamare un endpoint API
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    // Normalmente userei queryFn: getQueryFn({ on401: "throw" }),
    // ma visto che è simulato, ritorniamo direttamente i dati
    queryFn: () => {
      // Dati di esempio in attesa di un vero endpoint
      return [
        {
          id: 1,
          type: "like",
          userId: 2,
          username: "utente1",
          dreamId: 34,
          dreamTitle: "Esplorazione spaziale",
          createdAt: new Date().toISOString(),
          read: false,
        },
        {
          id: 2,
          type: "comment",
          userId: 7,
          username: "utente1",
          dreamId: 34,
          dreamTitle: "Esplorazione spaziale",
          content: "Che sogno affascinante! L'ho avuto anche io.",
          createdAt: new Date().toISOString(),
          read: false,
        },
        {
          id: 3,
          type: "message",
          userId: 9,
          username: "testuser",
          chatId: 1,
          content: "Ciao, ho visto che abbiamo avuto un sogno simile!",
          createdAt: new Date().toISOString(),
          read: true,
        },
      ];
    },
    enabled: isOpen,
  });

  // Filtra le notifiche in base alla scheda attiva
  const filteredNotifications = notifications.filter(
    (notification) =>
      activeTab === "all" || notification.type === activeTab
  );

  // Conta le notifiche non lette
  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  // Gestisce il clic su una notifica
  const handleNotificationClick = (notification: Notification) => {
    // Qui in un'implementazione reale invieremmo una richiesta per segnare
    // la notifica come letta
    onClose();
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
          <>
            <span className="font-semibold">{notification.username}</span> ha
            messo like al tuo sogno{" "}
            <span className="font-semibold">{notification.dreamTitle}</span>
          </>
        );
      case "comment":
        return (
          <>
            <span className="font-semibold">{notification.username}</span> ha
            commentato il tuo sogno{" "}
            <span className="font-semibold">{notification.dreamTitle}</span>
            <p className="text-sm text-gray-600 mt-1">
              "{notification.content?.substring(0, 50)}
              {notification.content && notification.content.length > 50
                ? "..."
                : ""}
              "
            </p>
          </>
        );
      case "message":
        return (
          <>
            <span className="font-semibold">{notification.username}</span> ti ha
            inviato un messaggio
            <p className="text-sm text-gray-600 mt-1">
              "{notification.content?.substring(0, 50)}
              {notification.content && notification.content.length > 50
                ? "..."
                : ""}
              "
            </p>
          </>
        );
      default:
        return "Notifica sconosciuta";
    }
  };

  // Ottiene l'URL a cui reindirizzare quando si clicca sulla notifica
  const getNotificationUrl = (notification: Notification) => {
    switch (notification.type) {
      case "like":
      case "comment":
        return `/dreams/${notification.dreamId}`;
      case "message":
        return `/chat/${notification.chatId}`;
      default:
        return "/";
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
          <h2 className="text-xl font-semibold">
            Notifiche
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-red-500" variant="secondary">
                {unreadCount} nuove
              </Badge>
            )}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
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
                  <div className="text-center p-4 text-gray-500">
                    Nessuna notifica
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <Link
                      key={notification.id}
                      to={getNotificationUrl(notification)}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div
                        className={`flex items-start gap-3 p-3 mb-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${
                          !notification.read ? "bg-blue-50" : ""
                        }`}
                      >
                        <PixelAvatar
                          id={notification.userId % 6}
                          className="flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getNotificationIcon(notification.type)}
                            <span className="text-xs text-gray-500">
                              {formatDate(notification.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm">{getNotificationText(notification)}</p>
                        </div>
                      </div>
                    </Link>
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