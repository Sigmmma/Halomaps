import classNames from 'classnames';
import React, { JSX, useState } from 'react';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
	input: {
		borderRadius: 0,
		fontFamily: 'verdana',
		fontSize: '11px',
		width: 'fit-content',
	},
});

export interface DropdownOption {
	key: string;
	text: string;
}

interface DropdownProps {
	className?: string;
	options: DropdownOption[];
}

export default function Dropdown({
	className,
	options,
}: DropdownProps): JSX.Element {
	const [selected, setSelected] = useState<string>(options[0].key);
	const styles = useStyles();

	return (
		<select
			className={classNames(styles.input, className)}
			onChange={(e) => setSelected(e.target.value)}
			value={selected}
		>
			{options.map(option => (
				<option key={option.key} value={option.key}>
					{option.text}
				</option>
			))}
		</select>
	);
}
