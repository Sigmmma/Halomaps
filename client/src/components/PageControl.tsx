import React, { Fragment, JSX, ReactNode } from 'react';
import { createUseStyles } from 'react-jss';

interface PageControlProps {
	count: number;
	pageSize: number;
	start: number;
	buildUrl: (page: number) => string;
}

type PageList = Array<number | null>;

const MAX_PAGE_LINKS = 10;

const useStyles = createUseStyles({
	container: {
		fontWeight: 'bold',
		width: '95%',
	},
	control: {
		display: 'inline-block',
		float: 'right',
		textAlign: 'right',
	},
	current: {
		display: 'inline-block',
		float: 'left',
	},
});

export function PageControl({
	count,
	pageSize,
	start,
	buildUrl,
}: PageControlProps): JSX.Element {
	const styles = useStyles();

	const { curPage, pageCount } = calcPage(count, pageSize, start);

	const links = generatePageList(curPage, pageCount).map<ReactNode>(page => {
		if (page === null   ) return '...';
		if (page === curPage) return `[${curPage}]`;
		return <a href={buildUrl(page)}>{page}</a>;
	});
	if (curPage >         1) links.push( <a href={buildUrl(curPage - 1)}>Prev</a> );
	if (curPage < pageCount) links.push( <a href={buildUrl(curPage + 1)}>Next</a> );

	return (
		<div className={styles.container}>
			<div className={styles.current}>
				<CurPage count={count} pageSize={pageSize} start={start} />
			</div>
			<div className={styles.control}>
				Go to page:{' '}
				{links.map((link, idx) => (
					<Fragment key={idx}>{' · '}{link}</Fragment>
				))}
			</div>
		</div>
	);
}

export function CurPage({
	count,
	pageSize,
	start,
}: Omit<PageControlProps, 'buildUrl'>): JSX.Element {
	const { curPage, pageCount } = calcPage(count, pageSize, start);
	return <>Page {curPage} of {pageCount}</>;
}

/** Calculate current page and max page count from item count and page size. */
function calcPage(count: number, pageSize: number, start: number): {
	curPage: number;
	pageCount: number;
} {
	return {
		curPage: Math.ceil(start / pageSize),
		pageCount: Math.ceil(count / pageSize),
	};
}

/**
 * Generates a list of page jumps. A null value indicates a non-clickable
 * ellipsis should be drawn.
 *
 * This function does the math to emulate this page control behavior
 * (and yes, page numbers can be out of bounds like that last example):
 *
 * - Page 1 of 298      Go to page: · [1] · 2 · 3 · 4 · 5 · 6 · 7 · 8 · ... · 298 · Next
 * - Page 5 of 298      Go to page: · 1 · 2 · 3 · 4 · [5] · 6 · 7 · 8 · ... · 298 · Prev · Next
 * - Page 6 of 298      Go to page: · 1 · ... · 3 · 4 · 5 · [6] · 7 · 8 · 9 · ... · 298 · Prev · Next
 * - Page 8 of 298      Go to page: · 1 · ... · 5 · 6 · 7 · [8] · 9 · 10 · 11 · ... · 298 · Prev · Next
 * - Page 293 of 298    Go to page: · 1 · ... · 290 · 291 · 292 · [293] · 294 · 295 · 296 · ... · 298 · Prev · Next
 * - Page 294 of 298    Go to page: · 1 · ... · 291 · 292 · 293 · [294] · 295 · 296 · 297 · 298 · Prev · Next
 * - Page 298 of 298    Go to page: · 1 · ... · 291 · 292 · 293 · 294 · 295 · 296 · 297 · [298] · Prev
 * - Page 429 of 371    Go to page: · 1 · ... · 364 · 365 · 366 · 367 · 368 · 369 · 370 · 371 · Prev
 *
 * Basically, the page list has at most 10 "things" (pages or ellipses) in it,
 * EXCEPT when `curPage` has ellipses on both sides, at which point the list has
 * 11 things in it (so an even number on both sides of `curPage`).
 *
 * Generating this list is actually way tricker than it first appears,
 * and involves handling many edge cases. Our approach is commented in context.
 */
function generatePageList(curPage: number, pageCount: number): PageList {
	const HALF_MAX = MAX_PAGE_LINKS / 2;

	// Clamp page number to avoid out of bound values.
	const safePage = Math.max(Math.min(curPage, pageCount), 1);

	let belowPages: PageList = [];
	let abovePages: PageList = [];

	// curPage near first page (i.e. close enough to not have an ellipsis on the left).
	// Unused left-side slots are given to right side.
	if (safePage <= HALF_MAX) {
		belowPages = makePages(safePage,         1, HALF_MAX);
		abovePages = makePages(safePage, pageCount, MAX_PAGE_LINKS - belowPages.length - 1);
	}
	// curPage near last page (i.e. close enough to not have an ellipsis on the right).
	// Unused right-side slots are given to left side.
	else if (safePage > (pageCount - HALF_MAX - 1)) {
		abovePages = makePages(safePage, pageCount, HALF_MAX);
		belowPages = makePages(safePage,         1, MAX_PAGE_LINKS - abovePages.length - 1);
	}
	// curPage somewhere in the middle. Getting here also implies we have enough
	// items to have ellipses on both sides, so just give both sides the same
	// number of items.
	else {
		belowPages = makePages(safePage,         1, HALF_MAX);
		abovePages = makePages(safePage, pageCount, HALF_MAX);
	}

	return [...belowPages.reverse(), safePage, ...abovePages];
}

/**
 * Makes a list of sequential page numbers either above or below the `start`
 * value, depending on the `end` value. `limit` is the max number of page
 * numbers to generate (but the list may contain less if it hits the `end`
 * value first).
 */
function makePages(start: number, end: number, limit: number): PageList {
	const step = (start > end) ? -1 : 1;

	if (end - (start * step) <= 0) {
		return [];
	}

	const items: PageList = [];
	let cur: number;
	let dist: number;
	do {
		cur  = start + ((items.length + 1) * step);
		dist = Math.abs(end - cur);

		// If 2 item slots left, and more than 2 items left to go
		if (items.length === (limit - 2) && dist >= 1) {
			items.push(null, end);
		} else {
			items.push(cur);
		}
	} while (items.length < limit && dist > 0);
	// We have at least 1 item slot left, and we're not at the stop value.

	return items;
}
