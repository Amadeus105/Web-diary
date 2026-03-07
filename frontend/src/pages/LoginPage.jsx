import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { login, register, getMe } from "../services/api";

const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isRegister) {
      const data = await register(username, password);
      if (data.detail) return setError(data.detail);
    }

    const data = await login(username, password);
    if (data.detail) return setError(data.detail);

    // Fetch user info to get is_admin
    const userInfo = await getMe(data.access_token);
    authLogin(data.access_token, userInfo);
    navigate("/");
};

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <div className="card p-4" style={{ width: "100%", maxWidth: "400px" }}>
        <h3 className="mb-4">{isRegister ? "Register" : "Login"}</h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            className="form-control mb-2"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            className="form-control mb-3"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="btn btn-primary w-100">
            {isRegister ? "Register" : "Login"}
          </button>
        </form>

        <p className="mt-3 text-center">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <span
            className="text-primary"
            style={{ cursor: "pointer" }}
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "Login" : "Register"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;