<?php

$banco = $app['controllers_factory'];

$banco->get('/lista', function () use ($app) {
  $rows = $app['db']->fetchAll( "SELECT * FROM tc_banco order by banco_id desc", array() );
  return $app->json( resultArray( 'OK', 'Datos cargados', $rows ) );
});

$banco->get('/{banco_id}', function ($banco_id) use ($app) {
  $row = $app['db']->fetchAssoc( "SELECT * FROM tc_banco where banco_id = ?", array($banco_id) );
  return $app->json( resultArray( 'OK', 'Datos cargados', $row ) );
});

$banco->post('/add', function () use ($app) {
  $data = json_decode( file_get_contents("php://input"), true );
  $app['db']->insert('tc_banco', $data);
  return $app->json( resultArray( 'OK', 'Datos guardados', null ) );
});

$banco->put('/edit', function () use ($app) {
  $data = json_decode( file_get_contents("php://input"), true );
  $app['db']->update( 'tc_banco', $data, array( 'banco_id' => $data['banco_id'] ) );
  return $app->json( resultArray( 'OK', 'Datos actualizados', null ) );
});

return $banco;
