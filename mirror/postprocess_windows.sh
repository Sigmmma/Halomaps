#!/bin/bash
# Sister script to postprocess that applies additional fixes to make the
# archive work on Windows computers.
MIRROR_DIR=$1

# Original filenames contain question marks, since Halomaps was essentially a
# "single endpoint" site that fetched pages using query parameters.
# We can't just escape these question marks in HTML, because question marks are
# a disallowed character in Windows filenames. 7zip will replace invalid
# characters with an underscore, but then links would still all be broken.
#
# tl;dr: Windows sucks, so we replace question marks with underscores.
echo "Tweaking links and filenames for Windows (this will take a while)"

find $MIRROR_DIR -type f -wholename '*index.*' \
	| while read file; do
		echo "$file"
		newname=$(echo "$file" | sed 's/?/_/')
		mv "$file" "$newname"
		sed --in-place 's/index.cfm%3Fpage/index.cfm_page/g' "$newname"
		sed --in-place 's/style.cfm%3F/style.cfm_/g' "$newname"
	done
