import React, { JSX, useId, useState } from 'react';

interface CheckboxProps {
	checked?: boolean;
	defaultChecked?: boolean;
	label?: string;
	setChecked?: (checked: boolean) => void;
}

export default function Checkbox({
	checked,
	defaultChecked,
	label,
	setChecked,
}: CheckboxProps): JSX.Element {
	const [checkedInternal, setCheckedInternal] = useState(!!defaultChecked);
	const id = useId();

	return (
		<div>
			<input
				checked={checked ?? checkedInternal}
				defaultChecked={defaultChecked}
				id={id}
				type='checkbox'
				onChange={(event) => {
					setCheckedInternal(event.target.checked);
					setChecked?.(event.target.checked);
				}}
			/>
			{label && <label htmlFor={id}>{label}</label>}
		</div>
	);
}
