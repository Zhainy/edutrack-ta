import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { seedDatabase } from '@/shared/mocks/seed-database';
import './app/styles/globals.css';

async function bootstrap() {
  await seedDatabase();

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap().catch(console.error);
