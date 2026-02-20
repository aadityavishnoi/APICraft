import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <Link to="/login">
      <h1>Go To Login</h1>
    </Link>
  );
}