import { Link, useLocation } from 'wouter';
import { trpc } from '@web/trpc.ts';
import { Spinner } from '@web/components/Spinner.tsx';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { saveSessionId } from '@web/lib/auth.ts';

type Props = {
	onHomeClick?: () => void | Promise<void>;
};

export const Navbar: React.FC<Props> = ({ onHomeClick }) => {
	// console.log('Navbar', onHomeClick);

	const [, setLocation] = useLocation();

	const { data, isLoading, error, mutate } = trpc.users.me.useSWR();
	const { trigger } = trpc.anon.newAccount.useSWRMutation();

	const goHome = async () => {
		if (onHomeClick) {
			// toast("Saving your game's progress...");
			await onHomeClick();
		}
		setLocation('/');
	};

	const loginAnon = async () => {
		const result = await trigger();
		if (result.type === 'error') {
			toast.error('Error: ' + result.error, {
				id: `anon-acct-creation-error-${result.error}`,
			});
		} else {
			saveSessionId(result.token);
			toast.success('Created anonymous account.', {
				id: 'anon-acct-created',
			});
			mutate();
		}
	};

	useEffect(() => {
		if (
			!isLoading &&
			data &&
			data.type === 'error' &&
			data.code === 'NO_USER'
		) {
			loginAnon();
		}
	}, [data, isLoading]);

	return (
		<div className='bg-background-900 sticky top-0 px-5 py-2 flex items-center justify-between z-50'>
			<button onClick={goHome}>
				<h5 className='cursor-pointer hover:text-primary-500'>
					AltRanked
				</h5>
			</button>
			<div>
				{isLoading && (
					<Spinner
						textColor='text-background-800'
						fillColor='fill-accent-500'
					/>
				)}
				{data?.type === 'error' && (
					<div className='bg-red-950 animate-pulse rounded-lg px-3 py-1 cursor-not-allowed'>
						<h6>{data.error}</h6>
					</div>
				)}
				{data?.type === 'success' && (
					<Link
						href={
							data.user.type === 'anon' ? '/login' : '/profile'
						}>
						<div className='bg-primary-500 text-text-950 hover:bg-primary-900 hover:text-text-50 rounded-lg px-3 py-1 cursor-pointer'>
							{data.user.type === 'anon' && <h6>Login</h6>}
							{data.user.type === 'altranked' && (
								<h6>{data.user.username}</h6>
							)}
						</div>
					</Link>
				)}
				{error && (
					<div className='bg-red-950 animate-pulse rounded-lg px-3 py-1 cursor-not-allowed'>
						<h6>Unexpected Error</h6>
					</div>
				)}
			</div>
		</div>
	);
};
