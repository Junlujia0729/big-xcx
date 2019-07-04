const app = getApp();
const mini_app_ver = '3.8.0';
const mini_app_from = 'android';
import { navigate } from "./router.js"

module.exports = {
  xcx_login_new(registerflag,updatetoken,callback){
    console.log("xcx_login_new");
    var judgeval = "";
    if (registerflag){
      judgeval = app.globalData.userToken;
    }else{
      judgeval = app.globalData.openId;
    }
    if (judgeval == "") {
      wx.login({  //调用微信登录
        success(res_wxlogin) {
          app.globalData.login_session_code = res_wxlogin.code;
          //login_session_code
          var loginObj = { code: res_wxlogin.code, os: app.globalData.systemInfo.platform }
          if (!registerflag){
            loginObj = Object.assign({ notregister: 1 }, loginObj);
          }
          if (!updatetoken){
            loginObj = Object.assign({ notupd: 1 }, loginObj);
          }
          console.log("send xcx_login_crypt");
          wx.request({
            url: app.globalData.mainDomain + "ApiNlpgbg/xcx_login_crypt",
            data: loginObj,
            method: "POST",
            header: { 'content-type': 'application/x-www-form-urlencoded', 'Version': mini_app_ver },
            dataType: 'json',
            success: function (res) {
              console.log("send xcx_login_crypt success");
              var wxlogincode = res_wxlogin.code;
              if (res.data.code == 200) {
                app.globalData.openId = res.data.data.openid;
                app.globalData.userToken = res.data.data.token;
                app.globalData.mobile = res.data.data.mobile;
                app.globalData.nickname = res.data.data.nickname;
                app.globalData.headimgurl = res.data.data.headimgurl;
                app.globalData.unionId = res.data.data.unionid;
                app.globalData.wx_ltk = res.data.data.wx_ltk;
              }else{
                app.globalData.openId = res.data.data.openid;
                app.globalData.unionId = res.data.data.unionid;
                app.globalData.wx_ltk = res.data.data.wx_ltk;
              }
              //两种情况下需要拉起同意鉴权进行注册或者设置信息
              //一个是未登录成功，另一个是昵称为空；或者unionid为空
              //如果是类似查询成绩，就不用注册
              if (registerflag && 
                  (app.globalData.userToken == "")) {
                //不同意获取信息，先注册，以便接口鉴权
                wx.request({
                  url: app.globalData.mainDomain + "ApiNlpgbg/xcx_register_crypt",
                  data: {
                    miniprog: 1,
                    code: wxlogincode
                  },
                  method: "POST",
                  header: { 'content-type': 'application/x-www-form-urlencoded', 'Version': mini_app_ver },
                  dataType: 'json',
                  success: function (resReg) {
                    if (resReg.data.code == 200) {
                      app.globalData.openId = resReg.data.data.openid;
                      app.globalData.userToken = resReg.data.data.token;
                      app.globalData.mobile = resReg.data.data.mobile;
                      app.globalData.nickname = resReg.data.data.nickname;
                      app.globalData.headimgurl = resReg.data.data.headimgurl;
                      app.globalData.unionId = resReg.data.data.unionid;
                      app.globalData.wx_ltk = resReg.data.data.wx_ltk;

                      callback();
                    }
                  },
                  fail: function () { }
                })
              }else{
                //登录成功
                callback();
              }
            },
            fail: function (fres) {
              console.log(fres);
              wx.showModal({
                title: '登录失败',
                content: '请确认网络正常后重新打开',
              })
             }
          })
        },
        fail() {
          wx.showModal({
            title: '登录失败了',
            content: '请确认网络正常后重新打开',
          })
        }
      })
    }else{
      callback();
    }
  },
  xcx_can_buy(zerolimit){
    if (app.globalData.userToken == ""
      || app.globalData.unionId == ""
      || app.globalData.unionId == undefined
      || (zerolimit == 1 && app.globalData.mobile == "")){
      return false;
    }else{
      return true;
    }
  },
  xcx_check_mobile_empty(){
    if (app.globalData.mobile == "") {
      navigate({
        path: "pages/login/login"
      });
      return false;
    }else{
      return true;
    }
  },
  xcx_reget_userinfo(callback){
    wx.login({  //调用微信登录
      success(res_wxlogin) {
        console.log(res_wxlogin);
        app.globalData.login_session_code = res_wxlogin.code;
        wx.getUserInfo({
          success: function (res_info) {
            console.log("success!");
            app.globalData.nickname = res_info.userInfo.nickName;
            app.globalData.headimgurl = res_info.userInfo.avatarUrl;
            if (app.globalData.userToken == "") {
              //没有注册用户，需要注册
              wx.request({
                url: app.globalData.mainDomain + "ApiNlpgbg/xcx_register_crypt",
                data: {
                  miniprog: 1,
                  encryptedData: res_info.encryptedData,
                  iv: res_info.iv,
                  code: res_wxlogin.code
                },
                method: "POST",
                header: { 'content-type': 'application/x-www-form-urlencoded', 'Version': mini_app_ver },
                dataType: 'json',
                success: function (resReg) {
                  if (resReg.data.code == 200) {
                    app.globalData.openId = resReg.data.data.openid;
                    app.globalData.userToken = resReg.data.data.token;
                    app.globalData.mobile = resReg.data.data.mobile;
                    app.globalData.nickname = resReg.data.data.nickname;
                    app.globalData.headimgurl = resReg.data.data.headimgurl;
                    app.globalData.unionId = resReg.data.data.unionid;
                    app.globalData.wx_ltk = resReg.data.data.wx_ltk;
                    callback();
                  }
                },
                fail: function () { }
              })
            } else {
              //已经注册只是没有头像，或者没有unionid
              wx.request({
                url: app.globalData.mainDomain + "ApiNlpgbg/xcx_setuinfo",
                data: {
                  miniprog: 1,
                  encryptedData: res_info.encryptedData,
                  iv: res_info.iv,
                  code: res_wxlogin.code,
                  nickname: res_info.userInfo.nickName,
                  headimgurl: res_info.userInfo.avatarUrl
                },
                method: "POST",
                header: {
                  'content-type': 'application/x-www-form-urlencoded', 'Version': mini_app_ver, 'Authorization': app.globalData.userToken, 'From': mini_app_from
                },
                dataType: 'json',
                success: function (resSetInfo) {
                  //主要是重新获取用户的unionid了
                  if (resSetInfo.data.code == 200) {
                    app.globalData.unionId = resSetInfo.data.data.unionid;
                    callback();
                  }
                },
                fail: function () { }
              })
            }
          },
          fail: function (res_info) {
            wx.openSetting({
              success: function (suc_data) {
                if (suc_data) {
                  if (suc_data.authSetting["scope.userInfo"] == true) {
                    app.globalData.rejectinfo = 0;
                  }
                }
              },
              fail: function () {
                console.info("设置失败返回数据");
              }
            });
          }
        })
      }
    })
  },
  xcxbind(){

  },
  json2Form :function(json) {
    var str = [];
    for (var p in json) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(json[p]));
    }
    return str.join("&");
  },
  requestAppApi_GET(url, params, funcback){
    var params1 = Object.assign({ miniprog: 1 }, params);
    wx.request({
        url: url,
        data: params1,
        method:"GET",
        header: { 
          'content-type': 'application/x-www-form-urlencode',
          'Authorization': app.globalData.userToken,
          'Version':mini_app_ver,
          'From': mini_app_from
          },
        dataType: 'json',
        success: function (res) { funcback(res)},
        fail: function (res) {  }
      })
  },
  requestAppApi_POST(url,params,funcback) {
    var params1 = Object.assign({ miniprog: 1 }, params);
    wx.request({
      url: url,
      data: params1,
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded', 'Version': mini_app_ver, 'Authorization': app.globalData.userToken, 'From': mini_app_from },
      dataType: 'json',
      success: function (res) {
        funcback(res);
      },
      fail: function (res) { }
    })
  },
  requestAppApi_POST_NOLOGIN(url, params, funcback) {
    var params1 = Object.assign({ openid: app.globalData.openId , miniprog: 1 }, params);
    wx.request({
      url: url,
      data: params1,
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded', 'Version': mini_app_ver, 'Authorization': app.globalData.wx_ltk, 'From': mini_app_from
      },
      dataType: 'json',
      success: function (res) {
        funcback(res);
      },
      fail: function (res) { }
    })
  },
  //多张图片上传
  //pictures 需要上传的数组 path 是本地路径  path_server 是远程路径
  upload_file_server(that, upurl, pictures, proc,total,callback) {
    var _that = that;
    var upload_task = wx.uploadFile({
      url: upurl, //需要用HTTPS，同时在微信公众平台后台添加服务器地址
      filePath: pictures[proc].path,//上传的文件本地地址
      name: 'file',
      formData: { 'path': 'wxchat' },//附近数据，这里为路径
      success: function (res) {
        var data = JSON.parse(res.data) //字符串转化为JSON
        var path_server_str = 'upload_picture_list[' + proc + '].path_server';
        _that.setData({
          [path_server_str]: data.data.key
        });
        proc ++;
        if (proc == total){
          callback();
        }else{
          module.exports.upload_file_server(_that, upurl, pictures, proc, total, callback);
        }
      }
    })
    upload_task.onProgressUpdate((res) => {
      console.log('上传进度', res.progress)
      // console.log('已经上传的数据长度', res.totalBytesSent)
      // console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
      // var upload_percent_str = 'upload_picture_list[' + proc + '].upload_percent';
      // _that.setData({
      //   [upload_percent_str]: res.progress
      // })
    })
  },
  genWebPageUrl: function (url) {
    //跳转，拼接用户的token，然后跳转
    var u = url;
    if (u.indexOf("?") == -1) {
      u += "?miniprogram=1&token=" + app.globalData.userToken + "&openid=" + app.globalData.openId;
    } else {
      u += "&miniprogram=1&token=" + app.globalData.userToken + "&openid=" + app.globalData.openId;
    }
    return u;
  },
  gotoActivityPage: function (path, title, open_type, callback) {
    if (path.indexOf("http://") == -1 && path.indexOf("https://") == -1) {
      if (open_type == "switchTab"){
        wx.switchTab({
          url: '../' + path,
          success: function () {
            if (callback) {
              callback();
            }
          }
        });
      }else{
        wx.navigateTo({
          url: '../' + path,
          success: function () {
            if (callback) {
              callback();
            }
          }
        })
      }
    } else {
      app.globalData.activityUrl = path;
      app.globalData.activityTitle = title;
      wx.navigateTo({
        url: '../activity/activity',
        success : function(){
          if (callback) {
            callback();
          }
        }
      })
    }
  }
}