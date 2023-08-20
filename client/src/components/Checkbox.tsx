import React, { JSX, useId } from 'react';

interface CheckboxProps {
	defaultChecked?: boolean;
	label: string;
}

export default function Checkbox({
	defaultChecked,
	label,
}: CheckboxProps): JSX.Element {
	const [id] = useId();

	return (
		<div>
			<input id={id} type='checkbox' defaultChecked={defaultChecked} />
			<label htmlFor={id}>{label}</label>
		</div>
	);
}
