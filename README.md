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

## Archive details

|              | Official | Ours |
| ------------ | -------- | ---- |
| Structure    |    ✔️     |  ✔️   |
| Topic names  |    ✔️     |  ✔️   |
| Dates        |    ✔️     |  ✔️   |
| Post content |    ✔️     |  ✔️   |
| Final posts  |    ❌    |  ✔️   |
| Usernames    |    ❌    |  ✔️   |
| User pages   |    ❌    |  ✔️   |
| Search       |    ❌    |  ✔️   |
| Forum stats  |    ❌    |  ✔️   |
| IDs          |    ❌    |  ✔️   |
| Links work   |    ❌    |  ✔️   |

### Wall of miscellaneous notes

- The root page is `index.html`. This is a good entry point for browsing the offline archive.
- The bulk of the mirror was downloaded Jan 18th 2023. Active topics were updated more frequently.
  - This process took several days (this is visible in the timestamps at the bottom of each page).
  - This means there are some discrepancies in things like forum statistics and "last post" markers.
    - Example: `index.html` has some slightly out-of-date stats.
- Echo77's last post in "Vehicles - Works in Process thread [WIP]" was manually reconstructed from a screenshot.
  - This was the last post made to the forum. It was approved very shortly before the forum was taken offline.
    - We actually did catch hints of it on the `page=forum` page, but missed the post itself because the topic was previously inactive.
    - The time on this post is "Today @ 12:15 AM". It should read "Yesterday @ 11:15 PM". This was a mistake we made in manually reconstructing the post.
  - It is missing entirely from the official archive. Presumably Dennis' archive script finished that thread before it was approved.
  - Because we manually reconstructed it, the message count is inconsistent for other pages in that topic.
- Any external links were not crawled or downloaded. They were left as-is.
  - **This includes images**, meaning **these images could disappear in the future**.
  - Many links were already broken at the time we mirrored the forum.
- Dates like "Today @ x" are relative to the timestamp at the bottom of the page.
- Any page that required a login to view is not included.
  - The "Private Messages" page and any admin pages are not included.
  - This is because the mirror was run as an anonymous user.
- Some pages include script tags for Google advertisement things. **We did not add these.** These scripts were present on Halomaps and have been left as-is in this archive.
- Some pages included scripts with IP addresses baked into them. These IPs have been scrubbed for this archive.
- Our mirror script crawled each page and downloaded the pages at every URL it found verbatim.
  - There are some duplicate pages where the only difference is the case in the file name (e.g. `userinfo` vs `userInfo`).
    - This is because Halomaps URL queries were case-insensitive and somewhat inconsistent.
  - Some longer topics have pages with wonky page numbers, like "142 of 124".
    - The resulting page is how Halomaps' actual server handled the incorrect query parameters.


## License
Copyright 2023 [Mimickal](https://github.com/Mimickal)<br/>
This code is licensed under the [AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0-standalone.html) license.<br/>
Basically, any modifications to this code must be made open source.
