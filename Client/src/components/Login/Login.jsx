import "mdb-react-ui-kit/dist/css/mdb.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useState } from "react";
import { TextField, MenuItem } from "@mui/material";
import {
  MDBContainer,
  MDBTabs,
  MDBTabsItem,
  MDBTabsLink,
  MDBTabsContent,
  MDBTabsPane,
  MDBBtn,
  MDBInput
} from "mdb-react-ui-kit";
import axios from "axios";
import { loginUrl, registerUrl } from "../../Util/apiUrls";

function Login() {
  const [justifyActive, setJustifyActive] = useState("tab1");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bank, setBank] = useState("");
  const [centralBank, setCentralBank] = useState("");
  const [company, setCompany] = useState("");

  const handleJustifyClick = (value) => {
    if (value === justifyActive) {
      return;
    }
    setJustifyActive(value);
  };

  function loginUser(event) {
    event.preventDefault();
    console.log("Login\n");
    axios
      .post(loginUrl, { username: username, password: password })
      .then((response) => {
        console.log(response.data);
        if (response.data.username) {
          localStorage.setItem("username", response.data.username);
          alert(`Logged in as ${response.data.username}`);
          location.href = "/";
        } else {
          alert("Invalid username or password");
        }
      })
      .catch((error) => {
        alert("Invalid username or password");
      });
  }

  function registerUser(event) {
    event.preventDefault();
    console.log("Register\n");
    axios
      .post(registerUrl, { 
        name: name,
        username: username,
        password: password,
        bankAccount: bankAccount,
        bank: bank,
        centralBank: centralBank,
        company: company
       })
      .then((response) => {
        console.log(response.data);
        alert(`Registration Successful`);
        location.href = "/login";
      })
      .catch((error) => {
        console.log(error);
        alert('Error');
      })
  }

  return (
    <MDBContainer className="p-3 my-5 d-flex flex-column w-50">
      <MDBTabs
        pills
        justify
        className="mb-3 d-flex flex-row justify-content-between"
      >
        <MDBTabsItem>
          <MDBTabsLink
            onClick={() => handleJustifyClick("tab1")}
            active={justifyActive === "tab1"}
            style={justifyActive !== "tab1" ? { backgroundColor: "#ccc" } : {}}
          >
            Login
          </MDBTabsLink>
        </MDBTabsItem>
        <MDBTabsItem>
          <MDBTabsLink
            onClick={() => handleJustifyClick("tab2")}
            active={justifyActive === "tab2"}
            style={justifyActive !== "tab2" ? { backgroundColor: "#ccc" } : {}}
          >
            Register
          </MDBTabsLink>
        </MDBTabsItem>
      </MDBTabs>

      <MDBTabsContent>
        {justifyActive === "tab1" && (
          <>
            <form onSubmit={loginUser}>
              <MDBInput
                wrapperClass="mb-4"
                label="Username"
                id="username"
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <MDBInput
                wrapperClass="mb-4"
                label="Password"
                id="loginPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <MDBBtn className="mb-4 w-100">Sign in</MDBBtn>
            </form>
            <p className="text-center">
              Not a member?{" "}
              <a href="#!" onClick={() => handleJustifyClick("tab2")}>
                Register
              </a>
            </p>
          </>
        )}

        {justifyActive === "tab2" && (
          <form onSubmit={registerUser}>
            <MDBInput
              wrapperClass="mb-4"
              label="Name"
              id="registerName"
              type="text"
              placeholder="Chinmay Pillai"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <MDBInput
              wrapperClass="mb-4"
              label="Username"
              id="registerUsername"
              type="text"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <MDBInput
              wrapperClass="mb-4"
              label="Email"
              id="registerEmail"
              type="email"
              placeholder="abc@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <MDBInput
              wrapperClass="mb-4"
              label="Password"
              id="registerPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <MDBInput
              wrapperClass="mb-4"
              label="Bank Account"
              id="bankAccount"
              type="text"
              placeholder="BankAccount123"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              required
            />
            <TextField
              select
              label="Bank"
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              fullWidth
              className="mb-4"
              required
            >
              <MenuItem value="ADFC">ADFC Bank</MenuItem>
              <MenuItem value="IBIBI">IBIBI Bank</MenuItem>
            </TextField>
            <TextField
              select
              label="centralBank"
              value={centralBank}
              onChange={(e) => setCentralBank(e.target.value)}
              fullWidth
              className="mb-4"
              required
            >
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="INR">INR</MenuItem>
            </TextField>
            <MDBInput
              wrapperClass="mb-4"
              label="Company"
              id="company"
              type="text"
              placeholder="Company123"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            />

            <MDBBtn className="mb-4 w-100">Sign up</MDBBtn>
          </form>
        )}
      </MDBTabsContent>
    </MDBContainer>
  );
}

export default Login;
