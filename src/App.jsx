import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:5000"
}/api/students`;

const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  return error.message || "Unable to connect to the student API.";
};

const getStudentId = (student) => student?._id ?? student?.id;

function App() {
  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    course: "",
  });
  const [editingStudent, setEditingStudent] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.get(API_URL);
      setStudents(response.data);
    } catch (error) {
      setErrorMessage(`Axios GET failed: ${getErrorMessage(error)}`);
    } finally {
      setIsLoading(false);
    }
  }

  const addStudent = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setStatusMessage("");

    try {
      const response = await axios.post(API_URL, newStudent);
      setStudents(currentStudents => [...currentStudents, response.data]);
      setNewStudent({ name: "", email: "", course: "" });
      setStatusMessage("Student added successfully.");
    } catch (error) {
      setErrorMessage(`Unable to add student: ${getErrorMessage(error)}`);
    }
  };

  const updateStudent = async (event) => {
    event.preventDefault();
    if (!editingStudent) {
      return;
    }

    const studentId = getStudentId(editingStudent);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const response = await axios.put(`${API_URL}/${studentId}`, editingStudent);
      setStudents(currentStudents =>
        currentStudents.map(student =>
          getStudentId(student) === getStudentId(response.data)
            ? { ...student, ...response.data }
            : student,
        ),
      );
      setEditingStudent(null);
      setStatusMessage("Student updated successfully.");
    } catch (error) {
      setErrorMessage(`Unable to update student: ${getErrorMessage(error)}`);
    }
  };

  const deleteStudent = async (studentId) => {
    setErrorMessage("");
    setStatusMessage("");

    try {
      await axios.delete(`${API_URL}/${studentId}`);
      setStudents(currentStudents =>
        currentStudents.filter(student => getStudentId(student) !== studentId),
      );
      setStatusMessage("Student deleted successfully.");
    } catch (error) {
      setErrorMessage(`Unable to delete student: ${getErrorMessage(error)}`);
    }
  };

  return (
    <main className="app">
      <header className="page-header">
        {/* <p className="eyebrow">Experiment 10</p> */}
        <h1>Student Management System</h1>
        <p>Manage student records using a React frontend and Express API.</p>
      </header>

      <section className="panel" aria-labelledby="add-student-heading">
        <h2 id="add-student-heading">Add Student</h2>
        <form className="student-form" onSubmit={addStudent}>
          <label>
            Name
            <input
              required
              type="text"
              placeholder="Name"
              value={newStudent.name}
              onChange={event =>
                setNewStudent({ ...newStudent, name: event.target.value })
              }
            />
          </label>
          <label>
            Email
            <input
              required
              type="email"
              placeholder="Email"
              value={newStudent.email}
              onChange={event =>
                setNewStudent({ ...newStudent, email: event.target.value })
              }
            />
          </label>
          <label>
            Course
            <input
              required
              type="text"
              placeholder="Course"
              value={newStudent.course}
              onChange={event =>
                setNewStudent({ ...newStudent, course: event.target.value })
              }
            />
          </label>
          <button className="button button-primary" type="submit">
            Add Student
          </button>
        </form>
      </section>

      {errorMessage && (
        <p className="notice notice-error" role="alert">{errorMessage}</p>
      )}
      {statusMessage && (
        <p className="notice notice-success" role="status">{statusMessage}</p>
      )}

      <section className="panel" aria-labelledby="student-list-heading">
        <div className="table-heading">
          <div>
            <h2 id="student-list-heading">Students</h2>
            <p>Student records returned by the backend API.</p>
          </div>
          <button
            className="button button-secondary"
            type="button"
            onClick={loadStudents}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Reload"}
          </button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Course</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => {
                const studentId = getStudentId(student);
                const isEditing = getStudentId(editingStudent) === studentId;

                return (
                  <tr key={studentId ?? `${student.name}-${student.email}`}>
                    {isEditing ? (
                      <>
                        <td>{studentId}</td>
                        <td>
                          <input
                            aria-label="Edit name"
                            required
                            value={editingStudent.name}
                            onChange={event =>
                              setEditingStudent({
                                ...editingStudent,
                                name: event.target.value,
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            aria-label="Edit email"
                            required
                            type="email"
                            value={editingStudent.email}
                            onChange={event =>
                              setEditingStudent({
                                ...editingStudent,
                                email: event.target.value,
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            aria-label="Edit course"
                            required
                            value={editingStudent.course}
                            onChange={event =>
                              setEditingStudent({
                                ...editingStudent,
                                course: event.target.value,
                              })
                            }
                          />
                        </td>
                        <td className="actions">
                          <form className="inline-form" onSubmit={updateStudent}>
                            <button className="button button-primary" type="submit">
                              Save
                            </button>
                            <button
                              className="button button-secondary"
                              type="button"
                              onClick={() => setEditingStudent(null)}
                            >
                              Cancel
                            </button>
                          </form>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{studentId}</td>
                        <td>{student.name}</td>
                        <td>{student.email}</td>
                        <td>{student.course}</td>
                        <td className="actions">
                          <button
                            className="button button-secondary"
                            type="button"
                            onClick={() => {
                              setEditingStudent({ ...student, id: studentId });
                              setErrorMessage("");
                              setStatusMessage("");
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="button button-danger"
                            type="button"
                            onClick={() => deleteStudent(studentId)}
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
              {!isLoading && students.length === 0 && (
                <tr>
                  <td className="empty-state" colSpan="5">
                    No students found. Add a student using the form above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default App;