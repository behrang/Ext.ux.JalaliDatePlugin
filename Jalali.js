/* Jalali.js  Gregorian to Jalali and inverse date converter
 * Copyright (C) 2001  Roozbeh Pournader <roozbeh@sharif.edu>
 * Copyright (C) 2001  Mohammad Toossi <mohammad@bamdad.org>
 * Copyright (C) 2003,2008  Behdad Esfahbod <js@behdad.org>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You can receive a copy of GNU Lesser General Public License at the
 * World Wide Web address <http://www.gnu.org/licenses/lgpl.html>.
 *
 * For licensing issues, contact The FarsiWeb Project Group,
 * Computing Center, Sharif University of Technology,
 * PO Box 11365-8515, Tehran, Iran, or contact us the
 * email address <FWPG@sharif.edu>.
 */

/* Changes:
 * 2013-May-25:
 *   Move JalaliConverter to Ext.Date.
 *
 * 2010-Sep-19:
 *   Some minor changes to names of functions for better naming conventions.
 *   Also redundant functions removed to prevent namespace pollution.
 *
 * 2008-Jul-32:
 *   Use a remainder() function to fix conversion of ancient dates
 *   (before 1600 gregorian).  Reported by Shamim Rezaei.
 *
 * 2003-Mar-29:
 *   Ported to javascript by Behdad Esfahbod
 *
 * 2001-Sep-21:
 *   Fixed a bug with "30 Esfand" dates, reported by Mahmoud Ghandi
 *
 * 2001-Sep-20:
 *   First LGPL release, with both sides of conversions
 */

(function () {
    'use strict';

    Ext.Date.JalaliConverter = {};

    Ext.Date.JalaliConverter.gregorianDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    Ext.Date.JalaliConverter.jalaliDaysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];

    Ext.Date.JalaliConverter.div = function (a, b) {
        return Math.floor(a / b);
    };

    Ext.Date.JalaliConverter.remainder = function (a, b) {
        return a - Math.floor(a / b) * b;
    };

    /**
     * Converts a Gregorian date to Jalali.
     * @param {Array} g An array containing Gregorian year, month and date.
     * @return {Array} An array containing Jalali year, month and date.
     */
    Ext.Date.JalaliConverter.gregorianToJalali = function (g) {
        var gy, gm, gd,
            jy, jm, jd,
            g_day_no, j_day_no,
            j_np, i, div, remainder,
            g_days_in_month, j_days_in_month;

        gy = g[0] - 1600;
        gm = g[1] - 1;
        gd = g[2] - 1;

        div = Ext.Date.JalaliConverter.div;
        remainder = Ext.Date.JalaliConverter.remainder;
        g_days_in_month = Ext.Date.JalaliConverter.gregorianDaysInMonth;
        j_days_in_month = Ext.Date.JalaliConverter.jalaliDaysInMonth;

        g_day_no = 365 * gy + div((gy + 3), 4) - div((gy + 99), 100) + div((gy + 399), 400);
        for (i = 0; i < gm; i += 1) {
            g_day_no += g_days_in_month[i];
        }
        if (gm > 1 && ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0))) {
            /* leap and after Feb */
            g_day_no += 1;
        }
        g_day_no += gd;

        j_day_no = g_day_no - 79;

        j_np = div(j_day_no, 12053);
        j_day_no = remainder(j_day_no, 12053);

        jy = 979 + 33 * j_np + 4 * div(j_day_no, 1461);
        j_day_no = remainder(j_day_no, 1461);

        if (j_day_no >= 366) {
            jy += div((j_day_no - 1), 365);
            j_day_no = remainder((j_day_no - 1), 365);
        }

        for (i = 0; i < 11 && j_day_no >= j_days_in_month[i]; i += 1) {
            j_day_no -= j_days_in_month[i];
        }
        jm = i + 1;
        jd = j_day_no + 1;

        return [jy, jm, jd];
    };

    /**
     * Converts a Jalali date to Gregorian.
     * @param {Array} j An array containing Jalali year, month and date.
     * @return {Array} An array containing Gregorian year, month and date.
     */
    Ext.Date.JalaliConverter.jalaliToGregorian = function (j) {
        var gy, gm, gd,
            jy, jm, jd,
            g_day_no, j_day_no,
            leap, i, div, remainder,
            g_days_in_month, j_days_in_month;

        jy = j[0] - 979;
        jm = j[1] - 1;
        jd = j[2] - 1;

        div = Ext.Date.JalaliConverter.div;
        remainder = Ext.Date.JalaliConverter.remainder;
        g_days_in_month = Ext.Date.JalaliConverter.gregorianDaysInMonth;
        j_days_in_month = Ext.Date.JalaliConverter.jalaliDaysInMonth;

        j_day_no = 365 * jy + div(jy, 33) * 8 + div((remainder(jy, 33) + 3), 4);
        for (i = 0; i < jm; i += 1) {
            j_day_no += j_days_in_month[i];
        }

        j_day_no += jd;

        g_day_no = j_day_no + 79;

        gy = 1600 + 400 * div(g_day_no, 146097);
        /* 146097 = 365*400 + 400/4 - 400/100 + 400/400 */
        g_day_no = remainder(g_day_no, 146097);

        leap = 1;
        if (g_day_no >= 36525) { /* 36525 = 365*100 + 100/4 */
            g_day_no -= 1;
            gy += 100 * div(g_day_no, 36524);
            /* 36524 = 365*100 + 100/4 - 100/100 */
            g_day_no = remainder(g_day_no, 36524);

            if (g_day_no >= 365) {
                g_day_no += 1;
            } else {
                leap = 0;
            }
        }

        gy += 4 * div(g_day_no, 1461);
        /* 1461 = 365*4 + 4/4 */
        g_day_no = remainder(g_day_no, 1461);

        if (g_day_no >= 366) {
            leap = 0;

            g_day_no -= 1;
            gy += div(g_day_no, 365);
            g_day_no = remainder(g_day_no, 365);
        }

        for (i = 0; g_day_no >= g_days_in_month[i] + (i === 1 && leap); i += 1) {
            g_day_no -= g_days_in_month[i] + (i === 1 && leap);
        }
        gm = i + 1;
        gd = g_day_no + 1;

        return [gy, gm, gd];
    };
}());
