import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from '../services/local-storage.service';
import {
  HttpRequest,
  HttpHandler,
  HttpInterceptor,
  HttpClient,
} from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, finalize, switchMap, take } from 'rxjs/operators';
import { LocalStorageEnum } from '../models/enums/local-storage.enum';
import { environment } from 'src/environments/environment';
import { RefreshToken } from '../models/refresh-token';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private localStorageService: LocalStorageService,
    private authService: AuthService,
    private http: HttpClient
  ) {}
  isRefreshingToken: boolean = false;
  tokenBehaviorSubject: BehaviorSubject<string> = new BehaviorSubject<string>(
    ''
  );
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    const refresh_token_url = environment.api_url + '/refresh-token';
    const refresh_token = this.localStorageService.get(
      LocalStorageEnum.refresh_token
    );
    let token = this.localStorageService.get(LocalStorageEnum.token);
    if (req.url == refresh_token_url) {
      req = this.addRefreshToken(req, refresh_token);
    } else if (token) {
      req = this.addToken(req, token);
    }
    return next.handle(req).pipe(
      catchError((err) => {
        if (err.status === 401) {
          if (req.url === refresh_token_url) {
            this.logout();
          } else if (refresh_token) {
            if (!this.isRefreshingToken) {
              this.isRefreshingToken = true;
              // Reset here so that the following requests wait until the token
              // comes back from the refreshToken call.
              this.tokenBehaviorSubject.next('');
              // get a new token via userService.refreshToken
              return this.http.post<RefreshToken>(refresh_token_url, {}).pipe(
                switchMap((res) => {
                  this.localStorageService.set(
                    LocalStorageEnum.token,
                    res.access_token
                  );

                  const currentDate = new Date();
                  const currentMillisecond = currentDate.getTime();
                  // convert to millisecond since response from server is in second
                  const tokenExpiresInMillsecond = res.expires_in * 1000;
                  const expiresAt =
                    currentMillisecond + tokenExpiresInMillsecond;
                  this.localStorageService.set(
                    LocalStorageEnum.token_expires_at,
                    String(expiresAt)
                  );
                  this.tokenBehaviorSubject.next(res.access_token);
                  return next.handle(this.addToken(req, res.access_token));
                }),
                catchError((err) => {
                  // If we don't get a new token, we are in trouble so logout.
                  this.logout();
                  return throwError(err);
                }),
                finalize(() => {
                  this.isRefreshingToken = false;
                })
              );
            } else {
              return this.tokenBehaviorSubject.pipe(
                filter((token) => token != ''),
                take(1),
                switchMap((token) => {
                  return next.handle(this.addToken(req, token));
                })
              );
            }
          } else {
            this.logout();
          }
        }
        return throwError(err);
      })
    );
  }

  private addToken(req: HttpRequest<any>, token: string) {
    return req.clone({
      setHeaders: {
        Authorization: 'Bearer ' + token,
      },
    });
  }

  private addRefreshToken(req: HttpRequest<any>, token: string) {
    return req.clone({
      body: { ...req.body, refresh_token: token },
    });
  }

  private logout() {
    this.authService.logout().subscribe((res) => {
      this.router.navigateByUrl('/login');
    });
  }
}
