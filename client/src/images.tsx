export const Design = {
	NAV_BG:        image('design/mbg3.gif'),
	NAV_BG_BRIGHT: image('design/mbg4.gif'),
	TOP_LOGO:      image('design/toplogo_forum.gif'),
};


function image(staticPath: string): NodeRequire {
	return require(`../static/${staticPath}`);
}
