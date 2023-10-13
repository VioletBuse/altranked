import { useEffect, useMemo, useState } from 'react';
import { client as _client } from '@web/trpc.ts';
import { useImmer } from 'use-immer';
import toast from 'react-hot-toast';
import { upgrades } from '@web/constants.ts';
import { useInterval } from 'usehooks-ts';

type Upgrades = 1 | 2 | 3 | 4 | 5 | 6;

type Result = {
	loading: boolean;
	state: {
		score: number;
		upgrades: {
			[key in Upgrades]: {
				count: number;
				cost: number;
				percentageToProc: number;
				secondsToProc: number;
				percentageOfCost: number;
			};
		};
	};
	functions: {
		click: () => void;
		upgrade: (upgrade: Upgrades, successText?: string) => () => void;
		save: () => Promise<void> | void;
	};
};

type State =
	| {
			loading: 'loading';
			game: null;
	  }
	| {
			loading: 'not-yet';
			game: null;
	  }
	| {
			loading: 'loaded';
			game: {
				score: number;
				upgrades: {
					[key in Upgrades]: {
						count: number;
						lastProc: number;
					};
				};
			};
	  };

export const useGame_2 = (id: string): Result => {
	const [client] = useState(() => _client);

	const [state, setState] = useImmer<State>({
		loading: 'not-yet',
		game: null,
	});

	const [time, setTime] = useState(Date.now());

	const initialize = async () => {
		const loadingToast = toast.loading('Loading game...', {
			id: 'game-loading',
		});
		try {
			setState((draft) => {
				draft.loading = 'loading';
			});
			const res = await client.games.get.query({ id });

			switch (res.type) {
				case 'error': {
					toast.error(res.error, { id: 'game-loaded-error' });
					toast.dismiss(loadingToast);
					return;
				}
				case 'success': {
					setState((draft) => {
						draft.loading = 'loaded';
						draft.game = {
							score: res.data.score,
							upgrades: {
								1: {
									count: res.data.upgrade1,
									lastProc: Date.now(),
								},
								2: {
									count: res.data.upgrade2,
									lastProc: Date.now(),
								},
								3: {
									count: res.data.upgrade3,
									lastProc: Date.now(),
								},
								4: {
									count: res.data.upgrade4,
									lastProc: Date.now(),
								},
								5: {
									count: res.data.upgrade5,
									lastProc: Date.now(),
								},
								6: {
									count: res.data.upgrade6,
									lastProc: Date.now(),
								},
							},
						};
					});
					toast.success('Game loaded.', { id: 'game-loaded' });
					toast.dismiss(loadingToast);
					return;
				}
			}
		} catch (err) {
			console.log({ err });
			toast.error('Failed to load game.', { id: 'game-loaded-failed' });
			toast.dismiss(loadingToast);
		}
	};

	const save = async () => {
		const loadingToast = toast.loading('Saving game...', {
			id: 'game-saving-loading',
		});
		try {
			if (state.game === null) {
				console.log('game not loaded');
				console.log({ state });
				toast.dismiss(loadingToast);
				toast.error('Game not loaded.', {
					id: 'game-saving-not-loaded',
				});
				return;
			}
			const res = await client.games.update.mutate({
				id: id,
				score: state.game.score,
				upgrade1: state.game.upgrades[1].count,
				upgrade2: state.game.upgrades[2].count,
				upgrade3: state.game.upgrades[3].count,
				upgrade4: state.game.upgrades[4].count,
				upgrade5: state.game.upgrades[5].count,
				upgrade6: state.game.upgrades[6].count,
			});

			switch (res.type) {
				case 'error': {
					toast.error(res.error, { id: 'game-saving-error' });
					toast.dismiss(loadingToast);

					if (res.data !== null) {
						setState((draft) => {
							if (draft.loading !== 'loaded') {
								return;
							}

							if (res.data) {
								draft.game.score = res.data.score;
								draft.game.upgrades = {
									1: {
										count: res.data.upgrade1,
										lastProc: Date.now(),
									},
									2: {
										count: res.data.upgrade2,
										lastProc: Date.now(),
									},
									3: {
										count: res.data.upgrade3,
										lastProc: Date.now(),
									},
									4: {
										count: res.data.upgrade4,
										lastProc: Date.now(),
									},
									5: {
										count: res.data.upgrade5,
										lastProc: Date.now(),
									},
									6: {
										count: res.data.upgrade6,
										lastProc: Date.now(),
									},
								};

								toast.success('Loaded most current save');
							}
						});
					}

					return;
				}
				case 'success': {
					toast.success('Game saved.', { id: 'game-saving-success' });
					toast.dismiss(loadingToast);
					return;
				}
			}
		} catch (err) {
			toast.error('Failed to save game.', { id: 'game-saving-failed' });
			toast.dismiss(loadingToast);
		}
	};

	useInterval(save, 1000 * 60 * 2);

	useInterval(() => {
		setState((draft) => {
			if (draft.loading !== 'loaded') {
				return;
			}

			Object.keys(draft.game.upgrades).forEach((upgrade) => {
				const upgradeIdx = parseInt(upgrade) as Upgrades;
				const upgradeData = upgrades[upgradeIdx];
				const upgradeState = draft.game.upgrades[upgradeIdx];

				if (upgradeState.count > 0) {
					const sinceLastProc = Date.now() - upgradeState.lastProc;
					if (sinceLastProc >= upgradeData.duration * 1000) {
						draft.game.score +=
							upgradeState.count * upgradeData.amt;
						upgradeState.lastProc = Date.now();
					}
				}
			});
		});

		setTime(Date.now());
	}, 250);

	const click = () => {
		setState((draft) => {
			if (draft.loading !== 'loaded') {
				return;
			}
			draft.game.score += 1;
		});
	};

	const upgrade = (upgradeIdx: Upgrades, successText?: string) => {
		return async () => {
			console.log('upgrade');
			console.log({ state });

			setState((draft) => {
				if (draft.loading !== 'loaded') {
					return;
				}

				const upgradeData = upgrades[upgradeIdx];
				const upgradeState = draft.game.upgrades[upgradeIdx];

				const upgrade_cost = Math.ceil(
					upgradeData.initCost *
						Math.pow(upgradeData.exp, upgradeState.count),
				);

				console.log('upgrade_cost', upgrade_cost);

				if (draft.game.score < upgrade_cost) {
					console.log('not enough RR');
					toast.error('Not enough RR to buy upgrade.', {
						id: 'upgrade-1-not-enough-rr',
					});
					return;
				}

				draft.game.score -= upgrade_cost;
				upgradeState.count += 1;

				if (successText) {
					toast.success(successText, {
						id: 'upgrade-1-success',
					});
				}
			});

			await save();
		};
	};

	useEffect(() => {
		if (state.loading === 'not-yet') {
			initialize();
		}
	}, [client, state, setState]);

	const result = useMemo((): Result => {
		if (state.loading !== 'loaded') {
			const upgradeDefault = {
				count: 0,
				cost: 0,
				secondsToProc: 0,
				percentageToProc: 0,
				percentageOfCost: 0,
			};

			return {
				loading: true,
				state: {
					score: 0,
					upgrades: {
						1: upgradeDefault,
						2: upgradeDefault,
						3: upgradeDefault,
						4: upgradeDefault,
						5: upgradeDefault,
						6: upgradeDefault,
					},
				},
				functions: {
					click,
					upgrade,
					save,
				},
			};
		}

		const processUpgradeData = (upgradeIdx: Upgrades) => {
			const count = state.game.upgrades[upgradeIdx].count;

			const cost = Math.ceil(
				upgrades[upgradeIdx].initCost *
					Math.pow(
						upgrades[upgradeIdx].exp,
						state.game.upgrades[upgradeIdx].count,
					),
			);

			const secondsToProc = Math.max(
				upgrades[upgradeIdx].duration -
					(Date.now() - state.game.upgrades[upgradeIdx].lastProc) /
						1000,
				0,
			);

			const percentageToProc = Math.min(
				1 - secondsToProc / upgrades[upgradeIdx].duration,
				1,
			);

			const percentageOfCost = Math.min(state.game.score / cost, 1);

			return {
				count,
				cost,
				secondsToProc,
				percentageToProc,
				percentageOfCost,
			};
		};

		return {
			loading: false,
			state: {
				score: state.game.score,
				upgrades: {
					1: processUpgradeData(1),
					2: processUpgradeData(2),
					3: processUpgradeData(3),
					4: processUpgradeData(4),
					5: processUpgradeData(5),
					6: processUpgradeData(6),
				},
			},
			functions: {
				click,
				upgrade,
				save,
			},
		};
	}, [state, setState, time]);

	return result;
};
