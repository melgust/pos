<?php

use Silex\Application;
use Silex\Provider\TwigServiceProvider;
use Silex\Provider\UrlGeneratorServiceProvider;
use Silex\Provider\ValidatorServiceProvider;
use Silex\Provider\ServiceControllerServiceProvider;
use Silex\Provider\DoctrineServiceProvider;

use Silex\Route;

class MyRoute extends Route
{
    use Route\SecurityTrait;
}

$app = new Application();
$app->register(new UrlGeneratorServiceProvider());
$app->register(new ValidatorServiceProvider());
$app->register(new ServiceControllerServiceProvider());
$app->register(new TwigServiceProvider());
$app['twig'] = $app->share($app->extend('twig', function ($twig, $app) {
    // add custom globals, filters, tags, ...

    return $twig;
}));

$app->register(new Silex\Provider\DoctrineServiceProvider(), array(
    'db.options' => array(
        'driver' => 'pdo_mysql',
        'dbhost' => 'localhost',
        'dbname' => 'chixot_dev',
        'user' => 'chixot_pos',
        'password' => 'chixotpos123',
        'charset'  => 'utf8'
    ),
));

$app->register(new Silex\Provider\SessionServiceProvider());

/*$app->register(new Silex\Provider\SecurityServiceProvider(), array(
	'security.firewalls' => array(
	    'login' => array(
	        'pattern' => '^/login$',
	    ),
	    'secured' => array(
	        'pattern' => '^.*$',
	        'form' => array('login_path' => '/login', 'check_path' => '/login_check'),
	        'logout' => array('logout_path' => '/logout'),
	        'users' => array(
	            'admin' => array('ROLE_ADMIN', '5FZ2Z8QIkA7UTZ4BYkoC+GsReLf569mSKDsfods6LYQ8t+a8EW9oaircfMpmaLbPBh4FOBiiFyLfuZmTSUwzZg=='),
	        ),
	    	  'users' => $app->share(function() use ($app) {
	            // Specific class App\User\UserProvider is described below
	           // var_dump($app['db']);exit;
	            return new App\User\UserProvider($app['db']);
	        }),
	    )
	)
));*/


// Defining Access Rules
// Roles are a great way to adapt the behavior of your website depending on groups of users, but they can also be used to further secure some areas by defining access rules:
/*$app['security.access_rules'] = array(
    array('^/admin', 'ROLE_ADMIN', 'https'),
    array('^.*$', 'ROLE_USER'),
);*/

$app['route_class'] = 'MyRoute';

return $app;