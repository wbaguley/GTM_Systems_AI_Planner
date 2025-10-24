import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardDynamic from "./pages/DashboardDynamic";
import PlatformsDynamic from "./pages/PlatformsDynamic";
import Settings from "./pages/Settings";
import GTMFramework from './pages/GTMFramework';
import ICPAssessment from "./pages/ICPAssessment";
import ICPQuestionnaire from "./pages/ICPQuestionnaire";
import ICPResults from "./pages/ICPResults";
import GTMAssessment from "./pages/GTMAssessment";
import GTMResults from "./pages/GTMResults";
import PlaybookBuilder from "./pages/PlaybookBuilder";
import PlaybookCanvas from "./pages/PlaybookCanvas";
import ModuleBuilder from "./pages/ModuleBuilder";
import FormDesigner from "./pages/FormDesigner";
import DashboardLayout from "./components/DashboardLayout";

function Router() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={DashboardDynamic} />
        <Route path="/platforms" component={PlatformsDynamic} />
        <Route path="/gtm-framework" component={GTMFramework} />
        <Route path="/gtm-framework/assessment/:id" component={GTMAssessment} />
        <Route path="/gtm-framework/results/:assessmentId" component={GTMResults} />
        <Route path="/playbook-builder" component={PlaybookBuilder} />
        <Route path="/playbook-builder/:id" component={PlaybookCanvas} />
        <Route path="/icp-assessment" component={ICPAssessment} />
        <Route path="/icp-assessment/:id/questionnaire" component={ICPQuestionnaire} />
        <Route path="/icp-assessment/:id/results" component={ICPResults} />
        <Route path="/settings" component={Settings} />
        <Route path="/module-builder" component={ModuleBuilder} />
        <Route path="/module-builder/:id/design" component={FormDesigner} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

