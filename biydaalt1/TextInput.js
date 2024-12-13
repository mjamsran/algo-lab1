import React, { useState } from 'react';
import './TextInput.css'; // Importing the CSS file for styling

function TextInput() {
  const [value, setValue] = useState('');

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  return (
    <div className="container">
      <div className="input-wrapper">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="Enter some text"
        />
        <p>You entered: {value}</p>
      </div>
    </div>
  );
}

export default TextInput;
