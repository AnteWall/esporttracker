app.controller('TimelineCtrl',['$scope','$filter', function ($scope,$filter) {

    $scope.getEndTimeTimeline = function(){
        if($scope.gameOver){
            return $filter('date')($scope.time.end_time, 'HH:mm:ss');
        }
        return 'Live';
    };
    $scope.getTimelineElapsed = function(){
        var procentage = Math.round(( ( $scope.time.current_time - $scope.time.start_time ) / ( $scope.time.end_time - $scope.time.start_time ) ) * 100) + "%" //73%
        if(procentage > 100) procentage = 100;
        return {'width' : procentage };
    };

    $scope.getTimelineTooltipPos = function(){
        var procentage = Math.round(( ( $scope.time.current_time - $scope.time.start_time ) / ( $scope.time.end_time - $scope.time.start_time ) ) * 100) + "%" //73%
        if(procentage > 100) procentage = 100;
        return {'left' : procentage };
    }

}]);
