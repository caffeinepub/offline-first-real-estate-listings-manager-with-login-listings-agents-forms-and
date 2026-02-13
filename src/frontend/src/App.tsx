import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NewEntryPage from './pages/NewEntryPage';
import RecordDetailsPage from './pages/RecordDetailsPage';
import AgentListPage from './pages/AgentListPage';
import AgentDetailsPage from './pages/AgentDetailsPage';
import SettingsPage from './pages/SettingsPage';
import CustomerListPage from './pages/CustomerListPage';
import SoldListPage from './pages/SoldListPage';
import DealPage from './pages/DealPage';
import AppLayout from './components/AppLayout';

const rootRoute = createRootRoute({
  component: () => <Outlet />
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  component: AppLayout,
  beforeLoad: ({ context }: any) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  }
});

const dashboardRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  component: DashboardPage
});

const newEntryRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/new-entry',
  component: NewEntryPage
});

const recordDetailsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/record/$recordId',
  component: RecordDetailsPage
});

const agentListRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/agents',
  component: AgentListPage
});

const agentDetailsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/agent/$agentId',
  component: AgentDetailsPage
});

const settingsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/settings',
  component: SettingsPage
});

const customerListRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/customers',
  component: CustomerListPage
});

const soldListRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/sold',
  component: SoldListPage
});

const dealRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/deal',
  component: DealPage
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  layoutRoute.addChildren([
    dashboardRoute,
    newEntryRoute,
    recordDetailsRoute,
    agentListRoute,
    agentDetailsRoute,
    settingsRoute,
    customerListRoute,
    soldListRoute,
    dealRoute
  ])
]);

const router = createRouter({
  routeTree,
  context: { isAuthenticated: false },
  defaultPreload: 'intent'
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function AppRouter() {
  const { isAuthenticated } = useAuth();
  return <RouterProvider router={router} context={{ isAuthenticated }} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
