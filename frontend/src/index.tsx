/* @refresh reload */
import { render } from 'solid-js/web';
import { Router } from "@solidjs/router";
import { Toaster } from 'solid-toast';

import './index.css';
import { App } from './App';
import { AuthProvider } from './contexts/auth';
import { UserProvider } from './contexts/user';
import { VMsProvider } from './contexts/vms';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?',
  );
}

render(() => (
  <Router>
    <AuthProvider>
      <UserProvider>
        <VMsProvider>
          <Toaster />
          <App />
        </VMsProvider>
      </UserProvider>
    </AuthProvider>
  </Router>
), root!);
