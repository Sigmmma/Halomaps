import React, { JSX } from 'react';
import { AsyncState } from 'react-use/lib/useAsyncFn';

import { Design } from '../images';
import { createUseStyles } from 'react-jss';
import { PaneType, TextPane } from './Pane';

type AsyncContentProps<T> = {
	state: AsyncState<T>;
	render: (data: T) => JSX.Element;
}

const useStyles = createUseStyles(() => ({
	icon: {
		display: 'block',
		marginLeft: 'auto',
		marginRight: 'auto',
		marginTop: '10px',
	},
}));

export default function AsyncContent<T>({
	render,
	state,
}: AsyncContentProps<T>): JSX.Element {
	const styles = useStyles();
	return state.loading ? <img className={styles.icon} src={Design.LOADING} />
		:  state.error   ? <RenderedError error={state.error} />
		:  state.value   ? render(state.value)
		:  <></>;
}

// TODO we'll want to display things like HTTP error codes
function RenderedError({ error }: { error: Error }): JSX.Element {
	return (
		<TextPane
			title={error.name}
			type={PaneType.ERROR}
			text={error.message}
		/>
	);
}
