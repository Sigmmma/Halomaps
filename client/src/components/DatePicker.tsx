import React, { JSX } from 'react';
import ReactDatePicker, { ReactDatePickerProps } from 'react-datepicker';
import { createUseStyles } from 'react-jss';
import 'react-datepicker/dist/react-datepicker.css';

import Input from './Input';

const useStyles = createUseStyles({
	calendar: {
		display: 'inline-block',
	},
});

export default function DatePicker(props: ReactDatePickerProps): JSX.Element {
	const styles = useStyles();
	return (
		// Need to wrap whole date picker in an "inline-block" div
		// so the pop-up calendar doesn't break up a line.
		<div className={styles.calendar}>
		<ReactDatePicker
			{...props}

			// Using customInput with this component is an ordeal, and nobody
			// should ever do it. This component's ref handling doesn't make
			// sense, and it isn't worth fighting with it.
			// This only works because <Input> is a thin wrapper around built-in
			// <input> that forwards (most of) its props.
			customInput={<Input size={10} />}
		/>
		</div>
	);
}
