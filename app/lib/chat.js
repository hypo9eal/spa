/**
 * chat.js
 */

/* eslint-env node */
/* eslint no-console: 0 */

'use strict';

var
  socket = require( 'socket.io' ),
  crud = require( './crud' ),

  chatterMap = {},

  emitUserList, signIn, chatObj;

emitUserList = function ( io ) {
  crud.read(
    'user',
    {
      is_online: true
    },
    function ( err, result_list ) {
      io
        .of( '/chat' )
        .emit( 'listchange', result_list );
    });
};

signIn = function ( io, user_map, socket ) {
  crud.update(
    'user',
    {
      _id: user_map._id
    },
    {
      is_online: true
    },
    function ( err, result_map ) {
      emitUserList( io );
      user_map.is_online = true;
      socket.emit( 'userupdate', user_map );
    } );

  chatterMap[ user_map._id ] = socket;
  socket.user_id = user_map._id;
};

chatObj = {
  connect: function ( server ) {
    var io = socket.listen( server );

    io
      // .set( 'blacklist', [] )
      .of( '/chat' )
      .on( 'connection', function ( socket ) {
        socket.on( 'adduser', function ( user_map ) {
          crud.read(
            'user',
            {
              name: user_map.name
            },
            function ( err, result ) {
              var
                result_map,
                cid = user_map.cid;

              delete user_map.cid;

              if ( result.length > 0 ) {
                result_map = result[ 0 ];
                result_map.cid = cid;
                signIn( io, result_map, socket );
              }
              else {
                user_map.is_online = true;
                crud.construct(
                  'user',
                  user_map,
                  function ( err, result ) {
                    result_map = result;
                    result_map.cid = cid;
                    chatterMap[ result_map._id ] = socket;
                    socket.user_id = result_map._id;
                    socket.emit( 'userupdate', result_map );
                    emitUserList( io );
                  }
                );
              }
            }
          );
        } );
        socket.on( 'updatechat', function () {} );
        socket.on( 'leavechat', function () {} );
        socket.on( 'disconnect', function () {} );
        socket.on( 'updateavatar', function () {} );
      });

    return io;
  }
};

module.exports = chatObj;
