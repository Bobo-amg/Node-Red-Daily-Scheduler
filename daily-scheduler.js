var schedule = require('node-schedule');

module.exports = function (RED) {
    "use strict";
    function DailySchedulerNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var context = this.context().flow;

        this.on('input', function (msg) {



            this.hour = config.hour;
            this.month = config.month;
            this.day = config.day;
            this.minute = config.minute;
            this.recur = config.recur;
            this.year = config.year;
            this.desc = config.desc;
            this.early = config.early;
            this.idx = config.idx;

            var editor, inputmsg = false;

            if (msg.hasOwnProperty("alarm_date") && msg.alarm_date.hasOwnProperty("hours") && msg.alarm_date.hasOwnProperty("years") &&
                msg.alarm_date.hasOwnProperty("months") && msg.alarm_date.hasOwnProperty("date") && msg.alarm_date.hasOwnProperty("desc")) {

                // ***************************************************
                // INPUT FROM MSG.ALARM_DATE

                this.status({ fill: "green", shape: "dot", text: "ok" });

                inputmsg = true;

                console.log('INCOMING MSG');

            } else if (node.month != '' && node.hour != '' && node.minute != '' && node.day != '' && node.desc != '') {

                // ***************************************************
                // INPUT FROM EDITOR

                console.log('The EDITOR worked.');

                this.status({ fill: "green", shape: "dot", text: "ok" });

                editor = true;

                msg.alarm_date = {};

                msg.alarm_date.years = Number(node.year);
                msg.alarm_date.months = Number(node.month);
                msg.alarm_date.date = Number(node.day);
                msg.alarm_date.hours = Number(node.hour);
                msg.alarm_date.minutes = Number(node.minute);
                msg.alarm_date.early = Number(node.early);
                msg.alarm_date.idx = node.idx;
                msg.alarm_date.desc = node.desc;
                msg.alarm_date.recur = node.recur;

            } else {
                msg.error = 'Date configuration error in Daily Scheduler node';
                console.log('Date configuration error in Daily Scheduler node');

                this.status({ fill: "red", shape: "dot", text: "config error" });
            }

            // const clone = RED.util.cloneMessage(msg);

            if (editor || inputmsg) {



                var jobname;

                if (msg.hasOwnProperty("alarm_date") && msg.alarm_date.hasOwnProperty("idx") && msg.alarm_date.idx != '') {
                    jobname = msg.alarm_date.idx;
                } else { jobname = msg._msgid; msg.alarm_date.idx = jobname; }

                if (msg.hasOwnProperty("alarm_date") && msg.alarm_date.hasOwnProperty("hours") && msg.alarm_date.hours != '') { }
                else { msg.alarm_date.hours = 0; }


                let jb = String(jobname);

                console.log(jb);

                if (msg.alarm_date.early > 0 || msg.alarm_date.recur) { // process for early reminders OR monthly recurring

                    var rule = new schedule.RecurrenceRule();
                    var earlyrem = msg.alarm_date.early + 1;

                    // change from minutes to dates *****************************....
                    var currentdate = new Date(msg.alarm_date.years, msg.alarm_date.months,
                        msg.alarm_date.date, msg.alarm_date.hours,
                        msg.alarm_date.minutes, 0, 0);

                    var earlydate = new Date(msg.alarm_date.years, msg.alarm_date.months,
                        msg.alarm_date.date, msg.alarm_date.hours,
                        msg.alarm_date.minutes - msg.alarm_date.early - 1, 0, 0);


                    if (msg.alarm_date.recur) { rule.month = [0, new schedule.Range(0, 11)]; } // monthly recurring

                    rule.date = msg.alarm_date.date;

                    rule.hour = msg.alarm_date.hours;

                    var j = schedule.scheduleJob(jb, { start: earlydate, end: currentdate, rule }, function () {

                        var id_status = context.get('cancel-date');

                        if (id_status == jb) {
                            schedule.scheduledJobs[jb].cancel();
                            console.log('CANCELLED ... early or recurring - ', jb);
                        } else {
                            earlyrem = earlyrem - 1;
                            console.log('early or recurring - ', jb);
                            console.log('Left - ', earlyrem);
                            msg.alarm_date.earlyrem = earlyrem;
                            node.send(msg);
                        }
                    });

                } else {  // change to standard single date event

                    console.log('SINGLE DATE TRIGGER .....');

                    var date = new Date(msg.alarm_date.years, msg.alarm_date.months, msg.alarm_date.date,
                        msg.alarm_date.hours, msg.alarm_date.minutes, 0);


                    var j = schedule.scheduleJob(jb, date, function () {

                        /**************** MISSING MESSAGES */
                        var id_status = context.get('cancel-date');

                        console.log('single date - ', jb);
                        console.log('message = ', msg);
                        node.send(msg);

                    });

                }

            }

            node.send(msg);

        });

    }

    RED.nodes.registerType("daily-scheduler", DailySchedulerNode);
}