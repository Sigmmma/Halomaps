import classNames from 'classnames';
import parseHTML from 'html-react-parser';
import React, { JSX } from 'react';
import { createUseStyles } from 'react-jss';

interface PostProps {
	content: string;
	className?: string;
}

const useStyles = createUseStyles({
	// Handle styles baked into post content
	'@global': {
		'.QUOTE': {
			backgroundColor: '#C6DDF0',
			borderColor: 'white',
			borderStyle: 'solid',
			borderWidth: '1px',
			fontSize: '11px',
			padding: '5px',
			margin: '5px',
		},
	},
	messageArea: {
		lineHeight: '18px',
		paddingTop: '10px',
	},
});

export default function PostContent({
	content,
	className,
 }: PostProps): JSX.Element {
	const styles = useStyles();
	return (
		<div className={classNames(styles.messageArea, className)}>
			{parseHTML(content)}
		</div>
	);
}
