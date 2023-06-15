import { DateTime } from 'luxon';
import React, { JSX } from 'react';

interface DateProps {
	date: Date | string;
}

export function DayDate({ date }: DateProps): JSX.Element {
	const dateTime = convertToDateTime(date);
	return <>{toDay(dateTime)}</>;
}

export function RelDate({ date }: DateProps): JSX.Element {
	const dateTime = convertToDateTime(date);
	return isToday(dateTime)     ? <b>Today @ {toTime(dateTime)}</b>
		:  isYesterday(dateTime) ? <b>Yesterday @ {toTime(dateTime)}</b>
		:                          <>{toAbsoluteDate(dateTime)}</>;
}

function convertToDateTime(date: Date | string): DateTime {
	return date instanceof Date
		? DateTime.fromJSDate(date)
		: DateTime.fromISO(date);
}

function isToday(dateTime: DateTime): boolean {
	return dateTime.toISODate() === DateTime.local().toISODate();
}

function isYesterday(dateTime: DateTime): boolean {
	return dateTime.toISODate() === DateTime.local().minus({ days: 1 }).toISODate();
}

/** Example: Jan 29, 2023 09:55 PM */
function toAbsoluteDate(dateTime: DateTime): string {
	return dateTime.toFormat('MMM d, yyyy hh:mm a');
}

/** Example: Sep 30, 2006 */
function toDay(dateTime: DateTime): string {
	return dateTime.toLocaleString(DateTime.DATE_MED);
}

/** Example: 05:41 PM */
function toTime(dateTime: DateTime): string {
	return dateTime.toLocaleString(DateTime.TIME_SIMPLE);
}
