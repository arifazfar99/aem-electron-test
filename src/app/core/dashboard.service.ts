import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, from, map, switchMap, throwError } from 'rxjs';
import PouchDB from 'pouchdb-browser';

import { environment } from 'src/environments/environment';
import { DashboardData } from './dashboard.model';

interface DashboardCacheDoc {
  _id: string;
  _rev?: string;
  data: DashboardData;
  savedAt: string;
}

export interface DashboardResult {
  data: DashboardData;
  cachedAt: string | null;
}

const CACHE_ID = 'latest';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private cache = new PouchDB<DashboardCacheDoc>('dashboard-cache');  

  constructor(private http: HttpClient) { }

  getDashboard(): Observable<DashboardResult> {
    return this.http.get<DashboardData>(`${environment.apiUrl}/dashboard`).pipe(
      switchMap(data =>
        from(this.saveToCache(data)).pipe(map(() => ({ data, cachedAt: null })))
      ),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          return throwError(() => err);
        }

        return from(this.cache.get(CACHE_ID)).pipe(
          map(doc => ({ data: doc.data, cachedAt: doc.savedAt })),
          catchError(() => throwError(() => err))
        );
      })
    );
  }

  private async saveToCache(data: DashboardData): Promise<void> {
    const existing = await this.cache.get(CACHE_ID).catch(() => null);
    await this.cache.put({ _id: CACHE_ID, _rev: existing?._rev, data, savedAt: new Date().toISOString() });
  }

}
