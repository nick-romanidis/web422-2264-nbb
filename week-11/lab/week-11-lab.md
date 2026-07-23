# Lab: Testing the Vehicles UI (Jest + Cypress)

In the notes we learned to test code two ways: **unit tests** with **Jest** (one
small piece at a time, no browser) and **end-to-end tests** with **Cypress** (a
real browser walking through a whole user journey). In the walkthrough *we* wrote
those tests together. In this lab **you** write them &mdash; against parts of the
app the notes did **not** cover, so it is real practice rather than copying.

The app under test is the same **Vehicles UI** from this week: a public home
page, a login form, a protected vehicles list, and a small API. It already
works. Your job is to add tests that prove it works and keep proving it.

The whole activity should take about **one hour**.

## Getting Started

We will use the **`testing-lab-missing`** example as a starting point.

- Open the **`testing-lab-missing`** folder in your editor (e.g. VS Code).
- Open the **`my-app`** folder in the integrated terminal.
- Run **`npm install`** to install the dependencies.
- Run **`npm run dev`** and browse the app at <http://localhost:3000>; log in
  with **bob** / **myPassword** so you have seen the behaviour you are about to
  test.

**Jest and Cypress are already installed and configured for you** (`jest.config.mjs`,
`cypress.config.js`, and the `cypress/support/` files all exist) so you can focus
on writing tests. If you want to see how that setup is done from scratch, it is
in the Week 11 notes.

### The stub files

The test files already exist, but each one is a **stub** &mdash; a `describe`
block with `// TODO` comments telling you what to assert. You will find:

| File | You will test |
| --- | --- |
| `tests/vehicles-list.test.js` | the `/api/vehicles` **list** route |
| `tests/login-api.test.js` | the `/api/login` route |
| `tests/authenticate.test.js` | the token helpers in `lib/authenticate.js` |
| `tests/login-page.test.js` | the Login **page** renders its form |
| `cypress/e2e/clickcounter.cy.js` | the Home page counter (E2E) |
| `cypress/e2e/login-flow.cy.js` | the login journey (E2E) |

In the Jest stubs, unwritten cases are marked with **`test.todo("...")`**; in the
Cypress stubs they are **`it("...")` with no function body** (a "pending" test).
Search the project for **`TODO`** to find every spot you need to complete.

Keep Jest running in its own terminal the whole time so tests re-run on save:

```bash
npm run test
```

You will see the todo tests listed as `todo` &mdash; replace each one with a real
test as you go.

---

## Part 1 &mdash; Unit tests with Jest

Recall the three building blocks from the notes: **`describe`** groups tests,
**`test`** is one case, and **`expect(value).matcher(...)`** is an assertion.
Useful matchers here: `toBe`, `toEqual`, `expect.objectContaining`,
`expect.any(String)`, `toBeTruthy`, `Array.isArray(...)`.

### Task 1.1 &mdash; The vehicles **list** route

Open **`tests/vehicles-list.test.js`**. The route under test is
`pages/api/vehicles/index.js`, which returns **all** vehicles (not one by id).

- **Goal:** prove that `GET /api/vehicles` returns all three vehicles, and that
  an unsupported method is rejected.
- **Hints:**
  - This is the same technique as the `/api/vehicles/[id]` test in the notes: use
    **`node-mocks-http`**. Build a fake request/response with
    `createMocks({ method: "GET" })`, `await handler(req, res)`, then read back
    what the handler did.
  - The status code comes from **`res._getStatusCode()`**; the body from
    **`res._getData()`** (a **string** &mdash; `JSON.parse` it).
  - To check "an array of three", `Array.isArray(data)` and `data.length`.
  - For the 405 case, send a method the route does not support (e.g. `"POST"`).
- **Success:** two green tests &mdash; a 200 that returns 3 vehicles, and a 405.

### Task 1.2 &mdash; The login route

Open **`tests/login-api.test.js`**. The route is `pages/api/login.js`; it accepts
a **POST** body of `{ userName, password }` and returns a token for the one valid
user (**bob / myPassword**).

- **Goal:** cover the happy path and the failure path of logging in.
- **Hints:**
  - Same `createMocks` technique, but this route reads a **body**. Pass it in:
    `createMocks({ method: "POST", body: { userName: "bob", password: "myPassword" } })`.
  - A valid login responds **200** with a body containing a `token`. You do not
    need to know the exact token string &mdash; assert only that one exists:
    `expect.objectContaining({ token: expect.any(String) })`.
  - A wrong password responds **422**.
  - *(Stretch)* a `GET` responds **405**.
- **Success:** valid credentials give 200 + a token; a bad password gives 422.

### Task 1.3 &mdash; The token helpers

Open **`tests/authenticate.test.js`**. These are the plain functions from
`lib/authenticate.js`: `setToken`, `getToken`, `removeToken`, `isAuthenticated`.
They read and write the browser's `localStorage` &mdash; which exists in our test
because Jest is configured with the **jsdom** environment.

- **Goal:** prove the helpers store, read, report, and clear a token correctly.
- **Hints:**
  - `localStorage` is **shared between tests** in jsdom, so a token left by one
    test can leak into the next. Reset it first:
    ```js
    beforeEach(() => {
      localStorage.clear();
    });
    ```
  - `setToken("abc.123")` then `getToken()` should return `"abc.123"`.
  - `isAuthenticated()` should be `false` before a token is set and `true` after.
  - After `removeToken()`, `getToken()` returns `null`.
- **Success:** three green tests; the `beforeEach` keeps them independent.

### Task 1.4 &mdash; The Login page renders its form

Open **`tests/login-page.test.js`**. Here you render the **page component** and
inspect the DOM, exactly like the Home-page test in the notes.

- **Goal:** prove the Login page renders a username field, a password field, and
  a submit button.
- **Hints:**
  - `render(<Login />)` gives you a `container`; query it with
    `container.querySelector('input[name="username"]')`, and similarly for
    `input[name="password"]` and `button[type="submit"]`. Each should be
    **truthy** (it exists).
  - **Notice the `jest.mock("next/router", ...)` already at the top of the file.**
    The Login page calls `useRouter()`, which does not exist in a plain unit test,
    so rendering it would throw. That mock supplies a fake `useRouter()`. This is
    the very situation the notes warned about: pages that use `useRouter`/SWR need
    a little extra setup to unit-test. Try **commenting the mock out** to see the
    error, then put it back.
  - *(Stretch)* assert the password field's `type` attribute is `"password"`
    using `element.getAttribute("type")`.
- **Success:** the page renders and all three form elements are found.

---

## Part 2 &mdash; End-to-end tests with Cypress

Now the whole app in a real browser. Cypress needs the app **running**, so:

> **Two terminals.** Keep **`npm run dev`** going in one terminal and run Cypress
> in another. Before you start, check the dev server really is on
> **`http://localhost:3000`** (the `Local:` line when it starts) &mdash; if port
> 3000 was busy it will quietly use 3001, and Cypress (pointed at 3000 by
> `baseUrl`) would then be testing the wrong thing.

Open the interactive runner (great for watching and debugging):

```bash
npm run cypress
```

Reach for these commands: `cy.visit`, `cy.get`, `cy.contains`, `.type`,
`.click`, `cy.url`, `.should`.

### Task 2.1 &mdash; The click counter (no login needed)

Open **`cypress/e2e/clickcounter.cy.js`**. The Home page (`/`) is public and
shows a button labelled `Clicked 0 Times`.

- **Goal:** prove the counter goes up when the button is clicked.
- **Hints:**
  - `cy.visit("/")` first.
  - `cy.contains("button", "Clicked 0 Times")` finds the button by its text; chain
    `.click()` onto it.
  - After a click, assert the button now reads `Clicked 1 Times` (another
    `cy.contains`). Cypress **retries** the assertion automatically, so you do not
    need to wait for the re-render yourself.
- **Success:** the spec drives the button and the count changes.

### Task 2.2 &mdash; The login journey

Open **`cypress/e2e/login-flow.cy.js`**. This walks the real path a user takes to
see protected data.

- **Goal:** log in as **bob** and confirm the vehicles page appears with a
  known vehicle and a **Logout** link.
- **Hints:**
  - `cy.visit("/login")`, then type into the inputs (they have
    `name="username"` and `name="password"`):
    `cy.get('input[name="username"]').type("bob")` and the password with a
    trailing **`{enter}`** to submit the form.
  - Assert the URL moved on: `cy.url().should("include", "/vehicles")`.
  - Assert the data loaded: `cy.contains("Chrysler")` (one of the seeded
    vehicles).
  - Assert the navbar reflects being logged in: `cy.get("nav").contains("Logout")`.
  - *(Stretch)* in a second `it`, log in, then `cy.get("nav").contains("Logout").click()`
    and assert the URL returns to `/login`.
- **Success:** the spec logs in, sees a vehicle, and (stretch) logs back out.

---

## Wrap up

You have now tested the same app at both altitudes the notes described:

| Kind | Tool | Files you wrote |
| --- | --- | --- |
| API route | Jest + node-mocks-http | `vehicles-list.test.js`, `login-api.test.js` |
| Plain functions | Jest | `authenticate.test.js` |
| A page's rendered output | Jest + Testing Library | `login-page.test.js` |
| A whole user journey | Cypress | `clickcounter.cy.js`, `login-flow.cy.js` |

**Think about it:** which of these bugs would each layer catch? *(a)* the list
route starts returning only 2 vehicles; *(b)* `removeToken` forgets to clear
storage; *(c)* the Login form loses its password field; *(d)* a logged-out user
can suddenly reach `/vehicles`. Some are caught cheaply by a unit test; at least
one is only visible end-to-end.

**Escape route:** stuck for more than a few minutes on a single task? Go back to
the **Week 11 lecture walkthrough** &mdash; it solves the *same kinds* of tests
(an API route with `node-mocks-http`, a rendered component, a Cypress journey),
just on different files. Find the closest example there, understand *why* it
works, then apply the idea to your task. Copying blindly helps nobody &mdash;
recognising the pattern and re-using it is the whole point.
