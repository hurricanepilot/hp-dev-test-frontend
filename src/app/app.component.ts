import { Component, inject, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TaskFormComponent } from "./task-form/task-form.component";
import { TaskListComponent } from "./task-list/task-list.component";
import { TaskUpdate } from './task-service/model/task-update.model';
import { Task } from './task-service/model/task.model';
import { TaskService } from './task-service/task.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-root',
    imports: [
        MatButtonModule,
        MatIconModule,
        MatSlideToggleModule,
        MatInputModule,
        MatTooltipModule,
        TaskFormComponent,
        TaskListComponent
    ],
    providers: [],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {

    title: string = 'HMCTS Demo Task Application';

    @ViewChild(TaskListComponent, { static: false }) taskListComponent!: TaskListComponent;
    @ViewChild(TaskFormComponent, { static: false }) taskFormComponent!: TaskFormComponent;

    taskService: TaskService = inject(TaskService);
    snackBar: MatSnackBar = inject(MatSnackBar);

    // filtering
    hideCompleted: boolean = false;
    filter: string | null = null;

    // task addition
    showAddTask: boolean = false;

    setHideCompleted(hide: boolean): void {
        this.hideCompleted = hide;
    }

    applyFilter(value: string) {
        this.filter = value?.toLowerCase();
    }

    deleteTask(task: Task): void {
        if (task) {
            let id = (task.id as number);
            this.taskService.deleteTask(id).subscribe({
                complete: () => {
                    this.taskListComponent?.listTasks()
                }, error: e => {
                    this.openSnackBar(e.reason, "dismiss", 10000)
                }
            });;
        }
    }

    saveTask(task: Task): void {
        this.taskService.createTask(task).subscribe({
            complete: () => {
                this.showAddTask = false;
                this.taskListComponent?.listTasks()
            }, error: e => {
                console.log(e);
                this.openSnackBar(e.reason, "dismiss", 10000)
            }
        });
    }

    updateTask(update: TaskUpdate): void {
        if (update.id) {
            let status = update.update.get("status");
            if (status) {
                this.taskService.updateTaskStatus(update.id, status).subscribe({
                    complete: () => {
                        this.taskListComponent?.listTasks()
                    }, error: e => {
                        this.openSnackBar(e.reason, "dismiss", 10000)
                    }
                });
            }
        }
    }

    showAddTaskPanel(show: boolean): void {
        this.showAddTask = show;
    }

    openSnackBar(message: string, action: string, duration: number) {
        this.snackBar.open(message, action, { duration: duration });
    }
}
