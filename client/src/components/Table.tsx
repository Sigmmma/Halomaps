import { Property } from 'csstype'; // From react-jss
import React, { JSX, ReactNode } from 'react';
import { createUseStyles } from 'react-jss';

import { Design, Icons } from '../images';

const useTableStyles = createUseStyles({
	blue: {
		backgroundColor: '#C6DDF0',
		fontSize: '10px',
		textAlign: 'center',
	},
	header: {
		backgroundImage: `url(${Design.BAR_DARK})`,
		color: 'white',
		fontWeight: 'bold',
		height: '18px',
		textAlign: 'center',
		paddingBottom: '0px',
		paddingTop: '2px',
		whiteSpace: 'nowrap',
	},
	normal: {
		backgroundColor: '#F2F2F2',
	},
	table: {
		backgroundColor: '#FFFFFF',
		borderColor: 'black',
		borderWidth: '1px',
		borderStyle: 'solid',
		marginTop: '3px',
		width: '95%',
	},
});

export interface Column<T> {
	blueBg?: boolean;
	header?: string;
	span?: number;
	width?: Property.Width<(string & {}) | number>; // Stolen from react-jss for type info
	onRender: (data: T) => ReactNode;
}

interface TableProps<T> {
	columns: Column<T>[];
	rows: (T | SeparatorContainer)[];
}

export function Table<T>({
	columns,
	rows,
}: TableProps<T>): JSX.Element {
	const styles = useTableStyles();
	return (
		<table cellSpacing={1} cellPadding={1} className={styles.table}>
			<TableHeader columns={columns} />
			<TableBody columns={columns} rows={rows} />
		</table>
	);
}

function TableHeader<T>({
	columns,
}: Pick<TableProps<T>, 'columns'>): JSX.Element {
	const styles = useTableStyles();
	return <>
		<colgroup>
			{columns
				.filter(column => column.header)
				.map((column, idx) => (
					<col
						key={idx}
						span={column.span}
						width={column.width}
					/>
				))
			}
		</colgroup>

		<thead><tr>
			{columns
				.filter(column => column.header)
				.map((column, idx) => (
					<th
						className={styles.header}
						colSpan={column.span}
						key={idx}
					>
						{column.header}
					</th>
				))
			}
		</tr></thead>
	</>;
}

function TableBody<T>({
	columns,
	rows,
}: TableProps<T>): JSX.Element {
	return (
		<tbody>
			{rows.map((row, idx) => (
				row instanceof SeparatorContainer
					? <TableSeparator
						colSpan={columns.length}
						content={row.content}
						key={idx}
						showTop={row.showTop}
					/>
					: <TableRow columns={columns} key={idx} row={row} />
			))}
		</tbody>
	);
}

function TableRow<T>({
	columns,
	row,
}: Pick<TableProps<T>, 'columns'> & { row: T }): JSX.Element {
	const styles = useTableStyles();
	return (
		<tr>
			{columns.map((column, idx) => (
				<td
					className={column.blueBg ? styles.blue : styles.normal}
					key={idx}
					style={{ width: column.width }}
				>
					{column.onRender(row)}
				</td>
			))}
		</tr>
	);
}

//******************************************************************************
// Horizontal Separator
//******************************************************************************

interface SeparatorProps {
	content?: ReactNode;
	showTop?: boolean;
}

/**
 * The thing callers actually call to add a separator to a Table.
 * This should be added to the Table's row data.
 *
 * This is essentially a big workaround to avoid "new" and allow the parent
 * Table to pass the column width into the actual Separator component.
 */
export function Separator(content: ReactNode, showTop=false): SeparatorContainer {
	return new SeparatorContainer({ content, showTop });
}

/**
 * Goofy container that passes a runtime instanceof check so that callers can
 * combine separators with their actual table row data.
 */
class SeparatorContainer {
	content: ReactNode;
	showTop?: boolean;

	constructor({ content, showTop }: SeparatorProps) {
		this.content = content;
		this.showTop = showTop;
	}
}

const useSeparatorStyles = createUseStyles({
	separator: {
		backgroundImage: `url(${Design.BAR_LIGHT})`,
		height: '18px',
		paddingTop: '2px',
		paddingBottom: '0px',
		verticalAlign: 'middle',
	},
	topLink: {
		float: 'right',
		fontSize: '10px',
		marginRight: '2px',
	},
	topIcon: {
		marginLeft: '5px',
		verticalAlign: 'middle',
	},
});

function TableSeparator({
	content,
	colSpan,
	showTop,
}: SeparatorProps & { colSpan: number }): JSX.Element {
	const styles = useSeparatorStyles();
	return (
		<tr><td className={styles.separator} colSpan={colSpan}>
			<b>{content}</b>

			{showTop && (
				<a className={styles.topLink} href='#TOP'>
					Top
					<img className={styles.topIcon} src={Icons.TOP} />
				</a>
			)}
		</td></tr>
	);
}
