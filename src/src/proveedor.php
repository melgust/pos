<?php

$proveedor = $app['controllers_factory'];

$proveedor->get('/lista', function () use ($app) {
  $rows = $app['db']->fetchAll( "SELECT * FROM tc_proveedor order by proveedor_id desc", array() );
  return $app->json( resultArray( 'OK', 'Datos cargados', $rows ) );
});

$proveedor->get('/{proveedor_id}', function ($proveedor_id) use ($app) {
  $row = $app['db']->fetchAssoc( "SELECT * FROM tc_proveedor where proveedor_id = ?", array($proveedor_id) );
  return $app->json( resultArray( 'OK', 'Datos cargados', $row ) );
});

$proveedor->post('/add', function () use ($app) {
  $data = json_decode( file_get_contents("php://input"), true );
  $app['db']->insert('tc_proveedor', $data);
  return $app->json( resultArray( 'OK', 'Datos guardados', null ) );
});

$proveedor->put('/edit', function () use ($app) {
  $data = json_decode( file_get_contents("php://input"), true );
  $app['db']->update( 'tc_proveedor', $data, array( 'proveedor_id' => $data['proveedor_id'] ) );
  return $app->json( resultArray( 'OK', 'Datos actualizados', null ) );
});

return $proveedor;
