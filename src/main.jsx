// src/main.jsx (FINAL UX VERSION)
import React, { Suspense, lazy } from "react"; 
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
// We no longer need to import the spinner here
// import LoadingSpinner from "./components/LoadingSpinner"; 

// Lazily import the main App component
const LazyApp = lazy(() => import("./App.jsx")); 

// (Keep all your page imports as lazy)
const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const SpotDetailsPage = lazy(() => import("./pages/SpotDetailsPage.jsx"));
const AmbassadorProfilePage = lazy(() => import("./pages/AmbassadorProfilePage.jsx"));
const SearchPage = lazy(() => import("./pages/SearchPage.jsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const ProfilePage = lazy(() => import("./pages/ProfilePage.jsx"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage.jsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.jsx"));
const SpotReviewsPage = lazy(() => import("./pages/SpotReviewsPage.jsx"));
const CategoryPage = lazy(() => import("./pages/CategoryPage.jsx")); 

import ProtectedRoute from "./components/ProtectedRoute.jsx"; 

// Router setup
const router = createBrowserRouter([
  {
    path: "/",
    element: <LazyApp />, 
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/spot/:spotId", element: <SpotDetailsPage /> },
      { path: "/spot/:spotId/reviews", element: <SpotReviewsPage /> },
      { path: "/ambassador/:ambassadorId", element: <AmbassadorProfilePage /> },
      { path: "/category/:categoryId", element: <CategoryPage /> }, 
      { path: "/search", element: <SearchPage /> },
      { path: "/login", element: <LoginPage /> },
      {
        path: "/profile",
        element: ( <ProtectedRoute> <ProfilePage /> </ProtectedRoute> ),
      },
      {
        path: "/favorites",
        element: ( <ProtectedRoute> <FavoritesPage /> </ProtectedRoute> ),
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

// Render the app
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
     {/* 💥 FIX: We use 'null' as the fallback. This ensures your app's fast-loading HTML structure 
     (header, nav) appears immediately, making the app feel instant. */}
     <Suspense fallback={null}> 
        <RouterProvider router={router} />
     </Suspense>
  </React.StrictMode>
);