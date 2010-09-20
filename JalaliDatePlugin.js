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
 * @class Ext.ux.JalaliDatePlugin
 *
 * <p>A plugin for Ext date components. Just add this object as a plugin to date components
 * (e.g. Ext.DatePicker, Ext.menu.DateMenu or Ext.form.DateField) and it will be converted to Jalali.
 *
 * @author Behrang Noroozinia
 */
Ext.ns("Ext.ux");
Ext.ux.JalaliDatePlugin = {

    /**
     * Initializes this plugin. Some methods in the main class are instrumented, others are replaced.
     * @param {Ext.Component} component Component that should be instrumented.
     */
    init: function (component) {
        if (component instanceof Ext.DatePicker) { // for both Ext.DatePicker & Ext.menu.DateMenu
            component.monthNames = Date.jalaliMonthNames;
            component.createMonthPicker = component.createMonthPicker.createSequence(this.afterCreateMonthPicker);
            component.showMonthPicker = component.showMonthPicker.createSequence(this.afterShowMonthPicker);
            component.onMonthClick = component.onMonthClick.createInterceptor(this.beforeOnMonthClick);
            component.onMonthDblClick = this.onMonthDblClick;
            component.showPrevMonth = this.showPrevMonth;
            component.showNextMonth = this.showNextMonth;
            component.showPrevYear = this.showPrevYear;
            component.showNextYear = this.showNextYear;
            component.update = this.update;
        } else if (component instanceof Ext.form.DateField) { // for Ext.form.DateField
            component.onTriggerClick = component.onTriggerClick.createInterceptor(this.beforeOnTriggerClick);
            component.safeParse = this.safeParse;
        }
    },

    /**
     * Replaces DateField.parseDate method. Since that method adds an hour field to format,
     * the parse functions in Date.parseFunctions are not used. Here we skip the hour conversion part.
     * It may produce errors when using different time zones.
     * @param {String} value The string containing a formatted date.
     * @param {String} format The format of the value to parse.
     */
    safeParse: function (value, format) {
        var parsedDate = Date.parseDate(value, format);
        if (parsedDate) {
            return parsedDate.clearTime();
        }
    },

    /**
     * Intercepts onTriggerClick method in date fields and adds this plugin to date menu.
     */
    beforeOnTriggerClick: function () {
        if (this.menu == null) {
            this.menu = new Ext.menu.DateMenu({
                hideOnClick: false,
                focusOnSelect: false,
                plugins: [Ext.ux.JalaliDatePlugin]
            })
        }
        return true;
    },

    /**
     * Replaces Gregorian month names with Jalali names.
     */
    afterCreateMonthPicker: function () {
        if (this.mpMonthsInstrumented) {
            return;
        }
        this.mpMonthsInstrumented = true;
        var monthNames = this.monthNames;
        this.mpMonths.each(function (m) {
            m.child('a').update(monthNames[m.dom.xmonth]);
        });
    },

    /**
     * Corrects month picker's selected month and year.
     */
    afterShowMonthPicker: function () {
        if (!this.disabled) {
            this.mpSelMonth = (this.activeDate || this.value).getJalaliMonth();
            this.updateMPMonth(this.mpSelMonth);
            this.mpSelYear = (this.activeDate || this.value).getJalaliFullYear();
            this.updateMPYear(this.mpSelYear);
        }
    },

    /**
     * Selects correct month and year when OK button is selected.
     */
    beforeOnMonthClick: function (e, t) {
        var el = new Ext.Element(t);
        if (el.is('button.x-date-mp-ok')) {
            e.stopEvent();
            this.update(Ext.ux.JalaliDatePlugin.prepareDate(
                    this.mpSelYear, this.mpSelMonth, (this.activeDate || this.value).getJalaliDate()));
            this.hideMonthPicker();
            return false;
        }
        return true;
    },

    /**
     * Handles double clicking in month picker.
     */
    onMonthDblClick : function(e, t){
        e.stopEvent();
        var el = new Ext.Element(t), pn;
        if((pn = el.up('td.x-date-mp-month', 2))){
            this.update(Ext.ux.JalaliDatePlugin.prepareDate(
                    this.mpSelYear, pn.dom.xmonth, (this.activeDate || this.value).getJalaliDate()));
            this.hideMonthPicker();
        }
        else if((pn = el.up('td.x-date-mp-year', 2))){
            this.update(Ext.ux.JalaliDatePlugin.prepareDate(
                    pn.dom.xyear, this.mpSelMonth, (this.activeDate || this.value).getJalaliDate()));
            this.hideMonthPicker();
        }
    },

    // private
    prepareDate: function (year, month, date) {
        var d = Date.correctJalaliDateOfMonth(year, month, date);
        return Date.createJalali(year, month, d);
    },

    /**
     * Handles showing previous month.
     */
    showPrevMonth: function () {
        this.update(this.activeDate.addJalali(Date.MONTH, -1));
    },

    /**
     * Handles showing next month.
     */
    showNextMonth: function () {
        this.update(this.activeDate.addJalali(Date.MONTH, 1));
    },

    /**
     * Handles showing previous year.
     */
    showPrevYear: function () {
        this.update(this.activeDate.addJalali(Date.YEAR, -1));
    },

    /**
     * Handles showing next year.
     */
    showNextYear: function () {
        this.update(this.activeDate.addJalali(Date.YEAR, 1));
    },

    /**
     * Overridden update method of DatePicker. A few lines changed, so it can show Jalali dates.
     * @param {Date} date The date that should be selected.
     * @param {Boolean} forceRefresh Force refresh current month display.
     */
    update : function(date, forceRefresh){
        if(this.rendered){
            var vd = this.activeDate, vis = this.isVisible();
            this.activeDate = date;
            if(!forceRefresh && vd && this.el){
                var t = date.getTime();
                if(vd.getJalaliMonth() == date.getJalaliMonth() && vd.getJalaliFullYear() == date.getJalaliFullYear()){
                    this.cells.removeClass('x-date-selected');
                    this.cells.each(function(c){
                       if(c.dom.firstChild.dateValue == t){
                           c.addClass('x-date-selected');
                           if(vis && !this.cancelFocus){
                               Ext.fly(c.dom.firstChild).focus(50);
                           }
                           return false;
                       }
                    }, this);
                    return;
                }
            }
            var days = date.getJalaliDaysInMonth(),
                firstOfMonth = date.getJalaliFirstDateOfMonth(),
                startingPos = firstOfMonth.getDay()-this.startDay;

            if(startingPos < 0){
                startingPos += 7;
            }
            days += startingPos;

            var pm = date.addJalali(Date.MONTH, -1),
                prevStart = pm.getJalaliDaysInMonth()-startingPos,
                cells = this.cells.elements,
                textEls = this.textNodes,
                // convert everything to numbers so it's fast
                d = Date.createJalali(pm.getJalaliFullYear(), pm.getJalaliMonth(), prevStart),
                today = new Date().clearTime().getTime(),
                sel = date.clearTime(true).getTime(),
                min = this.minDate ? this.minDate.clearTime(true) : Number.NEGATIVE_INFINITY,
                max = this.maxDate ? this.maxDate.clearTime(true) : Number.POSITIVE_INFINITY,
                ddMatch = this.disabledDatesRE,
                ddText = this.disabledDatesText,
                ddays = this.disabledDays ? this.disabledDays.join('') : false,
                ddaysText = this.disabledDaysText,
                format = this.format;
            d.setHours(this.initHour);

            if(this.showToday){
                var td = new Date().clearTime(),
                    disable = (td < min || td > max ||
                    (ddMatch && format && ddMatch.test(td.dateFormat(format))) ||
                    (ddays && ddays.indexOf(td.getDay()) != -1));

                if(!this.disabled){
                    this.todayBtn.setDisabled(disable);
                    this.todayKeyListener[disable ? 'disable' : 'enable']();
                }
            }

            var setCellClass = function(cal, cell){
                cell.title = '';
                var t = d.clearTime(true).getTime();
                cell.firstChild.dateValue = t;
                if(t == today){
                    cell.className += ' x-date-today';
                    cell.title = cal.todayText;
                }
                if(t == sel){
                    cell.className += ' x-date-selected';
                    if(vis){
                        Ext.fly(cell.firstChild).focus(50);
                    }
                }
                // disabling
                if(t < min) {
                    cell.className = ' x-date-disabled';
                    cell.title = cal.minText;
                    return;
                }
                if(t > max) {
                    cell.className = ' x-date-disabled';
                    cell.title = cal.maxText;
                    return;
                }
                if(ddays){
                    if(ddays.indexOf(d.getDay()) != -1){
                        cell.title = ddaysText;
                        cell.className = ' x-date-disabled';
                    }
                }
                if(ddMatch && format){
                    var fvalue = d.dateFormat(format);
                    if(ddMatch.test(fvalue)){
                        cell.title = ddText.replace('%0', fvalue);
                        cell.className = ' x-date-disabled';
                    }
                }
            };

            var i = 0;
            for(; i < startingPos; i++) {
                textEls[i].innerHTML = (++prevStart);
                d.setDate(d.getDate()+1);
                cells[i].className = 'x-date-prevday';
                setCellClass(this, cells[i]);
            }
            for(; i < days; i++){
                var intDay = i - startingPos + 1;
                textEls[i].innerHTML = (intDay);
                d.setDate(d.getDate()+1);
                cells[i].className = 'x-date-active';
                setCellClass(this, cells[i]);
            }
            var extraDays = 0;
            for(; i < 42; i++) {
                 textEls[i].innerHTML = (++extraDays);
                 d.setDate(d.getDate()+1);
                 cells[i].className = 'x-date-nextday';
                 setCellClass(this, cells[i]);
            }

            this.mbtn.setText(this.monthNames[date.getJalaliMonth()] + ' ' + date.getJalaliFullYear());

            if(!this.internalRender){
                var main = this.el.dom.firstChild,
                    w = main.offsetWidth;
                this.el.setWidth(w + this.el.getBorderWidth('lr'));
                Ext.fly(main).setWidth(w);
                this.internalRender = true;
                // opera does not respect the auto grow header center column
                // then, after it gets a width opera refuses to recalculate
                // without a second pass
                if(Ext.isOpera && !this.secondPass){
                    main.rows[0].cells[1].style.width = (w - (main.rows[0].cells[0].offsetWidth+main.rows[0].cells[2].offsetWidth)) + 'px';
                    this.secondPass = true;
                    this.update.defer(10, this, [date]);
                }
            }
        }
    }
};
