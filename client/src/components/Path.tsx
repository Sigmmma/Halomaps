import React, { JSX } from 'react';
import { createUseStyles } from 'react-jss';

interface PathPart {
	url: string;
	name: string;
}

interface PathProps {
	parts: PathPart[];
}

const useStyles = createUseStyles({
	container: {
		marginTop: '12px',
	},
	link: {
		fontSize: '11px',
		fontWeight: 'bold',
		marginRight: '4px',
	},
})

const FIRST_PART: PathPart = {
	url: '/index.cfm?page=home',
	name: 'Forums Index',
};

export default function Path({ parts }: PathProps): JSX.Element {
	const styles = useStyles();
	return (
		<div className={styles.container}>
			{[FIRST_PART, ...parts].map((part, idx) => (
				<span className={styles.link} key={idx}>
					»
					<a href={part.url}>{part.name}</a>
				</span>
			))}
		</div>
	);
}
