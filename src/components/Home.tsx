import { useNavigate, useLocation } from "@solidjs/router";
import type { Component } from "solid-js";

export const Home:Component = () => {

  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/') {
      navigate('/tournament/', { replace: true });
  }

return (
    <div>Hello</div>
  );
}