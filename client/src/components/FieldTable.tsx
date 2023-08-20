import classNames from 'classnames';
import React, { JSX, ReactNode } from 'react';
import { createUseStyles } from 'react-jss';

export type TableRow = [string, ReactNode];
export interface FieldTableProps {
	fields: TableRow[];
	tableClasses?: FieldTableClasses;
}
export interface FieldTableClasses {
	content?: string;
	label?: string;
	row?: string;
}

const useTableStyles = createUseStyles({
	label: {
		paddingTop: '3px',
		textAlign: 'right',
		verticalAlign: 'top',
	},
	table: {
		marginLeft: 'auto',
		marginRight: 'auto',
	},
});

export default function FieldTable({
	tableClasses,
	fields,
}: FieldTableProps): JSX.Element {
	const styles = useTableStyles();
	return (
		<table className={styles.table}>
			<tbody>{fields.map(([label, content], idx) => (
				<tr className={tableClasses?.row} key={idx}>

					<td className={classNames(
						styles.label,
						tableClasses?.label,
					)}>
						{label ? `${label}:` : ''}
					</td>

					<td className={tableClasses?.content}>
						{content}
					</td>
				</tr>
			))}</tbody>
		</table>
	);
}
