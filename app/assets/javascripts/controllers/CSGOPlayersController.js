app.controller('CSGOPlayerCtrl',['$scope',function($scope){

    $scope.playerStyle = function(player){
        if(player == undefined) return;
        if(!player.alive){
            return 'dead';
        }
    }

}]);