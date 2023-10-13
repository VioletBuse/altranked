import { trpc } from '@web/trpc.ts';
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Spinner } from '@web/components/Spinner.tsx';
import { Navbar } from '@web/components/Navbar.tsx';
import { clearSessionId } from '@web/lib/auth.ts';
import toast from 'react-hot-toast';

export const ProfilePage = () => {
	const { data: userData, mutate: mutateUserData } = trpc.users.me.useSWR();
	const [, setLocation] = useLocation();

	useEffect(() => {
		if (
			userData &&
			(userData.type !== 'success' || userData.user.type === 'anon')
		) {
			setLocation('/login');
		}
	}, [userData, setLocation]);

	const loading = !userData;

	const logout = async () => {
		clearSessionId();
		toast.success('Logged out.');
		await mutateUserData();
		setLocation('/');
	};

	return (
		<>
			{loading && (
				<div className='w-screen h-screen flex justify-center items-center'>
					<Spinner
						size='md'
						textColor='text-background-800'
						fillColor='fill-accent-500'
					/>
				</div>
			)}
			{!loading && (
				<div>
					<Navbar />
					<div className='px-4 py-2'>
						<h4>Profile</h4>
						<button
							className='bg-primary-500 text-text-900 rounded px-3 py-1 hover:bg-primary-900 hover:text-text-50'
							onClick={logout}>
							Logout
						</button>
					</div>
				</div>
			)}
		</>
	);
};
