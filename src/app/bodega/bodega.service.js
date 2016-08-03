angular.module('app.bodega.service', [

])

.factory('bodegaService', ['$http', '$q', 'appSettings',  function ( $http, $q, appSettings ) {

  return {
    listaEstado: function () {
      var deferred = $q.defer();
      var res = {
        "status" : "OK",
        "message" : "Lista cargada",
        "data" : [
          {
            "estado" : 0,
            "estado_desc" : "Inactivo"
          },
          {
            "estado" : 1,
            "estado_desc" : "Activo"
          }
        ]
      };
      deferred.resolve( res );
      return deferred.promise;
    },
    list: function () {
      var deferred = $q.defer();
      $http.get( appSettings.restApiServiceBaseUri + 'bodega/lista' ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    add: function ( data ) {
      var deferred = $q.defer();
      $http.post( appSettings.restApiServiceBaseUri + 'bodega/add', data ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    edit: function ( data ) {
      var deferred = $q.defer();
      $http.put( appSettings.restApiServiceBaseUri + 'bodega/edit', data ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    get: function ( bodega_id ) {
      var deferred = $q.defer();
      $http.get( appSettings.restApiServiceBaseUri + 'bodega/' + bodega_id ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
  }

}]);
