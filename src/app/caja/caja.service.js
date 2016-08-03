angular.module('app.caja.service', [

])

.factory('cajaService', ['$http', '$q', 'appSettings',  function ( $http, $q, appSettings ) {

  return {
    list: function () {
      var deferred = $q.defer();
      $http.get( appSettings.restApiServiceBaseUri + 'caja/lista' ).success( function ( res ) {
        deferred.resolve( res );
      }).error(function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    add: function ( data ) {
      var deferred = $q.defer();
      $http.post( appSettings.restApiServiceBaseUri + 'caja/add', data ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    edit: function ( data ) {
      var deferred = $q.defer();
      $http.put( appSettings.restApiServiceBaseUri + 'caja/edit', data ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    get: function ( caja_id ) {
      var deferred = $q.defer();
      $http.get( appSettings.restApiServiceBaseUri + 'caja/' + caja_id ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    }
  }

}]);
