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

## File Structure

The project contains the following "components" / "pages" structure:

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

We will start with Context, exactly as it was introduced in the notes: create
one Context object per value, declare the state in `_app.js`, wrap
`<Component {...pageProps} />` with the matching `Provider` components, and
read the values elsewhere with `useContext`.

### Creating the Context in "_app.js"

**File: "/pages/_app.js"**

Add the imports:

```js
import { useState, createContext } from "react";
```

Create and export two Context objects &mdash; one for the current user, and one
for the function that updates it:

```js
export const UserContext = createContext();
export const SetUserContext = createContext();
```

Declare the `user` state and wrap the app with both providers:

```jsx
export default function App({ Component, pageProps }) {
  const [user, setUser] = useState(null); // null = nobody is logged in yet

  return (
    <UserContext.Provider value={user}>
      <SetUserContext.Provider value={setUser}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </SetUserContext.Provider>
    </UserContext.Provider>
  );
}
```

Notice this is the same shape as the "count / setCount" example from the
notes, just renamed to "user / setUser". We did not need a separate
`context/UserContext.js` file this time &mdash; the Context objects live directly
in `_app.js` and are exported so other files can import them.

### Updating "Layout"

Add the imports near the top of the file:

```js
import { useContext } from "react";
import { UserContext } from "@/pages/_app";
```

Reference the user inside the component:

```js
const user = useContext(UserContext);
```

Then show the user's name when logged in, and a "Login" link otherwise
(replace the hard-coded `<Link href="/profile">Login</Link>`):

```jsx
{user ? (
  <span>Logged in as: {user}</span>
) : (
  <Link href="/profile">Login</Link>
)}
```

### Updating the "profile" page

Finally, wire up the login form so it sets the user in Context.

**File: "/pages/profile.js"**

```jsx
import { useState, useContext } from "react";
import { useRouter } from "next/router";
import { UserContext, SetUserContext } from "@/pages/_app";

export default function Profile() {
  const user = useContext(UserContext);
  const setUser = useContext(SetUserContext);
  const [name, setName] = useState("");
  const router = useRouter();

  function handleLogin(e) {
    e.preventDefault();
    if (!name) return;
    setUser(name); // update the Context for the whole app
    router.push("/");
  }

  function handleLogout() {
    setUser(null);
  }

  if (user) {
    return (
      <div>
        <h2>Profile</h2>
        <p>Logged in as: {user}</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <label>
          Name:{" "}
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>{" "}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
```

If we refresh the site now, we can log in from the "/profile" page and the
navbar should immediately update to show "Logged in as: ..." &mdash; even though
the change happened on a different page.

---

## Part 2 &mdash; Application state with Jotai (the Wishlist)

Before we begin, we must install Jotai using the command:

```
npm i jotai
```

### Creating the atom

If we would like to make our "wishlist" (ie: a list of "products" that the
user wishes to save) available anywhere within the site, we should create an
**"atom"** to store the values. The wishlist should start out empty:

**File: "/my-app/store.js"**

```js
import { atom } from "jotai";

export const wishlistAtom = atom([]);
```

We create a "store.js" file, import the `atom` function from `'jotai'`, and
define / export an atom (`wishlistAtom`). The default value is an empty array
(an empty wishlist).

### Updating "Layout"

The first component we will update to use `wishlistAtom` is "Layout". Here we
will show how many products have been added to the wishlist in parentheses
next to the "Wishlist" link.

Add the imports near the top of the file:

```js
import { useAtom } from "jotai";
import { wishlistAtom } from "@/store";
```

Reference the atom inside the component:

```js
const [wishlist] = useAtom(wishlistAtom);
```

Then replace the hard-coded `(0)` with the live count:

```jsx
<Link href="/wishlist">
  Wishlist <span>({wishlist.length})</span>
</Link>
```

We use `useAtom` the same way we use `useState`, only the "default value" is
the atom `wishlistAtom`. This gives us full read/write access to the atom,
shared by the rest of the site.

### Updating the "addToWishlist()" functions

The next pieces to update are the `addToWishlist()` functions that exist in
both **"/components/ProductCard.js"** and **"/pages/products/[id].js"**.

In both files, add the atom and the `useAtom` function:

```js
import { useAtom } from "jotai";
import { wishlistAtom } from "@/store";
```

Reference it in the component:

```js
const [wishlist, setWishlist] = useAtom(wishlistAtom);
```

Finally, update the `addToWishlist()` function to add the product to the
wishlist:

```js
function addToWishlist() {
  setWishlist([...wishlist, product]);
}
```

Since we are modifying the current list of items, we use **"spread syntax"**
to include all of the previous products, in addition to the new one.

If we refresh the site now, we should be able to click any "Add to Wishlist"
button and see the "Wishlist" number increase in the navigation bar.

### Updating the "wishlist" page

The final piece is to show all of the products currently in the wishlist on
the "/wishlist" page, as well as a **total price**.

**File: "/pages/wishlist.js"**

```jsx
import { useAtom } from "jotai";
import { wishlistAtom } from "@/store";

export default function WishlistPage() {
  const [wishlist] = useAtom(wishlistAtom);

  const totalPrice = wishlist.reduce(
    (total, product) => total + product.price,
    0
  );

  return (
    <div>
      <h2>My Wishlist</h2>
      <ul>
        {wishlist.map((product, index) => (
          <li key={index}>
            <strong>{product.title}</strong> &mdash; ${product.price}
          </li>
        ))}
      </ul>
      <hr />
      <strong>Total: ${totalPrice.toFixed(2)}</strong>
    </div>
  );
}
```

With this complete, we can browse the products, add some to the wishlist, and
view them (with a running total) on the "/wishlist" page.

---

## Wrap up

We now have a single app that manages two different pieces of application
state in two different ways:

| Concern | Tool | Key files |
| --- | --- | --- |
| Current user | **Context** | `pages/_app.js`, `components/Layout.js`, `pages/profile.js` |
| Wishlist list | **Jotai** | `store.js`, `components/Layout.js`, `components/ProductCard.js`, `pages/products/[id].js`, `pages/wishlist.js` |

Notice how much setup Context required just for **one** value: two Context
objects, two Providers wrapping the app, and a `useContext()` call everywhere
we needed it. If we had also used Context for the wishlist, we would need a
*second* pair of Context objects and *two more* providers &mdash; the "provider
hell" pyramid from the notes. The Jotai atom needed **no provider** and **no
`createContext`** at all &mdash; any component just imports the atom and calls
`useAtom`. This is exactly why Jotai tends to scale better as an application
grows more pieces of shared state.

A finished reference is available in the **"wishlist-complete"** folder.
