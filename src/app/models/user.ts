import { MongoObject } from './mongo-object';

export interface User extends MongoObject {
  username: string;
  first_name: string;
  last_name: string;
  role_id: string;
  phone: string;
  email?: string;
  password?: string;
}
