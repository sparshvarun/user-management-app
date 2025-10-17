import React, { useState } from 'react';

const UserForm = ({ onSubmit, initialData }) => {
    const [name, setName] = useState(initialData ? initialData.name : '');
    const [email, setEmail] = useState(initialData ? initialData.email : '');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ name, email });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="name">Name:</label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Submit</button>
        </form>
    );
};

export default UserForm;