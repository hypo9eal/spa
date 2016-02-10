/**
 * spa.model.js
 * - spa.modelの定義（モデル）
 * - personオブジェクトの定義
 * - peopleオブジェクトの定義
 * - chatオブジェクトの定義
 */

/* eslint-env jquery, browser */
/* eslint no-console: 1 */
/* global TAFFY:false */

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
     * @type {Bool} is_connected ユーザが現在チャットルームにいるか否か
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
   * - 完了時にspa-loginイベントを発行する
   * @param  {[type]} user_list [description]
   * @return {[type]} [description]
   */
  completeLogin = function ( user_list ) {
    var user_map = user_list[ 0 ];
    delete stateMap.people_cid_map[ user_map.cid ];
    stateMap.user.cid = user_map._id;
    stateMap.user.id = user_map._id;
    stateMap.user.css_map = user_map.css_map;
    stateMap.people_cid_map[ user_map._id ] = stateMap.user;

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
   * @return {Bool} 削除が実行されたか否か
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

  /**
   * public peopleオブジェクト
   * - pesronオブジェクトの集合を管理するためのメソッドとイベントを提供する
   * @return {Object} publicメソッドのマップ
   */
  people = ( function () {
    var get_by_cid, get_db, get_user, login, logout;

    /**
     * cidからpersonオブジェクトを取得する
     * @param  {String} cid [description]
     * @return {Object} [description]
     */
    get_by_cid = function ( cid ) {
      return stateMap.people_cid_map[ cid ];
    };

    /**
     * DB上のpeopleオブジェクトを取得する
     * @return {Object} [description]
     */
    get_db = function () {
      return stateMap.people_db;
    };

    /**
     * 現在のユーザーを取得する
     * @return {Object} [description]
     */
    get_user = function () {
      return stateMap.user;
    };

    /**
     * ログインする
     * - ログインするユーザーを作成する
     * - sioオブジェクトのuserupdateイベントにコールバックを割りあてる
     * - sioオブジェクトにadduserイベントを発行する
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
     * ログアウトする
     * - 現在のユーザーを削除する
     * - 現在のユーザーを匿名ユーザーに変更する
     * - spa-logoutイベントを発行する
     * @return {Bool} ユーザーが削除されたか否か
     */
    logout = function () {
      var
        is_removed,
        user = stateMap.user;

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
  }() );

  /**
   * public chatオブジェクト
   * - チャットメッセージングを管理するためのメソッドとイベントを提供する
   * - チャットルームの入退室
   * - ユーザーリストが更新されたイベントのイベントリスナの割り当て
   * - peopleオブジェクトの更新
   * @return {Object} publicメソッドのマップ
   */
  chat = ( function () {
    var
      _publish_listchange, _update_list, _leave_chat, join_chat;

    /**
     * ユーザーリストを受け取り、peopleオブジェクトを更新する
     * - ログインユーザーはcss_mapのみ更新し、ユーザーリストには追加しない
     * - DBのユーザーをnameでソートする
     * @param  {Array} arg_list 引数のリスト
     * @return {[type]} [description]
     */
    _update_list = function ( arg_list ) {
      var
        i,
        person_map,
        make_person_map,
        people_list = arg_list[ 0 ];

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

        makePerson( make_person_map );
      }

      stateMap.people_db.sort( 'name' );
    };

    /**
     * peopleオブジェクトを更新し、イベントを発行する
     * - _update_listを実行する
     * - spa-listchangeイベントを発行する
     * @param  {Array} arg_list [description]
     * @return {[type]} [description]
     */
    _publish_listchange = function ( arg_list ) {
      _update_list( arg_list );
      jqueryMap.$document.trigger( 'spa-listchange', [ arg_list ] );
    };

    /**
     * public チャットルームから退出する
     */
    _leave_chat = function () {
      var sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();
      stateMap.is_connected = false;
      if ( sio ) {
        sio.emit( 'leavechat' );
      }
    };

    /**
     * public チャットルームに入室する
     * - 匿名ユーザーを除外する
     * - DBのlistchangeイベントにイベントハンドラを割りあてる
     * @return {Bool} 入室したか否か
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
      stateMap.is_connected = true;

      return true;
    };

    return {
      _leave: _leave_chat,
      join: join_chat
    };
  }());

  /**
   * public モジュールの初期化をする
   * - 匿名ユーザーを作成して現在のユーザーとする
   * - DBからユーザーリストを取得する
   * @return {[type]} [description]
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
