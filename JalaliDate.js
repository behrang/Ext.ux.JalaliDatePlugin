/*
 * Copyright (c) 2010 Tosan, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * Instruments Date object and adds support for Jalali calendar to it.
 *
 * <p>Usage is very simple. Any date object is also a Jalali date. Examples:
 * <pre><code>
 var date;
 date = new Date();
 console.log(date.getJalaliFullYear()); // current year in Jalali calendar
 console.log(date.getJalaliMonth()); // current month in Jalali calendar (0-based)
 console.log(date.getJalaliDate()); // current date in Jalali calendar
 console.log(date.isJalaliLeapYear()); // true if this is a leap year in Jalali calendar
 console.log(date.addJalali(Date.MONTH, -3).format('Jalali')); // subtracts a month in Jalali calendar
 console.log(date.getJalaliDaysInMonth()); // count of days in current Jalali month
 console.log(date.getJalaliFirstDateOfMonth()); // date of the first day of current month in Jalali calendar
 * </code></pre>
 * There are some useful methods. Be sure to read the documentation.
 *
 * <p>Gregorian to Jalali conversion is based on algorithm provided by farsiweb.info
 * (see http://www.farsiweb.info/jalali/jalali.js).
 *
 * @author Behrang Noroozinia
 */
Ext.apply(Date, {

    /**
     * Validates a Jalali date.
     * @param y Year value.
     * @param m Month value, 1-based.
     * @param d Date value.
     * @return {Boolean} True if valid, false otherwise.
     */
    isJalaliValid: function (y, m, d) {
        if (y > 1500 || y < 1 || m > 12 || m < 1 || d > 31 || d < 1) {
            return false;
        }
        var g = Date.jalaliConverter.jalaliToGregorian([y, m, d]);
        var j = Date.jalaliConverter.gregorianToJalali(g);
        return j[0] === y && j[1] === m && j[2] === d;
    },

    /**
     * Corrects Jalali date of month if the date is invalid for the specified month of year.
     * @param {Number} year Jalali full year.
     * @param {Number} month Jalali month (0-based).
     * @param {Number} date Jalali date.
     * @return {Number} Corrected Jalali date.
     */
    correctJalaliDateOfMonth: function (year, month, date) {
        if (month === 11 && date > 29) {
            if (Date.isJalaliLeapYear(year)) {
                return 30;
            } else {
                return 29;
            }
        } else if (month > 5 && date > 30) {
            return 30;
        } else {
            return date;
        }
    },

    /**
     * Checks whether the specified year is a leap year in Jalali calendar.
     * @param {Number} year A 4-digit year to check.
     */
    isJalaliLeapYear: function (year) {
        return Date.isJalaliValid(year, 12, 30);
    },

    /**
     * Creates a new date instance based on the provided Jalali year, month (0-based) and date.
     * @param {Number} year Jalali full year.
     * @param {Number} month Jalali month (0-based).
     * @param {Number} date Jalali date.
     */
    createJalali: function (year, month, date) {
        var g = Date.jalaliConverter.jalaliToGregorian([year, month + 1, date]);
        return new Date(g[0], g[1] - 1, g[2]);
    },

    /**
     * Parses a Jalali formatted date string (like "1389/06/09") and returns a Date object.
     * @param {String} jalaliString Formatted string to parse.
     * @param {Boolean} strict True to validate date strings after parsing which will return null when invalid
     * (default is false).
     * @return {Date} A Date object which is set to the Gregorian conversion of input.
     */
    parseJalali: function (jalaliString, strict) {
        var split = jalaliString.split('/');
        var jy = parseInt(split[0], 10),
            jm = parseInt(split[1], 10),
            jd = parseInt(split[2], 10);
        if (isNaN(jy) || isNaN(jm) || isNaN(jd) || jy > 1500 || jy < 1 || jm > 12 || jm < 1 || jd > 31 || jd < 1) {
            return null;
        }
        var g = Date.jalaliConverter.jalaliToGregorian([jy, jm, jd]);
        var d = new Date(g[0], g[1] - 1, g[2]);
        if (strict &&
                (!d || d.getJalaliFullYear() !== jy || d.getJalaliMonth() + 1 !== jm && d.getJalaliDate() !== jd)) {
            return null;
        }
        return d;
    },

    /**
     * Month names of Jalali calendar. Override this for localization.
     */
    jalaliMonthNames: [
        'Farvardin',
        'Ordibehesht',
        'Khordad',
        'Tir',
        'Amordad',
        'Shahrivar',
        'Mehr',
        'Aban',
        'Azar',
        'Dey',
        'Bahman',
        'Esfand'
    ]
});

/**
 * Jalali format codes. List of Jalali format codes:
 * <pre><code>
 Format  Description                                                          Example returned values
 ------  -------------------------------------------------------------------  -----------------------
   r     Jalali day of the month without leading zeros                        1 to 31
   R     Jalali day of the month, 2 digits with leading zeros                 01 to 31
   q     Numeric representation of Jalali month without leading zeros         1 to 12
   Q     Numeric representation of Jalali month, 2 digits with leading zeros  01 to 12
   e     Full textual representation of Jalali month                          Farvardin to Esfand
   b     Short representation of Jalali year, 2 digits                        89 or 60
   B     Full numeric representation of Jalali year, 4 digits                 1389 or 1360
 * </code></pre>
 * Example usage:
 * <pre><code>
 var d = new Date();
 console.log(d.format('B/Q/R'));     // 1389/06/14
 console.log(d.format('b/q/r'));     // 89/6/14
 console.log(d.format('l, r e B'));  // Sunday, 14 Shahrivar 1389
 * </code></pre>
 */
Ext.apply(Date.formatCodes, {
    r: "this.getJalaliDate()",
    R: "String.leftPad(this.getJalaliDate(), 2, '0')",
    q: "(this.getJalaliMonth() + 1)",
    Q: "String.leftPad(this.getJalaliMonth() + 1, 2, '0')",
    e: "Date.jalaliMonthNames[this.getJalaliMonth()]",
    b: "('' + this.getJalaliFullYear()).substring(2, 4)",
    B: "this.getJalaliFullYear()"
});

Ext.apply(Date.formatFunctions, {
    /**
     * Formats date instances using Jalali format (like: "1389/06/14").
     * @return {String} Textual representation of Jalali date.
     */
    'Jalali': function () {
        return this.getJalaliFullYear() + '/' +
                String.leftPad(this.getJalaliMonth() + 1, 2, '0') + '/' +
                String.leftPad(this.getJalaliDate(), 2, '0');
    }
});

Ext.apply(Date.parseFunctions, {
    /**
     * Parses a Jalali formatted date string (like "1389/06/09") and returns a Date object.
     * @param {String} jalaliString Formatted string to parse.
     * @param {Boolean} strict True to validate date strings after parsing which will return null when invalid
     * (default is false).
     * @return {Date} A Date object which is set to the Gregorian conversion of input.
     */
    'Jalali': Date.parseJalali,
    'B/Q/R': Date.parseJalali,
    'B/q/r': Date.parseJalali,
    'b/q/r': function (value, strict) {
        return Date.parseJalali('13' + value, strict);
    },
    'b/Q/R': function (value, strict) {
        return Date.parseJalali('13' + value, strict);
    },
    'B': function (value, strict) {
        var now = new Date();
        return Date.parseJalali(value + '/' + (now.getJalaliMonth() + 1) + '/' + now.getJalaliDate(), strict);
    },
    'b': function (value, strict) {
        var now = new Date();
        return Date.parseJalali('13' + value + '/' + (now.getJalaliMonth() + 1) + '/' + now.getJalaliDate(), strict);
    },
    'q': function (value, strict) {
        var now = new Date();
        return Date.parseJalali(now.getJalaliFullYear() + '/' + value + '/' + now.getJalaliDate(), strict);
    },
    'Q': function (value, strict) {
        var now = new Date();
        return Date.parseJalali(now.getJalaliFullYear() + '/' + value + '/' + now.getJalaliDate(), strict);
    },
    'r': function (value, strict) {
        var now = new Date();
        return Date.parseJalali(now.getJalaliFullYear() + '/' + (now.getJalaliMonth() + 1) + '/' + value, strict);
    },
    'R': function (value, strict) {
        var now = new Date();
        return Date.parseJalali(now.getJalaliFullYear() + '/' + (now.getJalaliMonth() + 1) + '/' + value, strict);
    },
    'b/q': function (value, strict) {
        var now = new Date();
        return Date.parseJalali('13' + value + '/' + now.getJalaliDate(), strict);
    },
    'B/q': function (value, strict) {
        var now = new Date();
        return Date.parseJalali(value + '/' + now.getJalaliDate(), strict);
    },
    'B/Q': function (value, strict) {
        var now = new Date();
        return Date.parseJalali(value + '/' + now.getJalaliDate(), strict);
    },
    'b/Q': function (value, strict) {
        var now = new Date();
        return Date.parseJalali('13' + value + '/' + now.getJalaliDate(), strict);
    },
    'q/r': function (value, strict) {
        var now = new Date();
        return Date.parseJalali(now.getJalaliFullYear() + '/' + value, strict);
    },
    'Q/r': function (value, strict) {
        var now = new Date();
        return Date.parseJalali(now.getJalaliFullYear() + '/' + value, strict);
    },
    'Q/R': function (value, strict) {
        var now = new Date();
        return Date.parseJalali(now.getJalaliFullYear() + '/' + value, strict);
    },
    'q/R': function (value, strict) {
        var now = new Date();
        return Date.parseJalali(now.getJalaliFullYear() + '/' + value, strict);
    }
});

Ext.override(Date, {

    /**
     * Calculates current Jalali date and caches the result. Methods that change this instance's state,
     * should invalidate cache.
     */
    convertToJalali: function () {
        if (!this.jalaliConverted) {
            var j = Date.jalaliConverter.gregorianToJalali([this.getFullYear(), this.getMonth() + 1, this.getDate()]);
            this.jalaliYear = j[0];
            this.jalaliMonth = j[1] - 1;
            this.jalaliDate = j[2];
            this.jalaliConverted = true;
        }
    },

    /**
     * Calculates current Gregorian date.
     */
    convertFromJalali: function () {
        var g = Date.jalaliConverter.jalaliToGregorian([this.jalaliYear, this.jalaliMonth + 1, this.jalaliDate]);
        this.setFullYear(g[0]);
        this.setMonth(g[1] - 1);
        this.setDate(g[2]);
        this.jalaliConverted = false;
        this.convertToJalali();
    },

    /**
     * Invalidates cache of Jalali conversion, so convertToJalali() will recalculate Jalali values the next time.
     */
    invalidateJalaliConversion: function () {
        this.jalaliConverted = false;
    },

    /**
     * Returns Jalali full year.
     * @return {Number} Jalali year.
     */
    getJalaliFullYear: function () {
        this.convertToJalali();
        return this.jalaliYear;
    },

    /**
     * Returns Jalali month. Month is 0-based.
     * @return {Number} Jalali month of year (0-based).
     */
    getJalaliMonth: function () {
        this.convertToJalali();
        return this.jalaliMonth;
    },

    /**
     * Returns Jalali date of month.
     * @return {Number} Jalali date of month.
     */
    getJalaliDate: function () {
        this.convertToJalali();
        return this.jalaliDate;
    },

    /**
     * Checks if the current date falls within a Jalali leap year.
     * @return {Boolean} True if the current date falls within a Jalali leap year, false otherwise.
     */
    isJalaliLeapYear: function () {
        this.convertToJalali();
        return Date.isJalaliLeapYear(this.jalaliYear);
    },

    /**
     * Provides a convenient method for performing basic Jalali date arithmetic. This method
     * does not modify the Date instance being called - it creates and returns
     * a new Date instance containing the resulting date value.
     * @param {String} interval A valid date interval enum value.
     * @param {Number} value The amount to add to the current date.
     * @return {Date} The new Date instance.
     */
    addJalali: function (interval, value) {
        var d = this.clone();
        if (!interval || value === 0) {
            return d;
        }

        d.convertToJalali();

        switch (interval.toLowerCase()) {
        case Date.DAY:
            d.jalaliDate += value;
            d.convertFromJalali();
            break;
        case Date.MONTH:
            d.jalaliMonth += value;
            d.jalaliYear += Math.floor(d.jalaliMonth / 12);
            d.jalaliMonth %= 12;
            if (d.jalaliMonth < 0) {
                d.jalaliMonth += 12;
            }
            d.jalaliDate = Date.correctJalaliDateOfMonth(d.jalaliYear, d.jalaliMonth, d.jalaliDate);
            d.convertFromJalali();
            break;
        case Date.YEAR:
            d.jalaliYear += value;
            d.jalaliDate = Date.correctJalaliDateOfMonth(d.jalaliYear, d.jalaliMonth, d.jalaliDate);
            d.convertFromJalali();
            break;
        }
        return d;
    },

    /**
     * Returns the number of days in the current Jalali month, adjusted for leap year.
     * @return {Number} The number of days in the current Jalali month.
     */
    getJalaliDaysInMonth: function () {
        this.convertToJalali();
        if (this.jalaliMonth < 6) {
            return 31;
        } else if (this.jalaliMonth < 11) {
            return 30;
        } else if (this.isJalaliLeapYear()) {
            return 30;
        } else {
            return 29;
        }
    },

    /**
     * Returns the date of the first day of the Jalali month.
     * @return {Date} The date of the first day of the Jalali month.
     */
    getJalaliFirstDateOfMonth: function () {
        this.convertToJalali();
        return Date.createJalali(this.jalaliYear, this.jalaliMonth, 1);
    }
});

// Invalidates Jalali conversion cache
Ext.override(Date, {
    clearTime: Date.prototype.clearTime.createSequence(Date.prototype.invalidateJalaliConversion),
    setYear: Date.prototype.setYear.createSequence(Date.prototype.invalidateJalaliConversion),
    setMonth: Date.prototype.setMonth.createSequence(Date.prototype.invalidateJalaliConversion),
    setDate: Date.prototype.setDate.createSequence(Date.prototype.invalidateJalaliConversion),
    add: Date.prototype.add.createSequence(Date.prototype.invalidateJalaliConversion)
});
