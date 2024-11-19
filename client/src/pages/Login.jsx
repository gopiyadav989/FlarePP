import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {useDispatch} from "react-redux";
import {login} from "../redux/reducers/userSlice"
import "./../css/LoginSignup.css";

export default function Login() {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setError("Fill all the fields");
            return;
        }

        try {
            setLoading(true);

            const res = await fetch("http://localhost:3000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
            
            const data = await res.json();
            
            if (data.success === false) {
                setError(data.message);
                return;
            }
            console.log(data)
            dispatch(login({
                user:data.user,
                role: data.user.role
            }))
            navigate("/");
        } catch (e) {
            setError("error while calling backend");
        }
        finally {
            setLoading(false)
        }
    };

    return (
        <div className="flex items-center justify-center h-screen gap-12">
            {/* Form Section */}
            <div className="shadow-lg w-full max-w-xl p-10 rounded-lg">
                <h1 className="text-3xl text-center font-bold my-7 uppercase">
                    Sign In
                </h1>

                <form onSubmit={handleSubmit} className="flex flex-col">
                    <label>Email:</label>
                    <input
                        type="email"
                        placeholder="Enter your Email here"
                        id="email"
                        onChange={handleChange}
                        className="border p-3 rounded-lg mb-7"
                    />

                    <label>Password:</label>
                    <input
                        type="password"
                        placeholder="Password"
                        id="password"
                        onChange={handleChange}
                        className="border p-3 rounded-lg mb-7"
                    />

                    <button
                        type="submit"
                        className="bg-gradient-to-r from-blue-500 to-pink-500 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80 mb-7 animate-gradient-bg"
                        disabled={loading}
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                {error && <p className="text-red-500">{error}</p>}

                <div className="flex justify-center gap-2">
                    <p className="text-center">Don't have an account?</p>
                    <Link to="/signin" className="text-blue-500 hover:underline">Sign Up</Link>
                </div>

            </div>

            {/* Image Section (Hidden on small screens) */}
            <div className=" hidden md:block">
                <img
                    src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/authentication/illustration.svg"
                    alt="Illustration"
                />
            </div>

        </div>
    );
}
