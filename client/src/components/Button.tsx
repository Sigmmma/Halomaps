import React, { ButtonHTMLAttributes, DetailedHTMLProps, JSX } from 'react';
import { createUseStyles } from 'react-jss';

type ButtonProps = Pick<
	DetailedHTMLProps<
		ButtonHTMLAttributes<HTMLButtonElement>,
		HTMLButtonElement
	>,
	'type'
> & {
	text: string;
	onClick?: () => void;
}

const useStyles = createUseStyles({
	button: {
		backgroundColor: '#C6DDF0',
		borderColor: 'black',
		borderStyle: 'solid',
		borderWidth: '1px',
		color: 'black',
		fontSize: '11px',
		width: '100px',
		'&:hover': {
			backgroundColor: '#F2F2F2',
		},
	},
});

export default function Button({
	text,
	type = 'button',
	onClick,
}: ButtonProps): JSX.Element {
	const styles = useStyles();
	return (
		<button
			className={styles.button}
			onClick={onClick}
			type={type}
		>
			{text}
		</button>
	);
}
