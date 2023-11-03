import React, { DetailedHTMLProps, InputHTMLAttributes, JSX } from 'react';
import { createUseStyles } from 'react-jss';

type InputProps = DetailedHTMLProps<
	InputHTMLAttributes<HTMLInputElement>,
	HTMLInputElement
> & {
	onChangeValue?: (value: string) => void;
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
	type = 'text',
	value = '', // Avoid uncontrolled -> controlled React warning
	onChange,
	onChangeValue,
	...rest
}: InputProps): JSX.Element {
	const styles = useStyles();
	return (
		<input
			{...rest}
			className={styles.input}
			type={type}
			onChange={(e) => {
				onChange?.(e);
				onChangeValue?.(e.target.value);
			}}
			value={value}
		/>
	);
}
