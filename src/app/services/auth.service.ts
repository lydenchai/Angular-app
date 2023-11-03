import { Injectable } from '@angular/core';
import { RequestService } from './request.service';
import { map } from 'rxjs/operators';
import { LocalStorageService } from './local-storage.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { LocalStorageEnum } from '../models/enums/local-storage.enum';
import { NavigationStart, Router } from '@angular/router';
import { User } from '../models/user';
import { Login } from '../models/login';
import { Information } from '../models/information';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  authChange$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    this._isAuth
  );
  isAuth: boolean = this._isAuth;
  userRole: string = this._userRole;
  userId: string = this._userId;
  constructor(
    private router: Router,
    private requestService: RequestService,
    private localStorageService: LocalStorageService
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (this.isAuth != this._isAuth) {
          this.markStatusChange();
        }
      }
    });
  }

  login(data: Login) {
    return this.requestService
      .postJSON<{ user: User; access_token: string }>('/login', {
        data,
        is_loading: true,
      })
      .pipe(
        map((res: any) => {
          this.localStorageService.set(LocalStorageEnum.token, res.token);
          this.localStorageService.set(
            LocalStorageEnum.token_expires_at,
            this._getTokenExpiresAt(res.expires_in).toString()
          );
          this.localStorageService.set(
            LocalStorageEnum.user_role,
            res.user.role
          );
          this.localStorageService.set(
            LocalStorageEnum.user_profile,
            res.user.profile
          );

          this.localStorageService.set(
            LocalStorageEnum.user_firstname,
            res.user.first_name
          );
          this.localStorageService.set(
            LocalStorageEnum.user_lastname,
            res.user.last_name
          );
          this.localStorageService.set(LocalStorageEnum.user_id, res.user._id!);
          this.localStorageService.set(
            LocalStorageEnum.refresh_token,
            res.refresh_token
          );
          this.markStatusChange();
          return res;
        })
      );
  }

  logout() {
    this.requestService.postJSON('/logout', {});
    this.localStorageService.delete(LocalStorageEnum.token);
    this.localStorageService.delete(LocalStorageEnum.user_id);
    return new Observable<string>((observer) => {
      observer.complete(); // complete function will be called when the observable is complete
      this.markStatusChange();
    });
  }

  resetPassword = (data: { old_password: string; new_password: string }) => {
    const userId = this.localStorageService.get(LocalStorageEnum.user_id);
    return this.requestService.patchJSON(`/users/${userId}/change-pwd`, {
      is_loading: true,
      data: data,
    });
  };

  getInformation(data: Information) {
    return this.requestService
      .getJSON('/information', { data, is_loading: true })
      .pipe(
        map((res: any) => {
          return res;
        })
      );
  }

  getProfile() {
    return this.requestService.getJSON<User>('/profile').pipe(
      map((res) => {
        if (res.role_id != this.userRole) {
          this.localStorageService.set(LocalStorageEnum.user_role, res.role_id);
        }
        return res;
      })
    );
  }

  private markStatusChange() {
    this.authChange$.next(this._isAuth);
    this.isAuth = this._isAuth;
    this.userRole = this._userRole;
    this.userId = this._userId;
  }

  private _getTokenExpiresAt = (tokenExpiresIn: number): number => {
    const currentDate = new Date();
    const currentMillisecond = currentDate.getTime();
    // convert to millisecond since response from server is in second
    const tokenExpiresInMillsecond = tokenExpiresIn * 1000;
    return currentMillisecond + tokenExpiresInMillsecond;
  };

  private get _isAuth(): boolean {
    if (this.localStorageService.get(LocalStorageEnum.token)) {
      return true;
    }
    return false;
  }

  private get _userRole(): string {
    return this.localStorageService.get(LocalStorageEnum.user_role);
  }

  private get _userId(): string {
    return this.localStorageService.get(LocalStorageEnum.user_id);
  }

  public get tokenExpired(): boolean {
    const currentDate = new Date();
    return (
      Number(this.localStorageService.get(LocalStorageEnum.token_expires_at)) <
      currentDate.getTime()
    );
  }
}
