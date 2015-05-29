app.directive('csPlayers', function() {
    return {
        controller: 'CSGOPlayerCtrl',
        scope: {
            players: '=players',
            killbox: '=killbox'
        },
        templateUrl: 'csgo_players_template.html'
    };
});