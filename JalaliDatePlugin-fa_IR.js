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
 * Persian localization for Jalali date.
 *
 * @author Behrang Noroozinia
 */
Ext.apply(Date, {
    jalaliMonthNames: [
        'فروردین',
        'اردیبهشت',
        'خرداد',
        'تیر',
        'امرداد',
        'شهریور',
        'مهر',
        'آبان',
        'آذر',
        'دی',
        'بهمن',
        'اسفند'
    ],

    dayNames: [
        'یکشنبه',
        'دوشنبه',
        'سه‌شنبه',
        'چهارشنبه',
        'پنج‌شنبه',
        'آدینه',
        'شنبه'
    ]
});

Ext.override(Ext.DatePicker, {
    dayNames: Date.dayNames,
    format: 'B/Q/R',
    todayText: 'امروز',
    okText: 'ادامه',
    cancelText: 'برگشت',
    todayTip: '{0} (جای خالی)',
    minText: 'این تاریخ پیش از نخستین ناریخ است',
    maxText: 'این تاریخ پس از آخرین تاریخ است',
    disabledDaysText: 'غیرفعال',
    disabledDatesText: 'غیرفعال',
    nextText: 'ماه پسین (مهار+راست)',
    prevText: 'ماه پیشین (مهار+چپ)',
    monthYearText: 'ماه را انتخاب کنید (جابجایی سال با مهار+بالا/پایین)',
    startDay: 6
});

Ext.override(Ext.form.DateField, {
    format: 'B/Q/R',
    altFormats: 'B/Q/R|B/q/r|b/q/r|b/Q/R|q/r|Q/R|Q/r|q/R|r|R',
    todayText: 'امروز',
    okText: 'ادامه',
    cancelText: 'برگشت',
    todayTip: '{0} (جای خالی)',
    minText: 'باید تاریخ‌های پس از {0} را برگزینید',
    maxText: 'باید تاریخ‌های پیش از {0} را برگزینید',
    invalidText: '{0} تاریخ درستی نیست، باید در قالب «سال/ماه/روز» باشد',
    disabledDaysText: 'غیرفعال',
    disabledDatesText: 'غیرفعال'
});
