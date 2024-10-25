import React from "react";
import { Route, BrowserRouter, Routes } from "react-router-dom";

import { Home } from "./pages/Home";
import { CreatePoint } from "./pages/CreatePoint";

export function RoutesApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route Component={Home} path="/" />
        <Route Component={CreatePoint} path="/create-point" />
      </Routes>
    </BrowserRouter>
  );
}