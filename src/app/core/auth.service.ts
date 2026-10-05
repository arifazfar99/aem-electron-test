import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, from, map, of, switchMap, throwError } from 'rxjs';
import { CredentialStoreService } from './credential-store.service';

import { environment } from 'src/environments/environment';

const TOKEN_KEY = 'auth_token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private credentialStore: CredentialStoreService) { }

  login(username: string, password: string): Observable<string> {
    return this.http
      .post<string>(`${environment.apiUrl}/account/login`, { username, password })
      .pipe(
        switchMap(token => 
          from(this.credentialStore.save(username, password, token)).pipe(map(() => token))
        ),
        catchError((err: HttpErrorResponse) => this.offlineLogin(username, password, err)),
        tap(token => localStorage.setItem(TOKEN_KEY, token))
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private offlineLogin(username: string, password: string, err: HttpErrorResponse): Observable<string> {
    if (err.status === 401) {
      return throwError(() => err);
    }

    return from(this.credentialStore.verify(username, password)).pipe(
      switchMap(token => token ? of(token) : throwError(() => err))
    );
  }
}
