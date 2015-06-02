


app.directive('timeline', function() {
    return {
        controller: 'TimelineCtrl',
        scope: {
            time: '=time',
            gameOver: '=gameOver',
        },
        templateUrl: 'timeline_template.html'
    };
});