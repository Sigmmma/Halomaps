import classNames from 'classnames';
import React, { JSX, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import { useAsync, useSetState } from 'react-use';

import Client from '../client';
import AsyncContent from '../components/AsyncContent';
import Button from '../components/Button';
import Checkbox from '../components/Checkbox';
import Dropdown, { DropdownOption } from '../components/Dropdown';
import { FieldTable, Fieldset, TableRow } from '../components/Form';
import Input from '../components/Input';
import { Pane } from '../components/Pane';
import { Forum } from '../../../server/database/types';

const useStyles = createUseStyles({
	button: {
		marginLeft: '35px',
		marginRight: '-20px',
		width: 'fit-content',
	},
	centered: {
		marginLeft: 'auto',
		marginRight: 'auto',
		width: 'fit-content',
	},
	column: {
		display: 'inline-block',
		width: '45%',
	},
	fakeLink: {
		// Emulate <a href='...'> behavior
		color: '#1471CF',
		textDecorationLine: 'underline',
		'&:hover': {
			color: 'red',
			cursor: 'pointer',
		},
	},
	input: {
		width: '350px',
	},
	label: {
		fontWeight: 'bold',
	},
	pane: {
		marginLeft: 0,
		marginTop: '3px',
		width: '95%',
	},
});

enum MatchOption {
	All = 'All',
	Any = 'Any',
	Exact = 'Exact',
}

interface SearchParams {
	search?: string;
	match?: MatchOption;
	author?: string;
	days?: string;
	from?: Date;
	to?: Date;
	forums?: number[];
}

const PHRASE_OPTIONS: DropdownOption<MatchOption>[] = [
	{ key: MatchOption.All,   text: 'Match All Words'    },
	{ key: MatchOption.Any,   text: 'Match Any Word'     },
	{ key: MatchOption.Exact, text: 'Match Exact Phrase' },
];

const DAYS_OPTIONS: DropdownOption[] = [
	{ key: '', text: '-' },
	...([1, 2, 3, 7, 10, 14, 21, 30, 60, 90]
		.map(num => `${num}`)
		.map<DropdownOption>(text => ({ key: text, text }))
	),
];

export default function Search(): JSX.Element {
	const styles = useStyles();
	const [params, updateParams] = useSetState<Partial<SearchParams>>();

	const searchFields = useMemo<TableRow[]>(() => [
		['Search', <Input
			setValue={(search) => updateParams({ search })}
			size={30}
			value={params.search}
		/>],
		['Phrase', <Dropdown
			options={PHRASE_OPTIONS}
			selected={params.match ?? PHRASE_OPTIONS[0].key}
			setSelected={(match) => updateParams({ match })}
		/>],
		['Posted By', <>
			<Input
				setValue={(author) => updateParams({ author })}
				size={30}
				value={params.author}
			/>
			<Button text='Search' className={styles.button} />
		</>],
	], []);

	const forumsState = useAsync(async () => await Client.getForums(), []);

	return (
		// TODO top bar needs to be a little taller.
		// TODO need a small margin below the top bar.
		<Pane title='Search' className={styles.pane}>
			<div className={styles.centered}>
				<Fieldset label='Search Criteria:'>
					<FieldTable
						fields={searchFields}
						tableClasses={{
							label: styles.label,
							content: styles.input,
						}}
					/>
				</Fieldset>
				<br/>
				<Fieldset label='Date Criteria:'>
					<div className={classNames(styles.label, styles.centered)}>
						Search for messages posted in the last&nbsp;
						<Dropdown
							options={DAYS_OPTIONS}
							selected={params.days ?? DAYS_OPTIONS[8].key}
							setSelected={(days) => updateParams({ days: days || undefined })}
						/>
						&nbsp;day(s).
						<br />
						<br />
						<span style={{ color: 'navy' }}>OR...</span>&nbsp;
						{/* TODO need a date picker here */}
						Posted between&nbsp;
						<Input size={10} />
						&nbsp;and&nbsp;
						<Input size={10} />
					</div>
				</Fieldset>
				<br/>
				<Fieldset label='Search In Forums:'>
					<AsyncContent
						state={forumsState}
						render={(forums) => {
							const sorted = forums.sort((a, b) => a.name.localeCompare(b.name));

							const setChecked = (checked: boolean, id: number) => {
								let newForums;
								if (checked) {
									newForums = [...params.forums ?? [], id];
								} else {
									const removeIndex = params.forums
										?.findIndex(fid => fid === id)
										?? params.forums?.length
										?? 0;

									newForums = [
										...params.forums?.slice(0, removeIndex) ?? [],
										...params.forums?.slice(removeIndex + 1) ?? [],
									];
								}
								updateParams({ forums: newForums });
							};

							const column = (topKey: number, subForums: Forum[]) => (
								<div className={styles.column}>
									{subForums.map((forum, index) => (
										<Checkbox
											key={`${topKey}-${index}`}
											checked={params.forums?.includes(forum.id)}
											id={`forum${forum.id}`}
											label={forum.name}
											setChecked={(checked) => setChecked(checked, forum.id)}
										/>
									))}
								</div>
							);

							return <>
								<div className={styles.centered}>
									<a
										className={styles.fakeLink}
										onClick={() => updateParams({
											forums: forums.map(f => f.id)
										})}
									>
										Select All
									</a>
									&nbsp;|&nbsp;
									<a
										className={styles.fakeLink}
										onClick={() => updateParams({ forums: [] })}
									>
										Select None
									</a>
								</div>
								{ column(0, sorted.slice(0, sorted.length / 2)) }
								{ column(1, sorted.slice(sorted.length / 2)) }
							</>;
						}}
					/>
				</Fieldset>
			</div>
		</Pane>
	);
}
