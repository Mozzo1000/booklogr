import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import { Button, Label, TextInput } from 'flowbite-react';
import GoogleLoginButton from '../components/GoogleLoginButton';

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    let navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        AuthService.login(username, password).then(
            response => {
                navigate("/")
            },
            error => {
                console.log(error.response)
            }
        )
    }

  return (
    <>
      <h1>Login</h1>
      <GoogleLoginButton />
      <form className="flex max-w-md flex-col gap-4" onSubmit={handleLogin}>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="email1" value="Your email" />
          </div>
          <TextInput id="email1" type="email" placeholder="name@flowbite.com" required value={username} onChange={e => setUsername(e.target.value)}/>
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="password1" value="Your password" />
          </div>
          <TextInput id="password1" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <Button type="submit">Login</Button>
      </form>
    </>
  )
}

export default Login