import { DatePipe, SlicePipe } from '@angular/common';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { of, throwError } from 'rxjs';
import { TaskUpdate } from '../task-service/model/task-update.model';
import { Task } from '../task-service/model/task.model';
import { TaskService } from '../task-service/task.service';
import { TaskListComponent } from './task-list.component';


class MatDialogMock {
    open = jasmine.createSpy().and.returnValue({
      afterClosed: () => of(true),
    });
  }

describe('TaskListComponent', () => {
    let taskListComponent: TaskListComponent;
    let fixture: ComponentFixture<TaskListComponent>;
    let taskServiceSpy: jasmine.SpyObj<TaskService>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;

    beforeEach(async () => {
        const taskServiceSpyObj = jasmine.createSpyObj('TaskService', ['retrieveAllTasks']);

        await TestBed.configureTestingModule({
            imports: [
                MatDividerModule,
                MatFormFieldModule,
                MatExpansionModule,
                MatButtonModule,
                MatInputModule,
                MatSelectModule,
                MatIconModule,
                MatDialogModule,
                MatTooltipModule,
                TaskListComponent
            ],
            providers: [
                SlicePipe,
                DatePipe,
                { provide: TaskService, useValue: taskServiceSpyObj },
                { provide: MatDialog, useClass: MatDialogMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(TaskListComponent);
        taskListComponent = fixture.componentInstance;
        taskServiceSpy = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;
        dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    });

    beforeEach(() => {
        fixture.detectChanges();
    });

    it('should create the task list component', () => {
        expect(taskListComponent).toBeTruthy();
    });

    describe('ngOnChanges', () => {
        it('should queue a search task when filter changes, then call listTasks after the debounce', fakeAsync(() => {
            const taskSpy = spyOn(taskListComponent.searchTask, 'next').and.callThrough();
            const listTasksSpy = spyOn(taskListComponent, 'listTasks');
            taskListComponent.filter = 'newFilter';
            taskListComponent.ngOnChanges({});
            expect(taskSpy).toHaveBeenCalled();
            tick(400); // debounce is 300
            expect(listTasksSpy).toHaveBeenCalled();
        }));

        it('should queue a search task when hideCompleted changes, then call listTasks after the debounce', fakeAsync(() => {
            const taskSpy = spyOn(taskListComponent.searchTask, 'next').and.callThrough();
            const listTasksSpy = spyOn(taskListComponent, 'listTasks');
            taskListComponent.hideCompleted = true;
            taskListComponent.ngOnChanges({});
            expect(taskSpy).toHaveBeenCalled();
            tick(400); // debounce is 300
            expect(listTasksSpy).toHaveBeenCalled();

        }));
    });

    describe('listTasks', () => {
        it('should retrieve tasks and filter them correctly', () => {
            const mockTasks: Task[] = [
                { id: 1, title: 'Test Task 1', description: 'Test Description', status: 'NEW', dueDateTime: new Date() },
                { id: 2, title: 'Test Task 2', description: 'Test Description', status: 'NEW', dueDateTime: new Date() },
                { id: 3, title: 'Test Task 3', description: 'Test Description', status: 'NEW', dueDateTime: new Date() },
            ];
            taskServiceSpy.retrieveAllTasks.and.returnValue(of(mockTasks));
            taskListComponent.listTasks();
            expect(taskServiceSpy.retrieveAllTasks).toHaveBeenCalled();
            expect(taskListComponent.taskList.length).toBe(3);
        });

        it('should handle errors and open snackbar', () => {
            const errorMessage = 'Error fetching tasks';
            taskServiceSpy.retrieveAllTasks.and.returnValue(throwError({ reason: errorMessage }));

            const spy = spyOn(taskListComponent, 'openSnackBar');
            taskListComponent.listTasks();
            expect(taskServiceSpy.retrieveAllTasks).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledWith(errorMessage, "dismiss", 10000);
        });
    });

    describe('filterTaskList', () => {
        it('should filter tasks by status and keyword', () => {
            const mockTasks: Task[] = [
                { id: 1, title: 'Test Task 1', description: 'Test Description 1', status: 'NEW', dueDateTime: new Date() },
                { id: 2, title: 'Test Task 2', description: 'Test Description 2', status: 'COMPLETED', dueDateTime: new Date() }
            ];
            let filteredTasks = taskListComponent.filterTaskList(mockTasks, 'test', true);
            expect(filteredTasks.length).toBe(1);
            
            filteredTasks = taskListComponent.filterTaskList(mockTasks, '1', true);
            expect(filteredTasks.length).toBe(1);

            filteredTasks = taskListComponent.filterTaskList(mockTasks, '2', true);
            expect(filteredTasks.length).toBe(0);
        });

        it('should not filter completed tasks when hideCompleted is false', () => {
            const mockTasks: Task[] = [
                { id: 1, title: 'Test Task 1', description: 'Test Description 1', status: 'NEW', dueDateTime: new Date() },
                { id: 2, title: 'Test Task 2', description: 'Test Description 2', status: 'COMPLETED', dueDateTime: new Date() }
            ];
            const filteredTasks = taskListComponent.filterTaskList(mockTasks, 'test', false);
            expect(filteredTasks.length).toBe(2);
        });

        it('should filter ignoring case', () => {
            const mockTasks: Task[] = [
                { id: 1, title: 'Test Task 1', description: 'Test Description 1', status: 'NEW', dueDateTime: new Date() },
                { id: 2, title: 'Test Task 2', description: 'Test Description 2', status: 'COMPLETED', dueDateTime: new Date() }
            ];
            const filteredTasks = taskListComponent.filterTaskList(mockTasks, 'description 2', false);
            expect(filteredTasks.length).toBe(1);
        });

    });

    describe('deleteTask', () => {
        it('should open dialog and emit taskDeleted when confirmed', () => {
            spyOn(taskListComponent.taskDeleted, 'emit')
            const mockTask: Task = { id: 1, title: 'Test Task', description: 'Test Description', status: 'NEW', dueDateTime: new Date() };
            taskListComponent.dialog = dialogSpy;
            taskListComponent.deleteTask(mockTask);
            expect(taskListComponent.taskDeleted.emit).toHaveBeenCalledWith(mockTask);
        });
    });

    describe('updateTask', () => {
        it('should emit taskUpdated with correct data', () => {
            spyOn(taskListComponent.taskUpdated, 'emit')
            const mockTask: Task = { id: 1, title: 'Test Task', description: 'Test Description', status: 'NEW', dueDateTime: new Date() };
            taskListComponent.statusValue = 'IN_PROGRESS';
            taskListComponent.updateTask(mockTask);
            expect(taskListComponent.taskUpdated.emit).toHaveBeenCalledWith(new TaskUpdate(1, new Map([['status', 'IN_PROGRESS']])));
        });

        it('should not emit if task id is missing', () => {
            spyOn(taskListComponent.taskUpdated, 'emit')
            const mockTask: Task = { title: 'Test Task', description: 'Test Description', status: 'NEW', dueDateTime: new Date() };
            taskListComponent.statusValue = 'IN_PROGRESS';
            taskListComponent.updateTask(mockTask);
            expect(taskListComponent.taskUpdated.emit).not.toHaveBeenCalled();
        });
    });

    describe('openSnackBar', () => {
        it('should open snackbar with correct parameters', () => {
            const mockMessage = 'Test Message';
            const mockAction = 'Dismiss';
            const spy = spyOn(taskListComponent.snackBar, 'open');
            taskListComponent.openSnackBar(mockMessage, mockAction, 1000);
            expect(spy).toHaveBeenCalledWith(mockMessage, mockAction, { duration: 1000 });
        });
    });
});