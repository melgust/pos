angular.module('app.cuentacobrar.service', [

])

.factory('cuentacobrarService', ['$http', '$q', 'appSettings',  function ( $http, $q, appSettings ) {

  return {
    lista: function () {
      var deferred = $q.defer();
      $http.get( appSettings.restApiServiceBaseUri + 'cuentacobrar/cliente/lista' ).success( function ( res ) {
        deferred.resolve( res );
      }).error(function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    listaCliente: function ( cliente_id ) {
      var deferred = $q.defer();
      $http.get( appSettings.restApiServiceBaseUri + 'cuentacobrar/cliente/' + cliente_id + '/lista' ).success( function ( res ) {
        deferred.resolve( res );
      }).error(function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    add: function ( data ) {
      var deferred = $q.defer();
      $http.post( appSettings.restApiServiceBaseUri + 'cuentacobrar/add', data ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    addAll: function ( tipo_cliente_id ) {
      var deferred = $q.defer();
      $http.post( appSettings.restApiServiceBaseUri + 'cuentacobrar/todo/' + tipo_cliente_id ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    edit: function ( data ) {
      var deferred = $q.defer();
      $http.put( appSettings.restApiServiceBaseUri + 'cuentacobrar/edit', data ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    get: function ( cuentacobrar_id ) {
      var deferred = $q.defer();
      $http.get( appSettings.restApiServiceBaseUri + 'cuentacobrar/' + cuentacobrar_id ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    }
  }

}]);
