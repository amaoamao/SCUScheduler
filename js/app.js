/**
 * Created by mao on 17-1-24.
 */
// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = '399696677123-4en316frmevqe3elac4ddl95qfdvtgfs.apps.googleusercontent.com';

var SCOPES = ["https://www.googleapis.com/auth/calendar"];
var network_unavailable = setInterval("Materialize.toast('要翻墙哦', 5000)", 8000);
var mSchedule = [];
var isInit = true;
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
        // loadCalendarApi();
    } else {
        // Show auth UI, allowing the user to initiate authorization by
        // clicking authorize button.
        $('#authorize-div').css('display', 'inline');
        if (!isInit) {
            Materialize.toast("Google账户登录失败", 3000);
        }
    }
}

function handleGoogleAuthClick(event) {
    isInit=false;
    $('#progress_bar').css('display', 'inline');
    gapi.auth.authorize(
        {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
        handleAuthResult);
    return false;
}


function loadCalendarApi() {
    gapi.client.load('calendar', 'v3', listUpcomingEvents);
}

function startSync() {
    return false;
}
function listUpcomingEvents() {
    var request = gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': (new Date()).toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 100,
        'orderBy': 'startTime'
    });

    // request.execute(function (resp) {
    //     var events = resp.items;
    //     appendPre('Upcoming events:');
    //     if (events.length > 0) {
    //         for (i = 0; i < events.length; i++) {
    //             var event = events[i];
    //             var when = event.start.dateTime;
    //             if (!when) {
    //                 when = event.start.date;
    //             }
    //             appendPre(event.summary + ' (' + when + ')')
    //         }
    //     } else {
    //         appendPre('No upcoming events found.');
    //     }
    //
    // });


    var event = {
        'summary': 'Google I/O 2015',
        'location': '800 Howard St., San Francisco, CA 94103',
        'description': 'A chance to hear more about Google\'s developer products.',
        'start': {
            'dateTime': '2017-02-01T09:00:00',
            'timeZone': 'Asia/Shanghai'
        },
        'end': {
            'dateTime': '2017-02-01T17:00:00',
            'timeZone': 'Asia/Shanghai'
        },
        'recurrence': [
            'RRULE:FREQ=DAILY;COUNT=2'
        ],
        'colorId': '11',
        'attendees': [],
        'reminders': {
            'useDefault': false,
            'overrides': [
                {'method': 'popup', 'minutes': 30}
            ]
        }
    };

    request = gapi.client.calendar.events.insert({
        'calendarId': 'primary',
        'resource': event
    });

    // request.execute(function (event) {
    //     appendPre('Event created: ' + event.htmlLink);
    // });
}

function showSchedule(item, index) {
    var str = '<li><div class="collapsible-header "><div class="row"><br><div class="col s11"><input type="checkbox" class="filled-in center-align" id="filled-in-box" checked="checked"/><label for="filled-in-box" class="black-text center-align">' +
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

var x = {
    "kind": "calendar#colors",
    "updated": "2012-02-14T00:00:00.000Z",
    "calendar": {
        "event": {
            "1": {
                "background": "#a4bdfc",
                "foreground": "#1d1d1d"
            },
            "2": {
                "background": "#7ae7bf",
                "foreground": "#1d1d1d"
            },
            "3": {
                "background": "#dbadff",
                "foreground": "#1d1d1d"
            },
            "4": {
                "background": "#ff887c",
                "foreground": "#1d1d1d"
            },
            "5": {
                "background": "#fbd75b",
                "foreground": "#1d1d1d"
            },
            "6": {
                "background": "#ffb878",
                "foreground": "#1d1d1d"
            },
            "7": {
                "background": "#46d6db",
                "foreground": "#1d1d1d"
            },
            "8": {
                "background": "#e1e1e1",
                "foreground": "#1d1d1d"
            },
            "9": {
                "background": "#5484ed",
                "foreground": "#1d1d1d"
            },
            "10": {
                "background": "#51b749",
                "foreground": "#1d1d1d"
            },
            "11": {
                "background": "#dc2127",
                "foreground": "#1d1d1d"
            }
        }
    }
};