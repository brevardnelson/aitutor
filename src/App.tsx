
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { RBACProvider } from "@/contexts/RBACContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import OurStory from "./pages/OurStory";
import ContactUs from "./pages/ContactUs";
import About from "./pages/About";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { TeacherDashboard } from "./components/teacher/TeacherDashboard";
import { ParentDashboard } from "./components/parent/ParentDashboard";

const queryClient = new QueryClient();

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function usePageTracking() {
  const location = useLocation();
  useEffect(() => {
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [location.pathname, location.search]);
}

function PageTracker() {
  usePageTracking();
  return null;
}

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <RBACProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <PageTracker />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/our-story" element={<OurStory />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact-us" element={<ContactUs />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/teacher" element={<TeacherDashboard />} />
                <Route path="/parent" element={<ParentDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </RBACProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
