import { Injectable } from '@angular/core';
import { map, catchError, filter } from 'rxjs/operators';
import { LoadingService } from './loading.service';
import {
  HttpClient,
  HttpHeaders,
  HttpEventType,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { LocalStorageService } from './local-storage.service';
import { LocalStorageEnum } from '../models/enums/local-storage.enum';
import { Router } from '@angular/router';
import { throwError, Observable } from 'rxjs';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { environment } from '../../environments/environment';
import { RequestParam } from '../models/request-param';
import { APIResponseCodeEnum } from '../models/enums/api-response-code.enum';
@Injectable({
  providedIn: 'root',
})
export class RequestService {
  constructor(
    private http: HttpClient,
    private loadingService: LoadingService,
    private localStorageService: LocalStorageService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  get<T>(path: string, request: RequestParam = {}) {
    const url = this.getUrl(path);
    this.clean(request.data);
    if (request.is_loading) {
      this.loadingService.setLoading(true);
    }
    const headers = this.getAuthHeader();
    return this.http.get<T>(url, { params: request.data, headers }).pipe(
      map((res) => {
        if (request.is_loading) {
          this.loadingService.setLoading(false);
        }
        return res;
      }),
      catchError((err) =>
        this.handleHttpError(err, request.is_loading, request.is_alert_error)
      )
    );
  }

  getJSON<T>(path: string, request: RequestParam = {}) {
    const url = this.getUrl(path);
    this.clean(request.data);
    if (request.is_loading) {
      this.loadingService.setLoading(true);
    }

    const headers = this.getAuthHeader();
    headers.append('Content-Type', 'application/json');
    return this.http.get<T>(url, { params: request.data, headers }).pipe(
      map((res) => this.handleResponse<T>(res, request.is_loading)),
      catchError((err) =>
        this.handleHttpError(err, request.is_loading, request.is_alert_error)
      )
    );
  }

  post<T>(path: string, request: RequestParam) {
    const url = this.getUrl(path);
    this.clean(request.data);
    if (request.is_loading) {
      this.loadingService.setLoading(true);
    }
    const headers = this.getAuthHeader();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    request.data = this.toFormData(request.data);
    return this.http.post<T>(url, request.data, { headers }).pipe(
      map((res) => this.handleResponse<T>(res, request.is_loading)),
      catchError((err) =>
        this.handleHttpError(err, request.is_loading, request.is_alert_error)
      )
    );
  }

  patch<T>(path: string, request: RequestParam) {
    const url = this.getUrl(path);
    this.clean(request.data);
    if (request.is_loading) {
      this.loadingService.setLoading(true);
    }
    const headers = this.getAuthHeader();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    request.data = this.toFormData(request.data);
    return this.http.patch<T>(url, request.data, { headers }).pipe(
      map((res) => this.handleResponse<T>(res, request.is_loading)),
      catchError((err) =>
        this.handleHttpError(err, request.is_loading, request.is_alert_error)
      )
    );
  }

  postJSON<T>(path: string, request: RequestParam) {
    const url = this.getUrl(path);
    this.clean(request.data);
    if (request.is_loading) {
      this.loadingService.setLoading(true);
    }
    const headers = this.getAuthHeader();
    headers.append('Content-Type', 'application/json');
    return this.http.post<T>(url, request.data, { headers }).pipe(
      map((res) => this.handleResponse<T>(res, request.is_loading)),
      catchError((err) =>
        this.handleHttpError(err, request.is_loading, request.is_alert_error)
      )
    );
  }

  postFile<T>(path: string, request: RequestParam): Observable<T> {
    const url = this.getUrl(path);
    this.clean(request.data);
    if (request.is_loading) {
      this.loadingService.setLoading(true);
    }
    const headers = this.getAuthHeader();
    headers.append('Content-Type', 'multipart/form-data;boundary=abc');
    request.data = this.toFormData(request.data);
    request.is_alert_error = true;
    return this.http.post<T>(url, request.data, { headers }).pipe(
      map((res) => this.handleResponse<T>(res, request.is_loading)),
      catchError((err) =>
        this.handleHttpError(err, request.is_loading, request.is_alert_error)
      )
    );
  }

  postFileProgress<T>(
    path: string,
    request: RequestParam
  ): Observable<number | T> {
    const url = this.getUrl(path);
    this.clean(request.data);
    if (request.is_loading) {
      this.loadingService.setLoading(true);
    }
    const headers = this.getAuthHeader();
    headers.append('Content-Type', 'multipart/form-data;boundary=abc');
    request.data = this.toFormData(request.data);
    return this.http
      .post<T>(url, request.data, {
        headers,
        reportProgress: true,
        responseType: 'json',
        observe: 'events',
      })
      .pipe(
        filter(
          (res) =>
            res.type == HttpEventType.UploadProgress ||
            res.type == HttpEventType.Response
        ),
        map((res) => {
          if (res.type == HttpEventType.UploadProgress) {
            return Math.round((res.loaded / (res.total || 0)) * 100);
          } else {
            return this.handleResponse<T>(
              (res as HttpResponse<T>).body || ({} as T),
              request.is_loading
            );
          }
        }),
        catchError((err) =>
          this.handleHttpError(err, request.is_loading, request.is_alert_error)
        )
      );
  }

  patchFile<T>(path: string, request: RequestParam): Observable<T> {
    const url = this.getUrl(path);
    this.clean(request.data);
    if (request.is_loading) {
      this.loadingService.setLoading(true);
    }
    const headers = this.getAuthHeader();
    headers.append('Content-Type', 'multipart/form-data;boundary=abc');
    request.data = this.toFormData(request.data);

    return this.http.patch<T>(url, request.data, { headers }).pipe(
      map((res) => this.handleResponse<T>(res, request.is_loading)),
      catchError((err) =>
        this.handleHttpError(err, request.is_loading, request.is_alert_error)
      )
    );
  }

  patchJSON<T>(path: string, request: RequestParam) {
    const url = this.getUrl(path);
    this.clean(request.data);
    if (request.is_loading) {
      this.loadingService.setLoading(true);
    }
    const headers = this.getAuthHeader();
    headers.append('Content-Type', 'application/json');
    return this.http.patch<T>(url, request.data, { headers }).pipe(
      map((res) => this.handleResponse<T>(res, request.is_loading)),
      catchError((err) =>
        this.handleHttpError(err, request.is_loading, request.is_alert_error)
      )
    );
  }

  deleteJSON<T>(path: string, request: RequestParam = {}) {
    const url = this.getUrl(path);
    if (request.is_loading) {
      this.loadingService.setLoading(true);
    }
    const headers = this.getAuthHeader();
    headers.append('Content-Type', 'application/json');
    return this.http.delete<T>(url, { headers, params: request.data }).pipe(
      map((res) => this.handleResponse<T>(res, request.is_loading)),
      catchError((err) =>
        this.handleHttpError(err, request.is_loading, request.is_alert_error)
      )
    );
  }

  deleteJSONWithBody<T>(path: string, request: RequestParam = {}, body?: any) {
    const url = this.getUrl(path);
    if (request.is_loading) {
      this.loadingService.setLoading(true);
    }
    const headers = this.getAuthHeader();
    headers.append('Content-Type', 'application/json');
    return this.http
      .delete<T>(url, { headers, params: request.data, body: body })
      .pipe(
        map((res) => this.handleResponse<T>(res, request.is_loading)),
        catchError((err) =>
          this.handleHttpError(err, request.is_loading, request.is_alert_error)
        )
      );
  }

  private clean(obj: any) {
    for (const propName in obj) {
      if (obj[propName] === null || obj[propName] === undefined) {
        delete obj[propName];
      }
    }
  }

  private getAuthHeader(): HttpHeaders {
    const token = this.localStorageService.get(LocalStorageEnum.token);
    if (token) {
      return new HttpHeaders({
        Authorization: 'Bearer ' + token,
      });
    }
    return new HttpHeaders();
  }

  private handleResponse<T>(res: T, is_loading?: boolean) {
    if (is_loading) {
      this.loadingService.setLoading(false);
    }

    return res;
  }

  private handleHttpError(
    error: HttpErrorResponse,
    is_loading?: boolean,
    is_alert_error?: boolean
  ) {
    if (is_loading) {
      this.loadingService.setLoading(false);
    }
    if (error.status === APIResponseCodeEnum.user_error) {
      if (is_alert_error) {
        this.snackBar.open(error.error.message, '?', {
          duration: 3000,
          horizontalPosition: 'center',
        });
      }
      return throwError(error.error);
    } else if (error.status === APIResponseCodeEnum.invalid_token) {
      this.localStorageService.delete(LocalStorageEnum.token);
      this.router.navigateByUrl('login');
    } else if (error.status === APIResponseCodeEnum.server_error) {
      if (is_alert_error) {
        this.snackBar.open(error.message, '?', {
          duration: 3000,
          horizontalPosition: 'center',
        });
      }
    }
    return throwError(error.error.message);
  }

  private toFormData(formValue: any) {
    const formData = new FormData();

    for (const key of Object.keys(formValue)) {
      const value = formValue[key];
      if (Array.isArray(value)) {
        for (const i of value) {
          let updateKeyName = key + '[]';
          formData.append(updateKeyName, i);
        }
      } else {
        formData.append(key, value);
      }
    }
    return formData;
  }

  public getUrl(path: string) {
    let arr = path.split('/').filter((v) => v);
    arr.unshift(environment.api_url);
    return arr.join('/');
  }
}
