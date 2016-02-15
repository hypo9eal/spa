/**
 * spa.model.js
 * - spa.modelの定義（モデル）
 * - personオブジェクトの定義
 * - peopleオブジェクトの定義
 * - chatオブジェクトの定義
 */

/* eslint-env jquery, browser */
/* eslint no-console: 1 */
/* global TAFFY: false */

spa.model = ( function () {
  'use strict';

  var
    /**
     * 各種設定
     * @type {String} anon_id 匿名ユーザのID
     */
    configMap = {
      anon_id: 'a0'
    },

    /**
     * 各種状態
     * @type {Object} user 現在のユーザーのオブジェクト
     * @type {Object} anon_user 匿名ユーザーのオブジェクト
     * @type {Number} cid_serial cidのシリアルナンバーの現在地
     * @type {Object} people_cid_map cidをkeyとしたpersonオブジェクトのコレクション
     * @type {Object} people_db DBオブジェクト
     * @type {Boolean} is_connected ユーザが現在チャットに参加中か否か
     */
    stateMap = {
      user: null,
      anon_user: null,
      cid_serial: 0,
      people_cid_map: {},
      people_db: TAFFY(),
      is_connected: false
    },

    jqueryMap = {
      $document: $( document )
    },

    /**
     * @type {Boolean} フェイクデータを使用するか否か
     */
    isFakeData = true,

    personProto, makeCid, clearPeopleDb, completeLogin,
    makePerson, removePerson, people, chat, initModule;

  /**
   * personオブジェクトのプロトタイプ
   */
  personProto = {
    /**
     * ユーザーが現在のユーザーか否かを返す
     * @return {Boolean} [description]
     */
    get_is_user: function () {
      return this.cid === stateMap.user.cid;
    },

    /**
     * ユーザーが匿名ユーザーか否かを返す
     * @return {Boolean} [description]
     */
    get_is_anon: function () {
      return this.cid === stateMap.anon_user.cid;
    }
  };

  /**
   * cidを生成して返す
   * @return {Strings} [description]
   */
  makeCid = function () {
    return 'c' + String( stateMap.cid_serial++ );
  };

  /**
   * 現在のユーザーを除くすべてのユーザーを消去する
   * - people_dbとpeople_cid_mapをすべて消去する
   * - 現在のユーザーをpeople_dbとpeople_cid_mapに戻す
   */
  clearPeopleDb = function () {
    var user = stateMap.user;
    stateMap.people_db = TAFFY();
    stateMap.people_cid_map = {};

    if ( user ) {
      stateMap.people_db.insert( user );
      stateMap.people_cid_map[ user.cid ] = user;
    }
  };

  /**
   * ユーザーのログインを完了する
   * - ログインしたユーザー情報を現在のユーザーとして保存する
   * - チャットに参加する
   * - 完了時にspa-loginイベントを発行する
   * @param  {Array} user_list ログインしたユーザマップの配列
   */
  completeLogin = function ( user_list ) {
    var user_map = user_list[ 0 ];
    delete stateMap.people_cid_map[ user_map.cid ];
    stateMap.user.cid = user_map._id;
    stateMap.user.id = user_map._id;
    stateMap.user.css_map = user_map.css_map;
    stateMap.people_cid_map[ user_map._id ] = stateMap.user;

    chat.join();
    jqueryMap.$document.trigger( 'spa-login', [ stateMap.user ] );
  };

  /**
   * personオブジェクトを作成して返す
   * - 引数のマップからpersonオブジェクトを作成する
   * - 作成したpersonオブジェクトをpeople_cid_mapに格納する
   * - 作成したpersonオブジェクトをpeople_dbに追加する
   * @param  {Object} person_map 作成するpersonオブジェクトのプロパティのマップ
   * @return {Object} 作成したpersonオブジェクト
   */
  makePerson = function ( person_map ) {
    var
      person,
      cid = person_map.cid,
      css_map = person_map.css_map,
      id = person_map.id,
      name = person_map.name;

    if ( cid === undefined || ! name ) {
      throw 'client id and name required';
    }

    person = Object.create( personProto );
    person.cid = cid;
    person.name = name;
    person.css_map = css_map;

    if ( id ) {
      person.id = id;
    }

    stateMap.people_cid_map[ cid ] = person;

    stateMap.people_db.insert( person );

    return person;
  };

  /**
   * personオブジェクトを削除する
   * - personをperson_dbから削除する
   * - personをpeople_cid_mapから削除する
   * @param  {Object} person 削除対象のpersonオブジェクト
   * @return {Boolean} 削除が実行されたか否か
   */
  removePerson = function ( person ) {
    if ( ! person || person.id === configMap.anon_id ) {
      return false;
    }

    stateMap.people_db( { cid: person.cid } ).remove();
    if ( person.cid ) {
      delete stateMap.people_cid_map[ person.cid ];
    }

    return true;
  };

  // peopleオブジェクト 開始 -----------------------------------------------------

  /**
   * public peopleオブジェクト
   *
   * pesronオブジェクトの集合を管理するためのメソッドとイベントを提供する
   *
   * - methods
   *
   * get_by_cid( cid )
   * 	personオブジェクトをcidで取得する
   *
   * get_db()
   * 	バックエンドからユーザーリストオブジェクトを取得する
   *
   * get_user()
   * 	現在のユーザーを取得する
   *
   * login( name )
   * 	ログインする
   *
   * logout()
   * 	ログアウトする
   *
   * - events
   *
   * spa-logout
   * 	ログアウトすると発行される
   */
  people = ( function () {
    var get_by_cid, get_db, get_user, login, logout;

    /**
     * public personオブジェクトをcidで取得する
     * @param  {String} cid [description]
     * @return {Object} [description]
     */
    get_by_cid = function ( cid ) {
      return stateMap.people_cid_map[ cid ];
    };

    /**
     * public バックエンドからユーザーリストオブジェクトを取得する
     * @return {Object} [description]
     */
    get_db = function () {
      return stateMap.people_db;
    };

    /**
     * public 現在のユーザーを取得する
     * @return {Object} [description]
     */
    get_user = function () {
      return stateMap.user;
    };

    /**
     * public ログインする
     * - ログインするユーザーを作成する
     * - バックエンドのuserupdateイベントにコールバックを割りあてる
     * - バックエンドのadduserイベントを発行する
     * @param  {String} name ログインするユーザー名
     */
    login = function ( name ) {
      var sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();

      stateMap.user = makePerson({
        cid: makeCid(),
        css_map: {top: 25, left: 25, 'background-color': '#8f8'},
        name: name
      });

      sio.on( 'userupdate', completeLogin );

      sio.emit( 'adduser', {
        cid: stateMap.user.cid,
        css_map: stateMap.user.css_map,
        name: stateMap.user.name
      });
    };

    /**
     * public ログアウトする
     * - チャットから離脱する
     * - 現在のユーザーをユーザーリストから削除する
     * - 現在のユーザーを匿名ユーザーに変更する
     * - spa-logoutイベントを発行する
     * @return {Boolean} ユーザーが削除されたか否か
     */
    logout = function () {
      var
        is_removed,
        user = stateMap.user;

      chat._leave();
      is_removed = removePerson( user );
      stateMap.user = stateMap.anon_user;

      jqueryMap.$document.trigger( 'spa-logout', [ user ] );

      return is_removed;
    };

    return {
      get_by_cid: get_by_cid,
      get_db: get_db,
      get_user: get_user,
      login: login,
      logout: logout
    };
  }());

  // peopleオブジェクト 終了 -----------------------------------------------------

  // chatオブジェクト 開始 -------------------------------------------------------

  /**
   * public chatオブジェクト
   *
   * チャットメッセージングを管理するためのメソッドとイベントを提供する
   *
   * - methods
   *
   * join_chat()
   * 	チャットに参加する
   *
   * leave_chat()
   * 	チャットから離脱する
   *
   * get_chatee()
   * 	チャット相手を取得する
   *
   * set_chatee( person_id )
   * 	チャット相手を設定する
   *
   * send_msg( msg_text )
   * 	メッセージを送信する
   *
   * update_avatar( avatar_update_map )
   * 	更新されたユーザー情報をバックエンドに送信する
   *
   * _update_list( arg_list )
   * 	ユーザーリストを更新し、チャット相手のオンライン状態を確認する
   *
   * _publish_listchange( arg_list )
   * 	_update_listを実行し、spa-listchangeイベントを発行する
   *
   * _publish_updatechat( arg_list )
   * 	チャット相手を設定し、spa-updatechatイベントを発行する
   *
   * - events
   *
   * spa-setchatee
   * 	新しいチャット相手が設定されると発行されるイベント
   *
   * spa-listchange
   * 	ユーザーリストが変更されると発行されるイベント
   *
   * spa-updatechat
   * 	新しいメッセージを送受信すると発行されるイベント
   *
   */
  chat = ( function () {
    var
      _publish_listchange, _publish_updatechat,
      _update_list, leave_chat,
      get_chatee, join_chat, send_msg, set_chatee, update_avatar,
      chatee = null;

    /**
     * public チャットに参加する
     * - 匿名ユーザーを除外する
     * - バックエンドのlistchangeイベントにイベントハンドラを割りあてる
     * @return {Boolean} 参加したか否か
     */
    join_chat = function () {
      var sio;

      if ( stateMap.is_connected ) { return false; }

      if ( stateMap.user.get_is_anon() ) {
        console.warn( 'User must be defined before joining chat' );
        return false;
      }

      sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();
      sio.on( 'listchange', _publish_listchange );
      sio.on( 'updatechat', _publish_updatechat );
      stateMap.is_connected = true;

      return true;
    };

    /**
     * public チャットから離脱する
     */
    leave_chat = function () {
      var sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();
      chatee = null;
      stateMap.is_connected = false;
      if ( sio ) {
        sio.emit( 'leavechat' );
      }
    };

    /**
     * public チャット相手を返す
     * @return {Object} チャット相手のpersonオブジェクト
     */
    get_chatee = function () {
      return chatee;
    };

    /**
     * public チャット相手を設定する
     * - チャット相手に変更がなければ何もしない
     * - チャット相手が不在なら、chateeをnullにする
     * - spa-setchateeイベントを発行する
     * @param {String} person_id チャット相手のid
     * @return {Boolean} チャット相手が変更されたか否か
     */
    set_chatee = function ( person_id ) {
      var new_chatee;
      new_chatee = stateMap.people_cid_map[ person_id ];

      if ( new_chatee ) {
        if ( chatee && chatee.id === new_chatee.id ) {
          return false;
        }
      } else {
        new_chatee = null;
      }

      jqueryMap.$document.trigger( 'spa-setchatee', {
        old_chatee: chatee,
        new_chatee: new_chatee
      });

      chatee = new_chatee;
      return true;
    };

    /**
     * public チャットでメッセージを送信する
     * - ログイン状態で、かつチャット相手がいる状態でない場合は失敗する
     * - メッセージのオブジェクトを作成する
     * - spa-updatechatイベントを発行する
     * - バックエンドのupdatechatメッセージを発行させる
     * @param  {String} msg_text 送信するメッセージ
     * @return {Boolean} 送信が成功したか否か
     */
    send_msg = function ( msg_text ) {
      var
        msg_map,
        sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();

      if ( ! sio ) { return false; }
      if ( ! ( stateMap.user && chatee ) ) { return false; }

      msg_map = {
        dest_id: chatee.id,
        dest_name: chatee.name,
        sender_id: stateMap.user.id,
        msg_text: msg_text
      };

      _publish_updatechat( [ msg_map ] );
      sio.emit( 'updatechat', msg_map );

      return true;
    };

    /**
     * ユーザーリストを更新し、チャット相手のオンライン状態を確認する
     * - peopleオブジェクトを初期化する
     * - 新しいユーザーリストでmakePersonを実行するする
     * - チャット相手のオンライン状態を管理にする
     * - チャット相手がオフラインになったらチャット相手から解除する
     * - バックエンドのユーザーリストをnameでソートする
     * @param  {Array} arg_list 引数のリスト
     */
    _update_list = function ( arg_list ) {
      var
        i,
        person_map,
        make_person_map,
        people_list = arg_list[ 0 ],
        is_chatee_online = false;

      clearPeopleDb();

      PERSON:
      for( i = 0; i < people_list.length; i++ ) {
        person_map = people_list[ i ];

        if ( ! person_map.name ) { continue PERSON; }

        if ( stateMap.user && stateMap.user.id === person_map._id ) {
          stateMap.user.css_map = person_map.css_map;
          continue PERSON;
        }

        make_person_map = {
          cid: person_map._id,
          css_map: person_map.css_map,
          id: person_map._id,
          name: person_map.name
        };

        if ( chatee && chatee.id === make_person_map.id ) {
          is_chatee_online = true;
        }
        makePerson( make_person_map );
      }

      stateMap.people_db.sort( 'name' );

      if ( chatee && ! is_chatee_online ) { set_chatee( '' ); }
    };

    /**
     * _update_listを実行し、spa-listchangeイベントを発行する
     * @param  {Array} arg_list オンラインなユーザーの配列
     */
    _publish_listchange = function ( arg_list ) {
      _update_list( arg_list );
      jqueryMap.$document.trigger( 'spa-listchange', [ arg_list ] );
    };

    /**
     * チャット相手を設定し、spa-updatechatイベントを発行する
     * @param  {Array} arg_list 送信メッセージオブジェクトの配列
     */
    _publish_updatechat = function ( arg_list ) {
      var msg_map = arg_list[ 0 ];

      // チャット相手が未設定の場合、メッセージ送信元をチャット相手とする
      if ( ! chatee ) {
        set_chatee( msg_map.sender_id );

      // チャット相手が設定済みの場合、メッセージ送信元が自分以外で尚且つ
      // 現在のチャット相手以外であればメッセージ送信元をチャット相手とする
      } else if ( msg_map.sender_id !== stateMap.user.id
        && msg_map.sender_id !== chatee.id ) {
        set_chatee( msg_map.sender_id );
      }

      jqueryMap.$document.trigger( 'spa-updatechat', [ msg_map ] );
    };

    /**
     * public アバター機能で更新されたユーザー情報をバックエンドに送信する
     * - バックエンドのupdateavatarイベントを発行する
     * @param  {Object} avatar_update_map 更新されたユーザー情報
     */
    update_avatar = function ( avatar_update_map ) {
      var sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();
      if ( sio ) {
        sio.emit( 'updateavatar', avatar_update_map );
      }
    };

    return {
      leave: leave_chat,
      get_chatee: get_chatee,
      join: join_chat,
      send_msg: send_msg,
      set_chatee: set_chatee,
      update_avatar: update_avatar
    };
  }());

  // chatオブジェクト 終了 -------------------------------------------------------

  /**
   * public モジュールの初期化をする
   * - 匿名ユーザーを作成して現在のユーザーとする
   * - バックエンドからユーザーリストを取得する
   */
  initModule = function () {
    stateMap.anon_user = makePerson({
      cid: configMap.anon_id,
      id: configMap.anon_id,
      name: 'anonymous'
    });

    stateMap.user = stateMap.anon_user;
  };

  return {
    initModule: initModule,
    chat: chat,
    people: people
  };
}());
