// import React,{useState,useContext} from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import axios from '../Screens/config/axios'; // Adjust the path as necessary
// import { UserContext } from '../Context/user.context'; // Adjust the path as necessary


// export default function RegisterPage() {

//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');

//    const navigate = useNavigate()


//     const { setUser } = useContext(UserContext); // Access the setUser function from context

//     function submintHandler(e) {
//         e.preventDefault(); // Prevent default form submission behavior

//         axios.post('/users/register', {
//             email,
//             password
//         })
//         .then((res) => {
//             console.log(res.data);
//             navigate('/'); // Redirect to login page after successful registration
//             localStorage.setItem('token', res.data.token); // Store the token in localStorage
//             setUser(res.data.user); // Set the user in context
//         })
//         .catch((err) => {
//             console.error(err);
//             console.error(err.response.data);
//         });
//     }



//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-700 p-4">
//       <div className="backdrop-blur-lg bg-white/10 border border-white/30 shadow-2xl rounded-3xl p-8 max-w-sm w-full animate-fade-in-up">
//         <h2 className="text-3xl font-extrabold text-white text-center mb-6 drop-shadow-md">🌟 Create Account</h2>
        
//         <form className="space-y-4"
        
//         onSubmit={submintHandler}>
//           <div>
           
//           </div>
//           <div>
//             <label htmlFor="email" className="text-white block text-sm font-medium mb-1">Email</label>
//             <input
//             onChange={(e) => setEmail(e.target.value)}
//               id="email"
//               type="email"
//               className="w-full px-4 py-2 rounded-xl bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-cyan-300 transition"
//               placeholder="you@example.com"
//             />
//           </div>
//           <div>
//             <label htmlFor="password" className="text-white block text-sm font-medium mb-1">Password</label>
//             <input
//             onChange={(e) => setPassword(e.target.value)}
//               id="password"
//               type="password"
//               className="w-full px-4 py-2 rounded-xl bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-cyan-300 transition"
//               placeholder="••••••••"
//             />
//           </div>
//           <button
//             type="submit"
//             className="w-full bg-white text-indigo-800 font-bold py-2 px-4 rounded-xl hover:scale-105 hover:bg-cyan-300 transition-all duration-300"
//           >
//             ✨ Register
//           </button>
//         </form>

//         <p className="text-white mt-6 text-center text-sm">
//           Already have an account? <a href="/login" className="underline hover:text-cyan-200">Login</a>
//         </p>
//       </div>
//     </div>
//   );
// }
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../Screens/config/axios'; // Adjust the path as necessary
import { UserContext } from '../Context/user.context'; // Adjust the path as necessary

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // New state for error messages

    const navigate = useNavigate();
    const { setUser } = useContext(UserContext); // Access the setUser function from context

    function submintHandler(e) {
        e.preventDefault(); // Prevent default form submission behavior
        setError(''); // Clear any previous errors on new submission

        axios.post('/users/register', {
            email,
            password
        })
        .then((res) => {
            console.log(res.data);
            localStorage.setItem('token', res.data.token); // Store the token in localStorage

            // --- IMPORTANT ADDITION FOR CHAT HISTORY ---
            // Assuming your backend's registration response (res.data.user) includes the user's email
            if (res.data.user && res.data.user.email) {
                localStorage.setItem('userEmail', res.data.user.email); // Store the user's email in localStorage
            }
            // --- END IMPORTANT ADDITION ---

            setUser(res.data.user); // Set the user in context

            navigate('/'); // Redirect to the home page after successful registration
        })
        .catch((err) => {
            console.error("Registration error:", err);
            if (err.response && err.response.data && err.response.data.message) {
                // If the backend sends a specific error message (e.g., "Email already registered")
                setError(err.response.data.message);
            } else {
                // Generic error message for network issues or unexpected errors
                setError('Registration failed. Please try again later.');
            }
        });
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-700 p-4">
            <div className="backdrop-blur-lg bg-white/10 border border-white/30 shadow-2xl rounded-3xl p-8 max-w-sm w-full animate-fade-in-up">
                <h2 className="text-3xl font-extrabold text-white text-center mb-6 drop-shadow-md">🌟 Create Account</h2>

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
                            className="w-full px-4 py-2 rounded-xl bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-cyan-300 transition"
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
                            className="w-full px-4 py-2 rounded-xl bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-cyan-300 transition"
                            placeholder="••••••••"
                            value={password} // Controlled component
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-white text-indigo-800 font-bold py-2 px-4 rounded-xl hover:scale-105 hover:bg-cyan-300 transition-all duration-300"
                    >
                        ✨ Register
                    </button>
                </form>

                <p className="text-white mt-6 text-center text-sm">
                    Already have an account? <Link to="/login" className="underline hover:text-cyan-200">Login</Link>
                </p>
            </div>
        </div>
    );
}