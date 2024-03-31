import { Link } from "react-router-dom";
import React from "react";
export function NavItem({ item }) {
  let margin = "";
  if (item.margin) margin = " " + item.margin;

  if (item.internal) {
    return (

      <li className={"nav-item" + margin}>
        <Link className="nav-link" to={item.link}>
          {item.img && (
            <img
              className="me-2"
              src={item.img}
              alt="Can't Load Image :("
              width="30"
              height="24"
            ></img>
          )}
          {item.name}
        </Link>
      </li>
    );
  } 
  else {
    return (
      <li className="nav-item">
        <a className="nav-link" target="_blank" href={item.link}>
          {item.name}
        </a>
      </li>
    );
  }
}
