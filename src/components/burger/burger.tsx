import React from 'react';
import './Burger.css';

const Burger: React.FC = () => {
  return (
    <div className="burger">
      <div className="bun-top">
        <div className="sesame"></div>
        <div className="sesame"></div>
        <div className="sesame"></div>
        <div className="sesame"></div>
        <div className="sesame"></div>
      </div>
      <div className="lettuce"></div>
      <div className="cheese"></div>
      <div className="tomato"></div>
      <div className="patty"></div>
      <div className="bun-bottom"></div>
    </div>
  );
};

export default Burger;