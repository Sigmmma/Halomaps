import classNames from 'classnames';
import React, { JSX, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import { useAsync } from 'react-use';

import Client from '../client';
import AsyncContent from '../components/AsyncContent';
import Button from '../components/Button';
import Checkbox from '../components/Checkbox';
import Dropdown, { DropdownOption } from '../components/Dropdown';
import { FieldTable, Fieldset } from '../components/Form';
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

const PHRASE_OPTIONS: DropdownOption[] = [
	{ key: 'All',   text: 'Match All Words'    },
	{ key: 'Any',   text: 'Match Any Word'     },
	{ key: 'Exact', text: 'Match Exact Phrase' },
];

const DAYS_OPTIONS: DropdownOption[] = [
	{ key: '', text: '-' },
	...([1, 2, 3, 7, 10, 14, 21, 30, 60, 90]
		.map(num => `${num}`)
		.map<DropdownOption>(text => ({key: text, text }))
	),
];

export default function Search(): JSX.Element {
	const styles = useStyles();

	const phraseDropdown = useMemo(() => (
		<Dropdown options={PHRASE_OPTIONS} />
	), []);

	const postedBy = useMemo(() => <>
		<Input size={30} />
		<Button text='Search' className={styles.button} />
	</>, []);

	const forumsState = useAsync(async () => await Client.getForums(), []);

	return (
		// TODO top bar needs to be a little taller.
		// TODO need a small margin below the top bar.
		<Pane title='Search' className={styles.pane}>
			<div className={styles.centered}>
				<Fieldset label='Search Criteria:'>
					<FieldTable
						tableClasses={{
							label: styles.label,
							content: styles.input,
						}}
						fields={[
							['Search',    <Input size={30}/>],
							['Phrase',    phraseDropdown],
							['Posted By', postedBy],
						]}
					/>
				</Fieldset>
				<br/>
				<Fieldset label='Date Criteria:'>
					<div className={classNames(styles.label, styles.centered)}>
						Search for messages posted in the last&nbsp;
						{/* TODO Default is 30 */}
						<Dropdown options={DAYS_OPTIONS}/>
						&nbsp;day(s).
						<br />
						<br />
						<span style={{ color: 'navy' }}>OR...</span>&nbsp;
						Posted between <Input size={10} /> and <Input size={10} />
					</div>
				</Fieldset>
				<br/>
				<Fieldset label='Search In Forums:'>
					<div className={styles.centered}>
						<a href='#'>Select All</a>
						&nbsp;|&nbsp;
						<a href='#'>Select None</a>
					</div>
					<AsyncContent
						state={forumsState}
						render={(forums) => {
							const sorted = forums.sort((a, b) => a.name.localeCompare(b.name));

							const column = (subForums: Forum[]) => (
								<div className={styles.column}>
									{subForums.map(forum => (
										<Checkbox
											checked
											id={`forum${forum.id}`}
											label={forum.name}
										/>
									))}
								</div>
							);

							return <>
								{ column(sorted.slice(0, sorted.length / 2)) }
								{ column(sorted.slice(sorted.length / 2)) }
							</>;
						}}
					/>
				</Fieldset>
			</div>
		</Pane>
	);
}
