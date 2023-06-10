import { DateTime } from 'luxon';
import React, { JSX } from 'react';
import { createUseStyles } from 'react-jss';

interface FooterProps {
	date: Date;
	duration?: number;
}

const useStyles = createUseStyles({
	bar: {
		backgroundColor: '#F2F2F2',
		borderColor: '#C6DDF0',
		borderStyle: 'solid',
		borderWidth: '1px',
		marginTop: '15px',
		padding: '2px',
	},
	duration: {
		color: 'gray',
		float: 'right',
		fontFamily: 'verdana',
		fontSize: '10px',
		paddingTop: '1px',
	},
	link: {
		display: 'block',
		fontWeight: 'bold',
		marginTop: '2px',
		textAlign: 'center',
	},
});

export default function Footer({
	date,
	duration
}: FooterProps): JSX.Element {
	const styles = useStyles();
	return <>
		<div className={styles.bar}>
			<b>Time: </b>
			{toFooterDate(date)}

			{duration !== undefined && (
				<span className={styles.duration}>
					{duration.toLocaleString()} ms.
				</span>
			)}
		</div>
		<a className={styles.link} href='http://www.halomaps.org/'>
			A Halo Maps Website
		</a>
	</>;
}

/**
 * HaloMaps' footer date is in a slightly different format than other dates.
 *
 * Example: Tue January 31, 2023 8:55 AM
 */
function toFooterDate(date: Date): string {
	return DateTime.fromJSDate(date).toFormat('EEE MMMM d, yyyy t');
}
