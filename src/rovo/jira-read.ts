import api, {route} from '@forge/api';
import {z} from 'zod';
import {AnalystError, type ProjectAccess} from './analyst';

async function get<T>(path: ReturnType<typeof route>, schema: z.ZodType<T>): Promise<T> {
  const response = await api.asUser().requestJira(path, {method: 'GET'});
  if ([401, 403, 404].includes(response.status)) throw new AnalystError('ACCESS_DENIED', 'The requested Jira project is not accessible.');
  if (!response.ok) throw new AnalystError('DEPENDENCY_UNAVAILABLE', 'Jira could not be read. Retry from the saved report later.');
  return schema.parse(await response.json());
}

/** Deliberately exposes only two GET operations, with no issue-write gateway. */
export const analystProjectAccess: ProjectAccess = {
  project: selector => get(route`/rest/api/3/project/${selector}`, z.object({id: z.string(), key: z.string()})),
  canBrowse: async projectKey => {
    const result = await get(route`/rest/api/3/mypermissions?projectKey=${projectKey}&permissions=BROWSE_PROJECTS`, z.object({permissions: z.object({BROWSE_PROJECTS: z.object({havePermission: z.boolean()}).optional()})}));
    return result.permissions.BROWSE_PROJECTS?.havePermission === true;
  },
};
