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

export interface DropdownOption<T extends string = string> {
	key: T;
	text: string;
}

interface DropdownProps<T extends string = string> {
	className?: string;
	options: DropdownOption<T>[];
	selected?: T;
	setSelected?: (selected: T) => void;
}

export default function Dropdown<T extends string = string>({
	className,
	options,
	selected,
	setSelected,
}: DropdownProps<T>): JSX.Element {
	const styles = useStyles();
	return (
		<select
			className={classNames(styles.input, className)}
			onChange={(e) => setSelected?.(e.target.value as T)}
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
