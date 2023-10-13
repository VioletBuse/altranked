import { Route, Switch } from 'wouter';
import { NotFound } from '@web/pages/NotFound.tsx';
import { HomePage } from '@web/pages/Home.tsx';
import { LoginPage } from '@web/pages/Login.tsx';
import { RegisterPage } from '@web/pages/Register.tsx';
import { SWRConfig } from 'swr';
import { GamePage } from '@web/pages/Game.tsx';
import { trpc } from '@web/trpc.ts';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { ProfilePage } from '@web/pages/Profile.tsx';
import { Default } from '@web/pages/Default.tsx';

function App() {
	const [client] = useState(() => trpc.createClient());

	return (
		<>
			<Toaster
				toastOptions={{
					position: 'top-right',
				}}
			/>
			<SWRConfig
				value={{
					refreshInterval: 1000,
					revalidateIfStale: true,
					revalidateOnFocus: true,
					revalidateOnReconnect: true,
				}}>
				<trpc.Provider client={client}>
					<Switch>
						<Route path='/' component={Default} />
						<Route path='/home' component={HomePage} />
						<Route path='/home/:cursor' component={HomePage} />
						<Route path='/game/:id'>
							{(params: { id: string }) => (
								<GamePage id={params.id} />
							)}
						</Route>
						<Route path='/login' component={LoginPage} />
						<Route path='/register' component={RegisterPage} />
						<Route path='/profile' component={ProfilePage} />
						<Route component={NotFound} />
					</Switch>
				</trpc.Provider>
			</SWRConfig>
		</>
	);
}

export default App;
