import classNames from 'classnames';
import React, { JSX } from 'react';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
	input: {
		borderRadius: 0,
		fontFamily: 'verdana',
		fontSize: '11px',
		width: 'fit-content',
	},
});

export interface DropdownOption<T extends string | number = string> {
	key: T;
	text: string;
}

interface DropdownProps<T extends string | number = string> {
	className?: string;
	options: DropdownOption<T>[];
	selected?: T;
	setSelected?: (selected: T) => void;
}

export default function Dropdown<T extends string | number = string>({
	className,
	options,
	selected,
	setSelected,
}: DropdownProps<T>): JSX.Element {
	const styles = useStyles();
	return (
		<select
			className={classNames(styles.input, className)}
			onChange={(e) => setSelected?.(options[e.target.options.selectedIndex].key)}
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
