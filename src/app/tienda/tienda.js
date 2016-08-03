angular.module('app.tienda', [
  'ui.router',
  'toastr',
  'app.tiendaService'
])

.config(
  [          '$stateProvider', '$urlRouterProvider',
    function ($stateProvider,   $urlRouterProvider) {
      $stateProvider
        .state('index.tienda', {

          abstract: true,

          url: 'tienda',

          template: '<div ui-view></div>',

          resolve: {
          },

          controller: ['$scope',
            function (  $scope) {

              $scope.module = 'Tienda';

            }]

        })
        .state('index.tienda.edit', {

          url: '/:tienda_id/edit',

          templateUrl: 'app/tienda/tienda.add.tpl.html',

          resolve: {
            dataTienda: ['tiendaService', '$stateParams',
              function ( tiendaService, $stateParams ){
                return tiendaService.get( $stateParams.tienda_id );
              }]
          },

          controller: ['$scope', '$state', 'toastr', 'tiendaService', 'dataTienda',
            function (  $scope,   $state,   toastr,   tiendaService,   dataTienda) {

              $scope.data = dataTienda.data;

              $scope.submitForm = function ( isValid ) {
                if ( isValid ) {
                  tiendaService.edit( $scope.data ).then( function ( res ) {
                    if (res.status == 'OK') {
                      toastr.success( res.message );
                    } else {
                      toastr.error( res.message );
                    }
                  }, function ( error ) {
                    toastr.error( error );
                  });
                }
              }

            }]

        })
    }
  ]
);
