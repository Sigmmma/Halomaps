import React, { JSX } from 'react';

import UserLink from './User';
import { User } from '../../../server/database/types';

interface ModeratorsProps {
	className?: string;
	moderators: User[];
}

export default function ModeratorList({
	className,
	moderators,
}: ModeratorsProps): JSX.Element {
	// This is a list because of wishful thinking (aka we might some day want
	// to use this as a base for a real forum, so we'll have new moderators).
	// TODO maybe request this list from server
	return <div className={className}>
		<b>Moderators: </b>
		{moderators.map(user => <UserLink user={user} />)}
	</div>
}