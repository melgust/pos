<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

//Request::setTrustedProxies(array('127.0.0.1'));

function formatResponse( $id ) {
  return array( 'id' => $id, 'status' => 'OK' );
}

function resultArray( $status, $message, $data) {
  return array('status' => $status, 'message' => $message, 'data' => $data);
}

//handling CORS preflight request
$app->before(function (Request $request) {
  if ($request->getMethod() === "OPTIONS") {
    $response = new Response();
    // $response->headers->set("Access-Control-Allow-Origin", "*");
    $response->headers->set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    $response->headers->set("Access-Control-Allow-Headers", "Content-Type");
    $response->setStatusCode(200);
    return $response->send();
  }
}, Silex\Application::EARLY_EVENT);


//handling CORS respons with right headers
$app->after(function (Request $request, Response $response) {
  $response->headers->set("Access-Control-Allow-Origin", "*");
  $response->headers->set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  $response->headers->set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  // if ( $response->headers->get('content') )
  $content = json_decode( $response->getContent(), true );
  if ( isset( $content['error'] ) ) {
    // http://stackoverflow.com/questions/3290182/rest-http-status-codes-for-failed-validation-or-invalid-duplicate
    $response->setStatusCode( 422 ); // UNPROCESSABLE ENTITY
  }

});

//accepting JSON
/*$app->before(function (Request $request) {
  if (0 === strpos($request->headers->get('Content-Type'), 'application/json')) {
    $data = json_decode($request->getContent(), true);
    $request->request->replace(is_array($data) ? $data : array());
  }
});*/

$app->get('/', function () use ($app) {
  return 'hi test';
});

//factura
$app->mount('/factura', include 'factura.php');

//tienda
$app->mount('/tienda', include 'tienda.php');

//tipo cliente
$app->mount('/tipocliente', include 'tipocliente.php');

//cliente
$app->mount('/cliente', include 'cliente.php');

//categoria
$app->mount('/categoria', include 'categoria.php');

//producto
$app->mount('/producto', include 'producto.php');

//banco
$app->mount('/banco', include 'banco.php');

//precio
$app->mount('/precio', include 'precio.php');

//proveedor
$app->mount('/proveedor', include 'proveedor.php');

//usuarios
$app->mount('/usuario', include 'usuario.php');

//inventario
$app->mount('/inventario', include 'inventario.php');

//productos versus proveedores
$app->mount('/productoproveedor', include 'productoproveedor.php');

$app->error(function (\Exception $e, $code) use ($app) {

    if ($app['debug'] == false) {
        return;
    }

    return 'error exception cont' . $e;

    // 404.html, or 40x.html, or 4xx.html, or error.html
    /*$templates = array(
        'errors/'.$code.'.html',
        'errors/'.substr($code, 0, 2).'x.html',
        'errors/'.substr($code, 0, 1).'xx.html',
        'errors/default.html',
    );

    return new Response($app['twig']->resolveTemplate($templates)->render(array('code' => $code)), $code);*/
});
