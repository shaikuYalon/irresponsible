import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user || user.role !== 'admin') {
        console.warn('Unauthorized access attempt:', user); 
        return <Navigate to="/login" />;
    }

    return children;
}

export default PrivateRoute;
