angular.module('app.productoproveedor', [
  'ui.router',
  'toastr',
  'app.producto.service',
  'app.proveedor.service',
  'app.productoproveedor.service'
])

.config(
  [          '$stateProvider', '$urlRouterProvider',
    function ($stateProvider,   $urlRouterProvider) {
      $stateProvider
        .state('index.productoproveedor', {
          abstract: true,
          url: 'productoproveedor',
          template: '<div ui-view></div>',
          resolve: {
          },
          controller: ['$scope', 'toastr', 'appSettings',
            function (  $scope, toastr, appSettings) {
              $scope.module = 'Proveedor y producto';
            }
          ]
        })
        .state('index.productoproveedor.list', {
          url: '',
          templateUrl: 'app/productoproveedor/productoproveedor.list.tpl.html',
          resolve: {
            productoproveedor: ['productoproveedorService',
              function ( productoproveedorService ){
                return productoproveedorService.list();
              }]
          },

          controller: ['$scope', '$state', 'productoproveedor',
            function (  $scope,   $state,   productoproveedor) {

              $scope.gridOptions = angular.copy( $scope.gridOptionsSingleSelection );
              $scope.gridOptions.rowHeight = 70;
              $scope.gridOptions.columnDefs = [
                { field:'producto_desc', name: 'Producto' },
                { field:'proveedor_desc', name: 'Proveedor' },
                { field:'cantidad', name: 'Cantidad ingresada' },
                { field:'minimo', name: 'Existencia mínima' },
                { field: 'imagen_url', name: 'Imagen', enableFiltering: false,
                  cellTemplate:"<img width=\"70px\" ng-src=\"{{grid.appScope.getUrlImg(row.entity.imagen_url)}}\" lazy-src>",
                  width: "10%"}
              ];
              $scope.getUrlImg = function(value) {
                return appSettings.urlBaseImg + value;
              }
              $scope.gridOptions.data = productoproveedor.data;

              $scope.editRow = function ( row ) {
                $state.go('^.edit',{ producto_id: row.producto_id, proveedor_id : row.proveedor_id });
              }

            }]

        })
        .state('index.productoproveedor.add', {

          url: '/add',

          templateUrl: 'app/productoproveedor/productoproveedor.add.tpl.html',

          resolve: {
            dataProducto: ['productoService',
              function ( productoService ){
                return productoService.list();
              }],
            dataProveedor: ['proveedorService',
              function ( proveedorService ){
                return proveedorService.list();
              }]
          },
          controller: ['$scope', '$state', 'toastr', 'appSettings', 'Upload', 'productoproveedorService', 'dataProducto', 'dataProveedor',
            function ($scope, $state, toastr, appSettings, Upload, productoproveedorService, dataProducto, dataProveedor) {
              $scope.data = {
                producto_id : null,
                proveedor_id: null,
                cantidad : 0,
                minimo : 1
              };
              $scope.muestraImagen = 0;
              $scope.dataImg = { urlImg : null };
              $scope.dataProducto = dataProducto.data;
              $scope.dataProveedor = dataProveedor.data;
              $scope.submitForm = function ( isValid ) {
                if ( isValid ) {
                  productoproveedorService.add( $scope.data ).then( function ( res ) {
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
            }
          ]
        })
        .state('index.productoproveedor.edit', {
          url: '/:producto_id/:proveedor_id/edit',
          templateUrl: 'app/productoproveedor/productoproveedor.add.tpl.html',
          resolve: {
            dataProductoProveedor: ['productoproveedorService', '$stateParams',
              function ( productoproveedorService, $stateParams ){
                return productoproveedorService.get( $stateParams.producto_id, $stateParams.proveedor_id );
              }],
            dataProducto: ['productoService',
              function ( productoService ){
                return productoService.list();
              }],
            dataProveedor: ['proveedorService',
              function ( proveedorService ){
                return proveedorService.list();
              }]
          },
          controller: ['$scope', '$state', 'toastr', 'appSettings', 'Upload', 'productoproveedorService', 'dataProductoProveedor', 'dataProducto', 'dataProveedor',
            function ($scope, $state, toastr, appSettings, Upload, productoproveedorService, dataProductoProveedor, dataProducto, dataProveedor) {
              $scope.data = dataProductoProveedor.data;
              $scope.muestraImagen = 1;
              $scope.dataImg = { urlImg : appSettings.urlBaseImg + $scope.data.imagen_url };
              $scope.dataProducto = dataProducto.data;
              $scope.dataProveedor = dataProveedor.data;
              $scope.submitForm = function ( isValid ) {
                if ( isValid ) {
                  productoproveedorService.edit( $scope.data ) .then( function ( res ) {
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
            }
          ]
        }
      )
    }
  ]
);
