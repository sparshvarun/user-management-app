import React, { useEffect, useState } from 'react';
import { fetchUser, updateUser, fetchUsers, fetchFollowing, followUser, unfollowUser } from '../api/users';
import { useParams, useNavigate } from 'react-router-dom';
const API_BASE = import.meta.env.VITE_API_BASE.replace('/api', '');

export default function EditUser() {
    const { id: userId } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [followingSet, setFollowingSet] = useState(new Set()); 

    useEffect(() => {
        if (!userId) return;
        (async () => {
            const u = await fetchUser(userId);
            setUser(u);
            setName(u.name);
            setEmail(u.email);
            setPhone(u.phone || '');
            setDob(u.dob ? u.dob.slice(0, 10) : '');
            if (u.avatar_url) setPreview(`${API_BASE}${u.avatar_url}`);

            const all = await fetchUsers();
            setAllUsers(all);

            const f = await fetchFollowing(userId);
            setFollowingSet(new Set(f.following || []));
        })();
    }, [userId]);

    const onFileChange = e => {
        const f = e.target.files[0];
        setFile(f);
        if (f) setPreview(URL.createObjectURL(f));
    };

    const toggleFollowingCheckbox = (targetId) => {
        const s = new Set(followingSet);
        if (s.has(targetId)) s.delete(targetId);
        else s.add(targetId);
        setFollowingSet(s);
    };

    async function handleSubmit(e) {
        e.preventDefault();
        
        const fd = new FormData();
        fd.append('name', name);
        fd.append('email', email);
        fd.append('phone', phone);
        fd.append('dob', dob);
        if (file) fd.append('avatar', file);

        await updateUser(userId, fd);

        
        const current = await fetchFollowing(userId);
        const currentSet = new Set(current.following || []);
        const desiredSet = followingSet;

        
        const toFollow = [...desiredSet].filter(x => !currentSet.has(x));
        
        const toUnfollow = [...currentSet].filter(x => !desiredSet.has(x));

        for (const t of toFollow) {
            
            await followUser(Number(userId), t);
        }
        for (const t of toUnfollow) {
            await unfollowUser(Number(userId), t);
        }

        alert('Updated user profile and following list.');
        navigate('/');
    }

    if (!user) return <p>Loading...</p>;

    return (
        <div>
            <h2>Edit User #{userId}</h2>
            <form onSubmit={handleSubmit}>
                <div><label>Name</label><br /><input value={name} onChange={e => setName(e.target.value)} required /></div>
                <div><label>Email</label><br /><input value={email} onChange={e => setEmail(e.target.value)} required /></div>
                <div><label>Phone</label><br /><input value={phone} onChange={e => setPhone(e.target.value)} /></div>
                <div><label>DOB</label><br /><input type="date" value={dob} onChange={e => setDob(e.target.value)} /></div>
                <div><label>Avatar</label><br /><input type="file" accept="image/*" onChange={onFileChange} /></div>
                {preview && <div style={{ marginTop: 8 }}><img src={preview} width="120" alt="preview" /></div>}

                <h3 style={{ marginTop: 20 }}>Following</h3>
                <p>Select the users this user should follow (check/uncheck):</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                    {allUsers.filter(u => u.id !== Number(userId)).map(u => (
                        <label key={u.id} style={{ border: '1px solid #eee', padding: 8 }}>
                            <input
                                type="checkbox"
                                checked={followingSet.has(u.id)}
                                onChange={() => toggleFollowingCheckbox(u.id)}
                            /> {u.name} (id:{u.id}) — Followers: {u.followers}
                        </label>
                    ))}
                </div>

                <div style={{ marginTop: 12 }}>
                    <button type="submit">Save</button>
                </div>
            </form>
        </div>
    );
}
