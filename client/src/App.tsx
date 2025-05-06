import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

import HomePage from "@/pages/home-page";
import ExplorePage from "@/pages/explore-page";
import MatchesPage from "@/pages/matches-page";
import ChatPage from "@/pages/chat-page";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";

// Temporarily disable protected routes for debugging
function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/explore" component={ExplorePage} />
      <Route path="/matches" component={MatchesPage} />
      <Route path="/chat" component={ChatPage} />
      <Route path="/chat/:matchId" component={ChatPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* Temporarily remove WebSocketProvider during debugging */}
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
