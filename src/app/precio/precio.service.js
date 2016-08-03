angular.module('app.precio.service', [

])

.factory('precioService', ['$http', '$q', 'appSettings',  function ( $http, $q, appSettings ) {

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
    listaProducto: function ( tipo_cliente_id ) {
      var deferred = $q.defer();
      $http.get( appSettings.restApiServiceBaseUri + 'precio/producto/' + tipo_cliente_id + '/lista' ).success( function ( res ) {
        deferred.resolve( res );
      }).error(function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    list: function ( tipo_cliente_id ) {
      var deferred = $q.defer();
      $http.get( appSettings.restApiServiceBaseUri + 'precio/' + tipo_cliente_id + '/lista' ).success( function ( res ) {
        deferred.resolve( res );
      }).error(function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    add: function ( data ) {
      var deferred = $q.defer();
      $http.post( appSettings.restApiServiceBaseUri + 'precio/add', data ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    addAll: function ( tipo_cliente_id ) {
      var deferred = $q.defer();
      $http.post( appSettings.restApiServiceBaseUri + 'precio/todo/' + tipo_cliente_id ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    edit: function ( data ) {
      var deferred = $q.defer();
      $http.put( appSettings.restApiServiceBaseUri + 'precio/edit', data ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    },
    get: function ( precio_id ) {
      var deferred = $q.defer();
      $http.get( appSettings.restApiServiceBaseUri + 'precio/' + precio_id ).success( function ( res ) {
        deferred.resolve( res );
      }).error( function( error ){
        deferred.reject( error );
      });
      return deferred.promise;
    }
  }

}]);
