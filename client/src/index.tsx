import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { VolunteerAppWithRouter } from './VolunteerApp';
import { BrowserRouter } from 'react-router-dom';
import "./style.css"


const main: HTMLElement|null = document.getElementById('main');
if (main === null)
  throw new Error("Uh oh! HTML is missing 'main' element");

const root: Root = createRoot(main);
root.render(<React.StrictMode>
  <BrowserRouter>
    <VolunteerAppWithRouter/>
  </BrowserRouter>
</React.StrictMode>);
