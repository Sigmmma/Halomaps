import React, { JSX, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';

import { User } from '../../../server/database/types';

import Button from '../components/Button';
import Checkbox from '../components/Checkbox';
import { RelDate } from '../components/Date';
import PrivateMessageControls, { ButtonKey } from '../components/PrivateMessageControls';
import { Column, InlineElement, Separator, Table } from '../components/Table';
import { Icons } from '../images';

// TODO leaving this one alone for now.
// We'll probably want to invent some fake data for this page,
// as well as support switching views

type CheckMap = { [k: number]: boolean };

interface PrivateMessage {
	id: number;
	content: string;
	from: Pick<User, 'id'|'name'>;
	read: boolean;
	sentAt: Date;
	subject: string;
}

const useStyles = createUseStyles({
	image: {
		height: '30px',
	},
	note: {
		color: 'red',
		fontWeight: 'bold',
		textAlign: 'center',
	},
	subject: {
		fontWeight: 'bold',
		marginLeft: '5px',
	},
});

const TEST_ROWS: PrivateMessage[] = [{
	id: 12,
	content: 'test stuff',
	from: {
		name: 'Donut',
		id: 1683,
	},
	read: true,
	sentAt: new Date(),
	subject: 'Cool PM from someone',
},{
	id:34,
	content: 'test stuff',
	from: {
		name: 'Donut',
		id: 1683,
	},
	read: false,
	sentAt: new Date(),
	subject: 'Cool PM from someone else',
}];


export default function PrivateMessageBox(): JSX.Element {
	const styles = useStyles();
	const [checkMap, setCheckMap] = useState<CheckMap>([]);

	// TODO handle these parameters
	// box=inbox
	// box=sent
	// box=saved
	// messageId=<id>

	const COLUMNS: Column<PrivateMessage>[] = [
		{
			header: undefined,
			width: '32px',
			onRender: ({ read }) => (
				<img
					className={styles.image}
					src={read ? Icons.TOPIC : Icons.TOPIC_READ}
				/>
			),
		},
		{
			header: 'Subject',
			span: 2,
			onRender: (row) => (
				<a
					className={styles.subject}
					href={`index.cfm?page=private_msg_view&messageID=${row.id}&box=inbox`}
				>
					{row.subject}
				</a>
			),
		},
		{
			blueBg: true,
			header: 'From',
			width: '120px',
			onRender: (row) => (
				<a href={`index.cfm?page=userinfo&userID=${row.from.id}`}>
					{row.from.name}
				</a>
			),
		},
		{
			blueBg: true,
			header: 'Date',
			width: '120px',
			onRender: (row) => <RelDate date={row.sentAt} />,
		},
		{
			blueBg: true,
			header: 'Mark',
			width: '60px',
			onRender: (_row, index) => (
				<Checkbox
					checked={checkMap[index]}
					setChecked={(value) => setCheckMap({
						...checkMap,
						[index]: value,
					})}
				/>
			),
		},
	];

	const bottomBar = useMemo(() => new InlineElement(<BottomBar
		onMarkAll={() => setCheckMap(makeCheckMap(TEST_ROWS, true))}
		onUnmarkAll={() => setCheckMap(makeCheckMap(TEST_ROWS, false))}
	/>), []);

	return <>
		<PrivateMessageControls selectedKey={ButtonKey.INBOX}/>
		<div className={styles.note}>
			This is temporary test data.
			This page is barely functional,
			and we don't have a good reference for a lot of it.
		</div>
		<Table
			columns={COLUMNS}
			rows={[...TEST_ROWS, bottomBar]}
		/>
	</>;
}

// Helper for setting all checkboxes checked or unchecked.
function makeCheckMap(items: unknown[], value: boolean): CheckMap {
	const map: CheckMap = {};
	items.forEach((_item, index) => map[index] = value);
	return map;
}

//******************************************************************************
// Bottom button bar
//******************************************************************************

interface BottomBarProps {
	onMarkAll: () => void;
	onUnmarkAll: () => void;
}

const useBarStyles = createUseStyles({
	bar: {
		textAlign: 'right',
		width: '100%',
	},
	button: {
		width: 'fit-content',
	},
});

function BottomBar({
	onMarkAll,
	onUnmarkAll,
}: BottomBarProps): JSX.Element {
	const styles = useBarStyles();
	return (
		<Separator
			className={styles.bar}
			content={<>
				{/* TODO pop up a little "not supported" bar */}
				<Button text='Save Marked' className={styles.button} />&nbsp;
				<Button text='Deleted Marked' className={styles.button} />

				&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;&nbsp;

				<Button
					className={styles.button}
					text='Mark All'
					onClick={onMarkAll}
				/>&nbsp;

				<Button
					className={styles.button}
					text='Unmark All'
					onClick={onUnmarkAll}
				/>
			</>}
		/>
	);
}
