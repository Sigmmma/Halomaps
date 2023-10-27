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
}: InputProps): JSX.Element {
	const styles = useStyles();
	return (
		<input
			className={styles.input}
			type={type}
			maxLength={maxLength}
			size={size}
		/>
	);
}
