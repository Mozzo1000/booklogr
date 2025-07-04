import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import { Button, Label, TextInput, Card } from 'flowbite-react';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { RiMailLine } from "react-icons/ri";
import { RiLockPasswordLine } from "react-icons/ri";
import useToast from '../toast/useToast';
import AnimatedLayout from '../AnimatedLayout';

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    let navigate = useNavigate();
    const toast = useToast(8000);

    const handleLogin = (e) => {
        e.preventDefault();
        AuthService.login(username, password).then(
            response => {
                toast("success", "Login successful")
                navigate("/")
            },
            error => {
              const resMessage =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();
              toast("error", resMessage);
            }
        )
    }

  return (
    <AnimatedLayout>
      <div className="flex flex-col justify-center items-center gap-6">
        <div className="format lg:format-lg dark:format-invert">
          <h2>Login to your account</h2>
        </div>
        {String(import.meta.env.VITE_DEMO_MODE).toLowerCase() === "true" ? ( 
          <div className="text-center">
            <p className="text-lg font-bold">This is a demo of BookLogr</p>
            <p>Some features are <a className="font-medium text-blue-600 dark:text-blue-500 hover:underline" href="https://github.com/Mozzo1000/booklogr/blob/main/demo/README.md">disabled.</a></p>
            <br />
            <p className="font-bold">To login use,</p>
            <ul>Email: demo@booklogr.app</ul>
            <ul>Password: demo</ul>
          </div>
        ):(
          <GoogleLoginButton />
        )}

        <Card>
          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="email1">Email</Label>
              </div>
              <TextInput id="email1" type="email" icon={RiMailLine} placeholder="name@example.com" required value={username} onChange={e => setUsername(e.target.value)}/>
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="password1">Password</Label>
              </div>
              <TextInput id="password1" type="password" icon={RiLockPasswordLine} required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <Button type="submit">Login</Button>
            <Button as={Link} to="/register" color="light" className="hover:bg-gray-100">Register new account</Button>
          </form>
        </Card>
      </div>
    </AnimatedLayout>
  )
}

export default Login