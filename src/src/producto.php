<?php

$producto = $app['controllers_factory'];

$producto->get('/lista', function () use ($app) {
  $rows = $app['db']->fetchAll( "SELECT p.* , c.categoria_desc FROM tc_producto p inner join tc_categoria c ON p.categoria_id = c.categoria_id order by producto_id desc", array() );
  return $app->json( resultArray( 'OK', 'Datos cargados', $rows ) );
});

$producto->get('/{producto_id}', function ($producto_id) use ($app) {
  $row = $app['db']->fetchAssoc( "SELECT * FROM tc_producto where producto_id = ?", array($producto_id) );
  return $app->json( resultArray( 'OK', 'Datos cargados', $row ) );
});

$producto->post('/add', function () use ($app) {
  $data = json_decode( file_get_contents("php://input"), true );
  $app['db']->insert('tc_producto', $data);
  return $app->json( resultArray( 'OK', 'Datos guardados', null ) );
});

$producto->put('/edit', function () use ($app) {
  $data = json_decode( file_get_contents("php://input"), true );
  $app['db']->update( 'tc_producto', $data, array( 'producto_id' => $data['producto_id'] ) );
  return $app->json( resultArray( 'OK', 'Datos actualizados', null ) );
});

return $producto;
