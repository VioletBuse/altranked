import { Link as WLink } from 'wouter';

type Props = {
	href: string;
	children?: React.ReactNode;
};

export const Link: React.FC<Props> = ({ href, children }) => {
	return (
		<>
			<WLink
				className='text-primary-500 hover:text-primary-800 cursor-pointer'
				href={href}>
				{children}
			</WLink>
		</>
	);
};
