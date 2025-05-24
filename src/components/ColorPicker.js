import React from 'react';
import { ChromePicker } from 'react-color';

function ColorPicker({ color = '#1976d2', onChange = () => {} }) {
  return (
    <ChromePicker
      color={color}
      onChange={onChange}
    />
  );
}

export default ColorPicker; 