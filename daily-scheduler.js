var schedule = require('node-schedule');

module.exports = function (RED) {
    "use strict";
    function DailySchedulerNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        this.on('input', function (msg) {

            msg.payload = {};

            this.hour = config.hour;
            this.month = config.month;
            this.day = config.day;
            this.minute = config.minute;
            this.recur = config.recur;
            this.year = config.year;
            this.desc = config.desc;
            this.early = config.early;
            this.idx = config.idx;

            msg.payload.years = Number(node.year);
            msg.payload.months = Number(node.month);
            msg.payload.date = Number(node.day);
            msg.payload.hours = Number(node.hour);
            msg.payload.minutes = Number(node.minute);
            msg.payload.early = Number(node.early);
            msg.payload.idx = node.idx;
            msg.payload.desc = node.desc;
            msg.payload.recur = node.recur;

            var jobname;

            jobname = msg._msgid;

            let jb = String(jobname);

            console.log(jb);

            console.log('SINGLE DATE TRIGGER .....');

            var date = new Date(msg.payload.years, msg.payload.months, msg.payload.date,
                msg.payload.hours, msg.payload.minutes, 0);


            var j = schedule.scheduleJob(jb, date, function () {

                console.log('single date - ', jb);
                console.log('message = ', msg);
                node.send(msg);
            });

            node.send(msg);

        });

    }

    RED.nodes.registerType("daily-scheduler", DailySchedulerNode);
}