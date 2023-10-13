import React from 'react';
import { Link } from 'wouter';
import { Navbar } from '@web/components/Navbar.tsx';

export const NotFound: React.FC = () => {
	return (
		<>
			<Navbar />
			<div className='min-h-[95vh] min-w-screen flex items-center justify-center'>
				<div className='bg-background-900 rounded p-4'>
					<h5>Error 404</h5>
					<p className='text-text-200'>Page not found</p>
					<Link to='/' className='text-primary-200'>
						Go to home
					</Link>
				</div>
			</div>
		</>
	);
};
