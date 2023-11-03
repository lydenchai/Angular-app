import { RequestValidation } from '../request-validation';

export interface BadRequestResposne {
  error: RequestValidation[];
  message: string;
}
