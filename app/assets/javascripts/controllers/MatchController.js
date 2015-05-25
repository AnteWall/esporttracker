app = angular.module('esporttracker', ['ngAnimate']);


app.controller('MatchCtrl',['$scope','$filter','$http','$timeout','$interval',function($scope,$filter,$http,$timeout,$interval){

    $scope.current = {};
    $scope.current.debug = {};
    $scope.current.debug.index = 0;
    $scope.matchinfo = {};
    $scope.teams = [];
    $scope.counter_terrorists = [];
    $scope.terrorists = [];
    $scope.last_event;
    $scope.killbox = [];
    $scope.round_time = 0;
    $scope.timeline = {};
    $scope.current_time;
    $scope.end_time;
    $scope.timer;
    $scope.game_over = false;

    $scope.initialize = function(match_id){
        $scope.match_id = match_id;
        var url = '/match/' + match_id + '/log';
        loadLog(url);
    }

    $scope.debug_key_next = function(keyevent){

    }

    $scope.get_header_style = function(){
        return "match-header " + $scope.matchinfo.map;
    }

    function pause_timer(){
        $interval.cancel($scope.timer);
    }

    function start_timer(){
        if($scope.timer != undefined) pause_timer(); //Cancel Interval if already set
        $scope.timer = $interval(function(){
            $scope.round_time -= 1;
        },1000);
    }

    $scope.get_round = function(){
        if($scope.teams.length != 2) return 0;
        return parseInt($scope.teams[0].score) + parseInt($scope.teams[1].score) + 1
        //Offset with one to get the current played round
    }

    $scope.debug_next = function(){
        var ev = $scope.events[$scope.current.debug.index];
        match_log(ev.log);
        $scope.current.debug.index += 1;
    }

    $scope.playerStyle = function(player){
        if(player == undefined) return;
        if(!player.alive){
            return 'dead';
        }
    }

    $scope.get_ct_team = function(){
        if($scope.teams.length != 2) return "";
        if($scope.teams[0].side == "CT") return $scope.teams[0];
        return $scope.teams[1];
    }
    $scope.get_t_team = function(){
        if($scope.teams.length != 2) return "";
        if($scope.teams[0].side == "TERRORIST") return $scope.teams[0];
        return $scope.teams[1];
    }

    $scope.get_time_minutes = function(){
        return Math.floor($scope.round_time/60);
    }

    $scope.getTimelineElapsed = function(){
        var procentage = Math.round(( ( $scope.current_time - $scope.start_time ) / ( $scope.end_time - $scope.start_time ) ) * 100) + "%" //73%
        return {'width' : procentage };
    };

    $scope.getEndTimeTimeline = function(){
        if($scope.game_over){
            return $filter('date')($scope.end_time, 'HH:mm:ss');
        }
        return 'Live';
    };

    function match_log(str){
        switch (true) {
            case /- Loading maps (\w+)/.test(str):
                //console.log("LOAD MAP");
                load_map(str);
                break;
            case /- (.+) join team (\w+)/.test(str):
                //console.log("JOINED TEAM");
                join_team(str);
                break;
            case /- (.+) disconnected/.test(str):
                //console.log("DISSCONECTED");
                disconnect(str);
                break;
            case /- Un round a été marqué -.*\((\d+)\) - \((\d+)\)/.test(str):
                //console.log("ROUND WIN");
                round_win(str);
                break;
            case /\"\>(.+)<\/font> killed .+\"\>(.+)\<\/font> with (\w+)/.test(str):
                //console.log("KILLED");
                killed(str);
                break;
            case /INFO:.+ (Launching RS)/.test(str):
                //console.log("GAME STARTED");
                new_round();
            case /INFO:.+ (Starting Knife Round)/.test(str):
                //console.log("KNIFE ROUND");
                knife_round(str);
                break;
            case /: !(stay|switch)/.test(str):
                //console.log("SWAP OR STAY");
                switch_or_stay(str);
                break;
            case /- (.+) win ! Final score:/.test(str):
                //console.log("Match Over");
                end_game(str);
                break;
            default:
                console.log("Didn't match anything",str);
                break;
        }
    }
    function match_info_event(str) {
        switch (true) {
            case /- Teams: (.+) - ([^<>\n]+)(<br>)*/.test(str):
                set_teams(str);
                break;
            default:
                break;
        }
    }

    function load_map(log){
        var reg = /- Loading maps (\w+)/;
        var matches = log.match(reg);
        $scope.matchinfo.map = matches[1];
        $scope.counter_terrorists = [];
        $scope.terrorists = [];
    }

    function end_game(log){
        pause_timer();
        $scope.round_time = 0;
        $scope.game_over = true;
    }

    function switch_or_stay(log){
        var reg = /: !(stay|switch)/;
        var matches = log.match(reg);
        if(matches[1] == "switch"){
            swap_teams();
        }
        set_all_alive();
    }

    function swap_teams(){
        if($scope.teams[0].side == "CT"){
            $scope.teams[0].side = "TERRORIST";
        }else{
            $scope.teams[0].side = "CT";
        }
        if($scope.teams[1].side == "CT"){
            $scope.teams[1].side = "TERRORIST";
        }else{
            $scope.teams[1].side = "CT";
        }
    }

    function knife_round(log){
        new_round();
    }

    function new_round(){
        $scope.round_time = 120;
        start_timer();
        set_all_alive();
    }

    function set_all_alive(){
        for(var i = 0; i < $scope.terrorists.length;i++){
            $scope.terrorists[i].alive = true;
        }
        for(var i = 0; i < $scope.counter_terrorists.length;i++){
            $scope.counter_terrorists[i].alive = true;
        }
    }

    function killed(log){
        var reg = /\"\>(.+)<\/font> killed .+\"\>(.+)\<\/font> with (\w+)/;
        var matches = log.match(reg);
        log_kill(matches[1],matches[2],matches[3]);
        kill_player(matches[2]);
    }

    function log_kill(player,killed_player,weapon){
        var data = {player: player, killed: killed_player, weapon: weapon };
        $scope.killbox.push(data);
        $timeout(function(){
            $scope.killbox.splice($scope.killbox.indexOf(data),1);
        },2000);
    }

    function kill_player(name){
        var index = get_index_by_name_t(name);
        if(index == -1){
            index = get_index_by_name_ct(name);
            if(index > -1) $scope.counter_terrorists[index].alive = false;
        }
        else{
            $scope.terrorists[index].alive = false;
        }
    }

    function round_win(log){
        var reg = /- Un round a été marqué -.*\((\d+)\) - \((\d+)\)/;
        var matches = log.match(reg);
        $scope.teams[0].score = matches[1];
        $scope.teams[1].score = matches[2];
        var rounds = parseInt(matches[1]) + parseInt(matches[2]);
        if(rounds == 15){
            swap_teams();
        }
        new_round();
    }

    function get_index_by_name_ct(name){
        for(var i = 0; i < $scope.counter_terrorists.length; i++){
            var ct = $scope.counter_terrorists[i];
            if(ct.name == name){
                return i;
            }
        }
        return -1;
    }
    function get_index_by_name_t(name){
        for(var i = 0; i < $scope.terrorists.length; i++){
            var ct = $scope.terrorists[i];
            if(ct.name == name){
                return i;
            }
        }
        return -1;
    }

    function disconnect(log){
        var reg = /- (.+) disconnected/;
        var matches = log.match(reg);
        remove_from_ct(matches[1]);
        remove_from_ct(matches[0]);
    }

    function remove_from_ct(name){
        var index = get_index_by_name_ct(name);
        if(index > -1) $scope.counter_terrorists.splice(index,1);
    }

    function remove_from_t(name){
        var index = get_index_by_name_t(name);
        if(index > -1) $scope.terrorists.splice(index,1);
    }


    function join_team(log){
        var reg = /- (.+) join team (\w+)/;
        var matches = log.match(reg);
        remove_from_t(matches[1]);
        remove_from_ct(matches[1]);
        var user = { name: matches[1], alive: true };
        if(matches[2] == "CT"){
            $scope.counter_terrorists.push(user);
        }else if(matches[2] == "TERRORIST"){
            $scope.terrorists.push(user);
        }
    }

    function get_time(log){
        var reg = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/;
        var matches = log.match(reg);
        if(matches == null) {
            return null;
        }
        return matches[1];
    }

    function set_teams(log){
        $scope.teams = [];
        var reg = /- Teams: (.+) - ([^<>\n]+)(<br>)*/;
        var matches = log.match(reg);
        $scope.teams.push({name: matches[1],score: 0, side: "CT"});
        $scope.teams.push({name: matches[2],score: 0, side: "TERRORIST"});
    }

    function set_start_time() {
        for(var i = 0; i < $scope.events.length; i++) {
            var ev = $scope.events[i];
            var time = get_time(ev.log);
            if(time != null){
                $scope.start_time = new Date(time);
                $scope.current_time = angular.copy($scope.start_time);
                //DEBUG $scope.current_time.setSeconds($scope.current_time.getSeconds() + 2500);
                start_timeline_timer();
                return;
            }
        }
    }

    function start_timeline_timer(){
        $scope.timeline_timer_interval = $interval(function () {

            call_log_event($filter('date')($scope.current_time,'yyyy-MM-dd HH:mm:ss'));

            if($scope.current_time <= $scope.end_time){
                $scope.current_time.setSeconds($scope.current_time.getSeconds() + 1);
            }
            if($scope.game_over){
                pause_timer();
            }
        },100);
    }

    function load_events(events){
        for(var i = 0; i < events.length; i++){
            var ev = events[i];
            addEventToTimeline(ev.log);
            $scope.last_event = ev.id;
            if(isWinEvent(ev.log)){
                $scope.game_over = true;
            }
        }
        for(var i = events.length; i > 0; i--){
            if(events[i] == undefined || events[i].log == undefined) continue;
            var time = get_time(events[i].log);
            if(time != null){
                $scope.end_time = new Date(get_time(events[i].log));
                break;
            }
        }
        if($scope.current_time == undefined) set_start_time();
    }

    function isWinEvent(log){
        switch(true){
            case /- (.+) win ! Final score:/.test(log):
                return true;
                break;
        }
        return false;
    }

    function call_log_event(time){
        if($scope.timeline[time] != undefined){
            for(var i = 0; i < $scope.timeline[time].length; i++){
                var ev = $scope.timeline[time][i];
                match_log(ev);
            }
        }
    }

    function set_request_interval(){
        var interval = $interval(function(){

            var url = '/match/' + $scope.match_id + '/log';
            if($scope.last_event != undefined){
                url += '?last_event=' + $scope.last_event;
            }
            $http.get(url).success(function(result){
                if(!$scope.game_over){
                    load_events(result);
                }
            }).error(function(err){
                //console.log(err);

            });
            if($scope.game_over){
                $interval.cancel(interval);
            }
        },3000);
    }



    function addEventToTimeline(log){
        var time = get_time(log);
        if(time == null){
            match_info_event(log);
        }
        if($scope.timeline[time] == undefined){
            $scope.timeline[time] = [];
        }
        $scope.timeline[time].push(log);
    }

    function loadLog(url){

        $http.get(url).success(function(result){
            $scope.events = result
            set_request_interval();
            load_events(result);
        })
            .error(function(errors){
//      console.log(errors);
            });

    }

}]);

app.filter('digits', function() {
    return function(input) {
        if (input < 10) {
            input = '0' + input;
        }

        return input;
    }
});
