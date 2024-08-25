import React, { useState } from 'react';
import './ChatRoom.css';
import useSWR, {mutate} from 'swr';
import { useEffect , useRef } from 'react';

const url = 'https://chatroom.zjuxlab.com';
var AUserName: string = "";
var currentRoomName = "";

interface currentRoomIdProps {
  currentRoomId: number | null; // 添加 currentRoomId 属性
  setCurrentRoomId: React.Dispatch<React.SetStateAction<number | null>>; // 添加 setCurrentRoomId 属性
}

interface Message
{
    messageId: number;
    roomId: number;
    sender: string;
    content: string;
    time: number;
}

interface RoomPreviewInfo
{
    roomId: number;
    roomName: string;
    lastMessage: Message | null;
}

function fetcher(Aurl: string) {
    return fetch(Aurl).then(res => res.json());
}

function timestampToDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  return `${year}-${month < 10 ? '0' + month : month}-${day<10 ? '0' + day : day}\n${hour < 10 ? '0' + hour : hour}:${minute<10 ? '0' + minute : minute}:${second < 10 ? '0' + second : second}`;
}

interface RoomEntryProps extends RoomPreviewInfo, currentRoomIdProps {
  // currentRoomId 属性已经在 currentRoomIdProps 接口中定义
}

// RoomEntry 组件
function RoomEntry(props: RoomEntryProps)
{
  const ChangeCurrentRoomId = () => {
    props.setCurrentRoomId(props.roomId);
    console.log("now room id:" + props.roomId);
    currentRoomName = props.roomName;
  }

  return (
      <div className="room-entry" onClick={ChangeCurrentRoomId}>
        <div className="room-entry-header">
          <div className="room-entry-name">{props.roomName.length > 10 ? props.roomName.substring(0, 10) + '...' : props.roomName}</div>
          <div className="room-entry-time">
            {/* 假设 time 是以毫秒为单位的时间戳，这里除以 1000 转换为秒 */}
            {timestampToDateTime(props.lastMessage?.time ?? 0)}
          </div>
        </div>
        <div className="room-entry-lastmessage">{(props?.lastMessage?.sender ?? "noname") + ": " + (((props.lastMessage?.content.length ?? 0 )> 15)?(props.lastMessage?.content.substring(0, 10) + '...' ): (props.lastMessage?.content ?? "No message."))}</div>
      </div>
    );
};


function AddPage()
{
  const [inputValue, setInputValue] = useState('');
  
  const handleSubmit = () => {
    fetch(`${url}/api/room/add`, {
      method: 'POST', // 指定请求方法
      headers: {
        'Content-Type': 'application/json', // 设置头部信息
      },
      body: JSON.stringify({
        user: AUserName,
        roomName: inputValue, // 请求体中的参数
      }),
    });
    setInputValue('');
  };
  
    return (
      <div className="CreateRoomContainer">
        <div className="input-group">
          <input required={true} type="text" name="text" autoComplete="off" className="input" value={inputValue} onChange={(e) => setInputValue(e.target.value)} /*onKeyDown={handleKeyDown}*//>
          <label className="user-label">Enter New Room's Name</label>
          <button onClick={handleSubmit}>Create</button>
        </div>
      </div>
    )
}

function LeftSide({ currentRoomId, setCurrentRoomId }: currentRoomIdProps)
{
  const { data, error } = useSWR(`${url}/api/room/list`, fetcher,{ refreshInterval: 500 });
  
    useEffect(() => {
      console.log(data); // 这将在data更新后打印其值
    }, [data]);
  
  
    return (
      <>
        <div className="ListContainer">
          <AddPage />
          <div className="room-list">
            {data?.data?.rooms?.map((room: RoomPreviewInfo) => ( <RoomEntry key={room.roomId} {...room} currentRoomId={currentRoomId} setCurrentRoomId={setCurrentRoomId} />
            ))}
          </div>
        </div>
      </>
    )
}

function ShowMessage(AMessage: Message) {
  return (
    <div className="message">
      <div>
        <span className="sender">{AMessage.sender}</span>
        <span className="time">{timestampToDateTime(AMessage.time)}</span>
      </div>
      <span className="content">{AMessage.content}</span>
    </div>
  );
}

function RightSideDefault({currentRoomId,setCurrentRoomId}:currentRoomIdProps)
{
  return (
    <div className="ChatContainer" onClick={() => { console.log(currentRoomId) }}></div>
  )
}

function RightSide({ currentRoomId, setCurrentRoomId }: currentRoomIdProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const messageListRef = useRef<HTMLDivElement | null>(null);

  const handleSubmit = () => {
    fetch(`${url}/api/message/add`,{
      method: 'POST', // 指定请求方法
      headers: {
        'Content-Type': 'application/json', // 设置头部信息
      },
      body: JSON.stringify({
        roomId: currentRoomId, // 请求体中的参数
        content: inputValue,
        sender: AUserName,
      }),
    });
    setInputValue('');
    setCurrentRoomId(currentRoomId);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  // 加载聊天室消息的函数
  const { data, error } = useSWR(`${url}/api/room/message/list?roomId=${currentRoomId}`, fetcher, { refreshInterval: 500 });

  // 组件挂载后获取消息
  useEffect(() =>
  {
    console.log(data);
  }, [data]);

  // 确保滚动条在最底端
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [currentRoomId]);

  // 删除聊天室的函数
  const deleteRoom = async () =>
  {
    fetch(`${url}/api/room/delete`, {
      method: 'POST', // 指定请求方法
      headers: {
        'Content-Type': 'application/json', // 设置头部信息
      },
      body: JSON.stringify({
        user: AUserName,
        roomId: currentRoomId, // 请求体中的参数
      }),
    })
      .then(() => setCurrentRoomId(null));
  };


  return (
    <div className="ChatContainer">
      <div className="title-and-delete">
        <div className="title">{currentRoomName}</div>
        <button className="delete-button" onClick={deleteRoom}>
          Delete
        </button>
      </div>
      <div className="message-list" ref={messageListRef}>
        {data?.data?.messages.map((msg: Message) => (
          <ShowMessage {...msg} />
        ))}
      </div>
      <div className="input-and-send">
        <div className="input-group" style={{width:"100%"}}>
          <input required={true} type="text" name="text" autoComplete="off" className="input" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} />
          <label style={{left:"80px"}} className="user-label">Enter Something</label>
          <button onClick={handleSubmit}>Send</button>
      </div>
      </div>
    </div>
  );
}
export default function ChatRoom({ UserName }: { UserName: string }) 
{
  AUserName = UserName;
  const [currentRoomId, setCurrentRoomId] = useState<number | null>(null);

  return (
    <>
      <div className="ParentContainer">
        <LeftSide currentRoomId={currentRoomId} setCurrentRoomId={setCurrentRoomId} />
        {currentRoomId !== null && <RightSide currentRoomId={currentRoomId} setCurrentRoomId={setCurrentRoomId}/>}
        {currentRoomId === null && <RightSideDefault currentRoomId={currentRoomId} setCurrentRoomId={setCurrentRoomId}/>}
      </div>
    </>
  );
}
