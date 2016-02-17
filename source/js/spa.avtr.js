/**
 * spa.avtr.js
 * - spa.avtrの定義（アバターモジュール）
 */

/* eslint-env browser, jquery */

spa.avtr = ( function () {
  'use strict';

  var
    /**
     * 各種設定
     * @type {String} chat_model モデルのchatオブジェクト
     * @type {String} people_model モデルのpeopleオブジェクト
     * @type {Object} settable_map 外部から設定可能な設定のマップ
     */
    configMap = {
      chat_model: null,
      people_model: null,

      settable_map: {
        chat_model: true,
        people_model: true
      }
    },

    /**
     * 各種状態
     * @type {Object} drag_map ドラッグ中のアバターの座標情報
     * @type {Object} $drag_target ドラッグ中のアバターのjQueryオブジェクト
     * @type {Object} drag_bg_color ドラッグ中のアバターの色情報
     */
    stateMap = {
      drag_map: null,
      $drag_target: null,
      drag_bg_color: undefined
    },
    jqueryMap = {},

    getRandRgb, setJqueryMap, updateAvatar,
    onTapNav, onHeldstartNav, onHeldmoveNav, onHeldendNav,
    onSetchatee, onListchange, onLogout,
    configModule,initModule;

  // ユーティリティメソッド 開始 ---------------------------------------------------

  /**
   * RGB値をランダムで返す
   * @return {String} RGB値
   */
  getRandRgb = function () {
    var i, rgb_list = [];
    for ( i = 0; i < 3; i++ ) {
      rgb_list.push( Math.floor( Math.random() * 128 ) + 128 );
    }
    return 'rgb(' + rgb_list.join(',') + ')';
  };

  // ユーティリティメソッド 終了 ---------------------------------------------------

  // DOM関連メソッド 開始 --------------------------------------------------------

  /**
   * private jQuryオブジェクトをキャッシュする
   */
  setJqueryMap = function ( $container ) {
    jqueryMap = {
      $container: $container,
      $document: $(document)
    };
  };

  /**
   * アバターのCSS情報をバックエンドに更新する
   * @param  {Objet} $target アバターのjQueryオブジェクト
   */
  updateAvatar = function ( $target ) {
    var css_map, person_id;

    css_map = {
      top: parseInt( $target.css( 'top' ), 10 ),
      left: parseInt( $target.css( 'left' ), 10 ),
      'background-color': $target.css( 'background-color' )
    };
    person_id = $target.attr( 'data-id' );

    configMap.chat_model.update_avatar( {
      person_id: person_id,
      css_map: css_map
    } );
  };

  // DOM関連メソッド 終了 --------------------------------------------------------

  // イベントハンドラ 開始 --------------------------------------------------------

  /**
   * アバターのタップのイベントハンドラ
   * @param  {Object]} event イベントオブジェクト
   */
  onTapNav = function ( event ) {
    var
      css_map,
      $target = $( event.elem_target ).closest( '.spa-avtr-box' );

    if ( $target.length === 0 ) { return false; }
    $target.css( {
      'background-color': getRandRgb()
    } );
    updateAvatar( $target );
  };

  /**
   * アバターのtouchstartのイベントハンドラ
   * @param  {Object]} event イベントオブジェクト
   */
  onHeldstartNav = function ( event ) {
    var
      offset_target_map,
      offset_nav_map,
      $target = $( event.elem_target ).closest( '.spa-avtr-box' );

    if ( $target.length === 0 ) { return false; }

    stateMap.$drag_target = $target;
    offset_target_map = $target.offset();
    offset_nav_map = jqueryMap.$container.offset();

    offset_target_map.top -= offset_nav_map.top;
    offset_target_map.left -= offset_nav_map.left;

    stateMap.drag_map = offset_target_map;
    stateMap.drag_bg_color = $target.css( 'background-color' );

    $target
      .addClass( 'spa-x-is-drag' )
      .css( 'background-color' );
  };

  /**
   * アバターのtouchmoveのイベントハンドラ
   * @param  {Object]} event イベントオブジェクト
   */
  onHeldmoveNav = function ( event ) {
    var drag_map = stateMap.drag_map;

    if ( ! drag_map ) { return false; }

    drag_map.top += event.px_delta_y;
    drag_map.left += event.px_delta_x;

    stateMap.$drag_target.css( {
      top: drag_map.top,
      left: drag_map.left
    } );
  };

  /**
   * アバターのtouchendのイベントハンドラ
   * @param  {Object} event イベントオブジェクト
   */
  onHeldendNav = function ( event ) {
    var $drag_target = stateMap.$drag_target;

    if ( ! $drag_target ) { return false; }

    $drag_target
      .removeClass( 'spa-x-is-drag' )
      .css( 'background-color', stateMap.drag_bg_color );

    stateMap.drag_bg_color = undefined;
    stateMap.$drag_target = null;
    stateMap.drag_map = null;
    updateAvatar( $drag_target );
  };

  /**
   * spa-setchateeのイベントハンドラ
   * @param  {Object} event イベントオブジェクト
   * @param  {Object} arg_map チャット相手情報のオブジェクト
   */
  onSetchatee = function ( event, arg_map ) {
    var
      $nav = $(this),
      new_chatee = arg_map.new_chatee,
      old_chatee = arg_map.old_chatee;

    if ( old_chatee ) {
      $nav
        .find( '.spa-avtr-box[data-id=' + old_chatee.cid + ']' )
        .removeClass( 'spa-x-is-chatee' );
    }

    if ( new_chatee ) {
      $nav
        .find( '.spa-avtr-box[data-id=' + new_chatee.cid + ']' )
        .addClass( 'spa-x-is-chatee' );
    }
  };

  /**
   * spa-listchangeのイベントハンドラ
   * @param  {Object} event イベントオブジェクト
   */
  onListchange = function ( event ) {
    var
      $nav = jqueryMap.$container,
      people_db = configMap.people_model.get_db(),
      user = configMap.people_model.get_user(),
      chatee = configMap.chat_model.get_chatee() || {},
      $box;

    $nav.empty();

    if ( user.get_is_anon() ) { return false; }

    people_db().each( function ( person, idx) {
      var class_list;
      if( person.get_is_anon() ) { return true; }
      class_list = [ 'spa-avtr-box' ];

      if ( person.id === chatee.id ) {
        class_list.push( 'spa-x-is-chatee' );
      }
      if ( person.get_is_user() ) {
        class_list.push( 'spa-x-is-user' );
      }

      $box = $('<div/>')
        .addClass( class_list.join(' ') )
        .css( person.css_map )
        .attr( 'data-id', String( person.id ) )
        .prop( 'title', spa.util_b.encodeHtml( person.name) )
        .text( person.name )
        .appendTo( $nav );
    });
  };

  /**
   * spa-logoutのイベントハンドラ
   */
  onLogout = function () {
    jqueryMap.$container.empty();
  };

  // イベントハンドラ 終了 --------------------------------------------------------

  /**
   * public モジュールの設定をする
   * @param  {Object} input_map 適用する設定のマップオブジェクト
   * @return {Object} publicなメソッドを格納したオブジェクト
   */
  configModule = function ( input_map ) {
    spa.util.setConfigMap( {
      input_map: input_map,
      settable_map: configMap.settable_map,
      config_map: configMap
    } );
    return true;
  };

  /**
   * public モジュールの初期化をする
   * @param  {Object} $container モジュールの展開先のjQueryObject
   */
  initModule = function ( $container ) {
    setJqueryMap( $container );

    jqueryMap.$document.on( 'spa-setchatee', onSetchatee );
    jqueryMap.$document.on( 'spa-listchange', onListchange );
    jqueryMap.$document.on( 'spa-logout', onLogout );

    $container
      .on( 'utap', onTapNav )
      .on( 'uheldstart', onHeldstartNav )
      .on( 'uheldmove', onHeldmoveNav )
      .on( 'uheldend', onHeldendNav );

    return true;
  };

  return {
    configModule: configModule,
    initModule: initModule
  };
}());
