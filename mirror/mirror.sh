#!/bin/sh
# Mirrors the entire forum.
# This could also be used to update, but because pages render the current time,
# it will essentially always re-download the entire site.
# See: cherrypick.sh
wget \
	--mirror \
	--page-requisites \
	--content-disposition \
	--trust-server-names \
	--retry-on-host-error=0 \
	--retry-connrefused=0 \
	--retry-on-http-error=0 \
	--execute robots=off \
	--domains=forum.halomaps.org \
	http://forum.halomaps.org/
