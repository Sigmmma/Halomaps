#!/bin/bash
# Downloads the given page(s) without mirroring the rest of the site.
# Useful for manually updating specific pages.
wget \
	--timestamping \
	--page-requisites \
	--content-disposition \
	--trust-server-names \
	--execute robots=off \
	--domains=forum.halomaps.org \
	"$@"
