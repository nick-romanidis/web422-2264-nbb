# Lab: Retro Arcade High Score API (bcrypt + JWT)

In the lecture notes we took an open Web API and locked it down: hashed
passwords with **bcrypt**, added **register** / **login** routes backed by
**MongoDB**, and protected a route with a **JSON Web Token** verified by
**Passport**.

In this lab you will build a **new** API, from an empty folder, that has the
exact same problem: a "Retro Arcade High Score" leaderboard that starts out
completely open. Only registered arcade club members should be able to view
(or submit) high scores.

There is **no starter project** this time. You will run `npm init` yourself,
install only the packages you actually need as you need them, and write every
file from scratch. Keep the lecture notes open in another window &mdash; you
are expected to **reference** them for exact syntax (the shape of a Mongoose
connection, the shape of a passport-jwt strategy, etc.), not to remember
everything from memory. The learning goal is applying the pattern to a new
resource, not memorization.

This lab should take about **60&ndash;75 minutes**. Suggested time budgets are
given per part so you can tell if you're falling behind &mdash; if you are, look
for the "Running behind?" callouts, which offer a bit more scaffolding to keep
you moving.

Test every route with an API client such as the **Thunder Client** VS Code
extension (or Postman) &mdash; there is no UI.

---

## Part 0 &mdash; Project setup (~10 min)

1. Create a new folder for the project (e.g. `arcade-api`) and open it in your
   code editor and terminal.
2. Initialize a new Node project:

   ```
   npm init -y
   ```

3. Install the packages you need for a basic Express API:

   ```
   npm install express cors dotenv mongoose
   ```

4. Create the following empty files. You will fill them in throughout the lab:

   - `server.js` &mdash; the Express app: middleware, routes, and (later) the
     Passport configuration
   - `data-service.js` &mdash; the in-memory list of high scores
   - `user-service.js` &mdash; the Mongoose user schema and account functions
   - `.env` &mdash; your MongoDB connection string and JWT secret (never commit
     this file)
   - `.gitignore` &mdash; at minimum, ignore `node_modules` and `.env`

> **Success:** `npm init -y` produced a `package.json`, the four packages
> above are listed under `dependencies`, and all five files above exist
> (empty is fine for now).

---

## Part 1 &mdash; An open high score API (~10 min)

### Task 1.1 &mdash; The data service

The scores themselves are just fixture data &mdash; paste this into
`data-service.js`:

```js
const scores = [
  { id: 1, game: "Galaga", initials: "ACE", score: 985600, platform: "Arcade", year: 1981 },
  { id: 2, game: "Pac-Man", initials: "BUZ", score: 266330, platform: "Arcade", year: 1980 },
  { id: 3, game: "Donkey Kong", initials: "JMP", score: 1247700, platform: "Arcade", year: 1981 },
  { id: 4, game: "Tetris", initials: "LNS", score: 999999, platform: "NES", year: 1989 },
  { id: 5, game: "Street Fighter II", initials: "RYU", score: 152300, platform: "Arcade", year: 1991 },
];

module.exports.getAllScores = function () {
  return new Promise((resolve, reject) => {
    resolve(scores);
  });
};
```

### Task 1.2 &mdash; `server.js` skeleton and the open route

- **Goal:** a running Express server with a single **open** route,
  `GET /api/scores`, that returns the fixture data as JSON.
- **Hints:**
  - This is the exact same shape as the `/api/vehicles` route in the notes,
    just a different resource. Require `express`, `cors` and your
    `data-service.js`.
  - Don't forget `app.use(cors())` and `app.listen(...)` (use
    `process.env.PORT || 8080`, even though `.env` isn't wired up yet).
  - `getAllScores()` returns a Promise &mdash; `.then()` / `.catch()` it, same
    as the notes.

> **Success:** running `node server.js` and browsing
> <http://localhost:8080/api/scores> returns the 5 scores as JSON. Anyone can
> reach it &mdash; that's the problem the rest of the lab solves.

---

## Part 2 &mdash; Accounts with MongoDB + bcrypt (~20&ndash;25 min)

### Task 2.1 &mdash; MongoDB Atlas + `.env`

- Set up (or reuse) a MongoDB Atlas cluster.
- Create a **new** database for this project &mdash; don't reuse the lecture's
  database. Something like `arcade-api-users` with a `users` collection.
- Add your connection string to `.env` as `MONGO_CONNECTION_STRING=...`.
- In `server.js`, load it with `require("dotenv").config()` near the top,
  **before** anything that reads `process.env`.

### Task 2.2 &mdash; The user schema and `connect()`

- **Goal:** `user-service.js` defines a Mongoose schema for a player account
  and exports a `connect()` function that opens the DB connection and
  registers the model.
- **Requirements:**
  - Fields: `userName` (unique), `password`, `fullName`, `role`.
  - `connect()` returns a `Promise` that resolves once the connection is open,
    and rejects on error.
- **Hints:**
  - This is structurally identical to the notes' `user-service.js` &mdash; if
    you get stuck for more than 5 minutes, look at the "The user service" and
    "Connecting on startup" sections and adapt the variable/collection names.
  - You'll need `mongoose.Schema` and `mongoose.createConnection(...)`.
  - Remember to wrap `app.listen()` in `userService.connect().then(...)` back
    in `server.js`, same as the notes &mdash; the server shouldn't start
    listening until the DB connection succeeds.

> **Success:** `node server.js` logs "API listening on: ..." (meaning the DB
> connection succeeded) instead of erroring out.

### Task 2.3 &mdash; `registerUser()` with bcrypt

Install bcrypt:

```
npm install bcryptjs
```

- **Goal:** register a new player, storing a **hashed** password.
- Here is a shell to start from &mdash; fill in the `// TODO` parts:

  ```js
  module.exports.registerUser = function (userData) {
    return new Promise(function (resolve, reject) {
      if (userData.password != userData.password2) {
        reject("Passwords do not match");
      } else {
        // TODO: hash userData.password with bcrypt.hash() (10 rounds),
        // then build and save a new User document with the hashed password.
        // On success: resolve() with a friendly message.
        // On failure: check err.code == 11000 for a duplicate userName vs.
        // any other save error, and reject() with an appropriate message.
      }
    });
  };
  ```

- **Hints:**
  - `bcrypt.hash(plainText, 10)` returns a Promise that resolves to the hash.
  - Don't forget to overwrite `userData.password` with the hash **before**
    constructing the `new User(userData)`.

> **Success:** registering a new player via Thunder Client returns a success
> message, and the stored `password` field in MongoDB is a long hash, not the
> plain text you sent.

### Task 2.4 &mdash; `checkUser()` with bcrypt

- **Goal:** verify a login attempt against the stored hash.
- Shell to start from:

  ```js
  module.exports.checkUser = function (userData) {
    return new Promise(function (resolve, reject) {
      User.find({ userName: userData.userName })
        .limit(1)
        .exec()
        .then((users) => {
          if (users.length == 0) {
            reject("Unable to find user " + userData.userName);
          } else {
            // TODO: use bcrypt.compare() to check userData.password against
            // users[0].password. Resolve with users[0] on a match, reject
            // with a message otherwise.
          }
        })
        .catch((err) => {
          reject("Unable to find user " + userData.userName);
        });
    });
  };
  ```

- **Hint:** `bcrypt.compare(plainText, hash)` resolves to `true`/`false`.

> **Success:** you can verify this once the login route exists (Part 3) &mdash;
> correct credentials resolve, incorrect ones reject.

---

## Running behind at the 30&ndash;35 minute mark?

If Part 2 has taken a while, that's normal &mdash; it's the densest part of the
lab. It's fine to open the notes' `user-service.js` code side-by-side and
adapt it directly for the rest of Task 2.2&ndash;2.4 rather than deriving it from
hints alone. The point of this lab is practicing the *wiring*, not
re-inventing Mongoose/bcrypt syntax from memory.

---

## Part 3 &mdash; Register & login routes (~10 min)

### Task 3.1 &mdash; Parse JSON bodies and add `/api/register`

- Add `express.json()` middleware in `server.js` (before your routes).
- Add `POST /api/register`, same shape as the notes: pass `req.body` to
  `userService.registerUser()`, respond `200` with a message on success,
  `422` with a message on failure.

Test with Thunder Client &mdash; `POST http://localhost:8080/api/register`,
`Content-Type: application/json`:

```json
{
  "userName": "ace",
  "password": "joystick99",
  "password2": "joystick99",
  "fullName": "Alex Chen",
  "role": "player"
}
```

### Task 3.2 &mdash; Add `/api/login`

- **Goal:** for now, just confirm credentials are correct (no token yet
  &mdash; that's Part 4). Same shape as `/api/register`, but calling
  `userService.checkUser()`.

Test:

- Correct credentials &rarr; `200`, `{ "message": "login successful" }`.
- Wrong password &rarr; `422` with an "Incorrect password" message.
- Unknown `userName` &rarr; `422` with an "Unable to find user" message.

---

## Part 4 &mdash; Securing the leaderboard with JWT (~15&ndash;20 min)

### Task 4.1 &mdash; Install and configure

```
npm install jsonwebtoken passport passport-jwt
```

Add a long, random secret to `.env`:

```
JWT_SECRET=<paste a long random string here>
```

### Task 4.2 &mdash; The passport-jwt strategy

This part is almost entirely library configuration &mdash; not something you're
expected to derive from first principles. The strategy callback below is
given as-is; your job is to fill in the **`jwtOptions`** object it depends on.
Find the right pieces in the notes' "Configuring the strategy" section, and
make sure you understand **why** each option is what it is before you type it
&mdash; you'll need that understanding to explain `req.user` in the bonus
section.

```js
const passportJWT = require("passport-jwt");

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

const jwtOptions = {
  jwtFromRequest: /* which ExtractJwt method reads an "Authorization: JWT <token>" header? */,
  secretOrKey: /* where did you just store your secret? */,
};

const strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
  console.log("payload received", jwt_payload);

  if (jwt_payload) {
    next(null, {
      _id: jwt_payload._id,
      userName: jwt_payload.userName,
      fullName: jwt_payload.fullName,
      role: jwt_payload.role,
    });
  } else {
    next(null, false);
  }
});
```

### Task 4.3 &mdash; Register the strategy and add the middleware

- `require("passport")`, then `passport.use(strategy)` and
  `app.use(passport.initialize())` &mdash; same as the notes.

### Task 4.4 &mdash; Sign and return a token on login

- **Goal:** on a successful login, build a payload (safe fields only &mdash;
  never the password) and sign it with `jwt.sign(payload, jwtOptions.secretOrKey)`.
  Return it alongside the message as `token`.

### Task 4.5 &mdash; Protect the leaderboard

- Add `passport.authenticate("jwt", { session: false })` as middleware on
  `GET /api/scores`.

### Test the whole flow

1. `GET /api/scores` with no `Authorization` header &rarr; `401`.
2. `POST /api/login` as your registered player &rarr; copy the `token`.
3. `GET /api/scores` with header `Authorization: JWT <token>` &rarr; the 5
   scores come back.
4. Change one character in the token and retry &rarr; `401` again.

---

## Running behind at the ~55 minute mark?

If you're inside the last 15&ndash;20 minutes and still stuck on `jwtOptions`,
it's fine to copy the notes' version directly rather than deriving it &mdash;
the goal for the rest of the lab is getting to a working, protected
`/api/scores` route and understanding *why* it returns 401 without a valid
token, not typing speed.

---

## Bonus (optional, no time pressure) &mdash; Submit a score

If you finish early: add a **protected** `POST /api/scores` route that lets a
logged-in player submit a new high score.

- **Goal:** a logged-in player can `POST` `{ game, initials, score, platform,
  year }` and have it added to the leaderboard, tagged with who submitted it.
- **Hints:**
  - Add an `addScore(newScore)` function to `data-service.js` that pushes onto
    the existing `scores` array and resolves with the updated list.
  - Protect the route the same way as `GET /api/scores`.
  - Inside a route protected by `passport.authenticate("jwt", ...)`, Passport
    attaches the verified payload to `req.user`. Use `req.user.userName` to
    stamp a `submittedBy` field on the new score before saving it.

---

## Wrap up

| Concern | Tool | Key files |
| --- | --- | --- |
| Store accounts safely | **MongoDB + bcryptjs** | `user-service.js` (`registerUser`, `checkUser`) |
| Register / log in | **Express routes** | `/api/register`, `/api/login` |
| Prove identity per request | **jsonwebtoken** | `jwt.sign()` on login |
| Verify & protect routes | **passport + passport-jwt** | strategy + `passport.authenticate("jwt", ...)` |

**Think about it:** you built this from an empty folder using the lecture's
vehicles API as a mental template, not a copy/paste starting point. What
parts came back to you immediately, and which ones needed you to re-check the
notes? Those are the parts worth reviewing again before the next class.
