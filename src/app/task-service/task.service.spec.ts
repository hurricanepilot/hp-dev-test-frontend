// Http testing module and mocking controller
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

// Other imports
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { Error } from './model/error.model';
import { Task } from './model/task.model';
import { TaskService } from './task.service';

describe('TaskService', () => {
    let service: TaskService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [
                TaskService, 
                provideHttpClient(), 
                provideHttpClientTesting()
            ]
        });
        service = TestBed.inject(TaskService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('createTask', () => {
        it('should create a new task', () => {
            const mockTask: Task = {title: 'Test Task', status: 'NEW', dueDateTime: new Date() };
            service.createTask(mockTask).subscribe();

            const req = httpMock.expectOne(`${environment.apiUrl}/tasks`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(mockTask);
            req.flush(null);
        });
    });

    describe('retrieveTask', () => {
        it('should retrieve a task by id', () => {
            const mockTask: Task = {title: 'Test Task', status: 'NEW', dueDateTime: new Date(), id: 1 };
            service.retrieveTask(1).subscribe(task => expect(task).toEqual(mockTask));

            const req = httpMock.expectOne(`${environment.apiUrl}/tasks/1`);
            expect(req.request.method).toBe('GET');
            req.flush(mockTask);
        });
    });

    describe('retrieveAllTasks', () => {
        it('should retrieve all tasks', () => {
            const mockTasks: Task[] = [
                {title: 'Test Task 1', status: 'NEW', dueDateTime: new Date(), id: 1 },
                {title: 'Test Task 1', status: 'IN_PROGRESS', dueDateTime: new Date(), id: 2 },
            ];
            service.retrieveAllTasks().subscribe(tasks => expect(tasks).toEqual(mockTasks));

            const req = httpMock.expectOne(`${environment.apiUrl}/tasks`);
            expect(req.request.method).toBe('GET');
            req.flush(mockTasks);
        });
    });

    describe('updateTaskStatus', () => {
        it('should update the status of a task', () => {
            service.updateTaskStatus(1, 'COMPLETED').subscribe();

            const req = httpMock.expectOne(`${environment.apiUrl}/tasks/1`);
            expect(req.request.method).toBe('PATCH');
            expect(req.request.body).toEqual({ status: 'COMPLETED' });
            req.flush(null);
        });
    });

    describe('deleteTask', () => {
        it('should delete a task by id', () => {
            service.deleteTask(1).subscribe();

            const req = httpMock.expectOne(`${environment.apiUrl}/tasks/1`);
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });
    });

    describe('handleError', () => {
        it('should handle errors and return an observable with an Error object', () => {
            let error: Error | undefined;
            service.createTask({title: 'Test Task', status: 'NEW', dueDateTime: new Date() }).subscribe({
                next: () => fail('Expected an error but got none'),
                error: err => error = err
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/tasks`);
            expect(req.request.method).toBe('POST');
            req.flush("failed", { status: 404, statusText: 'Not Found' });

            expect(error?.status).toBe(404);
            expect(error?.reason).toBe('Not Found');
        });
    });
});