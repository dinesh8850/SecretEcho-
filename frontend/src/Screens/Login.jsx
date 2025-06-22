
 
// import React, { useState, useContext } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import axios from '../Screens/config/axios';
// import { UserContext } from '../Context/user.context'; // Adjust the path as necessary

// export default function Login() {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');

//     const navigate = useNavigate();
//     const { setUser } = useContext(UserContext); // Access the setUser function from context

//     function submintHandler(e) {
//         e.preventDefault(); // Prevent default form submission behavior

//         axios.post('/users/login', {
//             email,
//             password
//         })
//         .then((res) => {
//             console.log(res.data);
//             localStorage.setItem('token', res.data.token); // Store the token in localStorage

//             // --- IMPORTANT ADDITION HERE ---
//             // Assuming your backend's login response (res.data.user) includes the user's email
//             if (res.data.user && res.data.user.email) {
//                 localStorage.setItem('userEmail', res.data.user.email); // Store the user's email in localStorage
//             }
//             // --- END IMPORTANT ADDITION ---

//             setUser(res.data.user); // Set the user in context

//             navigate('/'); // Navigate to the home page (or wherever your chat is)
//          })
//          .catch((err) => {
//             console.error("Login error:", err); // Use console.error for actual errors
//             if (err.response && err.response.data) {
//                 console.log("Error response data:", err.response.data); // Log specific error from backend
//             } else {
//                 console.log("An unexpected error occurred.");
//             }
//          });
//     }

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-800 via-pink-600 to-yellow-500 p-4">
//             <div className="backdrop-blur-md bg-white/10 border border-white/30 shadow-2xl rounded-3xl p-8 max-w-sm w-full animate-fade-in-up">
//                 <h2 className="text-3xl font-extrabold text-white text-center mb-6 drop-shadow-md">🚀 Welcome Back!</h2>

//                 <form className="space-y-4" onSubmit={submintHandler}>
//                     <div>
//                         <label htmlFor="email" className="text-white block text-sm font-medium mb-1">Email</label>
//                         <input
//                             onChange={(e) => setEmail(e.target.value)}
//                             id="email"
//                             type="email"
//                             className="w-full px-4 py-2 rounded-xl bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-yellow-300 transition"
//                             placeholder="you@example.com"
//                             value={email} // Controlled component
//                         />
//                     </div>
//                     <div>
//                         <label htmlFor="password" className="text-white block text-sm font-medium mb-1">Password</label>
//                         <input
//                             onChange={(e) => setPassword(e.target.value)}
//                             id="password"
//                             type="password"
//                             className="w-full px-4 py-2 rounded-xl bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-yellow-300 transition"
//                             placeholder="••••••••"
//                             value={password} // Controlled component
//                         />
//                     </div>
//                     <button
//                         type="submit"
//                         className="w-full bg-white text-purple-800 font-bold py-2 px-4 rounded-xl hover:scale-105 hover:bg-yellow-300 transition-all duration-300"
//                     >
//                         💥 Login
//                     </button>
//                 </form>

//                 <p className="text-white mt-6 text-center text-sm">
//                     Don’t have an account? <Link to="/register" className="underline hover:text-yellow-200">Register</Link>
//                 </p>
//             </div>
//         </div>
//     );
// }
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../Screens/config/axios';
import { UserContext } from '../Context/user.context'; // Adjust the path as necessary

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // New state for error messages

    const navigate = useNavigate();
    const { setUser } = useContext(UserContext); // Access the setUser function from context

    function submintHandler(e) {
        e.preventDefault(); // Prevent default form submission behavior
        setError(''); // Clear any previous errors on new submission

        axios.post('/users/login', {
            email,
            password
        })
        .then((res) => {
            console.log(res.data);
            localStorage.setItem('token', res.data.token); // Store the token in localStorage

            if (res.data.user && res.data.user.email) {
                localStorage.setItem('userEmail', res.data.user.email); // Store the user's email in localStorage
            }

            setUser(res.data.user); // Set the user in context
            navigate('/'); // Navigate to the home page
         })
         .catch((err) => {
            console.error("Login error:", err);
            if (err.response && err.response.data && err.response.data.message) {
                // If the backend sends a specific error message
                setError(err.response.data.message);
            } else {
                // Generic error message for network issues or unexpected errors
                setError('Login failed. Please check your email and password, or try again later.');
            }
         });
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-800 via-pink-600 to-yellow-500 p-4">
            <div className="backdrop-blur-md bg-white/10 border border-white/30 shadow-2xl rounded-3xl p-8 max-w-sm w-full animate-fade-in-up">
                <h2 className="text-3xl font-extrabold text-white text-center mb-6 drop-shadow-md">🚀 Welcome Back!</h2>

                <form className="space-y-4" onSubmit={submintHandler}>
                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-500 text-white text-sm p-3 rounded-lg text-center animate-fade-in">
                            {error}
                        </div>
                    )}
                    {/* End Error Display */}

                    <div>
                        <label htmlFor="email" className="text-white block text-sm font-medium mb-1">Email</label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            id="email"
                            type="email"
                            className="w-full px-4 py-2 rounded-xl bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-yellow-300 transition"
                            placeholder="you@example.com"
                            value={email} // Controlled component
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="text-white block text-sm font-medium mb-1">Password</label>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            id="password"
                            type="password"
                            className="w-full px-4 py-2 rounded-xl bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-yellow-300 transition"
                            placeholder="••••••••"
                            value={password} // Controlled component
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-white text-purple-800 font-bold py-2 px-4 rounded-xl hover:scale-105 hover:bg-yellow-300 transition-all duration-300"
                    >
                        💥 Login
                    </button>
                </form>

                <p className="text-white mt-6 text-center text-sm">
                    Don’t have an account? <Link to="/register" className="underline hover:text-yellow-200">Register</Link>
                </p>
            </div>
        </div>
    );
}