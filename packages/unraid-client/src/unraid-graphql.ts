import { BadRequestError } from '@unraid-vm-cp/shared-types';

let _getCookie: (() => string | undefined) | undefined;
let _gqlUrl: string | undefined;

export function initGraphQLClient(getCookie: () => string | undefined, baseUrl: string) {
  _getCookie = getCookie;
  _gqlUrl = `${baseUrl}/graphql`;
}

export function _resetForTests() {
  _getCookie = undefined;
  _gqlUrl = undefined;
}

async function gql(query: string, variables: Record<string, unknown>) {
  if (!_getCookie || !_gqlUrl) {
    throw new BadRequestError('GraphQL client not initialized');
  }
  const cookie = _getCookie();
  if (!cookie) {
    throw new BadRequestError('Not authenticated with Unraid');
  }
  const response = await fetch(_gqlUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ query, variables }),
  });
  const data = await response.json();
  if (data.errors?.length) {
    throw new BadRequestError(data.errors[0].message);
  }
  return data.data;
}

export async function startVM(id: string) {
  await gql(
    `mutation StartVM($id: String!) { vm { start(id: $id) } }`,
    { id },
  );
  return true;
}

export async function stopVM(id: string) {
  await gql(
    `mutation StopVM($id: String!) { vm { stop(id: $id) } }`,
    { id },
  );
  return true;
}

export async function forceStopVM(id: string) {
  await gql(
    `mutation ForceStopVM($id: String!) { vm { forceStop(id: $id) } }`,
    { id },
  );
  return true;
}

export async function rebootVM(id: string) {
  await gql(
    `mutation RebootVM($id: String!) { vm { reboot(id: $id) } }`,
    { id },
  );
  return true;
}

export async function pauseVM(id: string) {
  await gql(
    `mutation PauseVM($id: String!) { vm { pause(id: $id) } }`,
    { id },
  );
  return true;
}

export async function resumeVM(id: string) {
  await gql(
    `mutation ResumeVM($id: String!) { vm { resume(id: $id) } }`,
    { id },
  );
  return true;
}
