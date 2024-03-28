export const Buttons = {
	NEW_TOPIC:   image('buttons/newtopic.gif'),
	REPLY_POST:  image('buttons/post_reply.png'),
	REPLY_QUOTE: image('buttons/quote_reply.png'),
	REPLY_TOPIC: image('buttons/reply.gif'),
};

export const Captcha = {
	A: image('captcha/A.gif'),
	D: image('captcha/D.gif'),
	U: image('captcha/U.gif'),
	W: image('captcha/W.gif'),
	Y: image('captcha/Y.gif'),
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
	INBOX:         image('icons/icon_inbox.gif'),
	LOCK:          image('icons/icon_lock.gif'),
	LOGIN:         image('icons/icon_login.gif'),
	LOGOUT:        image('icons/icon_logout.gif'),
	MEMBERS:       image('icons/icon_memberlist.gif'),
	MESSAGES:      image('icons/icon_messages.gif'),
	MODERATOR:     image('icons/users_moderator.gif'),
	MY_FORUMS:     image('icons/icon_mini_myforums.gif'),
	NEW_PM:        image('icons/icon_newprivatemessage.gif'),
	PINNED:        image('icons/icon_clip.gif'),
	PROFILE:       image('icons/icon_profile.gif'),
	RECENT:        image('icons/icon_recent.gif'),
	REGISTER:      image('icons/icon_register.gif'),
	SAVEBOX:       image('icons/icon_savebox.gif'),
	SEARCH:        image('icons/icon_search.gif'),
	SENTBOX:       image('icons/icon_sentbox.gif'),
	TOP:           image('icons/icon_totop.gif'),
	TOPIC:         image('icons/topic_red.gif'),
	TOPIC_JUMP:    image('icons/icon_mini_topic.gif'),
	TOPIC_POPULAR: image('icons/topic_popular_red.gif'),
	TOPIC_READ:    image('icons/topic.gif'),
	TOPIC_LOCKED:  image('icons/topic_locked.gif'),
};

export function avatar(staticPath: string): string {
	return image(`avatars/${staticPath}`);
}

function image(staticPath: string): string {
	return require(`../static/${staticPath}`);
}
