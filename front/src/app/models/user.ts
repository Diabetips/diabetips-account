export interface User {
  uid?: string;
  email: string;
  password?: string;
  invite?: string;
  lang: string;
  timezone: string;
  first_name: string;
  last_name: string;
}
