import { Route, Routes, useNavigate } from '@solidjs/router';
import { Component, onMount } from 'solid-js';

// Pages
import Users from './pages/Users/Users';
import VMs from './pages/VMs/VMs';
import Login from './pages/Login/Login';
import CreateUser from './pages/CreateUser/CreateUser';
import { useAuth } from './contexts/auth';
import { useUser } from './contexts/user';
import LinkVM from './pages/LinkVM/LinkVM';
import VMPermissions from './pages/VMPermissions/VMPermissions';

function Redirect(props: { children: any; when: boolean; to: string }) {
  const navigate = useNavigate();

  return () => (props.when ? navigate(props.to) : props.children);
}

export const App: Component = () => {

  const { isAuthenticated } = useAuth();
  const { getUser } = useUser();

  onMount(async () => {
    if (isAuthenticated()) {
      await getUser();
    }
  })

  return (
    <Routes>
      <Route
        path='/login'
        component={() => {
          return (
            <Redirect to='/vms' when={isAuthenticated()}>
              <Login />
            </Redirect>
          )
        }}
      />
      <Route
        path='/vms'
        component={() => {
          return (
            <Redirect to='/login' when={!isAuthenticated()}>
              <VMs />
            </Redirect>
          )
        }}
      />
      <Route
        path='/users'
        component={() => {
          return (
            <Redirect to='/login' when={!isAuthenticated()}>
              <Users />
            </Redirect>
          )
        }}
      />
      <Route
        path='/users/:userId/vms'
        component={() => {
          return (
            <Redirect to='/login' when={!isAuthenticated()}>
              <VMs />
            </Redirect>
          )
        }}
      />
      <Route
        path='/users/:userId/vms/link'
        component={() => {
          return (
            <Redirect to='/login' when={!isAuthenticated()}>
              <LinkVM />
            </Redirect>
          )
        }}
      />
      <Route
        path='/users/:userId/vms/:unraidVMId/permissions'
        component={() => {
          return (
            <Redirect to='/login' when={!isAuthenticated()}>
              <VMPermissions />
            </Redirect>
          )
        }}
      />
      <Route
        path='/users/create'
        component={() => {
          return (
            <Redirect to='/login' when={!isAuthenticated()}>
              <CreateUser />
            </Redirect>
          )
        }}
      />
      <Route
        path='*'
        component={() => {
          return (
            <Redirect to='/login' when={true}>
            </Redirect>
          )
        }}
      />
    </Routes>
  );
};
