import React, { JSX, useId, useState } from 'react';

interface CheckboxProps {
	checked?: boolean;
	defaultChecked?: boolean;
	id?: string;
	label?: string;
	setChecked?: (checked: boolean) => void;
}

export default function Checkbox({
	checked,
	defaultChecked,
	id,
	label,
	setChecked,
}: CheckboxProps): JSX.Element {
	const [checkedInternal, setCheckedInternal] = useState(!!defaultChecked);
	const inputId = id ?? useId();

	return (
		<div>
			<input
				checked={checked ?? checkedInternal}
				defaultChecked={defaultChecked}
				id={inputId}
				type='checkbox'
				onChange={(event) => {
					setCheckedInternal(event.target.checked);
					setChecked?.(event.target.checked);
				}}
			/>
			{label && <label htmlFor={inputId}>{label}</label>}
		</div>
	);
}
