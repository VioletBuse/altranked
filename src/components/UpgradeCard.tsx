import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { numberFormatter } from '@web/lib/format.ts';
import * as Progress from '@radix-ui/react-progress';

// const baseFormatter = Intl.NumberFormat('en', {});
// const compactFormatter = Intl.NumberFormat('en', {
// 	notation: 'compact',
// });

type Props = {
	name: string;
	count: number;
	cost: number;
	score: number;
	amount: number;
	duration: number;
	secondsToProc: number;
	percentageToProc: number;
	percentageToCost: number;
	upgrade: () => void;
};

export const UpgradeCard: React.FC<Props> = ({
	name,
	count,
	cost,
	score,
	amount,
	duration,
	secondsToProc,
	percentageToProc,
	percentageToCost,
	upgrade,
}) => {
	const formattedDuration = useMemo(() => {
		if (duration < 60) return `${duration} seconds`;
		if (duration < 3600) return `${(duration / 60).toFixed(1)} minutes`;
		if (duration < 86400) return `${(duration / 3600).toFixed(1)} hours`;
		return `${(duration / 86400).toFixed(1)} days`;
	}, [duration]);

	const formattedSecondsToProc = useMemo(() => {
		if (secondsToProc < 60) return `${secondsToProc.toFixed(1)} seconds`;
		if (secondsToProc < 3600)
			return `${(secondsToProc / 60).toFixed(1)} minutes`;
		if (secondsToProc < 86400)
			return `${(secondsToProc / 3600).toFixed(1)} hours`;
		return `${(secondsToProc / 86400).toFixed(1)} days`;
	}, [secondsToProc]);

	const missing = useMemo(() => {
		return cost - score;
	}, [cost, score]);

	return (
		<>
			<div>
				<motion.div
					whileHover={{ scale: 1.01 }}
					whileTap={{ scale: 0.98 }}
					className='bg-background-800 p-4 rounded mt-2 z-0'>
					<h3>
						{name} <span className='text-text-300'>x{count}</span>
					</h3>
					{count > 0 && (
						<>
							<Progress.Root
								className='rounded-full bg-primary-500 overflow-hidden'
								max={1}
								value={percentageToProc}>
								<Progress.Indicator
									className='bg-background-900 h-3'
									style={{
										transform: `translateX(${
											percentageToProc * 100
										}%)`,
										transition: 'transform 250ms linear',
									}}></Progress.Indicator>
							</Progress.Root>
							<p>
								+{numberFormatter(count * amount)} RR in{' '}
								{formattedSecondsToProc}
							</p>
						</>
					)}
					{count < 1 && (
						<div className='py-1 px-3'>
							<p className=''>
								+ {numberFormatter(amount)} RR every{' '}
								{formattedDuration}
							</p>
						</div>
					)}
					{percentageToCost >= 1 && (
						<motion.button
							className='mt-2 bg-primary-500 text-text-900 hover:bg-background-500 duration-100 rounded px-3 py-1'
							onClick={upgrade}>
							Buy for {numberFormatter(cost)} RR
						</motion.button>
					)}
					{percentageToCost < 1 && (
						<p className='mt-2 bg-background-800 text-text-300 hover:bg-background-900 duration-100 rounded px-3 py-1 cursor-not-allowed'>
							<span className='text-primary-500'>
								Cost {numberFormatter(cost)} RR
							</span>{' '}
							<span className='text-text-50'>
								Missing {numberFormatter(missing)} RR
							</span>
						</p>
					)}
				</motion.div>
			</div>
		</>
	);
};
