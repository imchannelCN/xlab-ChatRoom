import React, { useState } from 'react';
import './SetName.css';

interface SetNameProps {
  onSetName: (name: string) => void;
}

const SetName: React.FC<SetNameProps> = ({ onSetName }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = () => {
    onSetName(inputValue);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // 阻止默认行为，如表单提交
      handleSubmit();
    }
  };

  return (
    <div className="Wrapper">
      <div className="container">
        <h1>Welcome!🤗🤗🤗</h1>
        <div className="input-group">
          <input required={true} style={{width:'50%', color:"white"}} type="text" name="text" autoComplete="off" className="input" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown}/>
          <label style={{left:'80px'}} className="user-label">Enter your name</label>
          <button onClick={handleSubmit}>GO!</button>
        </div>
      </div>
    </div>
  );
};

export default SetName;