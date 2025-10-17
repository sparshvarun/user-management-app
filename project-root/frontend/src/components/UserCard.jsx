import React from 'react';

const UserCard = ({ user }) => {
    return (
        <div className="user-card">
            <h2>{user.name}</h2>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
        </div>
    );
};

export default UserCard;