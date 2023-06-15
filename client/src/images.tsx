export const Buttons = {
	NEW_TOPIC: image('buttons/newtopic.gif'),
};

export const Design = {
	BAR_DARK:      image('design/darkbg.gif'),
	BAR_DARK_ERR:  image('design/darkbgred.gif'),
	BAR_DARK_WARN: image('design/darkbgyellow.gif'),
	BAR_LIGHT:     image('design/lightbg.gif'),
	LOADING:       image('design/loading.gif'),
	NAV_BG:        image('design/mbg3.gif'),
	NAV_BG_BRIGHT: image('design/mbg4.gif'),
	TOP_LOGO:      image('design/toplogo_forum.gif'),
};

export const Icons = {
	FORUM:         image('icons/icon_newposts.gif'),
	HOME:          image('icons/icon_home.gif'),
	LOCK:          image('icons/icon_lock.gif'),
	LOGIN:         image('icons/icon_login.gif'),
	MEMBERS:       image('icons/icon_memberlist.gif'),
	MODERATOR:     image('icons/users_moderator.gif'),
	PINNED:        image('icons/icon_clip.gif'),
	RECENT:        image('icons/icon_recent.gif'),
	REGISTER:      image('icons/icon_register.gif'),
	SEARCH:        image('icons/icon_search.gif'),
	TOP:           image('icons/icon_totop.gif'),
	TOPIC:         image('icons/topic_red.gif'),
	TOPIC_JUMP:    image('icons/icon_mini_topic.gif'),
	TOPIC_POPULAR: image('icons/topic_popular_red.gif'),
	TOPIC_LOCKED:  image('icons/topic_locked.gif'),
};

function image(staticPath: string): string {
	return require(`../static/${staticPath}`);
}
