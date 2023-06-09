import classNames from 'classnames';
import { Property } from 'csstype'; // From react-jss
import React, {JSX, PropsWithChildren } from 'react';
import { createUseStyles } from 'react-jss';
import { Design } from '../images';

type PaneProps = {
	title: string;
	type?: PaneType;
	width?: Property.Width<(string & {}) | number>; // Stolen from react-jss for type info
}

type TextPaneProps = PaneProps & {
	text: string;
}

export enum PaneType {
	NORMAL,
	WARNING,
	ERROR,
}

const useStyles = createUseStyles({
	container: {
		backgroundColor: '#F2F2F2',
		borderColor: 'black',
		borderStyle: 'solid',
		borderWidth: '1px',
		marginLeft: 'auto',
		marginRight: 'auto',
		marginTop: '50px',
		padding: '1px',
		textAlign: 'center',
		width: 'fit-content',
	},
	text: {
		marginLeft: '10px',
		marginRight: '10px',
		marginTop: '10px',
		width: '300px',
	},
	title: {
		color: 'white',
		fontWeight: 'bold',
		height: '17px',
	},
	error:   { backgroundImage: `url(${Design.BAR_DARK_ERR})`  },
	normal:  { backgroundImage: `url(${Design.BAR_DARK})`      },
	warning: { backgroundImage: `url(${Design.BAR_DARK_WARN})` },
});

export function Pane({
	children,
	title,
	type = PaneType.NORMAL,
	width,
}: PaneProps & PropsWithChildren): JSX.Element {
	const styles = useStyles();
	return (
		<div className={styles.container} style={width ? {width} : undefined}>
			<div className={classNames(styles.title, {
				[styles.normal]: type === PaneType.NORMAL,
				[styles.warning]: type === PaneType.WARNING,
				[styles.error]: type === PaneType.ERROR,
			})}>
				{title}
			</div>
			{children}
		</div>
	);
}

export function TextPane(props: TextPaneProps): JSX.Element {
	const styles = useStyles();
	return (
		<Pane {...props}>
			<div className={styles.text}>{props.text}</div>
		</Pane>
	);
}
