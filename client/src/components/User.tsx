import React, { JSX } from 'react';

import { User } from '../../../server/database/types';

interface UserProps {
	user: User;
}

export default function UserLink({ user }: UserProps): JSX.Element {
	return <a href='TODO'>{user.name}</a>;
}
