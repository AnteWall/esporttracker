app.factory('Match', ['$http',function($http){
    var match = {};
    var apiUrl = '/api/match';

    match.CSGOLive = function(){
        return $http.get(apiUrl + '/live');
    }

    return match;
}]);
