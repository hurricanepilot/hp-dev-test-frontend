# HMCTS DTS Developer Technical Test - Frontend

## Overview

An implementation of the DTS developer technical test frontend using TypeScript and Angular.

The UI is implemented using Angular's Material component set, styled using simple CSS.

### Building/Running

This project requires the companion backend project to be running in order to successfully function - the expectation is that the backend service is running on `http://localhost:8080`, though this can be overridden in the `environment.ts` files as necessary.

To build and run the project, clone the repository and then, in the project root execute:

```bash
npm install
ng serve --configuration=development --open
```

This should install, build, serve and the launch the app in a browser. Provided the backend is running, you should now be able to add Tasks and view/filter existing Tasks.

if you just want to build the project, use:

```bash
npm run build:prod
```

to build the project after running the test suite.


### Usage

The UI is simple, and shows the list of currently defined Tasks, and allows you to:

- Add new Tasks
- Update the Status of existing Tasks
- Delete Tasks
- Apply a case-insensitive filter over the title/description
- Toggle visibility of COMPLETED tasks

### Testing & Coverage

Karma/Jasmine tests are included and have been configured to provide coverage reports via the `jasmine-html-reporter` plugin. If you run:

```bash
ng test
```

in the project root, the full test suite will execute and the coverage report will be available from:

> `./coverage/hp-dev-test-frontend/index.html`

