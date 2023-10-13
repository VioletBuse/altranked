import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@web/App.tsx';
import '@web/index.css';

console.log(import.meta.env.VITE_API_DOMAIN);

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
