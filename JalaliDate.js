/**
 * Instruments Ext.Date object and adds support for Jalali calendar to it.
 *
 * <p>Usage is very simple. Examples:
 * <pre><code>
 var date;
 date = new Date();
 console.log(Ext.Date.getJalaliFullYear(date)); // current year in Jalali calendar
 console.log(Ext.Date.getJalaliMonth(date)); // current month in Jalali calendar (0-based)
 console.log(Ext.Date.getJalaliDate(date)); // current date in Jalali calendar
 console.log(Ext.Date.isJalaliLeapYear(date)); // true if this is a leap year in Jalali calendar
 console.log(Ext.Date.format(Ext.Date.addJalali(date, Ext.Date.MONTH, -3), 'Jalali')); // subtracts a month in Jalali calendar
 console.log(Ext.Date.getJalaliDaysInMonth(date)); // count of days in current Jalali month
 console.log(Ext.Date.getJalaliFirstDateOfMonth(date)); // date of the first day of current month in Jalali calendar
 * </code></pre>
 * There are some useful methods. Be sure to read the documentation.
 *
 * <p>Gregorian to Jalali conversion is based on algorithm provided by farsiweb.info
 * (see http://www.farsiweb.info/jalali/jalali.js).
 */
(function () {
    'use strict';

    Ext.define('Ext.ux.JalaliDate', {
        override: 'Ext.Date',

        /**
         * Validates a Jalali date.
         * @param y Year value.
         * @param m Month value, 1-based.
         * @param d Date value.
         * @return {Boolean} True if valid, false otherwise.
         */
        isJalaliValid: function (y, m, d) {
            var g, j;
            if (y > 1500 || y < 1 || m > 12 || m < 1 || d > 31 || d < 1) {
                return false;
            }
            g = Ext.Date.JalaliConverter.jalaliToGregorian([y, m, d]);
            j = Ext.Date.JalaliConverter.gregorianToJalali(g);
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
            var d = Math.max(1, Math.min(31, date));
            if (month === 11 && d > 29) {
                if (Ext.Date.isJalaliLeapYear(year)) {
                    d = 30;
                } else {
                    d = 29;
                }
            } else if (month > 5 && d > 30) {
                d = 30;
            }
            return d;
        },

        /**
         * Creates a new date instance based on the provided Jalali year, month (0-based) and date.
         * @param {Number} year Jalali full year.
         * @param {Number} month Jalali month (0-based).
         * @param {Number} date Jalali date.
         */
        createJalali: function (year, month, date) {
            var g = Ext.Date.JalaliConverter.jalaliToGregorian([year, month + 1, date]);
            return new Date(g[0], g[1] - 1, g[2], 12);
        },

        /**
         * Parses a Jalali formatted date string (like "1389/06/09") and returns a Date object.
         * @param {String} jalaliString Formatted string to parse.
         * @param {Boolean} strict True to validate date strings after parsing which will return null when invalid
         * (default is false).
         * @return {Date} A Date object which is set to the Gregorian conversion of input.
         */
        parseJalali: function (jalaliString, strict) {
            var g, d,
                split = jalaliString.split('/'),
                jy = parseInt(split[0], 10),
                jm = parseInt(split[1], 10),
                jd = parseInt(split[2], 10);
            if (isNaN(jy) || isNaN(jm) || isNaN(jd) || jy > 1500 || jy < 1 || jm > 12 || jm < 1 || jd > 31 || jd < 1) {
                return null;
            }
            g = Ext.Date.JalaliConverter.jalaliToGregorian([jy, jm, jd]);
            d = new Date(g[0], g[1] - 1, g[2], 12);
            if (strict &&
                    (!d || Ext.Date.getJalaliFullYear(d) !== jy || Ext.Date.getJalaliMonth(d) + 1 !== jm || Ext.Date.getJalaliDate(d) !== jd)) {
                return null;
            }
            return d;
        },

        /**
         * Converts date to Jalali date.
         * @param {Date} gregorian date
         * @return {Object} with jalaliYear, jalaliMonth (0-based) and jalaliDate properties.
         */
        convertToJalali: function (date) {
            var j = Ext.Date.JalaliConverter.gregorianToJalali([date.getFullYear(), date.getMonth() + 1, date.getDate()]);
            return {
                jalaliYear: j[0],
                jalaliMonth: j[1] - 1,
                jalaliDate: j[2]
            };
        },

        /**
         * Returns Jalali full year.
         * @param {Date} gregorian date
         * @return {Number} Jalali year.
         */
        getJalaliFullYear: function (date) {
            return Ext.Date.convertToJalali(date).jalaliYear;
        },

        /**
         * Returns Jalali month. Month is 0-based.
         * @param {Date} gregorian date
         * @return {Number} Jalali month of year (0-based).
         */
        getJalaliMonth: function (date) {
            return Ext.Date.convertToJalali(date).jalaliMonth;
        },

        /**
         * Returns Jalali date of month.
         * @param {Date} gregorian date
         * @return {Number} Jalali date of month.
         */
        getJalaliDate: function (date) {
            return Ext.Date.convertToJalali(date).jalaliDate;
        },

        /**
         * Checks if the date or year is a Jalali leap year.
         * @param {Date/Number} date Gregorian date or Jalali year
         * @return {Boolean} True if the current date or year is a Jalali leap year, false otherwise.
         */
        isJalaliLeapYear: function (date) {
            var year = date;
            if (Object.prototype.toString.call(date) === '[object Date]') {
                year = Ext.Date.convertToJalali(date).jalaliYear;
            }
            return Ext.Date.isJalaliValid(year, 12, 30);
        },

        /**
         * Provides a convenient method for performing basic Jalali date arithmetic. It creates and returns
         * a new Date instance containing the resulting date value.
         * @param {Date} date Starting date
         * @param {String} interval A valid date interval enum value.
         * @param {Number} value The amount to add to the current date.
         * @return {Date} The new Date instance.
         */
        addJalali: function (date, interval, value) {
            var jd, gd,
                d = new Date(date.getTime());
            if (!interval || value === 0) {
                return d;
            }

            jd = Ext.Date.convertToJalali(d);

            switch (interval.toLowerCase()) {
            case Ext.Date.DAY:
                jd.jalaliDate += value;
                break;
            case Ext.Date.MONTH:
                jd.jalaliMonth += value;
                jd.jalaliYear += Math.floor(jd.jalaliMonth / 12);
                jd.jalaliMonth %= 12;
                if (jd.jalaliMonth < 0) {
                    jd.jalaliMonth += 12;
                }
                jd.jalaliDate = Ext.Date.correctJalaliDateOfMonth(jd.jalaliYear, jd.jalaliMonth, jd.jalaliDate);
                break;
            case Ext.Date.YEAR:
                jd.jalaliYear += value;
                jd.jalaliDate = Ext.Date.correctJalaliDateOfMonth(jd.jalaliYear, jd.jalaliMonth, jd.jalaliDate);
                break;
            }
            gd = Ext.Date.JalaliConverter.jalaliToGregorian([jd.jalaliYear, jd.jalaliMonth + 1, jd.jalaliDate]);
            d.setFullYear(gd[0]);
            d.setMonth(gd[1] - 1);
            d.setDate(gd[2]);
            return d;
        },

        /**
         * Returns the number of days in the current Jalali month, adjusted for leap year.
         * @param {Date} date Starting date
         * @return {Number} The number of days in the current Jalali month.
         */
        getJalaliDaysInMonth: function (date) {
            var days, jd = Ext.Date.convertToJalali(date);
            if (jd.jalaliMonth < 6) {
                days = 31;
            } else if (jd.jalaliMonth < 11) {
                days = 30;
            } else if (Ext.Date.isJalaliLeapYear(jd.jalaliYear)) {
                days = 30;
            } else {
                days = 29;
            }
            return days;
        },

        /**
         * Returns the date of the first day of the Jalali month.
         * @param {Date} date Starting date
         * @return {Date} The date of the first day of the Jalali month.
         */
        getJalaliFirstDateOfMonth: function (date) {
            var jd = Ext.Date.convertToJalali(date);
            return Ext.Date.createJalali(jd.jalaliYear, jd.jalaliMonth, 1);
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
    }, function () {
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
         console.log(Ext.Date.format(d, 'B/Q/R'));     // 1389/06/14
         console.log(Ext.Date.format(d, 'b/q/r'));     // 89/6/14
         console.log(Ext.Date.format(d, 'l, r e B'));  // Sunday, 14 Shahrivar 1389
         * </code></pre>
         */
        Ext.apply(Ext.Date.formatCodes, {
            r: "Ext.Date.getJalaliDate(this)",
            R: "Ext.String.leftPad(Ext.Date.getJalaliDate(this), 2, '0')",
            q: "(Ext.Date.getJalaliMonth(this) + 1)",
            Q: "Ext.String.leftPad(Ext.Date.getJalaliMonth(this) + 1, 2, '0')",
            e: "Ext.Date.jalaliMonthNames[Ext.Date.getJalaliMonth(this)]",
            b: "('' + Ext.Date.getJalaliFullYear(this)).substring(2, 4)",
            B: "Ext.Date.getJalaliFullYear(this)"
        });

        Ext.apply(Ext.Date.formatFunctions, {
            /**
             * Formats date instances using Jalali format (like: "1389/06/14").
             * @return {String} Textual representation of Jalali date.
             */
            'Jalali': function () {
                var jd = Ext.Date.convertToJalali(this);
                return jd.jalaliYear + '/' +
                        Ext.String.leftPad(jd.jalaliMonth + 1, 2, '0') + '/' +
                        Ext.String.leftPad(jd.jalaliDate, 2, '0');
            }
        });

        Ext.apply(Ext.Date.parseFunctions, {
            /**
             * Parses a Jalali formatted date string (like "1389/06/09") and returns a Date object.
             * @param {String} jalaliString Formatted string to parse.
             * @param {Boolean} strict True to validate date strings after parsing which will return null when invalid
             * (default is false).
             * @return {Date} A Date object which is set to the Gregorian conversion of input.
             */
            'Jalali': Ext.Date.parseJalali,
            'B/Q/R': Ext.Date.parseJalali,
            'B/q/r': Ext.Date.parseJalali,
            'b/q/r': function (value, strict) {
                return Ext.Date.parseJalali('13' + value, strict);
            },
            'b/Q/R': function (value, strict) {
                return Ext.Date.parseJalali('13' + value, strict);
            },
            'B': function (value, strict) {
                var now = new Date();
                return Ext.Date.parseJalali(value + '/' + (Ext.Date.getJalaliMonth(now) + 1) + '/' + Ext.Date.getJalaliDate(now), strict);
            },
            'b': function (value, strict) {
                var now = new Date();
                return Ext.Date.parseJalali('13' + value + '/' + (Ext.Date.getJalaliMonth(now) + 1) + '/' + Ext.Date.getJalaliDate(now), strict);
            },
            'q': function (value, strict) {
                var now = new Date();
                return Ext.Date.parseJalali(Ext.Date.getJalaliFullYear(now) + '/' + value + '/' + Ext.Date.getJalaliDate(now), strict);
            },
            'Q': function (value, strict) {
                var now = new Date();
                return Ext.Date.parseJalali(Ext.Date.getJalaliFullYear(now) + '/' + value + '/' + Ext.Date.getJalaliDate(now), strict);
            },
            'r': function (value, strict) {
                var now = new Date();
                return Ext.Date.parseJalali(Ext.Date.getJalaliFullYear(now) + '/' + (Ext.Date.getJalaliMonth(now) + 1) + '/' + value, strict);
            },
            'R': function (value, strict) {
                var now = new Date();
                return Ext.Date.parseJalali(Ext.Date.getJalaliFullYear(now) + '/' + (Ext.Date.getJalaliMonth(now) + 1) + '/' + value, strict);
            },
            'b/q': function (value, strict) {
                var now = new Date();
                return Ext.Date.parseJalali('13' + value + '/' + Ext.Date.getJalaliDate(now), strict);
            },
            'B/q': function (value, strict) {
                var now = new Date();
                return Ext.Date.parseJalali(value + '/' + Ext.Date.getJalaliDate(now), strict);
            },
            'B/Q': function (value, strict) {
                var now = new Date();
                return Ext.Date.parseJalali(value + '/' + Ext.Date.getJalaliDate(now), strict);
            },
            'b/Q': function (value, strict) {
                var now = new Date();
                return Ext.Date.parseJalali('13' + value + '/' + Ext.Date.getJalaliDate(now), strict);
            },
            'q/r': function (value, strict) {
                var now = new Date();
                return Ext.Date.parseJalali(Ext.Date.getJalaliFullYear(now) + '/' + value, strict);
            },
            'Q/r': function (value, strict) {
                var now = new Date();
                return Ext.Date.parseJalali(Ext.Date.getJalaliFullYear(now) + '/' + value, strict);
            },
            'Q/R': function (value, strict) {
                var now = new Date();
                return Ext.Date.parseJalali(Ext.Date.getJalaliFullYear(now) + '/' + value, strict);
            },
            'q/R': function (value, strict) {
                var now = new Date();
                return Ext.Date.parseJalali(Ext.Date.getJalaliFullYear(now) + '/' + value, strict);
            }
        });
    });
}());
