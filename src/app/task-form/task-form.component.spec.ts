import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MatTimepickerModule } from '@angular/material/timepicker';
import { TaskFormComponent } from './task-form.component';
import { provideNativeDateAdapter } from '@angular/material/core';

describe('TaskFormComponent', () => {
    let component: TaskFormComponent;
    let fixture: ComponentFixture<TaskFormComponent>;

    const spiedOnSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [],
            imports: [
                ReactiveFormsModule,
                FormsModule,
                MatFormFieldModule,
                MatDatepickerModule,
                MatTimepickerModule,
                MatExpansionModule,
                MatButtonModule,
                MatInputModule,
                TaskFormComponent
            ],
            providers: [
                { provide: MatSnackBar, useValue: spiedOnSnackBar },
                provideNativeDateAdapter()
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('initialise', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should initialize form with default values', () => {
            // expect an empty form
            expect(component.taskForm.controls['title'].value).toBe(null);
            expect(component.taskForm.controls['description'].value).toBe(null);
            expect(component.taskForm.controls['date'].value).toBe(null);
            expect(component.taskForm.controls['time'].value).toBe(null);
        });
    });

    describe('save', () => {
        it('should emit saved event with task data on save', () => {
            component.taskForm.patchValue({
                title: 'Test Task',
                description: 'This is a test task.',
                date: new Date(),
                time: new Date()
            });

            const spy = spyOn(component.saved, 'emit');
            component.save();
            expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({
                title: 'Test Task',
                status: 'NEW'
            }));
        });

        it('should open snackbar when form is invalid', () => {
            component.save();
            expect(spiedOnSnackBar.open).toHaveBeenCalled();
        });
    });

    describe('cancel', () => {
        it('should reset form and emit cancelled event on cancel', () => {
            const spy = spyOn(component.cancelled, 'emit');
            component.cancel();

            expect(component.taskForm.controls['title'].value).toBe(null);
            expect(component.taskForm.controls['description'].value).toBe(null);
            expect(component.taskForm.controls['date'].value).toBe(null);
            expect(component.taskForm.controls['time'].value).toBe(null);

            expect(spy).toHaveBeenCalled();
        });
    });
});