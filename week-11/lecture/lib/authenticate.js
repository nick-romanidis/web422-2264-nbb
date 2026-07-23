// A trimmed-down version of the Week 10 token helper. It is self-contained
// (it talks to this app's own /api/login route) so the app runs without the
// separate Vehicles API. The public surface is the same as Week 10, which is
// what our tests exercise.

export function setToken(token) {
  localStorage.setItem("access_token", token);
}

export function getToken() {
  try {
    return localStorage.getItem("access_token");
  } catch (err) {
    return null;
  }
}

export function removeToken() {
  localStorage.removeItem("access_token");
}

export function isAuthenticated() {
  const token = getToken();
  return token ? true : false;
}

export async function authenticateUser(userName, password) {
  const res = await fetch("/api/login", {
    method: "POST",
    body: JSON.stringify({ userName, password }),
    headers: {
      "content-type": "application/json",
    },
  });

  const data = await res.json();

  if (res.status === 200) {
    setToken(data.token);
    return true;
  } else {
    throw new Error(data.message);
  }
}
