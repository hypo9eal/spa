/**
 * spa.model.js
 * - spa.modelの定義（モデル）
 */

spa.model = ( function () {
  'use strict';

  var
    /**
     * 各種設定
     * @type {String} anon_id 匿名ユーザの仮ID
     */
    configMap = {
      anon_id: 'a0'
    },

    /**
     * 各種状態
     * @type {Object} anon_user 匿名ユーザのオブジェクト
     * @type {Object} people_cid_map cidをkeyとしたPersonオブジェクトのコレクション
     * @type {Object} people_db DBオブジェクト
     */
    stateMap = {
      anon_user: null,
      people_cid_map: {},
      people_db: TAFFY()
    },

    /**
     * @type {Boolean} フェイクデータを使用するか否か
     */
    isFakeData = true,

    personProto, makePerson, people, initModule;

  /**
   * Personオブジェクトのプロトタイプ
   * @type {Object}
   */
  personProto = {
    get_is_user: function () {
      return this.cid === stateMap.user.cid;
    },
    get_is_anon: function () {
      return this.cid === stateMap.anon_user.cid;
    }
  };

  /**
   * Personオブジェクトを作成して返す
   * @param  {Object} person_map 作成するPersonオブジェクトのプロパティのマップ
   * @return {Object} [description]
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
   * public Peopleオブジェクトのプロトタイプ
   * @type {Object}
   */
  people = {
    get_db: function () {
      return stateMap.people_db;
    },
    get_cid_map: function () {
      return stateMap.people_cid_map;
    }
  };

  /**
   * public モジュールの初期化をする
   * - 匿名ユーザーを作成して現在のユーザーとする
   * - DBからユーザーリストを取得する
   * @return {[type]} [description]
   */
  initModule = function () {
    var
      people_list,
      person_map;

    stateMap.anon_user = makePerson({
      cid: configMap.anon_id,
      id: configMap.anon_id,
      name: 'anonymous'
    });

    stateMap.user = stateMap.anon_user;

    if ( isFakeData ) {
      people_list = spa.fake.getPeopleList();
      for (let i = 0; i < people_list.length; i++ ) {
        person_map = people_list[ i ];
        makePerson({
          cid: person_map._id,
          css_map: person_map.css_map,
          id: person_map._id,
          name: person_map.name
        });
      }
    }
  };

  return {
    initModule: initModule,
    people: people
  };
}());
