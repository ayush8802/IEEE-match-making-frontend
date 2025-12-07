import React, { useState, useEffect, useRef } from 'react';

export default function ChatWindow({ activeUser, messages, onSendMessage }) {
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim()) {
            onSendMessage(inputValue);
            setInputValue("");
        }
    };

    if (!activeUser) {
        return (
            <main className="chat-window">
                <div className="empty-chat">
                    <p>Select a researcher to start chatting</p>
                </div>
            </main>
        );
    }

    return (
        <main className="chat-window">
            <header className="chat-header">
                <img
                    src={activeUser.photo && activeUser.photo !== "not found" ? activeUser.photo : "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"}
                    alt={activeUser.name}
                    style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                />
                <h3>{activeUser.name}</h3>
            </header>

            <div className="messages-list">
                {(!messages || messages.length === 0) && (
                    <p style={{ textAlign: 'center', color: 'var(--color-text-light)', marginTop: '20px' }}>
                        Start a conversation with {activeUser.name}!
                    </p>
                )}

                {messages && messages.map((msg) => (
                    <div key={msg.id} className={`message ${msg.sender === 'me' ? 'sent' : 'received'}`}>
                        {msg.text}
                        <span className="message-time">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    autoFocus
                />
                <button type="submit" className="send-btn" aria-label="Send">
                    ➤
                </button>
            </form>
        </main>
    );
}
