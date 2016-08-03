angular.module('app.categoria', [
  'ui.router',
  'toastr',
  'app.categoria.service'
])

.config(
  [          '$stateProvider', '$urlRouterProvider',
    function ($stateProvider,   $urlRouterProvider) {
      $stateProvider
        .state('index.categoria', {
          abstract: true,
          url: 'categoria',
          template: '<div ui-view></div>',
          resolve: {
          },
          controller: ['$scope',
            function (  $scope) {
              $scope.module = 'Categorias';
            }]

        })
        .state('index.categoria.list', {
          url: '',
          templateUrl: 'app/categoria/categoria.list.tpl.html',
          resolve: {
            categoria: ['categoriaService',
              function ( categoriaService ){
                return categoriaService.list();
              }]
          },
          controller: ['$scope', '$state', 'categoria',
            function (  $scope,   $state,   categoria) {
              $scope.gridOptions = angular.copy( $scope.gridOptionsSingleSelection );
              $scope.gridOptions.columnDefs = [
                { field:'categoria_desc', name: 'Categoria' },
              ];
              $scope.gridOptions.data = categoria.data;
              $scope.editRow = function ( row ) {
                $state.go('^.edit',{ categoria_id: row.categoria_id });
              }
            }]
        })
        .state('index.categoria.add', {
          url: '/add',
          templateUrl: 'app/categoria/categoria.add.tpl.html',
          resolve: {
          },
          controller: ['$scope', '$state', 'toastr', 'categoriaService',
            function (  $scope,   $state,   toastr,   categoriaService) {
              $scope.submitForm = function ( isValid ) {
                if ( isValid ) {
                  categoriaService.add( $scope.data ).then( function ( res ) {
                    if ( res.status == "OK" ) {
                      toastr.success( res.message );
                      $state.go( '^.list' );
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
        .state('index.categoria.edit', {
          url: '/:categoria_id/edit',
          templateUrl: 'app/categoria/categoria.add.tpl.html',
          resolve: {
            categoria: ['categoriaService', '$stateParams',
              function ( categoriaService, $stateParams ){
                return categoriaService.get( $stateParams.categoria_id );
              }]
          },
          controller: ['$scope', '$state', 'toastr', 'categoriaService', 'categoria',
            function (  $scope,   $state,   toastr,   categoriaService,   categoria) {
              $scope.data = categoria.data;
              $scope.submitForm = function ( isValid ) {
                if ( isValid ) {
                  categoriaService.edit( $scope.data ) .then( function ( res ) {
                    if ( res.status == "OK" ) {
                      toastr.success( res.message );
                      $state.go( '^.list' );
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
