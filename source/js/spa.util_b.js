/**
 * spa.util_b.js
 * - spa.util_bの定義（ブラウザ向けユーティリティモジュール）
 */

/* eslint-env browser, jquery */

spa.util_b = ( function () {
  'use strict';

  var
    /**
     * 各種設定
     * @type {RegEx} HTMLエンコード用の正規表現
     * @type {RegEx} HTMLエンコード用の正規表現(&なし)
     * @type {Objct} HTMLエンコード用マップ
     * @type {Objct} HTMLエンコード用マップ(&なし)
     */
    configMap = {
      regex_encode_html: /[&"'><]/g,
      regex_encode_noamp: /["'><]/g,
      html_encode_map: {
        '$': '&#38;',
        '"': '&#34;',
        "'": '&#39;',
        '>': '&#62;',
        '<': '&#60;'
      },
      encode_noamp_map: {}
    },

    decodeHtml, encodeHtml, getEmSize;

  configMap.encode_noamp_map = $.extend( {}, configMap.html_encode_map );
  delete configMap.encode_noamp_map['$'];

  // ユーティリティメソッド 開始 ---------------------------------------------------

  /**
   * 文字列からHTMLタグやブラウザエンティティを取り除く
   * @param  {String} str decodeする文字列
   * @return {String} decodeされた文字列
   */
  decodeHtml = function ( str ) {
    return $('<div/>').html(str || '').text();
  };

  /**
   * 文字列をHTMLエンコードする
   * @param  {String} input_arg_str [description]
   * @param  {Bool} exclude_amp [description]
   * @return {[type]} [description]
   */
  encodeHtml = function ( input_arg_str, exclude_amp ) {
    var
      input_str = String( input_arg_str ),
      regex, lookup_map;

    if ( exclude_amp ) {
      lookup_map = configMap.encode_noamp_map;
      regex = configMap.regex_encode_noamp;
    } else {
      lookup_map = configMap.html_encode_map;
      regex = configMap.regex_encode_html;
    }

    return input_str.replace(
      regex,
      function ( match, name ) {
        return lookup_map[ match ] || '';
      });
  };

  /**
   * DOM要素のfont-sizeの実測値を返す
   * @param  {Object} elem DOM要素のjQueryObject
   * @return {Number} font-size
   */
  getEmSize = function ( elem ) {
    return Number(
      getComputedStyle( elem, '' ).fontSize.match( /\d*\.?\d*/ )[0]
    );
  };

  // ユーティリティメソッド 終了 ---------------------------------------------------

  return {
    decodeHtml: decodeHtml,
    encodeHtml: encodeHtml,
    getEmSize: getEmSize
  };
}());
