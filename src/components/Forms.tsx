type InputProps = {
	onChange: (value: string) => void;
	label: string;
	placeholder?: string;
	type?: string;
};

export const Input: React.FC<InputProps> = ({
	onChange,
	label,
	placeholder,
	type,
}) => {
	return (
		<>
			<label className='flex flex-col'>
				{label}
				<input
					onChange={(e) => onChange(e.target.value)}
					className='form-input bg-background-600 hover:bg-background-500 focus:ring focus:ring-primary-500 border-none rounded px-3 py-1 text-md'
					placeholder={placeholder}
					type={type || 'text'}
					name='email or username'
				/>
			</label>
		</>
	);
};

type SubmitProps = {
	children?: React.ReactNode;
};

export const Submit: React.FC<SubmitProps> = ({ children }) => {
	return (
		<>
			<button
				className='rounded px-10 py-1 bg-primary-500 hover:bg-primary-950 text-text-950 hover:text-text-100 w-fit'
				type='submit'>
				{children}
			</button>
		</>
	);
};

type FormProps = {
	children?: React.ReactNode;
	onSubmit: () => void;
};

export const Form: React.FC<FormProps> = ({ children, onSubmit }) => {
	return (
		<>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					onSubmit();
				}}
				className='flex flex-col gap-y-2 my-2'>
				{children}
			</form>
		</>
	);
};

type ErrorProps = {
	message?: string;
};

export const Error: React.FC<ErrorProps> = ({ message }) => {
	return <>{message && <p className='text-red-500'>{message}</p>}</>;
};
