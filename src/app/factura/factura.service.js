angular.module('app.facturaService', [

])

.factory('facturaService', ['$http', '$q', 'appSettings',  function($http, $q, appSettings) {

  return {
    add: function ( data ) {
      var deferred = $q.defer();
      $http.post( appSettings.restApiServiceBaseUri + 'factura/add', data ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    addProforma: function ( data ) {
      var deferred = $q.defer();
      $http.post( appSettings.restApiServiceBaseUri + 'factura/proforma/add', data ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    agregarCliente: function ( data ) {
      var deferred = $q.defer();
      $http.post( appSettings.restApiServiceBaseUri + 'factura/cliente/agregar', data ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    buscarCliente: function ( nit ) {
      var deferred = $q.defer();
      $http.get( appSettings.restApiServiceBaseUri + 'factura/cliente/' + nit ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    buscarClienteId: function ( clienteId ) {
      var deferred = $q.defer();
      $http.get( appSettings.restApiServiceBaseUri + 'factura/cliente/' + clienteId + '/codigo' ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    buscarNombre: function ( nombre ) {
      var deferred = $q.defer();
      $http.get( appSettings.restApiServiceBaseUri + 'factura/cliente/lista/' + nombre + '/filtro' ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    buscarProducto: function ( producto, tipo ) {
      var deferred = $q.defer();
      $http.get( appSettings.restApiServiceBaseUri + 'factura/productocliente/' + producto + '/' + tipo ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    buscarNombreProducto: function ( nombre, tipo ) {
      var deferred = $q.defer();
      $http.get( appSettings.restApiServiceBaseUri + 'factura/productocliente/lista/' + nombre + '/' + tipo + '/filtro' ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    listaTipoCliente: function () {
      var deferred = $q.defer();
      $http.get( appSettings.restApiServiceBaseUri + 'factura/tipocliente/lista' ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    listaTipoPago: function () {
      var deferred = $q.defer();
      $http.get( appSettings.restApiServiceBaseUri + 'factura/tipopago/lista' ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    get: function ( facturaId ) {
      var deferred = $q.defer();
      $http.get( appSettings.restApiServiceBaseUri + 'factura/' + facturaId ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    getProforma: function ( proformaId ) {
      var deferred = $q.defer();
      $http.get( appSettings.restApiServiceBaseUri + 'factura/proforma/' + proformaId ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    }
  }

}]);
