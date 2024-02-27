import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import './ChatRoom.css';

// 单条消息接口
interface Message {
    messageId: number;
    content: string; // 消息内容
    uname: string; // 用户名
}

// 定义ChatRoom接口
interface ChatRoomProps {
    roomName: string;
    username: string; // 添加用户名属性
}

// 定义房间接口
interface Room {
    name: string;
    roomId: number;
    messages: Message[];
}

// ChatRoom组件定义，实现消息发送、房间切换、房间删除功能。
const ChatRoom: React.FC<ChatRoomProps> = ({ roomName, username }) => {
    // 使用SWR进行数据请求
    const { data: rooms, mutate: mutateRooms } = useSWR<Room[]>('/api/room/list');
    const [currentRoom, setCurrentRoom] = useState<Room | null>(rooms ? rooms[0] : null);
    const [inputMessage, setInputMessage] = useState('');

    // 处理发送消息的函数
    const handleSendMessage = async () => {
        // 检查是否输入消息，并且是否选中了房间
        if (inputMessage.trim() !== '' && currentRoom) {
            // 如果满足，则新建消息
            const newMessage: Message = {
                messageId: currentRoom.messages.length + 1,
                content: inputMessage,
                uname: username, // 使用当前用户的用户名
            };

            try {
                // 发送消息的API端点，假设是 /api/message/add
                const response = await fetch('/api/message/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newMessage),
                });

                if (response.ok) {
                    // 数据发送成功后，使用SWR的mutate来重新获取数据
                    mutateRooms();
                } else {
                    // 处理错误
                    console.error('发送消息失败');
                }
            } catch (error) {
                console.error('发送消息失败:', error);
            }

            setInputMessage('');
        }
    };

    // 处理新增房间的函数
    const handleAddRoom = async () => {
        const newRoomName = prompt('请输入新房间的名称');
        // 新增房间
        if (newRoomName && !rooms?.find((room) => room.name === newRoomName)) {
            try {
                // 新增房间的API端点，假设是 /api/room/add
                const response = await fetch('/api/room/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ user: username, roomName: newRoomName }),
                });

                if (response.ok) {
                    // 数据发送成功后，使用SWR的mutate来重新获取数据
                    mutateRooms();
                } else {
                    // 处理错误
                    console.error('新增房间失败');
                }
            } catch (error) {
                console.error('新增房间失败:', error);
            }
        }
    };

    // 处理删除房间的函数
    const handleDeleteRoom = async () => {
        if (currentRoom) {
            try {
                // 删除房间的API端点，假设是 /api/room/delete
                const response = await fetch('/api/room/delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ user: username, roomId: currentRoom.roomId }),
                });

                if (response.ok) {
                    // 数据发送成功后，使用SWR的mutate来重新获取数据
                    mutateRooms();
                    setCurrentRoom(null);
                } else {
                    // 处理错误
                    console.error('删除房间失败');
                }
            } catch (error) {
                console.error('删除房间失败:', error);
            }
        }
    };

    // 获取某一房间的历史消息的函数
    const fetchRoomMessages = async (roomId: number) => {
        try {
            // 获取某一房间历史消息的API端点，假设是 /api/room/message/list
            const response = await fetch(`/api/room/message/list?roomId=${roomId}`);
            if (response.ok) {
                const roomMessages: Message[] = await response.json();
                // 更新当前房间的消息列表
                setCurrentRoom((prevRoom) => {
                    if (prevRoom) {
                        return {
                            ...prevRoom,
                            messages: roomMessages,
                        };
                    }
                    return null;
                });
            } else {
                // 处理错误
                console.error('获取历史消息失败');
            }
        } catch (error) {
            console.error('获取历史消息失败:', error);
        }
    };

    // 切换房间时触发获取历史消息
    const handleSwitchRoom = (room: Room) => {
        setCurrentRoom(room);
        fetchRoomMessages(room.roomId);
    };

    // 渲染组件
    return (
        // 房间列表
        <div className="chatRoom">
            <div className="roomList">
                <button className="addRoomButton" onClick={handleAddRoom}>
                    添加房间
                </button>
                {rooms?.map((room) => (
                    <div
                        key={room.name}
                        className={`room ${currentRoom?.name === room.name ? 'active' : ''}`}
                        onClick={() => handleSwitchRoom(room)}
                    >
                        <span>{room.name}</span>
                        <button className="deleteRoomButton" onClick={handleDeleteRoom}>
                            删除
                        </button>
                    </div>
                ))}
            </div>
            {/* 消息列表 */}
            <div className="chatWindow">
                <div className="roomName">{currentRoom?.name}</div>
                <div className="messageList">
                    {currentRoom?.messages.map((message) => (
                        <div
                            key={message.messageId}
                            className={`message ${message.uname === username ? 'sentMessage' : 'receivedMessage'}`}
                        >
                            {`${message.uname}: ${message.content}`}
                        </div>
                    ))}
                </div>
                <div className="fixedBottom">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="输入消息"
                    />
                    <button onClick={handleSendMessage}>发送</button>
                </div>
            </div>
        </div>
    );
};

export default ChatRoom;
