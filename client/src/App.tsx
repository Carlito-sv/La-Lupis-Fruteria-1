import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AppLayout from "@/layouts/AppLayout";
import Dashboard from "@/pages/dashboard";
import Inventory from "@/pages/inventory";
import POS from "@/pages/pos";
import Invoicing from "@/pages/invoicing";
import Finances from "@/pages/finances";
import Staff from "@/pages/staff";
import Settings from "@/pages/settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/pos" component={POS} />
      <Route path="/invoicing" component={Invoicing} />
      <Route path="/finances" component={Finances} />
      <Route path="/staff" component={Staff} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppLayout>
          <Router />
        </AppLayout>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
