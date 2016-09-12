angular.module('app.cheque.service', [

])

.factory('chequeService', ['$http', '$q', 'appSettings',  function ( $http, $q, appSettings ) {

  return {
    lista: function () {
      var deferred = $q.defer();
      $http.get( appSettings.restApiServiceBaseUri + 'cheque/cliente/lista' ).success( function ( res ) {
        deferred.resolve( res );
      }).error(function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    buscar: function (numero, cuenta) {
      var deferred = $q.defer();
      $http.get( appSettings.restApiServiceBaseUri + 'cheque/buscar/' + numero + '/' + cuenta.toUpperCase() + '/lista' ).success( function ( res ) {
        deferred.resolve( res );
      }).error(function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    listaCliente: function ( cliente_id ) {
      var deferred = $q.defer();
      $http.get( appSettings.restApiServiceBaseUri + 'cheque/cliente/' + cliente_id + '/lista' ).success( function ( res ) {
        deferred.resolve( res );
      }).error(function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    add: function ( data ) {
      var deferred = $q.defer();
      $http.post( appSettings.restApiServiceBaseUri + 'cheque/add', data ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    addAll: function ( tipo_cliente_id ) {
      var deferred = $q.defer();
      $http.post( appSettings.restApiServiceBaseUri + 'cheque/todo/' + tipo_cliente_id ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    edit: function ( data ) {
      var deferred = $q.defer();
      $http.put( appSettings.restApiServiceBaseUri + 'cheque/edit', data ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    get: function ( cheque_id ) {
      var deferred = $q.defer();
      $http.get( appSettings.restApiServiceBaseUri + 'cheque/' + cheque_id ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    }
  }

}]);
