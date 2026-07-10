/// <reference types="vite/client" />
import React from 'react';
import {createRoot} from 'react-dom/client';
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from './App.tsx';
import './index.css';

const rawConvexUrl = import.meta.env.VITE_CONVEX_URL;

let convexUrl = (rawConvexUrl || "https://determined-mule-558.convex.cloud/").replace(/["']/g, "").trim();
if (convexUrl.includes('127.0.0.1') || convexUrl.includes('localhost')) {
  // Route through Vite proxy to avoid port 3210 which is blocked
  const url = new URL(convexUrl);
  convexUrl = `${window.location.origin}/api/convex${url.pathname}`;
}

const convex = new ConvexReactClient(convexUrl);

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </React.StrictMode>,
);
