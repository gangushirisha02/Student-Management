const form = document.getElementById("student-form");
const studentList = document.getElementById("student-list");
const message = document.getElementById("message");
const count = document.getElementById("student-count");
const formTitle = document.getElementById("form-title");
const submitButton = document.getElementById("submit-button");
const cancelButton = document.getElementById("cancel-button");

const fields = {
  id: document.getElementById("student-id"),
  name: document.getElementById("name"),
  email: document.getElementById("email"),
  course: document.getElementById("course"),
  age: document.getElementById("age")
};

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed.");
  return data;
}

async function loadStudents() {
  try {
    const students = await request("/api/students");
    count.textContent = `${students.length} student${students.length === 1 ? "" : "s"}`;

    if (students.length === 0) {
      studentList.innerHTML = '<tr><td colspan="6" class="empty">No students added yet.</td></tr>';
      return;
    }

    studentList.innerHTML = students.map(student => `
      <tr>
        <td>${student.id}</td>
        <td>${escapeHTML(student.name)}</td>
        <td>${escapeHTML(student.email)}</td>
        <td>${escapeHTML(student.course)}</td>
        <td>${student.age}</td>
        <td>
          <button class="edit" data-action="edit" data-id="${student.id}">Edit</button>
          <button class="delete" data-action="delete" data-id="${student.id}">Delete</button>
        </td>
      </tr>
    `).join("");
  } catch (error) {
    showMessage(error.message, true);
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function resetForm() {
  form.reset();
  fields.id.value = "";
  formTitle.textContent = "Add Student";
  submitButton.textContent = "Add Student";
  cancelButton.hidden = true;
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  const student = {
    name: fields.name.value.trim(),
    email: fields.email.value.trim(),
    course: fields.course.value.trim(),
    age: Number(fields.age.value)
  };

  try {
    if (fields.id.value) {
      await request(`/api/students/${fields.id.value}`, {
        method: "PUT",
        body: JSON.stringify(student)
      });
      showMessage("Student updated successfully.");
    } else {
      await request("/api/students", {
        method: "POST",
        body: JSON.stringify(student)
      });
      showMessage("Student added successfully.");
    }
    resetForm();
    await loadStudents();
  } catch (error) {
    showMessage(error.message, true);
  }
});

studentList.addEventListener("click", async event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  try {
    if (button.dataset.action === "edit") {
      const students = await request("/api/students");
      const student = students.find(item => item.id === id);
      if (!student) return;
      fields.id.value = student.id;
      fields.name.value = student.name;
      fields.email.value = student.email;
      fields.course.value = student.course;
      fields.age.value = student.age;
      formTitle.textContent = "Edit Student";
      submitButton.textContent = "Save Changes";
      cancelButton.hidden = false;
      fields.name.focus();
    } else if (button.dataset.action === "delete") {
      if (!confirm("Are you sure you want to delete this student?")) return;
      await request(`/api/students/${id}`, { method: "DELETE" });
      showMessage("Student deleted successfully.");
      await loadStudents();
    }
  } catch (error) {
    showMessage(error.message, true);
  }
});

cancelButton.addEventListener("click", resetForm);
loadStudents();
