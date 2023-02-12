# Halomaps Forum Archive

<a href="LICENSE.md"><img align="right" alt="AGPL-3.0 Logo"
src="https://www.gnu.org/graphics/agplv3-155x51.png">
</a>

This is a read-only recreation of the Halomaps forum. Browse our hosted instance: [Link coming soon]

## Motivation

On February 1, 2023, the forum of [Halomaps](http://halomaps.org) (http://forum.halomaps.org) was shut down. This forum was a long-standing, invaluable repository of knowledge and history for modding Halo Custom Edition. It was replaced with a read-only archive. The post content was preserved, but things like usernames, topic IDs, and forum statistics were stripped out. Some of the last posts were also lost. This means most (if not all) contributions to this history have effectively been made anonymous.

Thankfully, prior to the shut down, the entirety of the forum was crawled and downloaded using a [`wget` script](mirror/mirror.sh). This mirror includes all the information the official archive is missing. This mirror has been used to reconstruct the Halomaps forum database, and serve it using a minimal, read-only web server, in order to preserve it for the community.

## Download

The mirror can also be downloaded and browsed offline as a series of rendered-out HTML pages.

**Warning:** unzips to a directory containing **52,000** files that total **1.6GB**! This can cripple some file browsers!<br/>
**Note:** the server that ran the mirror was on the US East Coast timezone (GMT-5:00), so all dates rendered in HTML are relative to that time.

- [Download for Linux](https://github.com/Sigmmma/Halomaps/raw/master/mirror/forum.halomaps.org_linux.7z) (has original file names, won't work on Windows)
- [Download for Windows](https://github.com/Sigmmma/Halomaps/raw/master/mirror/forum.halomaps.org_windows.7z) (file names and links modified to work on Windows)

## License
Copyright 2023 [Mimickal](https://github.com/Mimickal)<br/>
This code is licensed under the [AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0-standalone.html) license.<br/>
Basically, any modifications to this code must be made open source.
