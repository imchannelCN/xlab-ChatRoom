import React, { useEffect, useState } from 'react';
import './App.css';
import SetName from './pages/SetName/SetName';
import ChatRoom from './pages/ChatRoom/ChatRoom';

function App() {
  const [UserName, setUserName] = useState<string>("");

  useEffect(() => {
    if (UserName) {
      console.log(UserName);
    }
  })

  return (
    <>
      {!UserName && <SetName onSetName={setUserName}/>}
      {UserName && <ChatRoom UserName={UserName} />}
    </>
  );
}

export default App;
