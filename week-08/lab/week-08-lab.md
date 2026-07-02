# Lab: Gadget Wishlist (Context + Jotai)

In the notes we saw that "component state" isn't enough once a value needs to
be shared across the site: a navbar showing how many items are in a cart, or
a "current user" that needs to be visible on every page. Passing that value
down through every component via props works, but it means "drilling" it
through components that don't otherwise need it &mdash; and every parent along
the way re-renders whenever the value changes.

**Context** solves the drilling problem, but if you lean on it for every
piece of shared state, your `_app.js` ends up wrapped in a pyramid of
providers (informally, "provider hell" &mdash; the same shape as the "Context
Hell" example from the notes), and the re-render cost is still there.
**Jotai** solves both: no providers to nest, and only the components that
actually read/write a given atom re-render.

In this lab you will build both into a single **Gadget Wishlist** app:

- **Part 1** uses **Context** to track the current **user** (who is logged in).
- **Part 2** uses **Jotai** to track the **Wishlist** (the products a user has saved).

The whole activity should take about **one hour**.

> This is a lab, not a copy-paste tutorial. You get **goals and hints**, not
> finished code &mdash; the point is to work it out from what you learned in the
> notes. Read the hints, try it, and check your work against the **"Success"**
> note at the end of each task. A finished reference exists in the
> **"wishlist-complete"** folder; treat it as an answer key to consult *after* a
> genuine attempt on a task, not a place to copy from. If you copy it, you'll
> pass the lab and fail the quiz.

## Getting Started

To begin, we will use the **"wishlist-missing"** example from the sample code
as a starting point.

Once you have the source code:

- Open the **"wishlist-missing"** folder in your code editor (ie: "Visual Studio Code")
- Open the **"my-app"** folder in the integrated terminal
- Run the command **"npm install"** (alternatively: **"npm i"**) to install the dependencies
- Build / Run the site with the usual command: **"npm run dev"**
- Browse the site at <http://localhost:3000>

The site runs as-is and the **Products** page already lists gadgets pulled
from the [DummyJSON](https://dummyjson.com/docs/products) API &mdash; but the
state is not wired up yet: the "Wishlist" count in the navbar stays at `(0)`,
the "Add to Wishlist" buttons only log to the console, the "Wishlist" page is
a placeholder, and "Login" does nothing.

Throughout the code you will find comments marked `// TODO (Context)` and
`// TODO (Jotai)`, one label per part of the lab. These mark the spots you need
to complete. Search the project for "TODO" to find them all.

## File Structure

Before writing any code, **explore the project** and make sure you understand
what each file does:

- **components/Layout.js**: The shared layout for the site (the "Gadget
  Wishlist" headline and the navigation links). It is where we will eventually
  show the **current user** (Context) and the **number of items** in the
  wishlist (Jotai).

- **components/ProductCard.js**: Renders a single product on the "/products"
  page. It takes a `product` prop and renders its thumbnail, title, category,
  price and rating. It also contains a button that invokes `addToWishlist()`,
  which currently only logs to the console.

- **pages/products/index.js**: Renders a `ProductCard` for every product in a
  flex grid, using `getStaticProps()` to pre-render the list. This file
  already works and does not need to be changed.

- **pages/products/[id].js**: Renders the full details for a single product,
  using `getStaticPaths()` and `getStaticProps()`. Like `ProductCard`, it
  contains an `addToWishlist()` function that has not yet been implemented.

- **pages/wishlist.js**: Currently a placeholder &mdash; this is where we will
  render the products currently in the wishlist, along with a total price.

- **pages/profile.js**: A simple login form. `handleLogin()` is not yet
  implemented.

- **pages/_app.js**: The Next.js boilerplate, with `<Layout>...</Layout>`
  already wrapping the app.

- **pages/index.js**: Renders the "Home" component on the default route "/".

---

## Part 1 &mdash; Shared state with Context (the current user)

We will build Context exactly as it was introduced in the notes: create the
Context object(s), declare the state in `_app.js`, wrap
`<Component {...pageProps} />` with the matching `Provider` component(s), and
read the values elsewhere with `useContext`.

Unlike some Context examples, here you will keep the Context objects **directly
in `_app.js`** (there is no separate `context/` file) and export them so other
files can import them.

### Task 1.1 &mdash; Create the Context in "_app.js"

**Goal:** make a "current user" value &mdash; and a way to change it &mdash; available
to every page in the app.

- **Requirements:**
  - The app needs one piece of state for the current user, starting out as
    "nobody is logged in."
  - Other files must be able to read **both** the user *and* the function that
    updates it.
  - Both must be provided to the whole component tree.
- **Hints:**
  - This is the same shape as the "count / setCount" Context example from the
    notes &mdash; but you need to share *two* things (the value **and** its setter),
    so create **two** separate Context objects.
  - Declare those Context objects at the **top level** of `_app.js` (module
    scope, not inside the `App` function) and **export** each one.
  - Declare the `user` state inside `App` with `useState`. What initial value
    represents "nobody logged in yet"?
  - Wrap the existing `<Layout>...</Layout>` with **both** providers. Each
    provider's `value` is one half of your `useState` pair.

> **Success:** the app still compiles and runs, and nothing visibly changes yet
> &mdash; the providers are in place, ready to be read in the next tasks.

### Task 1.2 &mdash; Show the logged-in user in the navbar

Open `components/Layout.js` and find the `// TODO (Context)` markers.

- **Goal:** when someone is logged in, the navbar shows `Logged in as: <name>`;
  otherwise it shows the existing "Login" link.
- **Hints:**
  - Read a Context value with the `useContext` hook.
  - You need the *user* value here. Import the matching Context object from the
    file where you declared it &mdash; remember that was `_app.js`
    (i.e. `@/pages/_app`).
  - The user is your "nobody logged in" value when logged out &mdash; use that to
    decide which of the two things to render (a ternary in your JSX).

> **Success:** logged out you see "Login"; once Task 1.3 works, you see the
> user's name instead.

### Task 1.3 &mdash; Wire up the login form

Open `pages/profile.js` and complete the `// TODO (Context)` markers.

- **Goal:** submitting the form logs the user in and sends them to the Home
  page. When already logged in, the page instead shows who is logged in and
  offers a **Logout** button.
- **Hints:**
  - This time you need **both** Context values &mdash; the user *and* the setter &mdash;
    so that's **two** `useContext` calls, one per Context object you exported
    from `_app.js`.
  - On submit, call the setter with the typed-in name, then redirect. Next.js
    gives you a router hook for navigation &mdash; which one, and which method sends
    the user to `/`? (Check how other Next.js pages navigate, or the docs.)
  - Logging out is just setting the user back to the "nobody logged in" value.
  - Because the value comes from Context, you should **not** need to pass
    anything through props for the navbar to react.

> **Success:** logging in on "/profile" updates the navbar to "Logged in as:
> ..." *instantly* &mdash; even though the change happened on a different page &mdash;
> and Logout returns you to the logged-out state.

---

## Part 2 &mdash; Application state with Jotai (the Wishlist)

**Goal:** a shared "wishlist" that any page can read from or add to, with a live
count in the navbar and a summary page showing a running total.

### Task 2.1 &mdash; Install Jotai and create the atom

Jotai is not yet a dependency of the starter. Add it, then create the store.

- **Requirement:** the app needs a single, shared piece of state that holds a
  list of products, starting empty.
- **Hints:**
  - Install the library the same way you would add any npm dependency (the
    notes show the exact command).
  - Create a `store.js` file in the project **root** (next to `package.json`).
  - Build the atom with the `atom()` function from `jotai`. What starting value
    represents an *empty* wishlist? Remember it holds a *list*.
  - Export the atom so other files can import it.

> **Success:** `store.js` exports one atom (e.g. `wishlistAtom`) and the app
> still compiles.

### Task 2.2 &mdash; Show the live count in the navbar

Back in `components/Layout.js`, find the `// TODO (Jotai)` markers.

- **Goal:** the "Wishlist" link shows the real number of items, e.g.
  `Wishlist (3)`, instead of the hard-coded `(0)`.
- **Hints:**
  - Jotai's hook for reading/writing an atom works "just like `useState`" &mdash;
    which hook is it, and what do you pass it?
  - You only need to *read* the list here.
  - How do you get the number of items in an array?

> **Success:** the count matches how many products are in the wishlist (still
> `0` until Task 2.3 lets you add some).

### Task 2.3 &mdash; Implement "Add to Wishlist"

The same `addToWishlist()` stub appears in **two** files:
`components/ProductCard.js` and `pages/products/[id].js`. Complete both.

- **Goal:** clicking "Add to Wishlist" adds that product to the shared wishlist,
  and the navbar count goes up.
- **Hints:**
  - Here you need to *read and update* the atom, so you need **both** values the
    hook returns (compare to `const [count, setCount] = useState(...)`).
  - The product to add is already available in the component (as a `prop` in
    `ProductCard`, and from the page data in `[id].js`) &mdash; so `addToWishlist`
    doesn't need a parameter.
  - Never mutate state directly. To build a **new** array containing everything
    already in the wishlist **plus** the new product, use the spread syntax from
    the notes.
  - Once it works, delete the leftover `console.log`.

> **Success:** clicking "Add to Wishlist" on the products list *and* on a
> product's details page both increase the navbar count.

### Task 2.4 &mdash; Build the Wishlist page

Open `pages/wishlist.js` (currently a placeholder).

- **Goal:** list every product currently in the wishlist, and below the list
  show a **total price** for all of them.
- **Hints:**
  - Read the atom (read-only is fine here).
  - Render the list by mapping over the array; give each item a `key`.
  - Each product object has fields including `title` and `price`.
  - For the total, which array method reduces a list of numbers to a single
    sum? Money reads best with two decimal places &mdash; there's a `Number`
    method for that.

> **Success:** after adding a few products, the "/wishlist" page lists them and
> shows a correct total price.

---

## Wrap up

We now have a single app that manages two different pieces of application
state in two different ways:

| Concern | Tool | Key files |
| --- | --- | --- |
| Current user | **Context** | `pages/_app.js`, `components/Layout.js`, `pages/profile.js` |
| Wishlist list | **Jotai** | `store.js`, `components/Layout.js`, `components/ProductCard.js`, `pages/products/[id].js`, `pages/wishlist.js` |

**Think about it:** notice how much setup Context required just for **one**
value &mdash; two Context objects, two Providers wrapping the app, and a
`useContext()` call everywhere you needed it. If you had *also* used Context for
the wishlist, you would need a *second* pair of Context objects and *two more*
providers &mdash; the "provider hell" pyramid from the notes. The Jotai atom
needed **no provider** and **no `createContext`** at all &mdash; any component just
imports the atom and calls `useAtom`. When would you reach for each?

Stuck for more than a few minutes on a single task? Compare just that one file
against the **"wishlist-complete"** folder, understand *why* it works, then come
back and finish the rest on your own.
