import React, { JSX } from 'react';

import { PaneType, TextPane } from '../components/Pane';

export default function NotFound(): JSX.Element {
	return (
		<TextPane
			text={
				'The resource you are looking for might have been removed, ' +
				'had its name changed, or is temporarily unavailable.'
			}
			title='404 Page Not Found'
			type={PaneType.WARNING}
		/>
	);
}
