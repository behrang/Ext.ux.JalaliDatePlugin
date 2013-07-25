/**
 * Persian localization for Jalali date.
 */
Ext.define('Ext.ux.JalaliDatePlugin-fa_IR', {
    override: 'Ext.Date',

    requires: 'Ext.ux.JalaliDatePlugin',

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

    jalaliDayNames: [
        'یک‌شنبه',
        'دوشنبه',
        'سه‌شنبه',
        'چهارشنبه',
        'پنج‌شنبه',
        'آدینه',
        'شنبه'
    ]
}, function () {
    Ext.override(Ext.ux.JalaliDatePlugin.localization.DatePicker, {
        dayNames: Ext.Date.jalaliDayNames,
        longDayFormat: 'r e B',
        monthYearFormat: 'e B',
        format: 'B/Q/R',
        todayText: 'امروز',
        okText: 'ادامه',
        cancelText: 'برگشت',
        todayTip: '{0} (جای خالی)',
        minText: 'این تاریخ پیش از نخستین تاریخ است',
        maxText: 'این تاریخ پس از آخرین تاریخ است',
        disabledDaysText: 'غیرفعال',
        disabledDatesText: 'غیرفعال',
        nextText: 'ماه پسین (مهار+راست)',
        prevText: 'ماه پیشین (مهار+چپ)',
        monthYearText: 'ماه را انتخاب کنید (جابجایی سال با مهار+بالا/پایین)',
        startDay: 6
    });

    Ext.override(Ext.ux.JalaliDatePlugin.localization.DateField, {
        format: 'B/Q/R',
        altFormats: 'B/Q/R|B/q/r|b/q/r|b/Q/R|q/r|Q/R|Q/r|q/R|r|R',
        minText: 'باید تاریخ‌های پس از {0} را برگزینید',
        maxText: 'باید تاریخ‌های پیش از {0} را برگزینید',
        invalidText: '{0} تاریخ درستی نیست، باید در قالب «سال/ماه/روز» باشد',
        disabledDaysText: 'غیرفعال',
        disabledDatesText: 'غیرفعال',
        startDay: 6
    });
});
