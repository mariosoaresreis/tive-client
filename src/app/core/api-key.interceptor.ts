import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  const apiKey = environment.tiveQueryApiKey;

  if (!apiKey || apiKey.includes('REPLACE_WITH') || apiKey.includes('__TIVE_QUERY_API_KEY__')) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        'X-Api-Key': apiKey
      }
    })
  );
};

