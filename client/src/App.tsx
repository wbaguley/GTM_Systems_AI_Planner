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
import { FeatureGate } from './components/FeatureGate';
import ICPAssessment from "./pages/ICPAssessment";
import ICPQuestionnaire from "./pages/ICPQuestionnaire";
import GTMAssessment from "./pages/GTMAssessment";
import GTMResults from "./pages/GTMResults";
import PlaybookBuilder from "./pages/PlaybookBuilder";
import PlaybookCanvas from "./pages/PlaybookCanvas";
import ModuleBuilder from "./pages/ModuleBuilder";
import FormDesigner from "./pages/FormDesigner";
import Pricing from "./pages/Pricing";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import DashboardLayout from "./components/DashboardLayout";

function Router() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={DashboardDynamic} />
        <Route path="/platforms" component={PlatformsDynamic} />
        <Route path="/gtm-framework">
          <FeatureGate feature="gtm_framework">
            <GTMFramework />
          </FeatureGate>
        </Route>
        <Route path="/gtm-framework/assessment/:id" component={GTMAssessment} />
        <Route path="/gtm-framework/results/:assessmentId" component={GTMResults} />
        <Route path="/playbook-builder">
          <FeatureGate feature="playbook_builder">
            <PlaybookBuilder />
          </FeatureGate>
        </Route>
        <Route path="/playbook-builder/:id" component={PlaybookCanvas} />
        <Route path="/icp-assessment">
          <FeatureGate feature="icp_assessment">
            <ICPAssessment />
          </FeatureGate>
        </Route>
        <Route path="/icp-assessment/:id/questionnaire" component={ICPQuestionnaire} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/terms" component={TermsOfService} />
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

