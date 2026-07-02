# Week 8 - Shared State with Props and Context

## Playgrounds

React Playground (CodeSandbox)
[https://codesandbox.io/p/sandbox/react-new](https://codesandbox.io/p/sandbox/react-new)

> In CodeSandbox, choose the **React** template. Put the code below in `App.js` and it will render in the preview pane.

## Passing Props

```jsx
import "./styles.css";

function MyButton({ text = "Button", enabled = true }) {
  return (
    <button
      type="button"
      disabled={!enabled}
      onClick={() => alert("That felt good")}
    >
      {text}
    </button>
  );
}

export default function App() {
  return (
    <div className="App">
      <MyButton text="Click Me!" />
    </div>
  );
}
```

```jsx
import "./styles.css";

function MyButton({
  text = "Button",
  enabled = true,
  message = "That felt good",
}) {
  return (
    <button type="button" disabled={!enabled} onClick={() => alert(message)}>
      {text}
    </button>
  );
}

export default function App() {
  return (
    <div className="App">
      <MyButton text="Click Me!" message="That felt great!" />
    </div>
  );
}
```

## State

```jsx
import "./styles.css";

function MyButton({ enabled = true }) {
  let count = 0;

  return (
    <button
      type="button"
      disabled={!enabled}
      onClick={() => {
        count++;
        alert(`${count}`);
      }}
    >
      Click Me
    </button>
  );
}

export default function App() {
  return (
    <div className="App">
      <MyButton />
    </div>
  );
}
```

- Show the click count on the button.
- It will not refresh because we are not using state.

```jsx
import "./styles.css";

function MyButton({ enabled = true }) {
  let count = 0;

  return (
    <button
      type="button"
      disabled={!enabled}
      onClick={() => {
        count++;
        alert(`${count}`);
      }}
    >
      {`Button clicked ${count} times`}
    </button>
  );
}

export default function App() {
  return (
    <div className="App">
      <MyButton />
    </div>
  );
}
```

- Let's fix this by adding state.

```jsx
import "./styles.css";
import { useState } from "react";

function MyButton({ enabled = true }) {
  const [count, setCount] = useState(0);

  return (
    <button
      type="button"
      disabled={!enabled}
      onClick={() => {
        setCount(count + 1);
      }}
    >
      {`Button clicked ${count} times`}
    </button>
  );
}

export default function App() {
  return (
    <div className="App">
      <MyButton />
    </div>
  );
}
```

- To avoid stale state, use this syntax

```jsx
import "./styles.css";
import { useState } from "react";

function MyButton({ enabled = true }) {
  const [count, setCount] = useState(0);

  return (
    <button
      type="button"
      disabled={!enabled}
      onClick={() => {
        // Increase multiple times... this does not work
        // it will only count by 1.
        setCount(count + 1);
        setCount(count + 1);
        setCount(count + 1);

        // To avoid stale state, and fix the above problem...
        setCount((prev) => prev + 1);
        setCount((prev) => prev + 1);
        setCount((prev) => prev + 1);
      }}
    >
      {`Button clicked ${count} times`}
    </button>
  );
}

export default function App() {
  return (
    <div className="App">
      <MyButton />
    </div>
  );
}
```

- Lift state up, so that the parent knows when the value changes.
- Move the click handler outside of the function and pass as a prop

```jsx
import "./styles.css";
import { useState } from "react";

function MyButton({ enabled = true, handleClick, count }) {
  return (
    <button type="button" disabled={!enabled} onClick={handleClick}>
      {`Button clicked ${count} times`}
    </button>
  );
}

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <p>Button clicked {count} times</p>
      <MyButton
        count={count}
        handleClick={() => {
          setCount((prev) => prev + 1);
        }}
      />
    </div>
  );
}
```

## Using context for state

- Create the context and a provider component
- Merge the context into the button
- Create a new component for displaying the information
- Update the App component

```jsx
import "./styles.css";
import { useState, createContext, useContext } from "react";

// Create the Context
const CountContext = createContext();

function CountProvider({ children }) {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount((prev) => prev + 1);
  };

  return (
    <CountContext.Provider value={{ count, handleClick }}>
      {children}
    </CountContext.Provider>
  );
}

function MyButton({ enabled = true }) {
  const { count, handleClick } = useContext(CountContext);

  return (
    <button type="button" disabled={!enabled} onClick={handleClick}>
      {`Button clicked ${count} times`}
    </button>
  );
}

function CountDisplay() {
  const { count } = useContext(CountContext);
  return <p>Button clicked {count} times</p>;
}

export default function App() {
  return (
    <CountProvider>
      <div className="App">
        <CountDisplay />
        <MyButton />
      </div>
    </CountProvider>
  );
}
```

## Context Hell

- Context works great for one piece of state, but real apps have many.
- Each new piece of shared state needs its **own** context, its **own** provider component, and its **own** state logic.
- Those providers stack up and wrap the tree in a deeply nested "pyramid" — often called **Context Hell** (or provider/wrapper hell).
- Notice how much boilerplate we add just to share three values, and how a component that needs all three has to call `useContext` three separate times.

```jsx
import "./styles.css";
import { useState, createContext, useContext } from "react";

// Three separate contexts for three pieces of state
const CountContext = createContext();
const ThemeContext = createContext();
const UserContext = createContext();

// ...and a provider component for each one
function CountProvider({ children }) {
  const [count, setCount] = useState(0);
  const handleClick = () => setCount((prev) => prev + 1);
  return (
    <CountContext.Provider value={{ count, handleClick }}>
      {children}
    </CountContext.Provider>
  );
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function UserProvider({ children }) {
  const [user, setUser] = useState("Guest");
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

// A component that needs ALL three has to reach into three contexts
function Dashboard() {
  const { count, handleClick } = useContext(CountContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, setUser } = useContext(UserContext);

  return (
    <div
      style={{
        background: theme === "light" ? "#fff" : "#333",
        color: theme === "light" ? "#000" : "#fff",
        padding: 20,
      }}
    >
      <p>User: {user}</p>
      <p>Theme: {theme}</p>
      <p>Button clicked {count} times</p>

      <button type="button" onClick={handleClick}>
        Increment
      </button>
      <button type="button" onClick={toggleTheme}>
        Toggle theme
      </button>
      <button type="button" onClick={() => setUser("Alice")}>
        Log in as Alice
      </button>
    </div>
  );
}

// Here's the "hell" — every provider must wrap the tree, nested inside each other
export default function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <CountProvider>
          <Dashboard />
        </CountProvider>
      </ThemeProvider>
    </UserProvider>
  );
}
```

- Add a fourth or fifth piece of state and the nesting just keeps growing.
- This is the problem the next section solves.

## Using Jotai

- Jotai makes it so much easier
- A tiny state‑management library that gives you global state with the same simplicity as useState.
- Instead of building context providers, reducers, or stores, you create small “atoms” that behave like shared pieces of state.
- Any component can read or update an atom directly, without prop‑drilling or boilerplate.
- In CodeSandbox, add `jotai` from the **Dependencies** panel (or include it in `package.json` as below).

_package.json_

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-scripts": "latest",
    "jotai": "*"
  }
}
```

_App.js_

```jsx
import "./styles.css";
import { atom, useAtom } from "jotai";

// Global atom
const countAtom = atom(0);

function MyButton() {
  const [count, setCount] = useAtom(countAtom);

  return (
    <button type="button" onClick={() => setCount((prev) => prev + 1)}>
      {`Clicked ${count} times`}
    </button>
  );
}

export default function App() {
  const [count] = useAtom(countAtom);

  return (
    <div className="App">
      <p>Count: {count}</p>
      <MyButton />
    </div>
  );
}
```

## Jotai vs Context Hell

- Let's refactor the **Context Hell** example above to use Jotai.
- Each piece of state becomes a single `atom` — no `createContext`, no provider components, no nesting.
- Any component reads or updates an atom directly with `useAtom`, exactly like `useState`.
- Compare this to the pyramid of providers we needed before.

```jsx
import "./styles.css";
import { atom, useAtom } from "jotai";

// One atom per piece of state — no contexts, no providers
const countAtom = atom(0);
const themeAtom = atom("light");
const userAtom = atom("Guest");

function Dashboard() {
  const [count, setCount] = useAtom(countAtom);
  const [theme, setTheme] = useAtom(themeAtom);
  const [user, setUser] = useAtom(userAtom);

  return (
    <div
      style={{
        background: theme === "light" ? "#fff" : "#333",
        color: theme === "light" ? "#000" : "#fff",
        padding: 20,
      }}
    >
      <p>User: {user}</p>
      <p>Theme: {theme}</p>
      <p>Button clicked {count} times</p>

      <button type="button" onClick={() => setCount((prev) => prev + 1)}>
        Increment
      </button>
      <button
        type="button"
        onClick={() =>
          setTheme((prev) => (prev === "light" ? "dark" : "light"))
        }
      >
        Toggle theme
      </button>
      <button type="button" onClick={() => setUser("Alice")}>
        Log in as Alice
      </button>
    </div>
  );
}

// No providers to wrap or nest — just render the component
export default function App() {
  return (
    <div className="App">
      <Dashboard />
    </div>
  );
}
```

- Same three pieces of shared state, but the provider pyramid is **gone**.
- Adding a fourth or fifth value is just one more `atom(...)` — the `App` component never changes.
