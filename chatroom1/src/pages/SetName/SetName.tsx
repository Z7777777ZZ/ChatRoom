import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import './SetName.css';

interface SetNameProps {
    onSetUsername: (username: string) => void;
}

const SetName: React.FC<SetNameProps> = ({ onSetUsername }) => {
    const [username, setUsername] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (username.trim() !== '') {
            // 假设后端接口是 /api/setUsername
            const response = await fetch('/api/setUsername', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username }),
            });

            if (response.ok) {

                onSetUsername(username);


                mutate('/api/your-data-endpoint');
            } else {
                // 处理错误
                console.error('设置用户名失败');
            }
        }
    };

    return (
        <div className="setName">
            <h2>设置用户名</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="username">(不超过10个字符)</label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <button type="submit">OKK</button>
            </form>
        </div>
    );
};

export default SetName;
