import { Navbar } from '@web/components/Navbar.tsx';
import { Error, Form, Input, Submit } from '@web/components/Forms.tsx';
import { Link } from '@web/components/Link.tsx';
import { trpc } from '@web/trpc.ts';
import { useState } from 'react';
import { useLocation } from 'wouter';
import toast from 'react-hot-toast';
import { saveSessionId } from '@web/lib/auth.ts';

export const RegisterPage = () => {
	const { mutate } = trpc.users.me.useSWR();
	const { trigger } = trpc.auth.register.useSWRMutation();

	const [, setLocation] = useLocation();

	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	const register = async () => {
		const res = await trigger({ username, email, password });
		if (res.type === 'error') {
			setError(res.error);
			toast.error(res.error);
		} else {
			setError('');
			mutate();
			toast.success('Registered!');
			saveSessionId(res.token);
			setLocation('/');
		}
	};

	return (
		<div>
			<Navbar />
			<div className='w-screen h-[94vh] flex justify-center items-center'>
				<div className='bg-background-800 rounded p-4 max-w-[90vw] md:max-w-[70vw] lg:max-w-[50vw] xl:max-w-[40vw]'>
					<h4>Register for AltRanked</h4>
					<p>
						All your local games will be automatically transferred
						to your new account.
					</p>
					<Form onSubmit={register}>
						<Input label='Username' onChange={setUsername} />
						<Input label='Email' type='email' onChange={setEmail} />
						<Input
							label='Password'
							type='password'
							onChange={setPassword}
						/>
						<Submit>Register</Submit>
					</Form>
					<Error message={error} />
					<Link href={'/login'}>
						Already have an account? Login here.
					</Link>
				</div>
			</div>
		</div>
	);
};
