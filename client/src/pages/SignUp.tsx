import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { useRef, useContext, useState } from "react";
import { BACKEND_URL } from "../config";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

export const Signup = () => {
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    const username = usernameRef.current?.value;
    const password = passwordRef.current?.value;

    if (!username || !password) {
      alert("Please enter both username and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
        username,
        password,
      });

      if (res.data.token) {
        login(res.data.token, res.data.user);
        navigate("/dashboard");
      } else {
        alert("Signup successful, but no token returned.");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-200 flex justify-center items-center">
      <div className="bg-white rounded-xl border border-gray-300 min-w-48 p-8 flex flex-col gap-3">
        <Input placeholder="Username" ref={usernameRef} />
        <Input placeholder="Password" ref={passwordRef} />
        <div className="flex justify-center pt-4 w-full">
          <Button
            variant="primary"
            size="md"
            text="Sign Up"
            widthFull={true}
            loading={loading}
            onClick={handleSignUp}
          />
        </div>

        {/* Google sign-up */}
        <div className="flex justify-center pt-2">
          <GoogleLogin
            onSuccess={async (cred) => {
              try {
                const res = await axios.post(
                  `${BACKEND_URL}/api/v1/google-signin`,
                  {
                    idToken: cred.credential,
                  }
                );
                login(res.data.token, res.data.user);
                navigate("/dashboard");
              } catch (e: any) {
                alert(e.response?.data?.message || "Google sign-up failed");
              }
            }}
            onError={() => alert("Google sign-up failed")}
          />
        </div>
      </div>
    </div>
  );
};
