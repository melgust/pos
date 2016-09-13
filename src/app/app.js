/////////////////////////////
// Parametros del sistema //
/////////////////////////////
var appSettings = {
  isDevelopment: true,
  restApiServiceBaseUri: 'http://chixot.com/pos/posapi/',
  urlBaseImg: 'http://chixot.com/pos/',
  timeOuttoastrNotifications: '15000',
  paginationPageSizes: [10, 25, 50],
  appVersion: '1'
};


/////////////////////////////
// Inicializacion de modulo//
// principal del sistema   //
/////////////////////////////
angular.module('app', [
  'template-partials',
  'app-partials',
  'ngSanitize',
  'ui.router',
  'ui.bootstrap',
  'ui.grid',
  'ui.grid.pagination',
  'ui.grid.selection',
  'ui.grid.autoResize',
  'ui.select',
  'LocalStorageModule',
  'chieffancypants.loadingBar',
  'toastr',
  'ngDialog',
  'base64',
  'ngFileUpload',

  'app.directives',

  'app.login',
  'app.tienda',
  'app.banco',
  'app.categoria',
  'app.tipocliente',
  'app.cliente',
  'app.producto',
  'app.factura',
  'app.precio',
  'app.proveedor',
  'app.productoproveedor',
  'app.inventario',
  'app.cuentacobrar',
  'app.bodega',
  'app.caja',
  'app.cheque',

  'app.utilsService',
  'app.authService',
  'app.authInterceptorService',
])

.filter('propsFilter', [function() {
  return function(items, props) {
    var out = [];

    if (angular.isArray(items)) {
      items.forEach(function(item) {
        var itemMatches = false;

        var keys = Object.keys(props);
        for (var i = 0; i < keys.length; i++) {
          var prop = keys[i];
          var text = props[prop].toLowerCase();
          if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
            itemMatches = true;
            break;
          }
        }

        if (itemMatches) {
          out.push(item);
        }
      });
    } else {
      // Let the output be the input untouched
      out = items;
    }

    return out;
  };
}])

.run(
  [          '$rootScope', '$state', '$stateParams', '$location', 'appSettings', 'toastr',
    function ($rootScope,   $state,   $stateParams,   $location,   appSettings,   toastr) {

      // add references to $state and $stateParams to the $rootScope
      // For example <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
      // to active whenever 'contacts.list' or one of its decendents is active.
      $rootScope.$state = $state;
      $rootScope.$stateParams = $stateParams;

      $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
        //console.log("entro en statechangeerror",{error: error});
        if ( error && error.status == 401 ) {
          //console.log("a login", { error: error } );
          $state.go('login');
        } else {
          if ( !appSettings.isDevelopment ) {
            location.href = 'assets/trex.html';
          } else {
            event.preventDefault();
            location.href = '#/';
          }
        }
      });

    }
  ]
)

.config(['$httpProvider', function($httpProvider) {
  $httpProvider.defaults.headers.common = {};
  $httpProvider.defaults.headers.post = {};
  $httpProvider.defaults.headers.put = {};
  $httpProvider.defaults.headers.patch = {};
}])

.config(['$httpProvider', function ($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
}])

.config(['ngDialogProvider', function (ngDialogProvider) {
  ngDialogProvider.setDefaults({
    className: 'ngdialog-theme-flat',
    showClose: true,
    closeByDocument: true,
    closeByEscape: true,
    cache: true,
    overlay: true
  });
}])

.config(['toastrConfig', function(toastrConfig) {
  angular.extend(toastrConfig, {
    autoDismiss: false,
    containerId: 'toast-container',
    maxOpened: 0,
    newestOnTop: true,
    positionClass: 'toast-top-right',
    preventDuplicates: false,
    preventOpenDuplicates: false,
    target: 'body'
  });
}])

.config(
  [          '$stateProvider', '$urlRouterProvider',
    function ($stateProvider,   $urlRouterProvider) {

      var authenticated = ['$location', '$q', 'authService', function ( $location, $q, authService ) {
        var deferred = $q.defer();
        if ( authService.isLoggedIn() ) {
          deferred.resolve();
        } else {
          deferred.reject( { status: 401 } );
        }
        return deferred.promise;
      }];

      /////////////////////////////
      // Redirects and Otherwise //
      /////////////////////////////

      $urlRouterProvider

        // If the url is ever invalid, e.g. '/asdf', then redirect to '/' aka the home state
        .otherwise('/');


      //////////////////////////
      // State Configurations //
      //////////////////////////

      // Use $stateProvider to configure your states.
      $stateProvider

        //////////
        // Home //
        //////////

        .state("index", {

          abstract: true,

          url: "/",

          templateUrl: 'app/index.tpl.html',

          resolve: {
            authenticated: authenticated,
            dataTienda: ['tiendaService',
              function( tiendaService ){
                return tiendaService.get( 1 );
              }],
            dataMenu: ['authService',
              function( authService ){
                return authService.listaMenu();
              }]
          },

          controller: ['$scope', 'appSettings', 'dataTienda', 'dataMenu', 'authService', '$state',
            function (  $scope, appSettings, dataTienda, dataMenu, authService, $state) {
              $scope.loginData = authService.getLoginData();
              $scope.dataMenu = dataMenu.data;
              angular.element( "html,body" ).removeClass( 'login-content' );
              $scope.dataTienda = dataTienda.data;
              $scope.current = {
                factura: {
                  tipo: 0,
                  usuario_id : $scope.loginData.usuario_id,
                  caja_id: $scope.loginData.caja_id,
                  serie : null,
                  numero : null,
                  nit : null,
                  nombre : null,
                  direccion : null,
                  cliente_id : null,
                  fecha : null,
                  total : null,
                  totalCredito : null,
                  totalIva : null,
                  totalSinIva : null,
                  detalle : [],
                  pagos : []
                },
                buscarId : 0,
                cantidad : 1
              };
              $scope.currentMaster = angular.copy( $scope.current );

              // dateOptions
              $scope.dateOptions = {
                formatYear: 'yy',
                startingDay: 0,
                format: 'dd/MM/yyyy',
                formatDateTime: 'dd/MM/yyyy HH:mm',
                showMeridian: false
              };

              // objeto fechas que contiene todas las fechas de los forms
              $scope.openedDates = {};

              // funcion que muestra el datepicker
              $scope.openDate = function ( $event, field ) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.openedDates[field] = true;
              };

              $scope.showDate = function(value)
              {
                if (value == null) {
                  return "";
                }
                return new Date(value);
              }
              $scope.showDate2 = function(value)
              {
                if (value == null) {
                  return "";
                } else {
                  value = value.replace(" ", "T") + ".000Z";
                }
                return new Date(value);
              }

              // grid
              $scope.gridOptionsMultipleSelection = {
                enableFiltering: false,
                enableRowSelection: true,
                multiSelect: true,
                enableSelectAll: true,
                enableRowHeaderSelection: false,
                paginationPageSizes: appSettings.paginationPageSizes,
                noUnselect: false,
                data: [],
                rowTemplate: "<div ng-click=\"grid.appScope.onClickRow( row.entity )\" ng-dblclick=\"grid.appScope.editRow( row.entity )\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell dbl-click-row></div>"
              };

              $scope.gridOptionsSingleSelection = {
                enableFiltering: true,
                enableRowSelection: true,
                multiSelect:false,
                enableSelectAll: false,
                enableRowHeaderSelection: false,
                paginationPageSizes: appSettings.paginationPageSizes,
                noUnselect: false,
                data: [],
                rowTemplate: "<div ng-click=\"grid.appScope.onClickRow( row.entity )\" ng-dblclick=\"grid.appScope.editRow( row.entity )\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell dbl-click-row></div>"
              };

              $scope.logout = function(isValid) {
                authService.logOut();
                $state.go('login');
              };

            }]

        })
        .state("index.home", {

          url: "",

          views: {
            '': {
              templateUrl: 'app/home/home.tpl.html',
              resolve: {

              },
              controller: ['$scope',
                function (  $scope) {

              }]
            }
          }

        })
    }
  ]
)

.controller('materialadminCtrl', ['$timeout', '$state', '$scope', function($timeout, $state, $scope/*, growlService*/){
  //Welcome Message
  //growlService.growl('Welcome back Mallinda!', 'inverse')


  // Detact Mobile Browser
  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
     angular.element('html').addClass('ismobile');
  }

  // By default Sidbars are hidden in boxed layout and in wide layout only the right sidebar is hidden.
  this.sidebarToggle = {
      left: false,
      right: false
  }

  // By default template has a boxed layout
  this.layoutType = localStorage.getItem('ma-layout-status');

  // For Mainmenu Active Class
  this.$state = $state;

  //Close sidebar on click
  this.sidebarStat = function(event) {
      if (!angular.element(event.target).parent().hasClass('active')) {
          this.sidebarToggle.left = false;
      }
  }

  //Listview Search (Check listview pages)
  this.listviewSearchStat = false;

  this.lvSearch = function() {
      this.listviewSearchStat = true;
  }

  //Listview menu toggle in small screens
  this.lvMenuStat = false;

  //Blog
  this.wallCommenting = [];

  this.wallImage = false;
  this.wallVideo = false;
  this.wallLink = false;

  //Skin Switch
  this.currentSkin = 'blue';

  this.skinList = [
      'lightblue',
      'bluegray',
      'cyan',
      'teal',
      'green',
      'orange',
      'blue',
      'purple'
  ]

  this.skinSwitch = function (color) {
      this.currentSkin = color;
  }

}])


// =========================================================================
// Header
// =========================================================================
.controller('headerCtrl', [ '$timeout', function($timeout/*, messageService*/){


  // Top Search
  this.openSearch = function(){
      angular.element('#header').addClass('search-toggled');
      angular.element('#top-search-wrap').find('input').focus();
  }

  this.closeSearch = function(){
      angular.element('#header').removeClass('search-toggled');
  }

  // Get messages and notification for header
  /*this.img = messageService.img;
  this.user = messageService.user;
  this.user = messageService.text;

  this.messageResult = messageService.getMessage(this.img, this.user, this.text);*/


  //Clear Notification
  this.clearNotification = function($event) {
      $event.preventDefault();

      var x = angular.element($event.target).closest('.listview');
      var y = x.find('.lv-item');
      var z = y.size();

      angular.element($event.target).parent().fadeOut();

      x.find('.list-group').prepend('<i class="grid-loading hide-it"></i>');
      x.find('.grid-loading').fadeIn(1500);
      var w = 0;

      y.each(function(){
          var z = $(this);
          $timeout(function(){
              z.addClass('animated fadeOutRightBig').delay(1000).queue(function(){
                  z.remove();
              });
          }, w+=150);
      })

      $timeout(function(){
          angular.element('#notifications').addClass('empty');
      }, (z*150)+200);
  }

  // Clear Local Storage
  this.clearLocalStorage = function() {

      //Get confirmation, if confirmed clear the localStorage
      swal({
          title: "Are you sure?",
          text: "All your saved localStorage values will be removed",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#F44336",
          confirmButtonText: "Yes, delete it!",
          closeOnConfirm: false
      }, function(){
          localStorage.clear();
          swal("Done!", "localStorage is cleared", "success");
      });

  }

  //Fullscreen View
  this.fullScreen = function() {
      //Launch
      function launchIntoFullscreen(element) {
          if(element.requestFullscreen) {
              element.requestFullscreen();
          } else if(element.mozRequestFullScreen) {
              element.mozRequestFullScreen();
          } else if(element.webkitRequestFullscreen) {
              element.webkitRequestFullscreen();
          } else if(element.msRequestFullscreen) {
              element.msRequestFullscreen();
          }
      }

      //Exit
      function exitFullscreen() {
          if(document.exitFullscreen) {
              document.exitFullscreen();
          } else if(document.mozCancelFullScreen) {
              document.mozCancelFullScreen();
          } else if(document.webkitExitFullscreen) {
              document.webkitExitFullscreen();
          }
      }

      if (exitFullscreen()) {
          launchIntoFullscreen(document.documentElement);
      }
      else {
          launchIntoFullscreen(document.documentElement);
      }
  }

}])

.directive('changeLayout', [function(){

  return {
      restrict: 'A',
      scope: {
          changeLayout: '='
      },

      link: function(scope, element, attr) {

          //Default State
          if(scope.changeLayout === '1') {
              element.prop('checked', true);
          }

          //Change State
          element.on('change', function(){
              if(element.is(':checked')) {
                  localStorage.setItem('ma-layout-status', 1);
                  scope.$apply(function(){
                      scope.changeLayout = '1';
                  })
              }
              else {
                  localStorage.setItem('ma-layout-status', 0);
                  scope.$apply(function(){
                      scope.changeLayout = '0';
                  })
              }
          })
      }
  }
}])

// =========================================================================
// MAINMENU COLLAPSE
// =========================================================================

.directive('toggleSidebar', [function(){

  return {
      restrict: 'A',
      scope: {
          modelLeft: '=',
          modelRight: '='
      },

      link: function(scope, element, attr) {
          element.on('click', function(){

              if (element.data('target') === 'mainmenu') {
                  if (scope.modelLeft === false) {
                      scope.$apply(function(){
                          scope.modelLeft = true;
                      })
                  }
                  else {
                      scope.$apply(function(){
                          scope.modelLeft = false;
                      })
                  }
              }

              if (element.data('target') === 'chat') {
                  if (scope.modelRight === false) {
                      scope.$apply(function(){
                          scope.modelRight = true;
                      })
                  }
                  else {
                      scope.$apply(function(){
                          scope.modelRight = false;
                      })
                  }

              }
          })
      }
  }

}])

// =========================================================================
// SUBMENU TOGGLE
// =========================================================================

.directive('toggleSubmenu', [function(){
  return {
      restrict: 'A',
      link: function(scope, element, attrs) {
          element.click(function(){
              element.next().slideToggle(200);
              element.parent().toggleClass('toggled');
          });
      }
  }
}])

// =========================================================================
// STOP PROPAGATION
// =========================================================================

.directive('stopPropagate', [function(){
  return {
      restrict: 'C',
      link: function(scope, element) {
          element.on('click', function(event){
              event.stopPropagation();
          });
      }
  }
}])

.directive('aPrevent', [function(){
  return {
      restrict: 'C',
      link: function(scope, element) {
          element.on('click', function(event){
              event.preventDefault();
          });
      }
  }
}])

// =========================================================================
// PRINT
// =========================================================================

.directive('print', [function(){
  return {
      restrict: 'A',
      link: function(scope, element){
          element.click(function(){
              window.print();
          })
      }
  }
}])

// =========================================================================
// Malihu Scroll - Custom Scroll bars
// =========================================================================
.service('scrollService', [function() {
  var ss = {};
  ss.malihuScroll = function scrollBar(selector, theme, mousewheelaxis) {
      $(selector).mCustomScrollbar({
          theme: theme,
          scrollInertia: 100,
          axis:'yx',
          mouseWheel: {
              enable: true,
              axis: mousewheelaxis,
              preventDefault: true
          }
      });
  }

  return ss;
}])

// =========================================================================
// MALIHU SCROLL
// =========================================================================

//On Custom Class
.directive('cOverflow', ['scrollService', function(scrollService){
  return {
      restrict: 'C',
      link: function(scope, element) {

          if (!$('html').hasClass('ismobile')) {
              scrollService.malihuScroll(element, 'minimal-dark', 'y');
          }
      }
  }
}])

// =========================================================================
// WAVES
// =========================================================================

// For .btn classes
.directive('btn', [function(){
  return {
      restrict: 'C',
      link: function(scope, element) {
          if(element.hasClass('btn-icon') || element.hasClass('btn-float')) {
              Waves.attach(element, ['waves-circle']);
          }

          else if(element.hasClass('btn-light')) {
              Waves.attach(element, ['waves-light']);
          }

          else {
              Waves.attach(element);
          }

          Waves.init();
      }
  }
}])

// =========================================================================
// INPUT FEILDS MODIFICATION
// =========================================================================

//Add blue animated border and remove with condition when focus and blur

.directive('fgLine', [function(){
  return {
      restrict: 'C',
      link: function(scope, element) {
          if($('.fg-line')[0]) {
              $('body').on('focus', '.form-control', function(){
                  $(this).closest('.fg-line').addClass('fg-toggled');
              })

              $('body').on('blur', '.form-control', function(){
                  var p = $(this).closest('.form-group');
                  var i = p.find('.form-control').val();

                  if (p.hasClass('fg-float')) {
                      if (i.length == 0) {
                          $(this).closest('.fg-line').removeClass('fg-toggled');
                      }
                  }
                  else {
                      $(this).closest('.fg-line').removeClass('fg-toggled');
                  }
              });
          }

      }
  }

}])



// =========================================================================
// AUTO SIZE TEXTAREA
// =========================================================================

.directive('autoSize', [function(){
  return {
      restrict: 'A',
      link: function(scope, element){
          if (element[0]) {
             autosize(element);
          }
      }
  }
}])

// =========================================================================
// BOOTSTRAP SELECT
// =========================================================================

.directive('selectPicker', [function(){
  return {
      restrict: 'A',
      link: function(scope, element, attrs) {
          //if (element[0]) {
              element.selectpicker();
          //}
      }
  }
}])

// =========================================================================
// INPUT MASK
// =========================================================================

.directive('inputMask', [function(){
  return {
      restrict: 'A',
      scope: {
        inputMask: '='
      },
      link: function(scope, element){
          element.mask(scope.inputMask.mask);
      }
  }
}])

// =========================================================================
// COLOR PICKER
// =========================================================================

.directive('colordPicker', [function(){
  return {
      restrict: 'A',
      link: function(scope, element, attrs) {
          $(element).each(function(){
              var colorOutput = $(this).closest('.cp-container').find('.cp-value');
              $(this).farbtastic(colorOutput);
          });

      }
  }
}])

// =========================================================================
// PLACEHOLDER FOR IE 9 (on .form-control class)
// =========================================================================

.directive('formControl', [function(){
  return {
      restrict: 'C',
      link: function(scope, element, attrs) {
          if(angular.element('html').hasClass('ie9')) {
              $('input, textarea').placeholder({
                  customClass: 'ie9-placeholder'
              });
          }
      }

  }
}])

.constant('appSettings', appSettings);

(function ($) {
  $(document).ready(function() {

    // jQuery reverse
    $.fn.reverse = [].reverse;

    // Hover behaviour: make sure this doesn't work on .click-to-toggle FABs!
    $(document).on('mouseenter.fixedActionBtn', '.fixed-action-btn:not(.click-to-toggle)', function(e) {
      var $this = $(this);
      openFABMenu($this);
    });
    $(document).on('mouseleave.fixedActionBtn', '.fixed-action-btn:not(.click-to-toggle)', function(e) {
      var $this = $(this);
      closeFABMenu($this);
    });

    // Toggle-on-click behaviour.
    $(document).on('click.fixedActionBtn', '.fixed-action-btn.click-to-toggle > a', function(e) {
      var $this = $(this);
      var $menu = $this.parent();
      if ($menu.hasClass('active')) {
        closeFABMenu($menu);
      } else {
        openFABMenu($menu);
      }
    });

  });

  $.fn.extend({
    openFAB: function() {
      openFABMenu($(this));
    },
    closeFAB: function() {
      closeFABMenu($(this));
    }
  });


  var openFABMenu = function (btn) {
    $this = btn;
    if ($this.hasClass('active') === false) {

      // Get direction option
      var horizontal = $this.hasClass('horizontal');
      var offsetY, offsetX;

      if (horizontal === true) {
        offsetX = 40;
      } else {
        offsetY = 40;
      }

      $this.addClass('active');
      $this.find('ul .btn-floating').velocity(
        { scaleY: ".4", scaleX: ".4", translateY: offsetY + 'px', translateX: offsetX + 'px'},
        { duration: 0 });

      var time = 0;
      $this.find('ul .btn-floating').reverse().each( function () {
        $(this).velocity(
          { opacity: "1", scaleX: "1", scaleY: "1", translateY: "0", translateX: '0'},
          { duration: 80, delay: time });
        time += 40;
      });
    }
  };

  var closeFABMenu = function (btn) {
    $this = btn;
    // Get direction option
    var horizontal = $this.hasClass('horizontal');
    var offsetY, offsetX;

    if (horizontal === true) {
      offsetX = 40;
    } else {
      offsetY = 40;
    }

    $this.removeClass('active');
    var time = 0;
    $this.find('ul .btn-floating').velocity("stop", true);
    $this.find('ul .btn-floating').velocity(
      { opacity: "0", scaleX: ".4", scaleY: ".4", translateY: offsetY + 'px', translateX: offsetX + 'px'},
      { duration: 80 }
    );
  };


}( jQuery ));
