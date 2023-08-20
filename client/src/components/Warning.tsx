import classNames from 'classnames';
import React, { JSX } from 'react';
import { createUseStyles } from 'react-jss';

interface WarningProps {
	className?: string;
	display: boolean;
	label: string;
}

const useStyles = createUseStyles({
	warning: {
		color: 'red',
	},
});

export default function Warning({
	className,
	display,
	label,
}: WarningProps): JSX.Element {
	const styles = useStyles();
	return (
		<div
			className={classNames(styles.warning, className)}
			hidden={!display}
		>
			{label} is disabled on this archive!
		</div>
	);
}
