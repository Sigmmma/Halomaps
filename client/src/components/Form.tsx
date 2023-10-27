import { Property } from 'csstype'; // From react-jss
import React, { JSX, PropsWithChildren } from 'react';
import { createUseStyles } from 'react-jss';

import { HeaderBar } from './Table';

const useFormStyles = createUseStyles({
	container: {
		backgroundColor: '#F2F2F2',
		borderColor: 'black',
		borderStyle: 'solid',
		borderWidth: '1px',
		marginTop: '3px',
		width: '95%',
	},
	header: {
		height: '18px',
		paddingTop: '3px',
	},
});

interface FormProps {
	title: string;
}

/** Standardized form with header. */
export function Form({
	children,
	title,
}: FormProps & PropsWithChildren): JSX.Element {
	const styles = useFormStyles();
	return (
		<form className={styles.container}>
			<HeaderBar content={title} className={styles.header} />
			{children}
		</form>
	);
}

//******************************************************************************
// Form Fieldset
//******************************************************************************

const useFieldsetStyles = createUseStyles({
	outline: {
		margin: '1px',
		width: '500px',
	},
	label: {
		fontWeight: 'bold',
	},
});

interface FieldsetProps {
	label: string;
	width?: Property.Width<(string & {}) | number>; // Stolen from react-jss for type info
}

/** Labeled, outlined section within a {@link Form}. */
export function Fieldset({
	children,
	label,
	width,
}: FieldsetProps & PropsWithChildren): JSX.Element {
	const styles = useFieldsetStyles();
	return (
		<fieldset className={styles.outline} style={{ width }}>
			<legend className={styles.label}>{label}</legend>
			{children}
		</fieldset>
	);
}
