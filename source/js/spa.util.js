/**
 * spa.util.js
 * - spa.utilの定義（汎用メソッド）
 */

spa.util = ( function () {
  var makeError, setConfigMap;

  /**
   * Errorオブジェクトを生成する
   * @param  {String} name_text エラー名
   * @param  {String} msg_text エラーメッセージ
   * @param  {[Error]} data Errorオブジェクト
   * @return {[Error]} [description]
   */
  makeError = function ( name_text, msg_text, data ) {
    var error = new Error();
    error.name = name_text;
    error.message = msg_text;

    if ( data ) {
      error.data = data;
    }

    return error;
  };

  /**
   * マップを設定する
   * @param {Object} arg_map.input_map 構成するマップオブジェクト
   * @param {Object} arg_map.settable_map 構成可能なkeyのマップオブジェクト
   * @param {Object} arg_map.config_map 構成を適用するマップオブジェクト
   */
  setConfigMap = function ( arg_map ) {
    var
      input_map = arg_map.input_map,
      settable_map = arg_map.settable_map,
      config_map = arg_map.config_map,
      key_name, error;

    for ( key_name in input_map ) {
      if ( input_map.hasOwnProperty( key_name ) ) {
        if ( settable_map.hasOwnProperty( key_name ) ) {
          config_map[key_name] = input_map[key_name];
        } else {
          error = makeError(
            'Bad Input',
            'Setting config key |' + key_name + '| is not supported.' );
          throw error;
        }
      }
    }
  };

  return {
    makeError: makeError,
    setConfigMap: setConfigMap
  };
}());
