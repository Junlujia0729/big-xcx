const app = getApp()
const userApi = require('../../libraries/user.js')

Page({
  data: {
    boards: [
      { route: 'bind/bind', id: '', name: '绑定账号', icon:'http://imgs.52jiaoshi.com/1513740919.png' },
      { route: 'mine/mine', id: '0', name: '我的课程', icon: 'http://imgs.52jiaoshi.com/1513740220.png'  },
      { route: 'mylogistic/mylogistic', id: '0', name: '我的物流', icon: '/images/icon_me_logistics.png' },
      { route: 'minegroup/minegroup', id: '0', name: '我的拼课',
        icon: '/images/icon_me_fight_course.png' },
      { route: 'discount/discount', id: '', name: '优惠券', icon: 'http://imgs.52jiaoshi.com/1513740817.png' },
      { route: 'mycolumn/mycolumn', id: '', name: '已订阅专栏', icon: '/images/icon_me_shishuo.png' },
      { route: 'mywallet/mywallet', id: '', name: '我的钱包', icon: 'http://imgs.52jiaoshi.com/1517900714.png' },
      { route: 'clockset/clockset', id: '', name: '设置', icon: 'http://imgs.52jiaoshi.com/1516345709.png' },
      { route: 'jobs/pages/createaudio/createaudio', id: '', name: '音频', icon: 'http://imgs.52jiaoshi.com/1516345709.png' },
      { route: 'dailypractice/pages/index/index', id: '', name: '模考', icon: 'http://imgs.52jiaoshi.com/1516345709.png' }
    ]
  },
  onLoad(params) {
    var that=this;
    userApi.xcx_login_new(1, 0, function () {
      that.setData({
        nickname: app.globalData.nickname,
        headimgurl: app.globalData.headimgurl
      });
      if (app.globalData.mobile != "") {
        that.data.boards.shift();
        that.setData({
          boards: that.data.boards
        })
      }
    });
    userApi.xcx_login_new(1, 0, function () {
      userApi.requestAppApi_GET(app.globalData.mainDomain + "ApiNlpgbg/xcx_myclass_link",
        {}, function (res) {
          var datas = res.data.data;
          var _boards = that.data.boards;
          for (let i = 0; i < _boards.length;i++){
            // if (_boards[i].name == '我的课程'){
            //   _boards[i].route = datas.link
            // }
          }
          console.log(_boards);
          that.setData({
            boards: _boards,
          });
        });
    });
  },
  selectcolumn: function (e) {
    wx.navigateTo({
      url: '../columndetail/columndetail?id=' + e.currentTarget.dataset.id,
    })
  },
  getinfo:function(e){
    const that =this;
    //微信登录
    wx.login({
      success: function (res) {
        console.log('success');
        app.globalData.login_session_code = res.code;
        const wxlogincode = res.code;
        if (res.code) {
          //获取个人信息
          wx.getUserInfo({
            success: function (res1) {
              console.log('getUserInfo');
              console.log(res1);
              var nickName = res1.userInfo.nickName;
              var headimgurl = res1.userInfo.avatarUrl;
              app.globalData.nickname = nickName;
              app.globalData.headimgurl = headimgurl;
              that.setData({
                nickname: nickName,
                headimgurl: headimgurl
              });
              userApi.requestAppApi_POST(app.globalData.mainDomain + "ApiNlpgbg/xcx_setuinfo",
                {
                  miniprog: 1,
                  encryptedData: res1.encryptedData,
                  iv: res1.iv,
                  code: wxlogincode,
                  nickname: res1.userInfo.nickName,
                  headimgurl: res1.userInfo.avatarUrl
                }, 
                function (resSetInfo) {
                  //主要是重新获取用户的unionid了
                  if (resSetInfo.data.code == 200) {
                    app.globalData.unionId = resSetInfo.data.data.unionid;
                  }  
                });
            }, fail: function () {
              //获取失败，调起客户端小程序设置界面
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
        } else {
          wx.showModal({
            title: 'wx.login失败',
            content: 'wx.login失败',
          })
        }
      }
    }); 

  },
  bindGetUserInfo: function (e) {
    console.log(e.detail.userInfo);
    const that = this;
    app.globalData.nickname = e.detail.userInfo.nickName;
    app.globalData.headimgurl = e.detail.userInfo.avatarUrl;
    that.setData({
      nickname: e.detail.userInfo.nickName,
      headimgurl: e.detail.userInfo.avatarUrl
    });
    var encryptedData = e.detail.encryptedData;
    var iv = e.detail.iv;
    wx.login({
      success: function (res) {
        console.log('success');
        app.globalData.login_session_code = res.code;
        const wxlogincode = res.code;
        if (res.code) {
          //获取个人信息
          userApi.requestAppApi_POST(app.globalData.mainDomain + "ApiNlpgbg/xcx_setuinfo",
            {
              miniprog: 1,
              encryptedData: encryptedData,
              iv: iv,
              code: wxlogincode,
              nickname: app.globalData.nickname,
              headimgurl: app.globalData.headimgurl
            },
            function (resSetInfo) {
              //主要是重新获取用户的unionid了
              if (resSetInfo.data.code == 200) {
                app.globalData.unionId = resSetInfo.data.data.unionid;
              }
            });
        } else {
          wx.showModal({
            title: 'wx.login失败',
            content: 'wx.login失败',
          })
        }
      }
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    const that = this
    userApi.xcx_login_new(1, 0, function () {
      that.setData({
        nickname: app.globalData.nickname,
        headimgurl: app.globalData.headimgurl
      });
      if (app.globalData.mobile != "" && that.data.boards[0].name == '绑定账号') {
        that.data.boards.shift();
        that.setData({
          boards: that.data.boards
        })
      }
    });
    wx.stopPullDownRefresh();
  },

  onShow: function () {
    const that = this
    userApi.xcx_login_new(1, 0, function () {
      that.setData({
        nickname: app.globalData.nickname,
        headimgurl: app.globalData.headimgurl
      });
      if (app.globalData.mobile != "" && that.data.boards[0].name == '绑定账号') {
        that.data.boards.shift();
        that.setData({
          boards: that.data.boards
        })
      }
    });
  },
})





