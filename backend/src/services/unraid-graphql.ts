import axios from 'axios';
import { config } from '../config.js';
import { BadRequestError } from './ErrorHandler.js';

const GQL_URL = `${config.unraid.baseUrl}/graphql`;

let _getCookie: () => string;

export function initGraphQLClient(getCookie: () => string) {
  _getCookie = getCookie;
}

export function _resetForTests() {
  _getCookie = undefined as unknown as () => string;
}

async function gql(query: string, variables: Record<string, unknown>) {
  if (!_getCookie) {
    throw new BadRequestError('GraphQL client not initialized');
  }
  const cookie = _getCookie();
  if (!cookie) {
    throw new BadRequestError('Not authenticated with Unraid');
  }
  const { data } = await axios({
    url: GQL_URL,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    data: { query, variables },
  });
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
