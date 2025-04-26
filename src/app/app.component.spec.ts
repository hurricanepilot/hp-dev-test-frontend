import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { AppComponent } from './app.component';
import { TaskListComponent } from './task-list/task-list.component';
import { TaskUpdate } from './task-service/model/task-update.model';
import { Task } from './task-service/model/task.model';

describe('AppComponent', () => {
    let app: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    let taskListSpy: jasmine.SpyObj<TaskListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNativeDateAdapter()
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(AppComponent);
        app = fixture.componentInstance;

        fixture.detectChanges();
    });

    describe('initialisation', () => {
        it('should create the app', () => {
            expect(app).toBeTruthy();
        });

        it(`should have the correct title`, () => {
            expect(app.title).toEqual('HMCTS Demo Task Application');
        });

        it('should render title', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            expect(compiled.querySelector('h1')?.textContent).toContain('HMCTS Demo Task Application');
        });
    });

    describe('sertHideCompleted', () => {
        it('should propagate hideCompleted changes to the TaskListComponent', () => {
            spyOn(app.taskListComponent, 'ngOnChanges');
            app.setHideCompleted(true);
            fixture.detectChanges();
            expect(app.taskListComponent.ngOnChanges).toHaveBeenCalled();
            expect(app.taskListComponent.hideCompleted).toEqual(app.hideCompleted);
        });
    });

    describe('applyFilter', () => {
        it('should propagate filter changes to the TaskListComponent', () => {
            spyOn(app.taskListComponent, 'ngOnChanges');
            app.applyFilter('myfilter');
            fixture.detectChanges();
            expect(app.taskListComponent.ngOnChanges).toHaveBeenCalled();
            expect(app.taskListComponent.filter).toEqual(app.filter);
        });
    });

    describe('deleteTask', () => {
        it('should call deleteTask on TaskService when deleteTask called on component', () => {
            spyOn(app.taskService, 'deleteTask').and.returnValue(of());
            app.deleteTask({ id: 1, title: 'Test Task 1', description: 'Test Description', status: 'NEW', dueDateTime: new Date() });
            expect(app.taskService.deleteTask).toHaveBeenCalled();
        });
        it('should handle errors and open the snack bar for deleteTask calls', () => {
            spyOn(app.taskService, 'deleteTask').and.returnValue(throwError({ reason: "failed" }));
            spyOn(app.snackBar, 'open');
            app.deleteTask({ id: 1, title: 'Test Task 1', description: 'Test Description', status: 'NEW', dueDateTime: new Date() });
            expect(app.taskService.deleteTask).toHaveBeenCalled();
            expect(app.snackBar.open).toHaveBeenCalled();
        });
    });


    describe('saveTask', () => {
        it('should call saveTask on TaskService when saveTask called on component', () => {
            const mockTask: Task = { id: 1, title: 'Test Task 1', description: 'Test Description', status: 'NEW', dueDateTime: new Date() };
            spyOn(app.taskService, 'createTask').and.returnValue(of());
            app.saveTask(mockTask);
            expect(app.taskService.createTask).toHaveBeenCalled();
        });

        it('should handle errors and open the snack bar for saveTask calls', () => {
            const mockTask: Task = { title: 'Test Task 1', description: 'Test Description', status: 'NEW', dueDateTime: new Date() };
            spyOn(app.taskService, 'createTask').and.returnValue(throwError({ reason: "failed" }));
            spyOn(app.snackBar, 'open');
            app.saveTask(mockTask);
            expect(app.taskService.createTask).toHaveBeenCalled();
            expect(app.snackBar.open).toHaveBeenCalled();
        });
    });

    describe('updateTask', () => {
        it('should call updateTask on TaskService when updateTask called on component', () => {
            const mockTaskUpdate: TaskUpdate = { id: 1, update: new Map() };
            mockTaskUpdate.update.set('status', 'COMPLETED');
            spyOn(app.taskService, 'updateTaskStatus').and.returnValue(of());
            app.updateTask(mockTaskUpdate);
            expect(app.taskService.updateTaskStatus).toHaveBeenCalled();
        });

        it('should handle errors and open the snack bar for updateTask calls', () => {
            const mockTaskUpdate: TaskUpdate = { id: 1, update: new Map() };
            mockTaskUpdate.update.set('status', 'COMPLETED');
            spyOn(app.taskService, 'updateTaskStatus').and.returnValue(throwError({ reason: "failed" }));
            spyOn(app.snackBar, 'open');
            app.updateTask(mockTaskUpdate);
            expect(app.taskService.updateTaskStatus).toHaveBeenCalled();
            expect(app.snackBar.open).toHaveBeenCalled();
        });
    });

    describe('addTaskPanel', () => {
        it('should add the TaskFormComponent when showAddTaskPanel(true) is called', () => {
            app.showAddTaskPanel(true);
            fixture.detectChanges();
            const taskFormEl = fixture.debugElement.query(By.css("task-form"));
            expect(taskFormEl).toBeTruthy();
        });

        it('should remove the TaskFormComponent when showAddTaskPanel(false) is called', () => {
            app.showAddTaskPanel(false);
            fixture.detectChanges();
            const taskFormEl = fixture.debugElement.query(By.css("task-form"));
            expect(taskFormEl).toBeFalsy();
        });
    });
});
