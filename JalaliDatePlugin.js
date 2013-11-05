/**
 * @class Ext.ux.JalaliDatePlugin
 *
 * <p>A plugin for Ext date components. Just add this object as a plugin to date components
 * (e.g. Ext.DatePicker, Ext.menu.DateMenu or Ext.form.DateField) and it will be converted to Jalali.
 */
(function () {
    var safeParse, createPicker, afterCreateMonthPicker, afterShowMonthPicker,
        onOkClick, showPrevMonth, showNextMonth, showPrevYear, showNextYear, update, fullUpdate;

    Ext.define('Ext.ux.JalaliDatePlugin', {
        extend: 'Ext.AbstractPlugin',
        alias: 'plugin.jalalidate',

        statics: {
            enabled: true,
            localization: {
                DatePicker: {},
                DateField: {}
            }
        },

        constructor: function () {
            if (this.enabled === undefined) {
                this.enabled = this.statics().enabled;
            }
        },

        /**
         * Initializes this plugin. Some methods in the main class are instrumented, others are replaced.
         * @param {Ext.Component} component Component that should be instrumented.
         */
        init: function (component) {
            if (!this.enabled) {
                return;
            }
            if (component instanceof Ext.DatePicker) { // for both Ext.DatePicker & Ext.menu.DateMenu
                component.monthNames = Ext.Date.jalaliMonthNames;
                component.createMonthPicker = Ext.Function.createSequence(component.createMonthPicker, afterCreateMonthPicker);
                component.showMonthPicker = Ext.Function.createSequence(component.showMonthPicker, afterShowMonthPicker);
                component.onOkClick = onOkClick;
                component.showPrevMonth = showPrevMonth;
                component.showNextMonth = showNextMonth;
                component.showPrevYear = showPrevYear;
                component.showNextYear = showNextYear;
                component.update = update;
                component.fullUpdate = fullUpdate;
                Ext.apply(component, this.statics().localization.DatePicker);
                component.dayNames = component.dayNames.slice(component.startDay).concat(component.dayNames.slice(0, component.startDay));
                component.setValue(component.value);
            } else if (component instanceof Ext.form.field.Date) { // for Ext.form.field.Date
                component.createPicker = createPicker;
                component.safeParse = safeParse;
                Ext.apply(component, this.statics().localization.DateField);
                component.setValue(component.value);
            }
        }
    });

    /**
     * Replaces DateField.safeParse method. Since that method adds an hour field to format,
     * the parse functions in Date.parseFunctions are not used. Here we skip the hour conversion part.
     * It may produce errors when using different time zones.
     * @param {String} value The value to attempt to parse.
     * @param {String} format A valid date format (see {@link Ext.Date#parse}).
     * @return {Date} The parsed Date object, or null if the value could not be successfully parsed.
     */
    safeParse = function (value, format) {
        var me = this,
            result = null,
            strict = me.useStrict,
            parsedDate;

        parsedDate = Ext.Date.parseDate(value, format, strict);
        if (parsedDate) {
            result = Ext.Date.add(parsedDate, Ext.Date.HOUR, -12);
        }
        return result;
    };

    /**
     * Override create picker in DateField.
     */
    createPicker = function () {
        var me = this,
            format = Ext.String.format;

        return new Ext.picker.Date(Ext.applyIf({
            pickerField: me,
            ownerCt: me.ownerCt,
            renderTo: Ext.getBody(),
            floating: true,
            hidden: true,
            focusOnShow: true,
            minDate: me.minValue,
            maxDate: me.maxValue,
            disabledDatesRE: me.disabledDatesRE,
            disabledDatesText: me.disabledDatesText,
            disabledDays: me.disabledDays,
            disabledDaysText: me.disabledDaysText,
            format: me.format,
            showToday: me.showToday,
            startDay: me.startDay,
            minText: format(me.minText, me.formatDate(me.minValue)),
            maxText: format(me.maxText, me.formatDate(me.maxValue)),
            listeners: {
                scope: me,
                select: me.onSelect
            },
            keyNavConfig: {
                esc: function() {
                    me.collapse();
                }
            },
            monthNames: Ext.Date.jalaliMonthNames,
            createMonthPicker: Ext.Function.createSequence(Ext.picker.Date.prototype.createMonthPicker, afterCreateMonthPicker),
            showMonthPicker: Ext.Function.createSequence(Ext.picker.Date.prototype.showMonthPicker, afterShowMonthPicker),
            onOkClick: onOkClick,
            showPrevMonth: showPrevMonth,
            showNextMonth: showNextMonth,
            showPrevYear: showPrevYear,
            showNextYear: showNextYear,
            update: update,
            fullUpdate: fullUpdate
        }, Ext.ux.JalaliDatePlugin.localization.DatePicker));
    };

    /**
     * Replaces Gregorian month names with Jalali names.
     */
    afterCreateMonthPicker = function () {
        if (this.mpMonthsInstrumented) {
            return;
        }
        this.mpMonthsInstrumented = true;
        var monthNames = this.monthNames,
            monthPicker = this.monthPicker;
        monthPicker.months.each(function (m, a, i) {
            m.update(monthNames[monthPicker.resolveOffset(i, 6)]);
        });
    };

    /**
     * Corrects month picker's selected month and year.
     */
    afterShowMonthPicker = function () {
        if (!this.disabled) {
            this.monthPicker.setValue([
                Ext.Date.getJalaliMonth(this.activeDate || this.value),
                Ext.Date.getJalaliFullYear(this.activeDate || this.value)
            ]);
        }
    };

    /**
     * Selects correct month and year when OK button is selected.
     */
    onOkClick = function (picker, value) {
        var me = this,
            month = value[0],
            year = value[1],
            date = Ext.Date.createJalali(year, month, me.getActive().getDate());

        if (Ext.Date.getJalaliMonth(date) !== month) {
            // 'fix' the JS rolling date conversion if needed
            date = Ext.Date.createJalali(year, month, Ext.Date.correctJalaliDateOfMonth(year, month, 31));
        }
        me.setValue(date);
        me.hideMonthPicker();
    };

    /**
     * Handles showing previous month.
     */
    showPrevMonth = function () {
        this.update(Ext.Date.addJalali(this.activeDate, Ext.Date.MONTH, -1));
    };

    /**
     * Handles showing next month.
     */
    showNextMonth = function () {
        this.update(Ext.Date.addJalali(this.activeDate, Ext.Date.MONTH, 1));
    };

    /**
     * Handles showing previous year.
     */
    showPrevYear = function () {
        this.update(Ext.Date.addJalali(this.activeDate, Ext.Date.YEAR, -1));
    };

    /**
     * Handles showing next year.
     */
    showNextYear = function () {
        this.update(Ext.Date.addJalali(this.activeDate, Ext.Date.YEAR, 1));
    };

    /**
     * Overridden update method of DatePicker. A few lines changed, so it can show Jalali dates.
     * @param {Date} date The date that should be selected.
     * @param {Boolean} forceRefresh Force refresh current month display.
     */
    update = function(date, forceRefresh) {
        var me = this,
            active = me.activeDate;

        if (me.rendered) {
            me.activeDate = date;
            if (!forceRefresh && active && me.el && Ext.Date.getJalaliMonth(active) === Ext.Date.getJalaliMonth(date) && Ext.Date.getJalaliFullYear(active) === Ext.Date.getJalaliFullYear(date)) {
                me.selectedUpdate(date, active);
            } else {
                me.fullUpdate(date, active);
            }
        }
        return me;
    };

    fullUpdate = function(date) {
        var me = this,
            cells = me.cells.elements,
            textNodes = me.textNodes,
            disabledCls = me.disabledCellCls,
            eDate = Ext.Date,
            i = 0,
            extraDays = 0,
            visible = me.isVisible(),
            newDate = +eDate.clearTime(date, true),
            today = +eDate.clearTime(new Date()),
            min = me.minDate ? eDate.clearTime(me.minDate, true) : Number.NEGATIVE_INFINITY,
            max = me.maxDate ? eDate.clearTime(me.maxDate, true) : Number.POSITIVE_INFINITY,
            ddMatch = me.disabledDatesRE,
            ddText = me.disabledDatesText,
            ddays = me.disabledDays ? me.disabledDays.join('') : false,
            ddaysText = me.disabledDaysText,
            format = me.format,
            days = eDate.getJalaliDaysInMonth(date),
            firstOfMonth = eDate.getJalaliFirstDateOfMonth(date),
            startingPos = firstOfMonth.getDay() - me.startDay,
            previousMonth = eDate.addJalali(date, eDate.MONTH, -1),
            longDayFormat = me.longDayFormat,
            prevStart,
            current,
            disableToday,
            tempDate,
            setCellClass,
            html,
            cls,
            formatValue,
            value;

        if (startingPos < 0) {
            startingPos += 7;
        }

        days += startingPos;
        prevStart = eDate.getJalaliDaysInMonth(previousMonth) - startingPos;
        current = eDate.createJalali(eDate.getJalaliFullYear(previousMonth), eDate.getJalaliMonth(previousMonth), prevStart);
        current.setHours(me.initHour);

        if (me.showToday) {
            tempDate = eDate.clearTime(new Date());
            disableToday = (tempDate < min || tempDate > max ||
                (ddMatch && format && ddMatch.test(eDate.dateFormat(tempDate, format))) ||
                (ddays && ddays.indexOf(tempDate.getDay()) !== -1));

            if (!me.disabled) {
                me.todayBtn.setDisabled(disableToday);
                me.todayKeyListener.setDisabled(disableToday);
            }
        }

        setCellClass = function(cell, cls) {
            value = +eDate.clearTime(current, true);
            cell.title = eDate.format(current, longDayFormat);
            // store dateValue number as an expando
            cell.firstChild.dateValue = value;
            if (value === today) {
                cls += ' ' + me.todayCls;
                cell.title = me.todayText;

                // Extra element for ARIA purposes
                me.todayElSpan = Ext.DomHelper.append(cell.firstChild, {
                    tag: 'span',
                    cls: Ext.baseCSSPrefix + 'hide-clip',
                    html: me.todayText
                }, true);
            }
            if (value === newDate) {
                cls += ' ' + me.selectedCls;
                me.fireEvent('highlightitem', me, cell);
                if (visible && me.floating) {
                    Ext.fly(cell.firstChild).focus(50);
                }
            }

            if (value < min) {
                cls += ' ' + disabledCls;
                cell.title = me.minText;
            } else if (value > max) {
                cls += ' ' + disabledCls;
                cell.title = me.maxText;
            } else if (ddays && ddays.indexOf(current.getDay()) !== -1) {
                cell.title = ddaysText;
                cls += ' ' + disabledCls;
            } else if (ddMatch && format) {
                formatValue = eDate.dateFormat(current, format);
                if (ddMatch.test(formatValue)) {
                    cell.title = ddText.replace('%0', formatValue);
                    cls += ' ' + disabledCls;
                }
            }
            cell.className = cls + ' ' + me.cellCls;
        };

        for (; i < me.numDays; ++i) {
            if (i < startingPos) {
                html = (++prevStart);
                cls = me.prevCls;
            } else if (i >= days) {
                html = (++extraDays);
                cls = me.nextCls;
            } else {
                html = i - startingPos + 1;
                cls = me.activeCls;
            }
            textNodes[i].innerHTML = html;
            current.setDate(current.getDate() + 1);
            setCellClass(cells[i], cls);
        }

        me.monthBtn.setText(Ext.Date.format(date, me.monthYearFormat));
    };
}());
