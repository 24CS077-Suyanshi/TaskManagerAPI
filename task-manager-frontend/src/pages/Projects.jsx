import { useEffect, useState } from "react";
import "../App.css";

const AUTH_URL = "http://localhost:5000/api/auth";
const API_URL = "http://localhost:5000/api/tasks";
const AI_URL = "http://localhost:5000/api/ai/generate-description";

function Projects() {
    const [token, setToken] = useState(
        localStorage.getItem("token") || ""
    );
    const [isRegister, setIsRegister] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiNotice, setAiNotice] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");


    // REGISTER / LOGIN
    const handleAuth = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        try {
            setLoading(true);

            const endpoint = isRegister ? "register" : "login";

            const response = await fetch(`${AUTH_URL}/${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Authentication failed");
            }

            if (isRegister) {
                setMessage("Registration successful. Please log in.");
                setIsRegister(false);
                setPassword("");
            } else {
                localStorage.setItem("token", data.token);
                setToken(data.token);
                setPassword("");
                setMessage("Login successful");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // GET TASKS
    const fetchTasks = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch tasks");
            }

            setTasks(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // GENERATE AI DESCRIPTION (Practical 13)
    const generateAiDescription = async () => {
        if (!title.trim()) {
            setError("Please enter a task title first to generate an AI description.");
            return;
        }

        setError("");
        setMessage("");
        setAiNotice("");

        try {
            setAiLoading(true);

            const response = await fetch(AI_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ title: title.trim() })
            });

            const data = await response.json();

            if (!response.ok && response.status !== 200) {
                throw new Error(data.message || "Failed to generate AI description");
            }

            if (data.description) {
                setDescription(data.description);
                setMessage("AI description generated! You can edit it before saving.");
                setAiNotice(data.source ? `Generated via: ${data.source}` : "AI Suggestion ready");
            } else {
                setMessage("No description generated. You can enter one manually.");
            }
        } catch (err) {
            setError(err.message || "AI service temporarily unavailable");
        } finally {
            setAiLoading(false);
        }
    };

    // CREATE TASK
    const addTask = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!title.trim()) {
            setError("Task title is required");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    completed: false
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to create task");
            }

            setTasks((prev) => [...prev, data]);
            setTitle("");
            setDescription("");
            setMessage("Task created successfully");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // UPDATE TASK
    const updateTask = async (task) => {
        const newTitle = window.prompt("Enter new task title:", task.title);

        if (newTitle === null || !newTitle.trim()) return;

        const newDescription = window.prompt(
            "Enter new description:",
            task.description || ""
        );

        if (newDescription === null) return;

        try {
            setLoading(true);
            setError("");
            setMessage("");

            const response = await fetch(`${API_URL}/${task._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: newTitle.trim(),
                    description: newDescription,
                    completed: task.completed
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to update task");
            }

            setTasks((prev) =>
                prev.map((item) => item._id === task._id ? data : item)
            );

            setMessage("Task updated successfully");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // DELETE TASK
    const deleteTask = async (id) => {
        if (!window.confirm("Are you sure you want to delete this task?")) {
            return;
        }

        try {
            setLoading(true);
            setError("");
            setMessage("");

            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to delete task");
            }

            setTasks((prev) => prev.filter((task) => task._id !== id));
            setMessage("Task deleted successfully");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // LOGOUT
    const logout = () => {
        localStorage.removeItem("token");
        setToken("");
        setTasks([]);
        setEmail("");
        setPassword("");
        setError("");
        setMessage("Logged out successfully");
    };

    // FETCH AFTER LOGIN
    useEffect(() => {
        if (token) {
            fetchTasks();
        } else {
            setTasks([]);
        }
    }, [token]);

    return (
        <div className="container">
            <h1>Task Manager</h1>

            {error && <p className="error">{error}</p>}
            {message && <p className="success">{message}</p>}

            {!token ? (
                <>
                    <h2>{isRegister ? "Register" : "Login"}</h2>

                    <form onSubmit={handleAuth}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <input
                            type="password"
                            placeholder="Password (at least 6 characters)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={6}
                            required
                        />

                        <button type="submit" disabled={loading}>
                            {loading
                                ? "Please wait..."
                                : isRegister ? "Register" : "Login"}
                        </button>
                    </form>

                    <p>
                        {isRegister
                            ? "Already have an account?"
                            : "Don't have an account?"}
                        {" "}
                        <button
                            type="button"
                            onClick={() => {
                                setIsRegister(!isRegister);
                                setError("");
                                setMessage("");
                            }}
                        >
                            {isRegister ? "Login" : "Register"}
                        </button>
                    </p>
                </>
            ) : (
                <>
                    <button type="button" onClick={logout}>
                        Logout
                    </button>

                    <form onSubmit={addTask} className="task-form">
                        <div className="input-with-button">
                            <input
                                type="text"
                                placeholder="Task title (e.g., Deploy to AWS, Write Unit Tests)"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="ai-btn"
                                onClick={generateAiDescription}
                                disabled={aiLoading || !title.trim()}
                                title="Generate an AI-powered task description based on the title"
                            >
                                {aiLoading ? "⏳ Generating..." : "✨ Generate AI Description"}
                            </button>
                        </div>

                        {aiNotice && (
                            <div className="ai-badge">
                                🤖 {aiNotice}
                            </div>
                        )}

                        <textarea
                            placeholder="Task description (Editable suggestion from AI or manual input)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />

                        <p className="ai-disclaimer">
                            ⚠️ <strong>AI Disclaimer:</strong> Content suggested by AI is editable and should be reviewed for accuracy before saving.
                        </p>

                        <button type="submit" disabled={loading}>
                            {loading ? "Adding..." : "Add Task"}
                        </button>
                    </form>

                    <h2>Tasks</h2>

                    {loading && <p>Loading...</p>}

                    {!loading && tasks.length === 0 && (
                        <p>No tasks available.</p>
                    )}

                    {tasks.map((task) => (
                        <div className="task" key={task._id}>
                            <h3>{task.title}</h3>
                            <p>{task.description}</p>
                            <p>
                                Status: {task.completed ? "Completed" : "Pending"}
                            </p>

                            <button onClick={() => updateTask(task)}>
                                Update
                            </button>

                            <button onClick={() => deleteTask(task._id)}>
                                Delete
                            </button>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}

export default Projects;
