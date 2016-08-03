angular.module('app.categoria.service', [

])

.factory('categoriaService', ['$http', '$q', 'appSettings',  function ( $http, $q, appSettings ) {

  return {
    list: function () {
      var deferred = $q.defer();
      $http.get( appSettings.restApiServiceBaseUri + 'categoria/lista' ).success( function ( res ) {
        deferred.resolve( res );
      }).error(function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    add: function ( data ) {
      var deferred = $q.defer();
      $http.post( appSettings.restApiServiceBaseUri + 'categoria/add', data ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    edit: function ( data ) {
      var deferred = $q.defer();
      $http.put( appSettings.restApiServiceBaseUri + 'categoria/edit', data ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    get: function ( categoria_id ) {
      var deferred = $q.defer();
      $http.get( appSettings.restApiServiceBaseUri + 'categoria/' + categoria_id ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
  }

}]);
