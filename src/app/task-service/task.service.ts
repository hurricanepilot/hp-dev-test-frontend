import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Task } from './model/task.model';
import { Error } from './model/error.model';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class TaskService {

    private readonly apiUrl: string = environment.apiUrl + '/tasks';
    private readonly http: HttpClient = inject(HttpClient)

    public createTask(task: Task): Observable<void> {
        return this.http.post<void>(this.apiUrl, task).pipe(catchError(this.handleError));
    }

    public retrieveTask(id: number): Observable<Task> {
        return this.http.get<Task>(`${this.apiUrl}/${id}`).pipe(
            catchError(this.handleError)
        );
    }

    public retrieveAllTasks(): Observable<Task[]> {
        return this.http.get<Task[]>(this.apiUrl).pipe(
            catchError(this.handleError)
        );
    }

    public updateTaskStatus(id: number, status: string): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}`, {"status": status}).pipe(
            catchError(this.handleError)
        );
    }

    public deleteTask(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
            catchError(this.handleError)
        );
    }

    private handleError(error: HttpErrorResponse): Observable<never> {
        // Return an observable with a user-facing error message.
        return throwError(
            () => new Error(error.status, error.statusText)
        );
    }
}