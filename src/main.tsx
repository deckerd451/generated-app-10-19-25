import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ChatPage } from '@/pages/ChatPage';
import { AppLayout } from '@/components/layout/AppLayout';
import { EcosystemPage } from '@/pages/EcosystemPage';
import { MockAuthPage } from '@/pages/MockAuthPage';
import { CommunityPage } from '@/pages/CommunityPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ImportSnapshotPage } from '@/pages/ImportSnapshotPage';
import { SimpleRouteError } from './components/SimpleRouteError';
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <SimpleRouteError />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "chat",
        element: <ChatPage />,
      },
      {
        path: "chat/:sessionId",
        element: <ChatPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "ecosystem",
        element: <EcosystemPage />,
      },
      {
        path: "import",
        element: <ImportSnapshotPage />,
      },
      {
        path: "community",
        element: <CommunityPage />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <SimpleRouteError />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
    errorElement: <SimpleRouteError />,
  },
  {
    path: "/auth/mock-consent/:service",
    element: <MockAuthPage />,
    errorElement: <SimpleRouteError />,
  },
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
)