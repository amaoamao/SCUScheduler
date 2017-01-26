/**
 * Created by mao on 17-1-24.
 */
var CLIENT_ID = '399696677123-4en316frmevqe3elac4ddl95qfdvtgfs.apps.googleusercontent.com';

var SCOPES = ["https://www.googleapis.com/auth/calendar"];
var network_unavailable = setInterval("Materialize.toast('要翻墙哦', 5000)", 8000);
var mSchedule = [];
var classStartTimeWJ = ['', '08:00:00', '08:55:00', '10:00:00', '10:55:00', '14:00:00', '14:55:00', '15:50:00', '16:55:00', '17:50:00', '19:30:00', '20:25:00', '21:20:00'];
var classEndTimeWJ = ['', '08:45:00', '09:40:00', '10:45:00', '11:40:00', '14:45:00', '15:40:00', '16:35:00', '17:40:00', '18:35:00', '20:15:00', '21:10:00', '22:05:00'];
var classStartTimeJA = ['', '08:15:00', '09:10:00', '10:15:00', '11:10:00', '13:50:00', '14:45:00', '15:40:00', '16:45:00', '17:40:00', '19:20:00', '20:15:00', '21:10:00'];
var classEndTimeJA = ['', '09:00:00', '09:55:00', '11:00:00', '11:55:00', '14:35:00', '15:30:00', '16:25:00', '17:30:00', '18:25:00', '20:05:00', '21:00:00', '21:55:00'];
var events = [];
var isInit = true;
var tempName;
function checkAuth() {
    gapi.auth.authorize(
        {
            'client_id': CLIENT_ID,
            'scope': SCOPES.join(' '),
            'immediate': true
        }, handleAuthResult);
}

function handleAuthResult(authResult) {
    window.clearInterval(network_unavailable);
    $('#progress_bar').css('display', 'none');

    if (authResult && !authResult.error) {

        $('#authorize-div').css('display', 'none');
        $('#jwc_auth_form').css('display', 'inline');
        Materialize.toast("Google账户登录成功", 3000);
    } else {
        $('#authorize-div').css('display', 'inline');
        if (!isInit) {
            Materialize.toast("Google账户登录失败", 3000);
        }
    }
}

function handleGoogleAuthClick(event) {
    isInit = false;
    $('#progress_bar').css('display', 'inline');
    gapi.auth.authorize(
        {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
        handleAuthResult);
    return false;
}


function loadCalendarApi() {
    gapi.client.load('calendar', 'v3', startSync);
    return false;
}
function haha() {
    if (events.length == 0) {
        Materialize.toast('导入完成', 3000);
        $('#progress_bar').css('display', 'none');
        $('#authorize-div').css('display', 'inline');
        return false;
    }
    var event = events.shift();
    tempName = event['summary'];
    var request = gapi.client.calendar.events.insert({
        'calendarId': 'primary',
        'resource': event
    });
    request.execute(function (event) {
        Materialize.toast('导入' + tempName + '成功');
        haha();
        $('#progress_hint').text('正在导入' + tempName);
    });

}
function startSync() {
    $('#show_schedule_div').css('display', 'none');
    $('#progress_bar').css('display', 'inline');
    var arr = $('.filled-in');
    for (var item in arr) {
        if (arr[item].checked) {
            for (var timeItem in mSchedule[item]['time']) {
                if (mSchedule[item]['time'][timeItem]['start'] == null) {
                    continue;
                }
                var startClass = mSchedule[item]['time'][timeItem]['start'];
                var endClass = mSchedule[item]['time'][timeItem]['end'];
                var week = mSchedule[item]['time'][timeItem]['week'];
                var startDate = new Date();
                startDate.setFullYear(2017, 1, 26);
                var startClassDate = new Date();
                startClassDate.setFullYear(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
                if (!(mSchedule[item]['even'] || mSchedule[item]['odd']))
                    startClassDate.setDate(startClassDate.getDate() + week - 7 + 7 * mSchedule[item]['weekStart']);
                else if (mSchedule[item]['even'])
                    startClassDate.setDate(startClassDate.getDate() + week + 7);
                else
                    startClassDate.setDate(startClassDate.getDate() + week);
                var count = mSchedule[item]['weekEnd'] - mSchedule[item]['weekStart'] + 1;
                if (mSchedule[item]['even'] || mSchedule[item]['odd'])
                    count = 18 / 2;
                var startString = startClassDate.getFullYear() + '-' + (startClassDate.getMonth() + 1) + '-' + startClassDate.getDate();
                var event = {
                    'summary': mSchedule[item]['title'],
                    'location': mSchedule[item]['time'][timeItem]['address'],
                    'description': (mSchedule[item]['description'] + ' by SCUScheduler'),
                    'start': {
                        'dateTime': (startString + 'T' + ((mSchedule[item]['time'][timeItem]['address'].indexOf('江安') >= 0) ? classStartTimeJA[startClass] : classStartTimeWJ[startClass])),
                        'timeZone': 'Asia/Shanghai'
                    },
                    'end': {
                        'dateTime': (startString + 'T' + ((mSchedule[item]['time'][timeItem]['address'].indexOf('江安') >= 0) ? classEndTimeJA[endClass] : classEndTimeWJ[endClass])),
                        'timeZone': 'Asia/Shanghai'
                    },
                    'recurrence': [
                        ('RRULE:FREQ=WEEKLY;COUNT=' + count + ((mSchedule[item]['even'] || mSchedule[item]['odd']) ? ';INTERVAL=2' : ''))
                    ],
                    'colorId': (item % 11 + 1).toString(),
                    'attendees': [],
                    'reminders': {
                        'useDefault': false,
                        'overrides': [
                            {'method': 'popup', 'minutes': 30}
                        ]
                    }
                };
                events.push(event);
            }
        }
    }
    haha();
    $('#progress_hint').text('正在导入' + tempName);
}

function showSchedule(item, index) {
    var str = '<li><div class="collapsible-header "><div class="row"><br><div class="col s11"><input type="checkbox" class="filled-in center-align" id="check-' + index + '" checked="checked"/><label for="check-' + index + '" class="black-text center-align">' +
        item['title'] +
        '</label></div><div class="col white-text">.</div></div></div><div class="collapsible-body"><br><div class="row"><div class="col s12"><div class="col"><i class="material-icons">class</i></div><div class="col">';
    if (!(item['even'] || item['odd'])) {
        str += item['weekStart'] + '~' + item['weekEnd'];
    }
    if (item['even']) {
        str += '双';
    }
    if (item['odd']) {
        str += '单';
    }
    str += '周</div></div></div>';
    item['time'].forEach(function (mItem, mIndex) {
        str += '<div class="row"><div class="col s6"><div class="col"><i class="material-icons">date_range</i></div><div class="col">' +
            '周' + mItem['week'] + '第' + mItem['start'] + '～' + mItem['end'] + '节' +
            '</div></div><div class="col s6"><div class="col"><i class="material-icons">place</i></div><div class="col">' +
            mItem['address'] +
            '</div></div></div>';
    });

    str += '<div class="row"><div class="col s12"><div class="col"><i class="material-icons">assignment</i></div><div class="col">' +
        item['description'] +
        '</div></div></div></div></li>';
    $('#schedule_list').append(str);

}
function getSchedule(form) {
    $('#jwc_auth_form').css('display', 'none');
    $('#progress_bar').css('display', 'inline');
    $('#progress_hint').text('正在爬取课表');
    $.get('http://weixin.i-teacher.net/schedule/index.jsp?zjh=' + $('#zjh').val() + '&mm=' + $('#mm').val(),
        function (data, status) {
            $('#progress_bar').css('display', 'none');
            if (data.indexOf('不正确') >= 0) {
                Materialize.toast('帐号或密码错误，请重新输入', 5000);
                $('#jwc_auth_form').css('display', 'inline');
            } else {
                Materialize.toast('爬取课表成功', 5000);
                mSchedule = eval(data);
                mSchedule.forEach(showSchedule);
                $('#show_schedule_div').css('display', 'inline');
                Materialize.showStaggeredList('#schedule_list');
            }

        });
    return false;
}