/* @refresh reload */
import { render } from 'solid-js/web';
import { Router, Route, Navigate, useNavigate } from '@solidjs/router';
import { Toaster } from 'solid-toast';
import { onMount, createEffect } from 'solid-js';

import './index.css';
import { AuthProvider, useAuth } from './contexts/auth';
import { UserProvider, useUser } from './contexts/user';
import { VMsProvider } from './contexts/vms';

import Users from './pages/Users/Users';
import VMs from './pages/VMs/VMs';
import Login from './pages/Login/Login';
import CreateUser from './pages/CreateUser/CreateUser';
import LinkVM from './pages/LinkVM/LinkVM';
import VMPermissions from './pages/VMPermissions/VMPermissions';
import EditUser from './pages/EditUser/EditUser';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

function InitUser() {
  const { isAuthenticated } = useAuth();
  const { getUser } = useUser();

  onMount(async () => {
    if (isAuthenticated()) {
      await getUser();
    }
  });

  return null;
}

function AuthGuard(props) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  createEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true });
    }
  });

  return <>{props.children}</>;
}

function GuestGuard(props) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  createEffect(() => {
    if (isAuthenticated()) {
      navigate('/vms', { replace: true });
    }
  });

  return <>{props.children}</>;
}

function RootLayout(props) {
  return (
    <AuthProvider>
      <UserProvider>
        <VMsProvider>
          <Toaster />
          <InitUser />
          {props.children}
        </VMsProvider>
      </UserProvider>
    </AuthProvider>
  );
}

render(() => (
  <Router root={RootLayout}>
    <Route path="/login" component={GuestGuard}>
      <Route path="/" component={Login} />
    </Route>
    <Route path="/" component={AuthGuard}>
      <Route path="/vms" component={VMs} />
      <Route path="/users" component={Users} />
      <Route path="/users/:userId/edit" component={EditUser} />
      <Route path="/users/:userId/vms" component={VMs} />
      <Route path="/users/:userId/vms/link" component={LinkVM} />
      <Route path="/users/:userId/vms/:unraidVMId/permissions" component={VMPermissions} />
      <Route path="/users/create" component={CreateUser} />
    </Route>
    <Route path="*" component={() => <Navigate href="/login" />} />
  </Router>
), root!);
