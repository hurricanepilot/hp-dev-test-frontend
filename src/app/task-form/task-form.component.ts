import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { Task } from '../task-service/model/task.model';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'task-form',
    imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatTimepickerModule,
        MatExpansionModule,
        MatButtonModule,
        MatInputModule
    ],
    templateUrl: './task-form.component.html',
    styleUrl: './task-form.component.css'
})
export class TaskFormComponent {

    @Input() showPanel = false;
    @Output() saved = new EventEmitter<Task>();
    @Output() cancelled = new EventEmitter<void>();

    snackBar = inject(MatSnackBar);

    taskForm = new FormGroup({
        title: new FormControl('', { validators: [Validators.required, Validators.maxLength(256)] }),
        description: new FormControl('', { validators: [Validators.maxLength(1024)] }),
        date: new FormControl(new Date(), Validators.required),
        time: new FormControl(new Date(), Validators.required),
    });

    ngOnInit() {
        this.taskForm.reset();
    }

    save() {
        if (this.taskForm.invalid) {
            this.openSnackBar("Please fill out all of the required form fields before saving", "close", 3000);
        } else {
            const dueDate = this.taskForm.value.date;
            if (this.taskForm.value.time) {
                dueDate?.setUTCHours(this.taskForm.value.time.getUTCHours(), this.taskForm.value.time.getUTCMinutes(), this.taskForm.value.time.getUTCSeconds());
            }

            const taskData = this.taskForm.value;
            const task = new Task((taskData.title as string), 'NEW', (taskData.date as Date), (taskData.description as string));
            this.taskForm.reset();
            this.saved.emit(task);
        }
    }

    cancel() {
        this.taskForm.reset();
        this.cancelled.emit();
    }

    openSnackBar(message: string, action: string, duration: number) {
        this.snackBar.open(message, action, { duration: duration });
    }
}
