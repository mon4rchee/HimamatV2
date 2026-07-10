/// <reference types="vite/client" />
import React from 'react';
import {createRoot} from 'react-dom/client';
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from './App.tsx';
import './index.css';

const convexUrl = import.meta.env.VITE_CONVEX_URL || "https://quick-setter-821.convex.cloud/";
const convex = new ConvexReactClient(convexUrl);

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </React.StrictMode>,
);
