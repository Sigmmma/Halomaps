import React, { DetailedHTMLProps, InputHTMLAttributes, JSX } from 'react';
import { createUseStyles } from 'react-jss';

type InputProps = Pick<
	DetailedHTMLProps<
		InputHTMLAttributes<HTMLInputElement>,
		HTMLInputElement
	>,
	'type'
> & {
	maxLength?: number;
	size: number;
	value?: string;
	setValue?: (value: string) => void;
}

const useStyles = createUseStyles({
	input: {
		borderColor: 'black',
		borderStyle: 'solid',
		borderWidth: '1px',
		fontFamily: 'verdana',
		fontSize: '14px',
	},
});

export default function Input({
	maxLength,
	size,
	type = 'text',
	value,
	setValue,
}: InputProps): JSX.Element {
	const styles = useStyles();
	return (
		<input
			className={styles.input}
			type={type}
			maxLength={maxLength}
			onChange={(e) => setValue?.(e.target.value)}
			size={size}
			value={value}
		/>
	);
}
