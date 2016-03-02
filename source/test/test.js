/**
 * test.js
 */

/* eslint-env node, mocha */
/* global jQuery:true, $:true, $g:true, spa:true */
/* eslint no-console: 0 */

var
  jsdom = require( 'jsdom' ).jsdom,
  window = jsdom('<html></html>').defaultView,
  should = require( 'chai' ).should(),

  userName = 'Honoka',

  makePeopleStr;

global.jQuery = require( 'jquery' )( window );
global.TAFFY = require( '../js/lib/taffy-min.js' ).taffy;
global.io = require( 'socket.io-client' );
global.$ = jQuery;
global.$g = $({});
global.spa = null;
global.location = {
  hostname: 'localhost',
  protocol: 'http:'
};

require( '../js/spa.js' );
require( '../js/spa.util.js' );
require( '../js/spa.data.js' );
require( '../js/spa.fake.js' );
require( '../js/spa.model.js' );

makePeopleStr = function ( people_db ) {
  var people_list = [];
  people_db().each( function ( person ) {
    people_list.push( person.name );
  });
  return people_list.sort().join(',');
};

describe( 'Initial state', function () {
  var
    user,
    people_db,
    people_str;

  before( function () {
    spa.initModule( null );
    spa.model.setDataMode( 'fake' );

    user = spa.model.people.get_user();
  });

  describe( 'User state', function () {
    it( 'user is anonymous', function () {
      ( user.get_is_anon() ).should.equal( true );
    });
  });

  describe( 'Online user state', function () {

    before( function () {
      people_db = spa.model.people.get_db();
      people_str = makePeopleStr( people_db );
    });

    it( 'expected user only contains anonymous', function () {
      ( people_str ).should.equal( 'anonymous' );
    });
  });
});

describe( 'Login', function () {
  var
    user,
    people_db,
    people_str,
    user_str = userName + ',anonymous';

  it( 'Login started', function () {
    spa.model.people.login( userName );
    user = spa.model.people.get_user();
    ( true ).should.equal( true );
  });

  it( 'User is no longer anonymous', function () {
    ( ! user.get_is_anon() ).should.equal( true );
  });

  it( 'User name is ' + userName, function () {
    ( user.name ).should.equal( userName );
  });

  it( 'User id is undefined as login is incomplete', function () {
    should.not.exist( user.id );
  });

  it( 'User cid is c0', function () {
    ( user.cid ).should.equal( 'c0' );
  });

  it( 'User list is as expected "' + user_str + '"', function () {
    people_db = spa.model.people.get_db();
    people_str = makePeopleStr( people_db );
    people_str.should.equal( user_str );
  });

  it( 'Login completely', function ( done ) {
    $g.on( 'spa-login', function () {
      done();
    });
  });
});

describe( 'After login', function () {
  var
    user,
    cloned_user,
    people_db,
    people_str,
    user_str = userName + ',Kotori,Maki,Rin,Umi';

  it( 'User properties has defalut value', function () {
    user = spa.model.people.get_user();
    cloned_user = $.extend( true, {}, user );

    delete cloned_user.___id;
    delete cloned_user.___s;
    delete cloned_user.get_is_anon;
    delete cloned_user.get_is_user;

    cloned_user.should.deep.equal( {
      cid: 'id_5',
      css_map: {
        top: 25,
        left: 25,
        'background-color': '#8f8'
      },
      id: 'id_5',
      name: userName
    });
  });

  it( 'Online user list is expected "' + user_str + '"', function () {
    people_db = spa.model.people.get_db();
    people_str = makePeopleStr( people_db );

    people_str.should.equal( user_str );
  });
});
