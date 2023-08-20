import classNames from 'classnames';
import React, { JSX, ReactNode, TdHTMLAttributes } from 'react';
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

export type Column<T> = Pick<
	TdHTMLAttributes<HTMLTableCellElement>, 'valign'|'width'
> & {
	blueBg?: boolean;
	header?: ReactNode;
	span?: number;
	onRender: (row: T, index: number, rows: (InlineElement | T)[]) => ReactNode;
}

interface TableProps<T> {
	className?: string;
	columns: Column<T>[];
	rows: (InlineElement | T)[];
}

export function Table<T>({
	className,
	columns,
	rows,
}: TableProps<T>): JSX.Element {
	const styles = useTableStyles();
	return (
		<table
			cellPadding={1}
			cellSpacing={1}
			className={classNames(styles.table, className)}
		>
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
				row instanceof InlineElement
					? <tr key={idx}><td colSpan={columns.length}>
						{row.content}
					</td></tr>
					: <TableRow
						allRows={rows}
						columns={columns}
						index={idx}
						key={idx}
						row={row}
					/>
			))}
		</tbody>
	);
}

type TableRowProps<T> = Pick<TableProps<T>, 'columns'> & {
	allRows: (T | InlineElement)[];
	row: T;
	index: number;
};

function TableRow<T>({
	allRows,
	columns,
	row,
	index,
}: TableRowProps<T>): JSX.Element {
	const styles = useTableStyles();
	return (
		<tr>
			{columns.map((column, idx) => (
				<td
					className={column.blueBg ? styles.blue : styles.normal}
					key={idx}
					valign={column.valign}
					width={column.width}
				>
					{column.onRender(row, index, allRows)}
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
 * Goofy container that passes a runtime instanceof check so that callers can
 * combine arbitrary ReactElements with their actual table row data.
 */
export class InlineElement {
	content: ReactNode;

	constructor(content: ReactNode) {
		this.content = content;
	}
}

const useSeparatorStyles = createUseStyles({
	separator: {
		backgroundImage: `url(${Design.BAR_LIGHT})`,
		paddingTop: '1px',
	},
	rawContent: {
		paddingTop: '2px',
		height: '17px',
		marginBottom: '-1px',
	},
	topLink: {
		float: 'right',
		fontSize: '10px',
		marginRight: '2px',
	},
	topIcon: {
		marginLeft: '5px',
	},
});

export function Separator({
	content,
	showTop,
}: SeparatorProps): JSX.Element {
	const styles = useSeparatorStyles();
	return (
		<div className={classNames(styles.separator, {
				// Set default height for basic text, otherwise fit to content.
				[styles.rawContent]: typeof content !== 'object',
		})}>
			<b>{content}</b>

			{showTop && (
				<a className={styles.topLink} href='#TOP'>
					Top
					<img className={styles.topIcon} src={Icons.TOP} />
				</a>
			)}
		</div>
	);
}
