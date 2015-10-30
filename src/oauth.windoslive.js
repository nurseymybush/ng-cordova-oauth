angular.module('oauth.windowslive', ['oauth.utils'])
  .factory('$windowslive', windowslive);

function windowslive($q, $http, $cordovaOauthUtility) {
  return { signin: oauthWindowslive };

  /*
   * Sign into the Windows Live Connect service
   *
   * @param    string clientId
   * @param    array appScope
   * @param    object options
   * @return   promise
  */
  function oauthWindowslive(clientId, appScope, options) {
    var deferred = $q.defer();
    if(window.cordova) {
      var cordovaMetadata = cordova.require("cordova/plugin_list").metadata;
      if($cordovaOauthUtility.isInAppBrowserInstalled(cordovaMetadata) === true) {
        var redirect_uri = "https://login.live.com/oauth20_desktop.srf";
        if(options !== undefined) {
          if(options.hasOwnProperty("redirect_uri")) {
            redirect_uri = options.redirect_uri;
          }
        }
        var browserRef = window.open('https://login.live.com/oauth20_authorize.srf?client_id=' + clientId + "&scope=" + appScope.join(",") + '&response_type=token&display=touch' + '&redirect_uri=' + redirect_uri, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
        browserRef.addEventListener('loadstart', function (event) {
          if((event.url).indexOf(redirect_uri) === 0) {
            browserRef.removeEventListener("exit", function (event) { });
            browserRef.close();
            var callbackResponse = (event.url).split("#")[1];
            var responseParameters = (callbackResponse).split("&");
            var parameterMap = [];

            for (var i = 0; i < responseParameters.length; i++) {
              parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
            }

            if (parameterMap.access_token !== undefined && parameterMap.access_token !== null) {
              deferred.resolve({ access_token: parameterMap.access_token, expires_in: parameterMap.expires_in });
            } else {
              deferred.reject("Problem authenticating");
            }
          }
        });
        browserRef.addEventListener('exit', function (event) {
          deferred.reject("The sign in flow was canceled");
        });
      } else {
        deferred.reject("Could not find InAppBrowser plugin");
      }
    } else {
      deferred.reject("Cannot authenticate via a web browser");
    }

    return deferred.promise;
  }
}

windowslive.$inject = ['$q', '$http', '$cordovaOauthUtility'];
