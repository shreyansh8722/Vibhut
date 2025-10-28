import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="container mx-auto max-w-xl p-6 mt-20 text-center">
      <AlertTriangle className="w-24 h-24 text-yellow-500 mx-auto mb-6" />
      <h1 className="text-4xl font-bold text-gray-900">404 - Page Not Found</h1>
      <p className="text-gray-600 mt-4 text-lg">
        Oops! The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="mt-8 inline-block bg-yellow-600 text-white font-semibold py-3 px-6 rounded-md shadow hover:bg-yellow-700"
      >
        Go Back Home
      </Link>
    </div>
  );
}