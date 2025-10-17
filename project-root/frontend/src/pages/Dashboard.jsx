import React, { useEffect, useState } from 'react';
import { fetchUsers, deleteUser, followUser, unfollowUser, fetchFollowing } from '../api/users';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const [users, setUsers] = useState([]);
    const [activeUserId, setActiveUserId] = useState(null); // simulate login
    const [activeFollowings, setActiveFollowings] = useState(new Set());
    const API_BASE = import.meta.env.VITE_API_BASE.replace('/api', '');

    
    async function load() {
        const data = await fetchUsers();
        setUsers(data);
        if (!activeUserId && data.length > 0) {
            setActiveUserId(prev => prev || data[0].id);
        }
    }

    useEffect(() => { load(); }, []);

   
    useEffect(() => {
        if (!activeUserId) return;
        (async () => {
            try {
                const res = await fetchFollowing(activeUserId);
                setActiveFollowings(new Set(res.following || []));
            } catch (err) {
                console.error(err);
            }
        })();
    }, [activeUserId]);

    
    async function handleDelete(id) {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        await deleteUser(id);
        if (id === activeUserId) setActiveUserId(null);
        await load();
    }

   
    async function toggleFollow(targetId) {
        if (!activeUserId) {
            alert('Please select an active user from the dropdown first.');
            return;
        }
        const isFollowing = activeFollowings.has(targetId);
        const updatedSet = new Set(activeFollowings);
        if (isFollowing) updatedSet.delete(targetId);
        else updatedSet.add(targetId);
        setActiveFollowings(updatedSet);

        try {
            if (isFollowing) {
                await unfollowUser(activeUserId, targetId);
            } else {
                await followUser(activeUserId, targetId);
            }
            const updatedUsers = await fetchUsers();
            setUsers(updatedUsers);
        } catch (err) {
            console.error('Follow/Unfollow error:', err);
            alert('Error updating follow');
        }
    }

    return (
        <div>
            <h2>All Users</h2>

            
            <div style={{ marginBottom: '1rem' }}>
                <label style={{ marginRight: 8, fontWeight: 500 }}>Active user (simulate login):</label>
                <select
                    value={activeUserId || ''}
                    onChange={e => setActiveUserId(Number(e.target.value) || null)}
                >
                    <option value="">-- Select user --</option>
                    {users.map(u => (
                        <option key={u.id} value={u.id}>
                            {u.name} (id:{u.id})
                        </option>
                    ))}
                </select>
                <button className="btn btn-outline" style={{ marginLeft: 10 }} onClick={load}>Refresh</button>
            </div>

            
            <div className="user-grid">
                {users.map(u => (
                    <div key={u.id} className="card">
                        {u.avatar_url && (
                            <img
                                src={`${API_BASE}${u.avatar_url}`}
                                alt="avatar"
                                className="avatar"
                            />
                        )}

                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{u.name}</div>
                            <div>{u.email}</div>
                            <div>{u.phone}</div>
                            <div>Age: {u.age ?? '-'}</div>
                            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                                Followers: {u.followers} | Following: {u.following}
                            </div>

                            <div style={{ marginTop: 8 }}>
                                <Link to={`/edit/${u.id}`} className="btn btn-outline">Edit</Link>
                                <button className="btn btn-danger" onClick={() => handleDelete(u.id)}>Delete</button>

                                {activeUserId && activeUserId !== u.id && (
                                    <button
                                        className={`btn ${activeFollowings.has(u.id) ? 'btn-outline' : 'btn-primary'}`}
                                        onClick={() => toggleFollow(u.id)}
                                    >
                                        {activeFollowings.has(u.id) ? 'Unfollow' : 'Follow'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {users.length === 0 && <p>No users found.</p>}
            </div>
        </div>
    );
}


