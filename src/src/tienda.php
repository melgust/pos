<?php

$tienda = $app['controllers_factory'];

$tienda->get('/lista', function () use ($app) {
  $rows = $app['db']->fetchAll("SELECT * FROM tc_tienda", array());
  return $app->json( resultArray( 'OK', 'Datos cargados', $rows ) );
});

$tienda->get('/{id}', function ($id) use ($app) {
  $row = $app['db']->fetchAssoc( "SELECT * FROM tc_tienda where tienda_id = ?", array($id) );
  return $app->json( resultArray( 'OK', 'Datos cargados', $row ) );
});

$tienda->put('/edit', function () use ($app) {
  $data = json_decode( file_get_contents("php://input"), true );
  $app['db']->update( 'tc_tienda', $data, array( 'tienda_id' => $data['tienda_id'] ) );
  return $app->json( resultArray( 'OK', 'Datos actualizados', null ) );
});

return $tienda;
