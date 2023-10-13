export const numberFormatter = (num: number): string => {
	if (num < 1) {
		return num.toFixed(3);
	}

	const magnitude = Math.floor(Math.log10(num));
	const order = Math.floor(magnitude / 3);

	const divisor = Math.pow(10, order * 3);

	// const numbers = [
	// 	'',
	// 	'Thousand',
	// 	'Million',
	// 	'Billion',
	// 	'Trillion',
	// 	'Quadrillion',
	// 	'Quintillion',
	// 	'Sextillion',
	// 	'Septillion',
	// 	'Octillion',
	// 	'Nonillion',
	// 	'Decillion',
	// ];

	const suffixes = [
		'',
		'K',
		'M',
		'B',
		'T',
		'Qa',
		'Qi',
		'Sx',
		'Sp',
		'Oc',
		'No',
		'Dc',
	];

	const suffix = suffixes[order];

	const formatted = (num / divisor).toPrecision(3);
	return `${formatted}${suffix}`;
};
