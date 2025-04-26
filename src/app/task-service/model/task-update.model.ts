export class TaskUpdate {
    // the id of the Task
    id: number;
    // the update details
    update: Map<string, string>;

    constructor(id: number, update: Map<string, string>) {
        this.id = id;
        this.update = update;
    }
}