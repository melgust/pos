angular.module('app.inventario.service', [

])

.factory('inventarioService', ['$http', '$q', 'appSettings',  function ( $http, $q, appSettings ) {

  return {
    list: function () {
      var deferred = $q.defer();
      $http.get( appSettings.restApiServiceBaseUri + 'inventario/lista' ).success( function ( res ) {
        deferred.resolve( res );
      }).error(function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    add: function ( data ) {
      var deferred = $q.defer();
      $http.post( appSettings.restApiServiceBaseUri + 'inventario/agregar', data ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    edit: function ( ingreso_inventario_id, data ) {
      var deferred = $q.defer();
      $http.put( appSettings.restApiServiceBaseUri + 'inventario/' + ingreso_inventario_id + '/anular', data ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    get: function ( url ) {
      var deferred = $q.defer();
      $http.get( appSettings.restApiServiceBaseUri + url ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    getData: function ( url, data ) {
      var deferred = $q.defer();
      $http.post( appSettings.restApiServiceBaseUri + url, data ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    anularFactura: function ( data, id ) {
      var deferred = $q.defer();
      $http.post( appSettings.restApiServiceBaseUri + 'inventario/factura/' + id + '/anular', data ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
  }

}]);
