import React, { JSX } from 'react';
import ReactDatePicker, { ReactDatePickerProps } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import Input from './Input';

export default function DatePicker(props: ReactDatePickerProps): JSX.Element {
	return (
		<ReactDatePicker
			{...props}

			// Using customInput with this component is an ordeal, and nobody
			// should ever do it. This component's ref handling doesn't make
			// sense, and it isn't worth fighting with it.
			// This only works because <Input> is a thin wrapper around built-in
			// <input> that forwards (most of) its props.
			customInput={<Input size={10} />}
		/>
	);
}
