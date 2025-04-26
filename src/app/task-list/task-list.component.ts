import { DatePipe, SlicePipe } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TaskUpdate } from '../task-service/model/task-update.model';
import { Task } from '../task-service/model/task.model';
import { TaskService } from '../task-service/task.service';
import { debounceTime, Subject } from 'rxjs';

@Component({
    selector: 'task-list',
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
        SlicePipe,
        DatePipe
    ],
    templateUrl: './task-list.component.html',
    styleUrl: './task-list.component.css'
})
export class TaskListComponent {

    dialog = inject(MatDialog);

    @ViewChild('deleteDialog', { static: false }) deleteDialogTemplate!: TemplateRef<any>;

    @Input() filter: string | null = null;
    @Input() hideCompleted: boolean = false;

    @Output() taskUpdated = new EventEmitter<TaskUpdate>();
    @Output() taskDeleted = new EventEmitter<Task>();


    taskService: TaskService = inject(TaskService);
    snackBar = inject(MatSnackBar);

    taskList: Task[] = [];

    statusValue: 'NEW' | 'IN_PROGRESS' | 'DEFERRED' | 'COMPLETED' = 'NEW';

    searchTask: Subject<void> = new Subject<void>();

    ngOnInit() {
        this.searchTask.pipe(debounceTime(300)).subscribe(() => this.listTasks());
    }

    ngOnDestroy() {
        this.searchTask.complete();
    }

    ngOnChanges(changes: SimpleChanges) {
        this.searchTask.next();
    }

    listTasks() {
        this.taskService.retrieveAllTasks().subscribe({ 
            next: r => { 
                this.taskList = this.filterTaskList(r, this.filter, this.hideCompleted); 
            }, 
            error: e => {
                 this.openSnackBar(e.reason, "dismiss", 10000) 
            } 
        });
    }

    filterTaskList(tasks: Task[], filter: string | null, hideCompleted: boolean): Task[] {
        return tasks.filter(task => this.applyFilter(task, filter, hideCompleted));
    }

    private applyFilter(task: Task, filter: string | null, hideCompleted: boolean): boolean {
        let result = true;
        if(task.status === 'COMPLETED' && hideCompleted) {
            result = false;
        } else if(filter) {
            const title = task.title.toLowerCase();
            const desc = task.description?.toLowerCase();
            const lcfilter = filter.toLowerCase();
            if(!title.includes(lcfilter) && !desc?.includes(lcfilter)) {
                result = false;
            }
        }
        return result;
    }

    deleteTask(task: Task): void {
        let ref = this.dialog.open(this.deleteDialogTemplate, { data: { "task": task } });
        ref.afterClosed().subscribe(result => {
            if (result) {
                if (task.id) {
                    this.taskDeleted.emit(task);
                }
            }
        });
    }

    updateTask(task: Task): void {
        if (task.id && this.statusValue) {
            const map = new Map<string, string>();
            map.set("status", this.statusValue);
            this.taskUpdated.emit(new TaskUpdate(task.id, map));
            this.statusValue = 'NEW';
        }
    }

    openSnackBar(message: string, action: string, duration: number) {
        this.snackBar.open(message, action, { duration: duration });
    }

}
