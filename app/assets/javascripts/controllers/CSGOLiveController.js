app = angular.module('esporttracker', ['ngAnimate','templates']);

app.controller('CSGOLiveCtrl',['$scope','Match','$interval',function($scope,Match,$interval){

    $scope.matches = [];
    $scope.live_update = true;
    getLive();

    function getLive(){
        getMatches(); //To request onLoad and then every 5 seconds
        $interval(function(){
            if($scope.live_update) getMatches();
        },5000);
    }

    function getMatches(){
        Match.CSGOLive().success(function(res){
            $scope.matches = res;
        }).error(function(err){
            console.log(err);
        })
    }
}]);