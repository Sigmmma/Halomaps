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
	onRender: (row: T, index: number, rows: (SeparatorContainer | T)[]) => ReactNode;
}

interface TableProps<T> {
	className?: string;
	columns: Column<T>[];
	rows: (SeparatorContainer | T)[];
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
				row instanceof SeparatorContainer
					? <TableSeparator
						colSpan={columns.length}
						content={row.content}
						key={idx}
						showTop={row.showTop}
					/>
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
	allRows: (T | SeparatorContainer)[];
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
 * The thing callers actually call to add a separator to a Table.
 * This should be added to the Table's row data.
 *
 * This is essentially a big workaround to avoid "new" and allow the parent
 * Table to pass the column width into the actual Separator component.
 */
export function Separator(content?: ReactNode, showTop=false): SeparatorContainer {
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
		paddingTop: '2px',
		paddingBottom: '0px',
		verticalAlign: 'middle',
	},
	rawContent: {
		height: '18px',
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
		<tr><td
			className={classNames(styles.separator, {
				// Set default height for basic text, otherwise fit to content.
				[styles.rawContent]: typeof content !== 'object',
			})}
			colSpan={colSpan}
		>
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
