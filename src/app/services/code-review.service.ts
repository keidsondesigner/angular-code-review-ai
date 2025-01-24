import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface CodeAnalysis {
  quality: string;
  recommendations: string[];
  improvedCode: string;
  performance: string[];
  security: string[];
  bestPractices: string[];
}

@Injectable({
  providedIn: 'root',
})
export class CodeReviewService {
  private apiUrl = 'https://api-keidsonroby-ai.onrender.com';
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string>('');

  loading$: Observable<boolean> = this.loadingSubject.asObservable();
  error$: Observable<string> = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  analyzeCode(code: string, framework: string): Observable<CodeAnalysis> {
    this.loadingSubject.next(true);
    this.errorSubject.next('');

    return this.http.post<CodeAnalysis>(`${this.apiUrl}/code-review/analyze`, { code, framework }).pipe(
      tap(() => this.loadingSubject.next(false)),
      catchError((error) => {
        this.loadingSubject.next(false);
        const errorMessage = error.error?.message || 'Falha ao analisar o código';
        this.errorSubject.next(errorMessage);
        return from([this.getDefaultAnalysis()]);
      })
    );
  }

  private getDefaultAnalysis(): CodeAnalysis {
    return {
      quality: 'Não foi possível completar a análise',
      recommendations: ['Por favor, tente novamente em alguns momentos'],
      improvedCode: '',
      performance: [],
      security: [],
      bestPractices: [],
    };
  }
}
