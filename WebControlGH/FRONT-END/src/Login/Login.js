import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Login.css";
import axios from "axios";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Manejador de envío del formulario
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    // Validación básica
    if (!username || !password) {
      setError("Por favor, completa todos los campos");
      setLoading(false);
      return;
    }

    try {
      const endpoint = "http://localhost:3002/api/usuario/login";

      // Enviar username y password en el body
      const res = await axios.post(endpoint, {
        username,
        password,
      });

      // Verificar respuesta exitosa
      if (res.data?.success) {
        const usuario = res.data.data;

        // Guardar usuario en localStorage
        localStorage.setItem("user", JSON.stringify(usuario));

        console.log("Login exitoso:", usuario);

        // Redirigir al home
        navigate("/home/gestion-obras");
      } else {
        setError(res.data?.message || "Error al iniciar sesión");
      }
    } catch (error) {
      console.error("Error de conexión:", error);

      // Manejar diferentes tipos de errores
      if (error.response) {
        // El servidor respondió con un error
        setError(error.response.data?.message || "Credenciales inválidas");
      } else if (error.request) {
        // No hubo respuesta del servidor
        setError("No se pudo conectar con el servidor");
      } else {
        // Error al configurar la petición
        setError("Error al procesar la solicitud");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="header">
        <h1>GESTOR CC</h1>
      </div>
      <div className="login-container">
        <form onSubmit={handleSubmit} className="login-form">
          <h2>LOGIN</h2>

          {/* Mostrar mensaje de error */}
          {error && <div className="error-message">{error}</div>}

          <div className="input-group">
            <label htmlFor="username">Usuario:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </>
  );
}

export default Login;
