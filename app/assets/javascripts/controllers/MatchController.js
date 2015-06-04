

app.controller('MatchCtrl',['$scope','$filter','$http','$timeout','$interval',function($scope,$filter,$http,$timeout,$interval){

    $scope.current = {};
    $scope.current.debug = {};
    $scope.current.debug.index = 0;
    $scope.matchinfo = {};
    $scope.teams = [];
    $scope.counter_terrorists = [];
    $scope.terrorists = [];
    $scope.last_event = undefined;
    $scope.killbox = [];
    $scope.last_round_kills = [];
    $scope.round_time = 0;
    $scope.timeline = {};
    $scope.timer = undefined;
    $scope.game_over = false;
    $scope.game_status = 'warmup';

    $scope.chat_log = [];

    $scope.players = {};
    $scope.players.ct = [];
    $scope.players.t = [];

    $scope.time = {};
    $scope.time.playback_speed = 1;
    $scope.time.end_time = undefined;
    $scope.time.start_time = undefined;
    $scope.time.current_time = undefined;
    $scope.time.timeline_timer_interval = undefined;
    $scope.time.pauseTimer = function(){
        console.log("pauseing!");
        $interval.cancel($scope.time.timeline_timer_interval);
    };
    $scope.time.startTimer = function(){
        console.log("Stariong");
        $scope.time.pauseTimer(); //Cancel so it won't double play timers.
        start_timeline_timer();
    };
    $scope.time.changePlaybackSpeed = function(number){
        console.log(number);
        $scope.time.playback_speed = number;
        $interval.cancel($scope.time.timeline_timer_interval);
        start_timeline_timer();
    };
    $scope.time.nextRound = function(){
        var notFoundNextRound = true;
        $interval.cancel($scope.time.timeline_timer_interval);
        while(notFoundNextRound){
            if($scope.time.current_time <= $scope.time.end_time) {
                var time = $filter('date')($scope.time.current_time,'yyyy-MM-dd HH:mm:ss');
                if($scope.timeline[time] != undefined){
                    for(var i = 0; i < $scope.timeline[time].length; i++){
                        var ev = $scope.timeline[time][i];
                        match_log(ev);
                        if(isNewRound(ev)) {
                            notFoundNextRound = false;
                            break;
                        }
                    }
                }
                $scope.time.current_time.setSeconds($scope.time.current_time.getSeconds() + 1);
            }else{
                notFoundNextRound = false;
            }
        }
        start_timeline_timer();
    };

    $scope.initialize = function(match_id){
        $scope.match_id = match_id;
        var url = '/match/' + match_id + '/log';
        loadLog(url);
    };

    $scope.getPlayerSide = function(player){
        if(get_index_by_name_ct(player) > -1){
            return  'counter-terrorists';
        }else if(get_index_by_name_t(player) > -1){
            return 'terrorists';
        }else{
            return 'bajs';
        }
    }

    $scope.debug_key_next = function(keyevent){

    };

    $scope.get_header_style = function(){
        return 'match-header ' + $scope.matchinfo.map;
    };

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

    var game_start = function () {
        $scope.game_status = 'game';
        new_round();
    };

    var addToChatLog = function (str) {
        $scope.chat_log.push(str);
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
            case /\"\>(.+)<\/font> killed .+\"\>(.+)\<\/font> with (\w+).* \(CT: (\d+) - T: (.*\d+)\)/.test(str):
                //console.log("KILLED");
                killed(str);
                break;
            case /INFO:.+ (Launching RS)/.test(str):
                //console.log("GAME STARTED");
                game_start();
                break;
            case /INFO:.+ (Starting Knife Round)/.test(str):
                //console.log("KNIFE ROUND");
                knife_round(str);
                break;
            case /: [!|\.](stay|switch)/.test(str):
                //console.log("SWAP OR STAY");
                switch_or_stay(str);
                break;
            case /- (.+) win ! Final score:/.test(str):
                //console.log("Match Over");
                end_game(str);
                break;
            default:
                console.log("Didn't match anything",str);
                addToChatLog(str);
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
        $scope.players.t = [];
        $scope.players.ct = [];
    }

    function end_game(log){
        pause_timer();
        $scope.round_time = 0;
        $scope.game_over = true;
    }

    function switch_or_stay(log){
        var reg = /: [!|\.](stay|switch)/;
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
        $scope.game_status = 'knife';
        new_round();
    }

    function new_round(){
        $scope.round_time = 120;
        $scope.last_round_kills = angular.copy($scope.killbox);
        $scope.killbox = [];
        start_timer();
        set_all_alive();
    }

    function set_all_alive(){
        for(var i = 0; i < $scope.players.t.length;i++){
            $scope.players.t[i].alive = true;
        }
        for(var i = 0; i < $scope.players.ct.length;i++){
            $scope.players.ct[i].alive = true;
        }
    }

    var clear_all_alive = function (side) {
        if(side == "T"){
            console.log("CLEARING T!");
            for(var i = 0; i < $scope.players.t.length;i++){
                if($scope.players.t[i].alive == true){
                    remove_from_t($scope.players.t[i].name);
                }
            }
        }
        else if(side == "CT") {
            for (var i = 0; i < $scope.players.ct.length; i++) {
                if ($scope.players.ct[i].alive == true) {
                    remove_from_ct($scope.players.ct[i].name);
                }
            }
        }
    };

    var playerExists = function (player) {
        if(get_index_by_name_ct(player) > -1) return true;
        if(get_index_by_name_t(player) > -1) return true;
        return false;
    };

    function addTPlayer(name){
        var user = { name: name, alive: true, deaths: 0, kills: 0 };
        $scope.players.t.push(user);
    }
    function addCTPlayer(name){
        var user = { name: name, alive: true, deaths: 0, kills: 0 };
        $scope.players.ct.push(user);
    }

    function killed(log){
        var reg = /\"\>(.+)<\/font> killed .+\"\>(.+)\<\/font> with (\w+).* \(CT: (\d+) - T: (.*\d+)\)/;
        var matches = log.match(reg);
        if($scope.game_status == 'game' || $scope.game_status == 'knife') {

            //If Player don't exits, add him/her
            if(!playerExists(matches[1])){
                if(get_index_by_name_ct(matches[2]) > -1){
                    addTPlayer(matches[1])
                }else if(get_index_by_name_t(matches[2]) > -1){
                    addCTPlayer(matches[1]);
                }
            }
            if($scope.game_status == 'game') add_kill_to_player(matches[1]);
            log_kill(matches[1],matches[2],matches[3]);
            kill_player(matches[2]);
            if(matches[4] == "0"){
                clear_all_alive("CT");
            }
            else if(matches[5] == "0"){
                clear_all_alive("T");
            }
        }
    }



    var add_kill_to_player = function (player) {
        var i = get_index_by_name_ct(player)
        if(i > -1) $scope.players.ct[i].kills += 1;
        else{
            var i = get_index_by_name_t(player);
            if(i > -1) $scope.players.t[i].kills += 1;
        }
    };

    function log_kill(player,killed_player,weapon){
        var data = {player: player, killed: killed_player, weapon: weapon};
        $scope.killbox.push(data);
    }

    function kill_player(name){
        var index = get_index_by_name_t(name);
        if(index == -1){
            index = get_index_by_name_ct(name);
            if(index > -1) {
                $scope.players.ct[index].alive = false;
                if($scope.game_status == 'game') {
                    $scope.players.ct[index].deaths += 1;
                }
            }
        }
        else{
            $scope.players.t[index].alive = false;
            if($scope.game_status == 'game') {
                $scope.players.t[index].deaths += 1;
            }
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
        for(var i = 0; i < $scope.players.ct.length; i++){
            var ct = $scope.players.ct[i];
            if(ct.name == name){
                return i;
            }
        }
        return -1;
    }
    function get_index_by_name_t(name){
        for(var i = 0; i < $scope.players.t.length; i++){
            var t = $scope.players.t[i];
            if(t.name == name){
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
        if(index > -1) $scope.players.ct.splice(index,1);
    }

    function remove_from_t(name){
        var index = get_index_by_name_t(name);
        if(index > -1) $scope.players.t.splice(index,1);
    }


    function join_team(log){
        var reg = /- (.+) join team (\w+)/;
        var matches = log.match(reg);
        var player_i = get_index_by_name_ct(matches[1]);
        var user;

        user = { name: matches[1], alive: true, deaths: 0, kills: 0 };
        if(player_i > -1) user = $scope.players.ct[player_i];
        else{
            var player_i = get_index_by_name_t(matches[1]);
            if(player_i > -1) user = $scope.players.t[player_i];
        }

        remove_from_t(matches[1]);
        remove_from_ct(matches[1]);
        if(matches[2] == "CT"){
            $scope.players.ct.push(user);
        }else if(matches[2] == "TERRORIST"){
            $scope.players.t.push(user);
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
                $scope.time.start_time = new Date(time);
                $scope.time.current_time = angular.copy($scope.time.start_time);
                start_timeline_timer();
                return;
            }
        }
    }

    function start_timeline_timer(){
        $scope.time.timeline_timer_interval = $interval(function () {
            call_log_event($filter('date')($scope.time.current_time,'yyyy-MM-dd HH:mm:ss'));
            if($scope.game_over) pause_timer();
            if($scope.time.current_time <= $scope.time.end_time){
                $scope.time.current_time.setSeconds($scope.time.current_time.getSeconds() + 1);
            }
        },(1000/$scope.time.playback_speed));
    }

    var playUntilLog = function (events, log) {
        for(var i = 0; i < events.length; i++){
            match_log(events[i].log);
            if(events[i].log == log){
                var time = get_time(log);
                var time = get_time(log);
                $scope.time.current_time = new Date(time);
                break;
            }
        }
    };

    function load_events(events){
        if($scope.time.current_time == undefined) set_start_time();
        for(var i = 0; i < events.length; i++){
            var ev = events[i];
            addEventToTimeline(ev.log);
            $scope.last_event = ev.id;
            if(isKnifeRound(ev.log)){
                playUntilLog(events,ev.log);
            }
            if(isWinEvent(ev.log)){
                $scope.game_over = true;
            }
        }
        for(var i = events.length; i > 0; i--){
            if(events[i] == undefined || events[i].log == undefined) continue;
            var time = get_time(events[i].log);
            if(time != null){
                $scope.time.end_time = new Date(get_time(events[i].log));
                break;
            }
        }
    }

    function isWinEvent(log){
        switch(true){
            case /- (.+) win ! Final score:/.test(log):
                return true;
                break;
        }
        return false;
    }
    function isKnifeRound(log){
        switch(true){
            case /INFO:.+ (Starting Knife Round)/.test(log):
                return true;
                break;
        }
        return false;
    }

    function isNewRound(log){
        switch(true){
            case /- Un round a été marqué -.*\((\d+)\) - \((\d+)\)/.test(log):
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
