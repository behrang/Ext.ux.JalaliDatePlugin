Ext.ux.JalaliDatePlugin
=======================

About
-----
JalaliDatePlugin is an ExtJS plugin for DatePicker, DateMenu and DateField components. It converts their calendar to Jalali (Khorshidi or Shamsi) calendar. It supports Ext 3.2.1 and Ext 4.2.1.


Installation
------------
To install Ext.ux.JalaliDatePlugin, include the following on your page:

    <script src="Jalali.js"></script>
    <script src="JalaliDate.js"></script>
    <script src="JalaliDatePlugin.js"></script>

If you want a Persian localization, include this one too:

    <script src="JalaliDatePlugin-fa_IR.js"></script>


Usage
-----
Usage is very easy. Just add Ext.ux.JalaliDatePlugin to DatePicker, DateMenu or DateField's plugins property:

    var datePicker = new Ext.DatePicker({
        plugins: ['jalalidate']
    });

Please note that all other configuration properties of components like minDate, maxDate, disabledDays and disabledDates work as expected.

You can globally disable all Jalali fields with this:

    Ext.ux.JalaliDatePlugin.enabled = false;


Example
-------
Download or clone the code and then open example.html file in your browser.


License
-------
Jalali.js is licensed under the terms of the LGPL license.

Other files are licensed under the terms of the MIT license.


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/behrang/ext.ux.jalalidateplugin/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

