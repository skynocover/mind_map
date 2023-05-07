import React, { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { AppContext } from './AppContext';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';

function App() {
  const auth = getAuth();
  const user = auth.currentUser;
  const provider = new GoogleAuthProvider();

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      {user ? (
        <p>Hello, {user.displayName}</p>
      ) : (
        <button
          onClick={() =>
            signInWithPopup(auth, provider)
              .then((result) => {
                const credential = GoogleAuthProvider.credentialFromResult(result);
                if (credential) {
                  const token = credential.accessToken;
                  const user = result.user;
                  console.log({ user, token });
                  // redirect('/projects');
                }
              })
              .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                const email = error.customData.email;
                const credential = GoogleAuthProvider.credentialFromError(error);
                console.log({ errorCode, errorMessage, credential, email });
              })
          }
        >
          Sign in with Google
        </button>
      )}
    </>
  );
}

export default App;
