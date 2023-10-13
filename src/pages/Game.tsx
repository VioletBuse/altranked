import { Navbar } from '@web/components/Navbar.tsx';
import { motion, useAnimate } from 'framer-motion';
import { Spinner } from '@web/components/Spinner.tsx';
import { useGame_2 } from '@web/hooks/useGame_2.ts';
import { upgrades } from '@web/constants.ts';
import { useCallback, useEffect, useMemo, useState } from 'react';
import CountUp from 'react-countup';
import { UpgradeCard } from '@web/components/UpgradeCard.tsx';
import { rankImagesArray, rankNamesArray } from '@web/rank_images.tsx';
import { numberFormatter } from '@web/lib/format.ts';

type Props = {
	id: string;
};

export const GamePage: React.FC<Props> = ({ id }) => {
	const game = useGame_2(id);
	const [scope, animate] = useAnimate();

	const [last, setLast] = useState(0);
	const [current, setCurrent] = useState(0);

	const [rankImage] = useMemo(() => {
		if (game.state.score === 0)
			return [rankImagesArray[0], rankNamesArray[0]];

		const log = Math.log10(game.state.score);
		const rank = Math.floor(log);
		return [rankImagesArray[rank], rankNamesArray[rank]];
	}, [game.state.score, rankImagesArray]);

	const [nextRankName, nextRankScore, missingRankForRankup] = useMemo(() => {
		const log = Math.log10(game.state.score);
		const rank = Math.floor(log);
		const val = Math.pow(10, rank + 1);
		const missing = val - game.state.score;
		return [
			rankNamesArray[rank + 1],
			numberFormatter(val),
			numberFormatter(missing),
		];
	}, [game.state.score]);

	useEffect(() => {
		setLast(current);
		setCurrent(game.state.score);
	}, [game.state.score]);

	useEffect(() => {
		(async () => {
			await Promise.all([
				animate(
					'#rank_img',
					{
						scale: [0.8, 1.5, 1],
					},
					{ duration: 0.5 },
				),
			]);
		})();
	}, [animate, rankImage]);

	useEffect(() => {
		rankImagesArray.forEach((img) => {
			new Image().src = img;
		});
	}, [rankImagesArray]);

	const formattingFn = useCallback((num: number) => {
		return numberFormatter(num);
	}, []);

	return (
		<div ref={scope}>
			{game.loading && (
				<>
					<Navbar />
					<div className='w-screen h-[94vh] flex items-center justify-center'>
						<Spinner
							size='lg'
							textColor='text-background-600'
							fillColor='fill-primary-500'
						/>
					</div>
				</>
			)}
			{!game.loading && (
				<>
					<Navbar onHomeClick={game.functions.save} />
					<div className='sticky top-11 bg-background-950 z-20'>
						<div className='px-4 pt-4'>
							<div
								id='rank_container'
								className='flex flex-col md:flex-row items-center justify-center gap-x-5 gap-y-2 bg-background-800 rounded md:w-fit p-2'>
								<div className='flex flex-row gap-x-2'>
									<img
										id='rank_img'
										className='h-14'
										src={rankImage}
										alt='rank'
									/>
									<CountUp
										className='leading-none text-4xl'
										formattingFn={formattingFn}
										suffix=' RR'
										duration={0.6}
										start={last}
										end={current}
									/>
								</div>
								<motion.button
									whileHover={{}}
									whileTap={{ scale: 0.95 }}
									onClick={game.functions.click}
									className='bg-primary-500 text-text-900 hover:bg-primary-900 hover:text-text-300 duration-100 text-2xl rounded px-6 py-3 w-full md:w-fit'>
									Play Ranked{' '}
									<span className='text-primary-800'>
										(+1 RR)
									</span>
								</motion.button>
							</div>
							<p className='text-xl mt-2 text-text-200'>
								Rankup to{' '}
								<span className='text-primary-500'>
									{nextRankName}
								</span>{' '}
								at{' '}
								<span className='text-primary-500'>
									{nextRankScore}
								</span>{' '}
								RR. You need{' '}
								<span className='text-primary-500'>
									{missingRankForRankup}
								</span>{' '}
								more RR to rankup.
							</p>
							<div className=''>
								<h4 className='mt-2'>Upgrades</h4>
							</div>
						</div>
					</div>
					<div className='px-4 pb-4'>
						<UpgradeCard
							name='Aim Training'
							count={game.state.upgrades['1'].count}
							cost={game.state.upgrades['1'].cost}
							score={game.state.score}
							amount={upgrades[1].amt}
							duration={upgrades[1].duration}
							secondsToProc={
								game.state.upgrades['1'].secondsToProc
							}
							percentageToProc={
								game.state.upgrades['1'].percentageToProc
							}
							percentageToCost={
								game.state.upgrades['1'].percentageOfCost
							}
							upgrade={game.functions.upgrade(1)}
						/>
						<UpgradeCard
							name='Vod Review'
							count={game.state.upgrades['2'].count}
							cost={game.state.upgrades['2'].cost}
							score={game.state.score}
							amount={upgrades[2].amt}
							duration={upgrades[2].duration}
							secondsToProc={
								game.state.upgrades['2'].secondsToProc
							}
							percentageToProc={
								game.state.upgrades['2'].percentageToProc
							}
							percentageToCost={
								game.state.upgrades['2'].percentageOfCost
							}
							upgrade={game.functions.upgrade(2)}
						/>
						<UpgradeCard
							name='Implement Pro Strats'
							count={game.state.upgrades['3'].count}
							cost={game.state.upgrades['3'].cost}
							score={game.state.score}
							amount={upgrades[3].amt}
							duration={upgrades[3].duration}
							secondsToProc={
								game.state.upgrades['3'].secondsToProc
							}
							percentageToProc={
								game.state.upgrades['3'].percentageToProc
							}
							percentageToCost={
								game.state.upgrades['3'].percentageOfCost
							}
							upgrade={game.functions.upgrade(3)}
						/>
						<UpgradeCard
							name='Upgrade PC'
							count={game.state.upgrades['4'].count}
							cost={game.state.upgrades['4'].cost}
							score={game.state.score}
							amount={upgrades[4].amt}
							duration={upgrades[4].duration}
							secondsToProc={
								game.state.upgrades['4'].secondsToProc
							}
							percentageToProc={
								game.state.upgrades['4'].percentageToProc
							}
							percentageToCost={
								game.state.upgrades['4'].percentageOfCost
							}
							upgrade={game.functions.upgrade(4)}
						/>
						<UpgradeCard
							name='Tilt Queue'
							count={game.state.upgrades['5'].count}
							cost={game.state.upgrades['5'].cost}
							score={game.state.score}
							amount={upgrades[5].amt}
							duration={upgrades[5].duration}
							secondsToProc={
								game.state.upgrades['5'].secondsToProc
							}
							percentageToProc={
								game.state.upgrades['5'].percentageToProc
							}
							percentageToCost={
								game.state.upgrades['5'].percentageOfCost
							}
							upgrade={game.functions.upgrade(5)}
						/>
						<UpgradeCard
							name='Scrim with Team'
							count={game.state.upgrades['6'].count}
							cost={game.state.upgrades['6'].cost}
							score={game.state.score}
							amount={upgrades[6].amt}
							duration={upgrades[6].duration}
							secondsToProc={
								game.state.upgrades['6'].secondsToProc
							}
							percentageToProc={
								game.state.upgrades['6'].percentageToProc
							}
							percentageToCost={
								game.state.upgrades['6'].percentageOfCost
							}
							upgrade={game.functions.upgrade(6)}
						/>
					</div>
				</>
			)}
		</div>
	);
};
