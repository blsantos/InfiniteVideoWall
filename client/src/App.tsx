import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Chapter from "@/pages/chapter";
import Upload from "@/pages/upload";
import Admin from "@/pages/admin";
import Statistics from "@/pages/statistics";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/chapter/:id" component={Chapter} />
          <Route path="/upload" component={Upload} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/chapter/:id" component={Chapter} />
          <Route path="/upload" component={Upload} />
          <Route path="/admin" component={Admin} />
          <Route path="/statistics" component={Statistics} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
