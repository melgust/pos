<?php

$tipocliente = $app['controllers_factory'];

$tipocliente->get('/lista', function () use ($app) {
  $rows = $app['db']->fetchAll( "SELECT * FROM tc_tipo_cliente order by tipo_cliente_id desc", array() );
  return $app->json( resultArray( 'OK', 'Datos cargados', $rows ) );
});

$tipocliente->get('/{tipo_cliente_id}', function ($tipo_cliente_id) use ($app) {
  $row = $app['db']->fetchAssoc( "SELECT * FROM tc_tipo_cliente where tipo_cliente_id = ?", array($tipo_cliente_id) );
  return $app->json( resultArray( 'OK', 'Datos cargados', $row ) );
});

$tipocliente->post('/add', function () use ($app) {
  $data = json_decode( file_get_contents("php://input"), true );
  $app['db']->insert('tc_tipo_cliente', $data);
  return $app->json( resultArray( 'OK', 'Datos guardados', null ) );
});

$tipocliente->put('/edit', function () use ($app) {
  $data = json_decode( file_get_contents("php://input"), true );
  $app['db']->update( 'tc_tipo_cliente', $data, array( 'tipo_cliente_id' => $data['tipo_cliente_id'] ) );
  return $app->json( resultArray( 'OK', 'Datos actualizados', null ) );
});

return $tipocliente;
