import type { JiraAction, Project } from '../contracts';
export class JiraError extends Error { constructor(message:string,public definiteRejection=false){super(message);this.name='JiraError';} }
export interface JiraGateway {
  permission(project:string,permission:'BROWSE_PROJECTS'|'ADMINISTER_PROJECTS'|'CREATE_ISSUES'):Promise<boolean>;
  project(id:string):Promise<Project>;
  projects():Promise<Project[]>;
  issueTypes(project:string):Promise<{id:string;name:string}[]>;
  validateIssueType(project:string,type:string):Promise<void>;
  create(project:string,type:string,action:JiraAction,marker:string):Promise<{key:string;url:string}>;
  verifyIssue(key:string,marker:string):Promise<{key:string;url:string}>;
  comment(key:string,marker:string,paragraphs:string[]):Promise<{id:string}>;
}
