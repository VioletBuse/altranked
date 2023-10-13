import { Navbar } from '@web/components/Navbar.tsx';
import { trpc } from '@web/trpc.ts';
import { Link } from '@web/components/Link.tsx';
import { Error, Form, Input, Submit } from '@web/components/Forms.tsx';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useLocation } from 'wouter';
import { saveSessionId } from '@web/lib/auth.ts';

export const LoginPage = () => {
	const { mutate } = trpc.users.me.useSWR();
	const { trigger } = trpc.auth.login.useSWRMutation();

	const [, setLocation] = useLocation();

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	const login = async () => {
		const res = await trigger({ usernameOrEmail: username, password });
		if (res.type === 'error') {
			toast.error(res.error);
			setError(res.error);
		} else {
			setError('');
			mutate();
			toast.success('Logged in!');
			saveSessionId(res.token);
			setLocation('/');
		}
	};

	return (
		<div>
			<Navbar />
			<div className='w-screen h-[94vh] flex justify-center items-center'>
				<div className='bg-background-800 rounded p-4 max-w-[90vw] md:max-w-[70vw] lg:max-w-[50vw] xl:max-w-[40vw]'>
					<h4>Login to AltRanked</h4>
					<p>
						All your local games will be automatically transferred
						to your account.
					</p>
					<Form onSubmit={login}>
						<Input
							label='Email or Username'
							onChange={setUsername}
						/>
						<Input
							label='Password'
							onChange={setPassword}
							type='password'
						/>
						<Submit>Login</Submit>
					</Form>
					<Error message={error} />
					<Link href='/register'>
						Don't have an account? Register here.
					</Link>
				</div>
			</div>
		</div>
	);
};
