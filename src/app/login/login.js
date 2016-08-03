angular.module('app.login', [
  'ui.router',
  'toastr',
  'app.authService'
])

.config(
  [          '$stateProvider', '$urlRouterProvider',
    function ($stateProvider,   $urlRouterProvider) {
      $stateProvider
        //////////////
        // Login //
        //////////////
        .state('login', {

          url: '/login',

          templateUrl: 'app/login/login.tpl.html',

          resolve: {
            dataCaja: ['authService',
              function ( authService ){
                return authService.listaCaja();
              }]
          },

          controller: ['$scope', '$state', '$timeout', 'dataCaja', 'authService', 'toastr', '$base64',
            function (  $scope, $state, $timeout, dataCaja, authService, toastr, $base64) {
              angular.element("html,body").addClass('login-content');
              $scope.dataCaja = dataCaja.data;
              //Status
              $scope.loginData = {
                usuario : null,
                password : null,
                caja_id : null
              }
              $scope.submitForm = function ( isValid ) {
                if ( isValid ) {
                  $scope.loginData.password = $base64.encode($scope.loginData.password);
                  authService.login( $scope.loginData ).then( function( response ) {
                    if (response.status == 'OK') {
                      $state.go( 'index.home' );
                    } else {
                      toastr.error(response.message);
                    }
                  }, function ( error ) {
                    toastr.error(error);
                  });

                }
              }
            }]

        })
    }
  ]
);
