import React, { JSX } from 'react';
import { createUseStyles } from 'react-jss';

interface InputProps {
	maxLength?: number;
	size: number;
}

const useStyles = createUseStyles({
	input: {
		borderColor: 'black',
		borderStyle: 'solid',
		borderWidth: '1px',
		fontSize: '14px',
	},
});

export default function Input({
	maxLength,
	size,
}: InputProps): JSX.Element {
	const styles = useStyles();
	return (
		<input
			className={styles.input}
			type='text'
			maxLength={maxLength}
			size={size}
		/>
	);
}
