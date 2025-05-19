import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set title and meta description for SEO
document.title = "La Lupis ERP - Sistema de Control Financiero";

// Add meta description for SEO
const metaDescription = document.createElement('meta');
metaDescription.name = 'description';
metaDescription.content = 'Sistema ERP integral para gestión de abarrotes, frutas y verduras. Control de inventario, ventas, finanzas y personal para su negocio.';
document.head.appendChild(metaDescription);

// Add Open Graph tags for better social media sharing
const ogTitle = document.createElement('meta');
ogTitle.property = 'og:title';
ogTitle.content = 'La Lupis ERP - Sistema de Control Financiero';
document.head.appendChild(ogTitle);

const ogDescription = document.createElement('meta');
ogDescription.property = 'og:description';
ogDescription.content = 'Sistema ERP integral para gestión de abarrotes, frutas y verduras. Control de inventario, ventas, finanzas y personal para su negocio.';
document.head.appendChild(ogDescription);

createRoot(document.getElementById("root")!).render(<App />);
