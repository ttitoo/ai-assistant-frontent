import { createElement } from 'react';
import AddIcon from '@mui/icons-material/Add';
import styled from 'styled-components';

const Button = styled.a`
  width: 64px;
  height: 64px;
  color: #fff;
  background-color: #3f51b5;
  font-size: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

const FloatingMenu = ({ handleClick, icon }) => (
  <div className="fixed bottom-5 right-5">
    <Button className="rounded-full" onClick={handleClick}>
      {createElement(icon || AddIcon, { fontSize: "large" })}
    </Button>
  </div>
);

export default FloatingMenu;
