import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
    const userId = localStorage.getItem("userId");

    return userId ? children : <Navigate to="/" replace />;
}

export default PrivateRoute;
