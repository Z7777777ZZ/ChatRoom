import React, { useState } from 'react';
import SetName from './pages/SetName/SetName';
import ChatRoom from './pages/ChatRoom/ChatRoom';


const App: React.FC = () => {
  // 使用状态来追踪当前显示的页面
  const [currentPage, setCurrentPage] = useState<'setname' | 'chatroom'>('setname');
  const [username, setUsername] = useState('');

  // 设置用户名并切换到聊天室页面
  const handleSetUsername = (newUsername: string) => {
    setUsername(newUsername);
    setCurrentPage('chatroom');
  };

  return (
 
      <div>
        {currentPage === 'setname' && <SetName onSetUsername={handleSetUsername} />}
        {currentPage === 'chatroom' && <ChatRoom username={username} roomName='默认房间' />}
      </div>
   
  );
};

export default App;

