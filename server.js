const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let students = [];
let nextId = 1;

// Get all students
app.get("/api/students", (req, res) => {
  res.json(students);
});

// Add a student
app.post("/api/students", (req, res) => {
  const { name, email, course, age } = req.body;

  if (!name || !email || !course || age === undefined || age === "") {
    return res.status(400).json({ message: "Please fill in all fields." });
  }

  const student = {
    id: nextId++,
    name: String(name).trim(),
    email: String(email).trim(),
    course: String(course).trim(),
    age: Number(age)
  };

  students.push(student);
  res.status(201).json(student);
});

// Update a student
app.put("/api/students/:id", (req, res) => {
  const id = Number(req.params.id);
  const student = students.find(item => item.id === id);

  if (!student) {
    return res.status(404).json({ message: "Student not found." });
  }

  const { name, email, course, age } = req.body;
  if (!name || !email || !course || age === undefined || age === "") {
    return res.status(400).json({ message: "Please fill in all fields." });
  }

  Object.assign(student, {
    name: String(name).trim(),
    email: String(email).trim(),
    course: String(course).trim(),
    age: Number(age)
  });

  res.json(student);
});

// Delete a student
app.delete("/api/students/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = students.findIndex(item => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Student not found." });
  }

  students.splice(index, 1);
  res.json({ message: "Student deleted successfully." });
});

app.listen(PORT, () => {
  console.log(`Student Management App running at http://localhost:${PORT}`);
});
