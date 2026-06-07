import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import AuthBootstrap from "@/components/common/AuthBootstrap";
import Toast from "@/components/common/Toast";
import AppRoutes from "@/routes/AppRoutes";

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <AuthBootstrap>
            <AppRoutes />
            <Toast />
          </AuthBootstrap>
        </BrowserRouter>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
