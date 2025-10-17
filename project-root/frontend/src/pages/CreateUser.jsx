import React, { useState } from 'react';
import { createUser } from '../api/users';

export default function CreateUser() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState('');
    const [file, setFile] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();
        const fd = new FormData();
        fd.append('name', name);
        fd.append('email', email);
        fd.append('phone', phone);
        fd.append('dob', dob);
        if (file) fd.append('avatar', file);
        const res = await createUser(fd);
        alert(res.id ? 'User created successfully!' : res.error || 'Error creating user');
        if (res.id) window.location.reload();
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Create User</h2>
            <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
            <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
            <input type="date" value={dob} onChange={e => setDob(e.target.value)} />
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
            <button type="submit">Create</button>
        </form>
    );
}
