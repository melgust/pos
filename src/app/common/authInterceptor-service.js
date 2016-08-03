angular.module('app.authInterceptorService', [
  'LocalStorageModule',
  'toastr'
])

.factory('authInterceptor', ['$q', '$injector', '$location', 'localStorageService', 'toastr', function ( $q, $injector, $location, localStorageService, toastr ) {

  var authInterceptor = {};

  authInterceptor.request = function ( config ) {

    config.headers = config.headers || {};
   
    var authData = localStorageService.get( 'loginData' );
    if (authData) {
      config.headers.Authorization = 'Bearer ' + authData.token;
    }

    return config;
  }

  authInterceptor.responseError = function ( rejection ) {
    console.log("rejection", rejection);
    if ( rejection.data.error ) {
      toastr.error( rejection.data.error );
    }

    if ( rejection.status === 401 ) {
      var authService = $injector.get('authService');
      var authData = localStorageService.get('loginData');

      if ( authData ) {
        if ( authData.useRefreshTokens ) {
          $location.path( '/refresh' );
          return $q.reject( rejection );
        }
      }
      authService.logOut();
      //console.log("location.href", '/#/login');
      // $location.path('/login');
      location.href = "#/login";
    }
    return $q.reject( rejection );
  }

  return authInterceptor;
}]);