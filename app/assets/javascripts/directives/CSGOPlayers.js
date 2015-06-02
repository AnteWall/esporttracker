app.directive('csPlayers', function() {
    return {
        controller: 'CSGOPlayerCtrl',
        scope: {
            players: '=players',
        },
        templateUrl: 'csgo_players_template.html'
    };
});