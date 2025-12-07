import React from 'react';

export default function ChatSidebar({ users, activeUser, onSelectUser }) {
    if (!users || users.length === 0) {
        return (
            <aside className="chat-sidebar">
                <header>
                    <h3>Messages</h3>
                </header>
                <div className="chat-users-list">
                    <p style={{ padding: '20px', color: 'var(--color-text-light)' }}>
                        No mutual recommendations found.
                    </p>
                </div>
            </aside>
        );
    }

    return (
        <aside className="chat-sidebar">
            <header>
                <h3>Messages</h3>
            </header>
            <div className="chat-users-list">
                {users.map((user, idx) => (
                    <div
                        key={idx}
                        className={`chat-user-item ${activeUser && activeUser.name === user.name ? 'active' : ''}`}
                        onClick={() => onSelectUser(user)}
                    >
                        <img
                            src={user.photo && user.photo !== "not found" ? user.photo : "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"}
                            alt={user.name}
                            className="chat-user-avatar"
                        />
                        <div className="chat-user-info">
                            <h4>{user.name}</h4>
                            <p>{user.field || "Researcher"}</p>
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
}
