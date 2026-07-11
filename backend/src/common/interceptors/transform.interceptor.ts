import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data is already structured with success/data/message, keep it or adapt it
        if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
          return data;
        }
        
        const message = data && typeof data === 'object' && 'message' in data ? data.message : 'Operation successful';
        const resultData = data && typeof data === 'object' && 'data' in data ? data.data : data;

        return {
          success: true,
          data: resultData,
          message: message,
        };
      }),
    );
  }
}
