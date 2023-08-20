import classNames from 'classnames';
import { Property } from 'csstype'; // From react-jss
import React, {JSX, PropsWithChildren } from 'react';
import { createUseStyles } from 'react-jss';

import { Design } from '../images';

type PaneProps = {
	className?: string;
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
		borderColor: 'black',
		borderStyle: 'solid',
		borderWidth: '1px',
		marginLeft: 'auto',
		marginRight: 'auto',
		marginTop: '50px',
		padding: '1px',
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
		textAlign: 'center',
	},
	error:   { backgroundImage: `url(${Design.BAR_DARK_ERR})`  },
	normal:  { backgroundImage: `url(${Design.BAR_DARK})`      },
	warning: { backgroundImage: `url(${Design.BAR_DARK_WARN})` },
	errorBg:   { backgroundColor: '#FFF2F2' },
	normalBg:  { backgroundColor: '#F2F2F2' },
	warningBg: { backgroundColor: '#FFFFF2' },
});

export function Pane({
	children,
	className,
	title,
	type = PaneType.NORMAL,
	width,
}: PaneProps & PropsWithChildren): JSX.Element {
	const styles = useStyles();
	return (
		<div
			className={classNames(styles.container, className, {
				[styles.normalBg]:  type === PaneType.NORMAL,
				[styles.warningBg]: type === PaneType.WARNING,
				[styles.errorBg]:   type === PaneType.ERROR,
			})}
			style={width ? {width} : undefined}
		>
			<div className={classNames(styles.title, {
				[styles.normal]:  type === PaneType.NORMAL,
				[styles.warning]: type === PaneType.WARNING,
				[styles.error]:   type === PaneType.ERROR,
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
