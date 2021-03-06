const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found" });
  }

  request.user = user

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  // if (!name, !username) return response.status(400).send();

  const usernameAlreadyExists = users.some(user => user.username === username);

  if (usernameAlreadyExists) {
    return response.status(400).json({ error: "User already exists" });
  }

  const userCreated = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(userCreated);

  return response.status(201).json(userCreated);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request

  // if (!title || !deadline) return response.status(400).send();

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;

  const { user } = request

  // if (!title || !deadline || !id) return response.status(404).send();

  const todoEdited = user.todos.find(todo => todo.id === id);

  if (!todoEdited) return response.status(404).json({ error: "Task not found" });

  todoEdited.title = title;
  todoEdited.deadline = new Date(deadline);

  return response.status(200).json(todoEdited);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request

  const todoEdited = user.todos.find(todo => todo.id === id);
  if (!todoEdited) return response.status(404).json({ error: "Task not found" });

  todoEdited.done = !todoEdited.done;

  return response.status(200).json(todoEdited);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request

  const todoDeleted = user.todos.find(todo => todo.id === id);

  if (!todoDeleted) return response.status(404).json({ error: "Task not found" });
  user.todos.splice(todoDeleted, 1);

  return response.status(204).json({ message: "Deleted with successful" })
});

module.exports = app;