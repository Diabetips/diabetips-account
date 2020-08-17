export { environment } from './environments/environment';

export interface Environment {
  production: boolean;

  apiUrl: string;
  backUrl: string;
}
