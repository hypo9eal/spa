/**
 * spa.fake.js
 * - spa.fakeの定義（テスト用データモジュール）
 */

/* eslint-env node */

spa.fake = ( function () {
  'use strict';

  var peopleList, fakeIdSerial, makeFakeId, mockSio;

  fakeIdSerial = 5;

  /**
   * フェイクのユーザーIDを生成する
   * @return {String} ユーザーID
   */
  makeFakeId = function () {
    return 'id_' + String( fakeIdSerial++ );
  };

  peopleList = [
    {
      name: 'Betty',
      _id: 'id_01',
      css_map: {
        top: 20,
        left: 20,
        'background-color': 'rgb(128,128,128)'
      }
    },
    {
      name: 'Mike',
      _id: 'id_02',
      css_map: {
        top: 60,
        left: 20,
        'background-color': 'rgb(128,255,128)'
      }
    },
    {
      name: 'Pebbles',
      _id: 'id_03',
      css_map: {
        top: 100,
        left: 20,
        'background-color': 'rgb(128,192,192)'
      }
    },
    {
      name: 'Wilma',
      _id: 'id_04',
      css_map: {
        top: 140,
        left: 20,
        'background-color': 'rgb(192,128,128)'
      }
    }
  ];

  /**
   * mockSioオブジェクト
   */
  mockSio = ( function () {
    var on_sio, emit_sio, emit_mock_msg,
      send_listchange, listchange_idto,
      callback_map = {};

    /**
     * イベントに対するコールバックを登録する
     * @param  {String} msg_type イベント
     * @param  {Function} callback [description]
     */
    on_sio = function ( msg_type, callback) {
      callback_map[ msg_type ] = callback;
    };

    /**
     * 各種イベントへ応答する
     * @param  {String} msg_type 発行されたイベント
     * @param  {[type]} data イベント発行時に渡された引数
     */
    emit_sio = function ( msg_type, data ) {
      var person_map, i;

      /**
       * ユーザーがログインすると発行されるイベント
       * - 新規IDでログインユーザーを作成する
       * - ユーザーリストにログインユーザーを追加する
       * - userupdateのコールバックを実行する
       */
      if ( msg_type === 'adduser' && callback_map.userupdate ) {
        setTimeout( function () {
          person_map = {
            _id: makeFakeId(),
            name: data.name,
            css_map: data.css_map
          };
          peopleList.push( person_map );
          callback_map.userupdate( [ person_map ] );
        }, 3000 );
      }

      /**
       * チャットでメッセージが送信すると発行されるイベント
       * - チャットメッセージのデータを作成する
       * - updatechatのコールバックを実行する
       */
      if ( msg_type === 'updatechat' && callback_map.updatechat ) {
        setTimeout( function () {
          var user = spa.model.people.get_user();
          callback_map.updatechat( [{
            dest_id: user.id,
            dest_name: user.name,
            sender_id: data.dest_id,
            msg_text: 'Thanks for the note, ' + user.name
          }] );
        }, 2000);
      }

      /**
       * チャットを離脱すると発行されるイベント
       * - 各種コールバックの設定を削除する
       */
      if ( msg_type === 'leavechat' ) {
        delete callback_map.listchange;
        delete callback_map.updatechat;

        if ( listchange_idto ) {
          clearTimeout( listchange_idto );
          listchange_idto = undefined;
        }
        send_listchange();
      }

      /**
       * アバター機能でユーザー情報が更新されると発行されるイベント
       * - 更新されたユーザーのアバター情報を更新する
       * - 更新したユーザー情報を引数にlistchangeのコールバックを実行する
       */
      if ( msg_type === 'updateavatar' && callback_map.listchange ) {
        for ( i = 0; i < peopleList.length; i++ ) {
          if ( peopleList[ i ]._id === data.person_id ) {
            peopleList[ i ].css_map = data.css_map;
            break;
          }
        }
        callback_map.listchange( [ peopleList ] );
      }
    };

    /**
     * 他のユーザーからのメッセージを模倣する
     */
    emit_mock_msg = function () {
      setTimeout( function () {
        var user = spa.model.people.get_user();
        if ( callback_map.updatechat ) {
          callback_map.updatechat( [{
            dest_id: user.id,
            dest_name: user.name,
            sender_id: 'id_04',
            msg_text: 'Hi there ' + user.name + '! Wilma here.'
          }] );
        } else {
          emit_mock_msg();
        }
      }, 8000);
    };

    /**
     * DBが更新されたことを模倣する
     */
    send_listchange = function () {
      listchange_idto = setTimeout( function () {
        if( callback_map.listchange ) {
          callback_map.listchange( [ peopleList ] );
          emit_mock_msg();
          listchange_idto = undefined;
        } else {
          send_listchange();
        }
      }, 1000);
    };

    send_listchange();

    return {
      emit: emit_sio,
      on: on_sio
    };
  }());

  return {
    mockSio: mockSio
  };
}());
