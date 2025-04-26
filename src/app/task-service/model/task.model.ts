export class Task {
    // The ID of the Task object - assigned by the server during creation
    id?: number; 
    // The title of the Task object
    title: string; 
    // The description of the Task object
    description?: string; 
    // The status of the Task object
    status: 'NEW' | 'IN_PROGRESS' | 'DEFERRED' | 'COMPLETED'; 
    // The due date/time of the Task object
    dueDateTime: Date; 

    constructor(
        title: string,
        status: 'NEW' | 'IN_PROGRESS' | 'DEFERRED' | 'COMPLETED',
        dueDateTime: Date,
        description?: string,
        id?: number
    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.dueDateTime = dueDateTime;
    }
}