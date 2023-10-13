import React from 'react';
import { Navbar } from '@web/components/Navbar.tsx';
import { trpc } from '@web/trpc.ts';
import { Link, useParams } from 'wouter';
import toast from 'react-hot-toast';
import { Spinner } from '@web/components/Spinner.tsx';
import { useLocation } from '@web/hooks/useLocation.ts';
import { numberFormatter } from '@web/lib/format.ts';

export const HomePage: React.FC = () => {
	const [, setLocation] = useLocation();
	const params = useParams() as unknown as { cursor: string | undefined };

	const {
		data: gamesData,
		isLoading: gamesLoading,
		error: gamesError,
		mutate: gamesMutate,
	} = trpc.games.list.useSWR({
		cursor: params.cursor,
		limit: 10,
	});

	console.log({ gamesData, gamesLoading, gamesError, cursor: params.cursor });

	const nextPageLink = React.useMemo(() => {
		if (gamesData && gamesData.type === 'success') {
			const lastGame = gamesData.data[gamesData.data.length - 1];
			if (lastGame) {
				return `/home/${lastGame.lastUpdatedAt}:${lastGame.createdAt}`;
			} else {
				return '/home';
			}
		} else {
			return '/home';
		}
	}, [gamesData]);

	// console.log({nextPageLink, params})

	const { trigger: createGame } = trpc.games.create.useSWRMutation();
	const [loadingNewGame, setLoadingNewGame] = React.useState(false);

	const create = async () => {
		setLoadingNewGame(true);
		const res = await createGame();
		setLoadingNewGame(false);
		if (res.type === 'error') {
			toast.error(res.error);
		} else {
			gamesMutate();
			const game = res.data;
			toast.success('Game created');
			setLocation(`/game/${game.id}`);
		}
	};

	return (
		<div>
			<Navbar />
			{gamesData &&
				gamesData.type === 'success' &&
				gamesData.data.length > 0 && (
					<div className='px-4 py-2'>
						<button
							onClick={create}
							className='rounded px-7 py-1 flex flex-row gap-x-1 bg-primary-500 hover:bg-primary-100 text-text-900 duration-100'>
							{loadingNewGame && (
								<Spinner
									textColor='text-primary-300'
									fillColor='fill-background-800'
								/>
							)}{' '}
							New Game
						</button>
						{!params.cursor && gamesData.data.length >= 1 && (
							<Link href={`/game/${gamesData.data[0].id}`}>
								<div className='bg-primary-500 hover:bg-background-400 text-text-950 rounded p-6 my-2 cursor-pointer duration-100'>
									<div className='flex flex-row items-center justify-between'>
										<h1>
											{numberFormatter(
												gamesData.data[0].totalScore,
											)}{' '}
											RR{' '}
											<span className='text-primary-800'>
												Earned
											</span>
										</h1>
									</div>
									<div className='flex flex-row items-center justify-between'>
										<h4 className='font-normal'>
											Last Played{' '}
											{new Date(
												gamesData.data[0].lastUpdatedAt,
											).toLocaleDateString()}{' '}
											at{' '}
											{new Date(
												gamesData.data[0].lastUpdatedAt,
											).toLocaleTimeString()}
										</h4>
									</div>
								</div>
							</Link>
						)}
						{gamesData.data
							.slice(params.cursor ? 0 : 1)
							.map((game) => (
								<Link href={`/game/${game.id}`} key={game.id}>
									<div className='rounded p-4 bg-background-800 text-text-50 hover:bg-primary-500 hover:text-text-950 my-2 flex gap-x-2 gap-y-0 flex-col md:flex-row items-start md:items-center md:justify-between cursor-pointer duration-100'>
										<h5>
											{numberFormatter(game.totalScore)}{' '}
											Total RR
										</h5>
										<h5 className='font-normal'>
											last played{' '}
											{new Date(
												game.lastUpdatedAt,
											).toLocaleDateString()}{' '}
											at{' '}
											{new Date(
												game.lastUpdatedAt,
											).toLocaleTimeString()}
										</h5>
										<h5 className='font-normal hidden xl:block'>
											started{' '}
											{new Date(
												game.createdAt,
											).toLocaleDateString()}
										</h5>
									</div>
								</Link>
							))}
						{gamesData.data.length === 10 && (
							<Link href={nextPageLink}>
								<p className='rounded px-7 py-1 w-fit bg-primary-500 hover:bg-primary-200 text-text-900 duration-100'>
									Load More
								</p>
							</Link>
						)}
					</div>
				)}
			{gamesData &&
				gamesData.type === 'success' &&
				gamesData.data.length === 0 && (
					<div className='w-screen h-[94vh] flex items-center justify-center'>
						<button
							onClick={create}
							className='text-xl rounded px-4 py-1 flex flex-row gap-x-1 bg-primary-500 hover:bg-primary-100 text-text-900 duration-100'>
							{loadingNewGame && (
								<Spinner
									size='md'
									textColor='text-primary-300'
									fillColor='fill-background-800'
								/>
							)}{' '}
							New Game
						</button>
					</div>
				)}
			{(!gamesData || (gamesData && gamesData.type === 'error')) && (
				<div className='w-screen h-[94vh] flex items-center justify-center'>
					{(gamesError ||
						(gamesData && gamesData.type === 'error')) && (
						<div className='rounded p-4 bg-red-600 max-w-[90vw] md:max-w-[70vw] lg:max-w-[50vw] xl:max-w-[40vw]'>
							<h5>Error</h5>
							<p>
								{gamesData && gamesData.type === 'error'
									? gamesData.error
									: 'There has been an unknown error.'}
							</p>
						</div>
					)}
					{gamesLoading && (
						<Spinner
							size='md'
							textColor='text-background-700'
							fillColor='fill-primary-500'
						/>
					)}
				</div>
			)}
		</div>
	);
};
