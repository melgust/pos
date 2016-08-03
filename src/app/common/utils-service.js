angular.module('app.utilsService', [

])

.factory('utils', ['$filter', '$timeout', function ($filter, $timeout) {
  return {
    findById: function (a, id) {
      if ( typeof a !== "undefined" ) {
        for (var i = 0; i < a.length; i++) {
          if (a[i].id == id) return a[i];
        }
      }
      return null;
    },

    findFieldById: function (a, field, id) {
      var obj = this.findById(a,id);
      return obj !== null ? obj[field] : null;
    },

    findByField: function (a, field, value) {
      for (var i = 0; i < a.length; i++) {
        if (a[i][field] == value) return a[i];
      }
      return null;
    },

    filterByField: function (a, field, value) {
      var newArray = [];
      if ( typeof a !== "undefined" ) {
        for (var i = 0; i < a.length; i++) {
          if (a[i][field] == value) newArray.push(a[i]);
        }
      }
      return newArray;
    },

    existInArray: function (a, field, value) {
      if ( typeof a !== "undefined" ) {
        for (var i = a.length - 1; i >= 0; i--) {
          if ( a[i][field] == value) {
            return true;
          }
        }
      }
      return false;
    },

    compareAndDeleteRepeatedItems: function(a1, a2, field) {
      var newArray = [];
      if ( typeof a1 !== "undefined" && typeof a2 !== "undefined" ) {
        for (var i = 0; i < a1.length; i++) {
          if ( !this.existInArray( a2, field, a1[i][field]) ) {
            newArray.push( a1[i] );
          }
        }
      }
      return newArray;
    },

    xml2json: function (a) {

      try {
        var result = a.replace("<?xml version=\"1.0\" encoding=\"utf-8\"?>\r","").replace("<string xmlns=\"http://tempuri.org/\">", "").replace("</string>","");
        return ( result === '' ) ? [] : JSON.parse( result );
      } catch ( error ) {
        return undefined;
      }
    },

    // Util for returning a random key from a collection that also isn't the current key
    newRandomKey: function (coll, key, currentKey) {
      var randKey;
      do {
        randKey = coll[Math.floor(coll.length * Math.random())][key];
      } while (randKey == currentKey);
      return randKey;
    },

    parseValue: function( str, fixed ) {
      var value = parseFloat( str, 10 );
      return isNaN( value ) ? 0 : parseFloat( value.toFixed( fixed ), 10 );
    },
    /*
      Funcion que abre una nueva ventana con el cotenido de una plantilla
      Esta funcion compila el html de la plantilla a html puro, es decir si tiene ng-repeat o cualquier directiva angular aqui se compila de otra forma se mostraria tal cual aparece el html
      Parametros:
      html: puede ser la URL de una plantilla o un selector JQuery .class o #id
      scope: El $scope del controlador, util para la compilacion
      title: El titulo de la ventana
    */
    openWindow: function ( html, scope, title ) {
      var markup = '<!DOCTYPE HTML>' +
        '<html>' +
          '<head>' +
            '<title>' + title + '</title></head>' +
            '<link rel="stylesheet" href="bower_components/bootstrap/dist/css/bootstrap.min.css">' +
          '<body>';

      var element = null;

      try {
        element = angular.element( html );
      } catch ( error ) {
        element = $compile( '<div>' + $templateCache.get( html ) + '</div>' )(scope);
      }

      $timeout(function(){
        markup += '<div class="container">' + element.html() + '</div>';
        markup += "</body></html>";
        var newwindow = window.open("", title, "resizable,scrollbars,status");
        newwindow.document.write( markup );
        newwindow.document.close();
        $timeout(function(){
          newwindow.print();
          // newwindow.close();
        }, 4);
      }, 0);
    },
  };
}]);
