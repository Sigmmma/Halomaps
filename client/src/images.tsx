export const Design = {
	NAV_BG:        image('design/mbg3.gif'),
	NAV_BG_BRIGHT: image('design/mbg4.gif'),
	TOP_LOGO:      image('design/toplogo_forum.gif'),
};

export const Icons = {
	HOME:     image('icons/icon_home.gif'),
	LOGIN:    image('icons/icon_login.gif'),
	MEMBERS:  image('icons/icon_memberlist.gif'),
	RECENT:   image('icons/icon_recent.gif'),
	REGISTER: image('icons/icon_register.gif'),
	SEARCH:   image('icons/icon_search.gif'),
};

function image(staticPath: string): string {
	return require(`../static/${staticPath}`);
}
