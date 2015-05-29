app = angular.module('esporttracker', ['ngAnimate','templates']);


app.controller('CSGOPlayerCtrl',['$scope',function($scope){

    $scope.playerStyle = function(player){
        if(player == undefined) return;
        if(!player.alive){
            console.log(player);
            return 'dead';
        }
    }

}]);