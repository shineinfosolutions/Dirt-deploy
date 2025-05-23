import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
const Login = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [btnDisable, setBtnDisable] = useState(false);
  const login = async (e) => {
    e.preventDefault();
    // if (!email || !password) {
    //   toast.error("Please Input Valid Details !", { id: "Login" });
    //   return;
    // }
    // try {
    //   setBtnDisable(true);
    //   let data = {
    //     email: email,
    //     password: password,
    //   };
  //     axios
  //       .post(`https://ordering-portal-backend.vercel.app/api/user/login`, data)
  //       .then((res) => {
  //         console.log(res);

  //         if (res.data.success) {
  //           if (!res.data.isActive) {
  //             toast.error("This user is currently In-Active", { id: "wede" });
  //             setBtnDisable(false);
  //             return;
  //           }
  //           localStorage.setItem("email", res.data.email);
  //           localStorage.setItem("role", res.data.role);
  //           localStorage.setItem("uid", res.data._id);
  //           localStorage.setItem("branch", JSON.stringify(res.data.branch));
  //           localStorage.setItem("eid", res.data.eid);
  //           localStorage.setItem("isActive", res.data.isActive);
  //           localStorage.setItem("module", JSON.stringify(res.data.module));
  //           localStorage.setItem("name", res.data.name);
  //           localStorage.setItem("position", res.data.position);
  //           localStorage.setItem("currentUser", res.data.success);
  //           toast.success("Logged In Successfully !");

  //           setTimeout(() => {
  //             setCurrentUser(true);
  //             navigate("/", { replace: true });
  //           }, 200);
  //           setBtnDisable(false);
  //         }
  //       })
  //       .catch((error) => {
  //         console.log(error);
  //         toast.error(error.response.data.message);
  //         setBtnDisable(false);
  //       });
  //   } catch (error) {
  //     console.log(error);
  //     setBtnDisable(false);
  //   }
  localStorage.setItem('currentUser',true);
  navigate("/");
   };

  useEffect(() => {
    if (currentUser) {
      navigate("/", { replace: true });
    } else return;
  }, [currentUser]);
  return (
    <>
      <Toaster />
      <div
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1516815334695-610d284a5d50?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
        }}
        className="hero min-h-screen bg-base-200"
      >
        <div className="hero-overlay bg-opacity-60"></div>
        <div className="hero-content flex-col md:gap-16 lg:flex-row-reverse">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl font-bold text-white">Login now!</h1>
            <p className="py-6 text-white">
              Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda
              excepturi exercitationem quasi. In deleniti eaque aut repudiandae
              et a id nisi.
            </p>
          </div>
          <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
            <form className="card-body">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="email"
                  className="input input-bordered"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <input
                  type="password"
                  placeholder="password"
                  className="input input-bordered"
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="form-control mt-6">
                <button
                  disabled={btnDisable}
                  onClick={login}
                  className="btn btn-primary"
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
