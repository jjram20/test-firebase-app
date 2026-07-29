import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth"
import { useState } from "react";

import { auth } from "../../firebase";

export function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  async function handleSubmit(
    event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();
    
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Ocurrió un error durante la autenticación"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleMode() {
    setIsRegistering((currentValue) => !currentValue);
    setErrorMessage("");
  }

  return (
    <main>
      <section>
        <h1>{isRegistering ? "Crear cuenta" : "Iniciar sesión"}</h1>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          {errorMessage && (
            <p role="alert" aria-live="polite">
              {errorMessage}
            </p>
          )}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Procesando..."
              : isRegistering
                ? "Crear cuenta"
                : "Entrar"}
          </button>
        </form>

        <button
          type="button"
          onClick={toggleMode}
          disabled={isSubmitting}
        >
          {isRegistering
            ? "Ya tengo una cuenta"
            : "Crear una cuenta"}
        </button>
      </section>
    </main>
  )
}

