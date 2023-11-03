import classNames from 'classnames';
import React, { JSX, useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import { useAsync, useSetState } from 'react-use';

import { Forum } from '../../../server/database/types';
import { copyRemoveAt } from '../../../server/util';

import Client from '../client';
import AsyncContent from '../components/AsyncContent';
import Button from '../components/Button';
import Checkbox from '../components/Checkbox';
import DatePicker from '../components/DatePicker';
import Dropdown, { DropdownOption } from '../components/Dropdown';
import { FieldTable, Fieldset } from '../components/Form';
import Input from '../components/Input';
import { Pane } from '../components/Pane';

const useSharedStyles = createUseStyles({
	centered: {
		marginLeft: 'auto',
		marginRight: 'auto',
		width: 'fit-content',
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

interface SearchProps {
	params: SearchParams;
	updateParams: (params: Partial<SearchParams>) => void;
}

export default function Search(): JSX.Element {
	const styles = useSharedStyles();
	const [params, updateParams] = useSetState<SearchParams>();

	console.log(params);

	return (
		// TODO top bar needs to be a little taller.
		// TODO need a small margin below the top bar.
		<Pane title='Search' className={styles.pane}>
			<div className={styles.centered}>
				<SearchCriteria params={params} updateParams={updateParams} />
				<br/>
				<DateCriteria params={params} updateParams={updateParams} />
				<br/>
				<ForumSelector params={params} updateParams={updateParams} />
			</div>
		</Pane>
	);
}

//******************************************************************************
// Search Criteria section
//******************************************************************************

const useSearchStyles = createUseStyles({
	button: {
		marginLeft: '35px',
		marginRight: '-20px',
		width: 'fit-content',
	},
});

const PHRASE_OPTIONS: DropdownOption<MatchOption>[] = [
	{ key: MatchOption.All,   text: 'Match All Words'    },
	{ key: MatchOption.Any,   text: 'Match Any Word'     },
	{ key: MatchOption.Exact, text: 'Match Exact Phrase' },
];

function SearchCriteria({ params, updateParams }: SearchProps): JSX.Element {
	const styles = useSharedStyles();
	const searchStyles = useSearchStyles();

	return (
		<Fieldset label='Search Criteria:'>
			<FieldTable
				tableClasses={{
					label: styles.label,
					content: styles.input,
				}}
				fields={[
					['Search', <Input
						onChangeValue={(search) => updateParams({ search })}
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
							onChangeValue={(author) => updateParams({ author })}
							size={30}
							value={params.author}
						/>
						<Button text='Search' className={searchStyles.button} />
					</>],
				]}
			/>
		</Fieldset>
	);
}

//******************************************************************************
// Date Criteria section
//******************************************************************************

const DAYS_OPTIONS: DropdownOption[] = [
	{ key: '', text: '-' },
	...([1, 2, 3, 7, 10, 14, 21, 30, 60, 90]
		.map(num => `${num}`)
		.map<DropdownOption>(text => ({ key: text, text }))
	),
];

function DateCriteria({ params, updateParams }: SearchProps): JSX.Element {
	const styles = useSharedStyles();

	return (
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
				Posted between&nbsp;

				{/* FIXME Popup calendar messes up page formatting */}
				<DatePicker
					selected={params.from}
					maxDate={params.to}
					onChange={(date) => updateParams({ from: date ?? undefined })}
				/>

				&nbsp;and&nbsp;

				<DatePicker
					selected={params.to}
					minDate={params.from}
					onChange={(date) => updateParams({ to: date ?? undefined })}
				/>
			</div>
		</Fieldset>
	);
}

//******************************************************************************
// Forum selection section
//******************************************************************************

const useForumListStyles = createUseStyles({
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
});

function ForumSelector({ params, updateParams }: SearchProps): JSX.Element {
	const styles = useSharedStyles();
	const listStyles = useForumListStyles();

	const forumsState = useAsync(async () => await Client.getForums(), []);

	// Select all forums by default
	useEffect(() => (
		updateParams({ forums: forumsState.value?.map(f => f.id) })
	), [forumsState.value]);

	return (
		<Fieldset label='Search In Forums:'>
			<AsyncContent
				state={forumsState}
				render={(forums) => {
					const sortedForums = forums.sort((a, b) => a.name.localeCompare(b.name));

					/** Add or remove checked forum from the forum list. */
					const updateChecked = (checked: boolean, id: number) => (
						updateParams({ forums: checked
							? [...params.forums ?? [], id]
							: copyRemoveAt(
								params.forums ?? [],
								params.forums
									?.findIndex(fid => fid === id)
									?? params.forums?.length
									?? 0
							)
						})
					);

					/** Creates one column of forum checkboxes. */
					const column = (topKey: number, subForums: Forum[]) => (
						<div className={listStyles.column}>
							{subForums.map((forum, index) => (
								<Checkbox
									key={`${topKey}-${index}`}
									checked={params.forums?.includes(forum.id)}
									id={`forum${forum.id}`}
									label={forum.name}
									setChecked={(checked) => updateChecked(checked, forum.id)}
								/>
							))}
						</div>
					);

					return <>
						<div className={styles.centered}>
							<a
								className={listStyles.fakeLink}
								onClick={() => updateParams({
									forums: forums.map(f => f.id)
								})}
							>
								Select All
							</a>
							&nbsp;|&nbsp;
							<a
								className={listStyles.fakeLink}
								onClick={() => updateParams({ forums: [] })}
							>
								Select None
							</a>
						</div>
						{ column(0, sortedForums.slice(0, sortedForums.length / 2)) }
						{ column(1, sortedForums.slice(sortedForums.length / 2)) }
					</>;
				}}
			/>
		</Fieldset>
	);
}
