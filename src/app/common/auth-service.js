angular.module('app.authService', [
  'ui.router',
  'LocalStorageModule',
  'app.utilsService'
])

.factory('authService', ['$http', '$q', '$location', 'localStorageService', 'utils', 'appSettings',  function ($http, $q, $location, localStorageService, utils, appSettings) {

  var auth = {};

  auth.saveToken = function(token) {
    localStorageService.set('sgt2-token', token);
  };

  auth.getToken = function() {
    return localStorageService.get('sgt2-token');
  };

  auth.saveLoginData = function ( loginData ) {
    localStorageService.set('loginData', loginData);
  };

  auth.getLoginData = function () {
    return localStorageService.get('loginData');
  };

  auth.getUserId = function () {
    return auth.getLoginData() ? auth.getLoginData().usuario_id : null;
  };

  auth.getPerfilId = function () {
    return auth.getLoginData() ? auth.getLoginData().perfil_id : null;
  };

  auth.listaCaja = function () {
    var deferred = $q.defer();
    $http.get(appSettings.restApiServiceBaseUri + 'usuario/caja/lista').success(function (res) {
        deferred.resolve(res);
    }).error(function( error ) {
      deferred.reject( error );
    });
    return deferred.promise;
  };

  auth.listaMenu = function () {
    var deferred = $q.defer();
    $http.get(appSettings.restApiServiceBaseUri + 'usuario/menu/lista/' + auth.getPerfilId() + '/perfil').success(function (res) {
        deferred.resolve(res);
    }).error(function( error ) {
      deferred.reject( error );
    });
    return deferred.promise;
  };

  auth.login = function (data) {
    var deferred = $q.defer();
    $http.post(appSettings.restApiServiceBaseUri + 'usuario/validar', data).success(function (res) {
        if (res.status == 'OK') {
          var userData = {
            usuario : res.data.usuario,
            usuario_desc : res.data.usuario_desc,
            usuario_id : res.data.usuario_id,
            perfil_id : res.data.perfil_id,
            caja_id : data.caja_id
          };
          auth.saveLoginData(userData);
        }
        deferred.resolve(res);
    }).error(function( error ) {
      deferred.reject( error );
    });
    return deferred.promise;
  };

  auth.logOut = function () {
    localStorageService.remove('loginData');
  };

  auth.isLoggedIn = function () {
    return auth.getLoginData() ? true : false;
  };

  auth.loginPermission = function ( data ) {
    var deferred = $q.defer();
    $http.get(appSettings.apiServiceBaseUri + 'wsHomeDMZ.asmx/login',{
      params: { strUsername: data.username, strPassword: data.password }
    }).success(function (res) {
      res = utils.xml2json(res);
      if ( res.id_usuario != 2 &&  res.usuario != "null" ) {
        deferred.resolve(res);
      } else {
        deferred.resolve({'error': 'Usuario invalido'});
      }
    }).error(function( error ) {
      deferred.reject( error );
    });
    return deferred.promise;
  };

  auth.userPermission = function ( idUsuario, opcion ) {
    var deferred = $q.defer();
    $http.get(appSettings.apiServiceBaseUri + 'wssujetosdmz.asmx/getPermisoOpcion', {
      params: { p_id_usuario: idUsuario, p_id_opcion: opcion }
    }).success(function(data){
       deferred.resolve(utils.xml2json(data));
    }).error(function( error ){
      deferred.reject( error );
    });
    return deferred.promise;
  };

  return auth;

}]);
