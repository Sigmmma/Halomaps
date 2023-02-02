#!/bin/bash
# Applies some post-processing to the forum mirror.
MIRROR_DIR=$1

# Question marks are considered query strings in URLs, so we escape those to
# reference local mirror files with question marks in the names.
echo "Tweaking links so mirror can be browsed locally (this will take a while)"

find $MIRROR_DIR -type f -wholename '*index.*' \
	| while read file; do
		echo "$file"
		# ? escapes to %3F
		sed --in-place 's/index.cfm?page/index.cfm%3Fpage/g' "$file"
		sed --in-place 's/style.cfm?/style.cfm%3F/g' "$file"
	done


# A few pages have scripts that have the browser's IP baked into them.
echo "Scrubbing IP addresses from HTML scripts (only a few pages)"

IP_REGEX="ip: \"[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\""
IFS=$'\n' # Change input field separator to handle files with spaces
for file in $(grep \
	--files-with-matches \
	--recursive \
	--extended-regexp "$IP_REGEX" \
	$MIRROR_DIR
); do
	echo "$file"
	sed \
		--in-place \
		--regexp-extended "s/$IP_REGEX/ip: \"[REDACTED]\"/g" \
		"$file"
done
