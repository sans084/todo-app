import axios from "axios";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

const api = axios.create({ baseURL: `${STRAPI_URL}/api` });

export async function register({ username, email, password }) {
  const { data } = await api.post("/auth/local/register", { username, email, password });
  return data;
}

export async function login({ identifier, password }) {
  const { data } = await api.post("/auth/local", { identifier, password });
  return data;
}

export async function getMe(jwt) {
  const { data } = await api.get("/users/me", {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  return data;
}

export async function getTodos(jwt) {
  const { data } = await api.get("/todos", {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  return data.data;
}

export async function createTodo(jwt, { title }) {
  const { data } = await api.post(
    "/todos",
    { data: { title, isCompleted: false } },
    { headers: { Authorization: `Bearer ${jwt}` } }
  );
  return data.data;
}

export async function updateTodo(jwt, todoId, isCompleted) {
  const { data } = await api.put(
    `/todos/${todoId}`,
    { data: { isCompleted } },
    { headers: { Authorization: `Bearer ${jwt}` } }
  );
  return data.data;
}

export async function deleteTodo(jwt, todoId) {
  await api.delete(`/todos/${todoId}`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
}
