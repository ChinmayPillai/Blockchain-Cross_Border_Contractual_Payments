import { Outlet } from "react-router-dom";
import { NavItem } from "./NavItem";

const Home = {
  name: "Home",
  link: "/#",
  internal: true,
}
const Contracts = {
  name: "My Contracts",
  link: "/contracts",
  internal: true,
  margin: "me-2",
};

const ContractRequests = {
  name: "Contract Requests",
  link: "/requests",
  internal: true,
  margin: "me-2",
};

const PendingContracts = {
  name: "Pending Contracts",
  link: "/pending",
  internal: true,
  margin: "me-2",
};

let Login = {
  name: "Login / SignUp",
  link: "/login",
  internal: true,
  margin: "me-2",
  img: "Login.png",
};

let Dashboard = {
  name: "Dashboard",
  link: "/dashboard",
  internal: true,
  margin: "me-2",
};

function NavBar() {

  function Logout() {
    localStorage.removeItem("username");
    alert("User logged out");
    location.href = "/"
  }

  return (
    <>
      <nav
        className="navbar sticky-top bg-dark navbar-expand-lg"
        data-bs-theme="dark"
      >
        <div className="container-fluid">
          <a className="navbar-brand" href="/#">
            BlockPe
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <NavItem item={Home} />
              <NavItem key={2} item={Contracts} />
            </ul>
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 d-flex">
              <NavItem key={1} item={ContractRequests} />
              <NavItem key={4} item={PendingContracts} />
              {
                localStorage.getItem("username") ? (
                  <>
                    <NavItem key={3} item={Dashboard} />
                    <li className="nav-item my-2">
                      <img
                        src="Logout.png"
                        alt="Logout"
                        width="30"
                        height="24"
                        onClick={Logout}
                      ></img>
                    </li>
                  </>
                ) :
                (<NavItem key={3} item={Login} />)
              }
            </ul>
          </div>
        </div>
      </nav>

      <Outlet />
    </>
  );
}

export default NavBar;
