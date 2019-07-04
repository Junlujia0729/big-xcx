// pages/mine/mine.js

 
const app = getApp();
const userApi = require('../../libraries/user.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    classid: 0,
    items:[],
    group_type:1,
    countDownHour: 0,
    countDownMinute: 0,
    countDownSecond: 0,
    is_show: true,
    mobile: false,
    platform:'',
    guideApp: 0,
    platfrom_ios:0,
  },
  spell_type:0,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this
    that.setData({ 
      groupid: options.groupid,
      platform: app.globalData.systemInfo.platform,
      platform_ios: app.globalData.systemInfo.platform ? (app.globalData.systemInfo.platform.toLowerCase() == "ios" || app.globalData.systemInfo.platform.toLowerCase() == "devtools") : 0
    });
    if (options.tjuid) {
      that.setData({
        tjuid: options.tjuid,
      });
    } else {
      that.setData({
        tjuid: 0,
      });
    }
    userApi.xcx_login_new(1, 0, function () {
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Course/share_group",
        { groupid: options.groupid },function (res) {
          // console.log(res.data.data);
          var datas = res.data.data;
          //循环已加入用户
          var arr = [];
          var arr1 = [];
          for (var j = 0; j < datas.group_rule.items.length; j++) {
            arr.push(j + 1)
          }
          for (var h = 0; h < (datas.group_rule.number - datas.group_rule.items.length); h++) {
            arr1.push(h + 1)
          }
          that.setData({
            datas: datas,
            classid: datas.classid,
            arr:arr,
            arr1:arr1,
            countdown: datas.group_rule.countdown
          });
          //倒计时
          var totalSecond = datas.group_rule.countdown;
          var interval = setInterval(function () {
            // 秒数  
            var second = totalSecond;

            // 天数位  
            var day = Math.floor(second / 3600 / 24);
            var dayStr = day.toString();
            if (dayStr.length == 1) dayStr = '0' + dayStr;

            // 小时位  
            var hr = Math.floor((second - day * 3600 * 24) / 3600);
            var hrStr = hr.toString();
            if (hrStr.length == 1) hrStr = '0' + hrStr;

            // 分钟位  
            var min = Math.floor((second - day * 3600 * 24 - hr * 3600) / 60);
            var minStr = min.toString();
            if (minStr.length == 1) minStr = '0' + minStr;

            // 秒位  
            var sec = second - day * 3600 * 24 - hr * 3600 - min * 60;
            var secStr = sec.toString();
            if (secStr.length == 1) secStr = '0' + secStr;

            that.setData({
              countDownHour: hrStr,
              countDownMinute: minStr,
              countDownSecond: secStr,
            });
            totalSecond--;
            if (totalSecond < 0) {
              clearInterval(interval);
              //设置结束
              that.setData({
                countDownDay: '00',
                countDownHour: '00',
                countDownMinute: '00',
                countDownSecond: '00',
              });
            }
          }.bind(this), 1000);   
      });

      userApi.requestAppApi_GET(app.globalData.mainDomain + "Course/rec_class", { groupid: options.groupid }, function (res) {
        // console.log(res.data.data);
        that.setData({
          items: res.data.data
        });
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.setNavigationBarTitle({ title: "拼课状态" });
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
  * 用户点击右上角分享
  */
  onShareAppMessage: function (res) {
    
    var that = this;
    if (res.from === 'button') {
      console.log(res.target);
    }
    return {
      title: '【限时拼课】快来' + that.data.datas.group_rule.price + '元拼' + that.data.datas.classname,
      path: '/pages/sharegroup/sharegroup?id=' + that.data.classid + '&groupid=' + that.data.groupid,
      success: function (res1) {
        var scene = 10007;
        if (res1.shareTickets != undefined) {
          scene = 10044;
        }
        userApi.requestAppApi_POST(app.globalData.mainDomain + "/ApiNlpgbg/xcx_share_stat", {
          scene: scene, openid: app.globalData.openId
        }, function (shres) {

        });
        // 转发成功,通过res1.shareTickets[0]获取转发ticket
      },
      fail: function (res1) {
        // 转发失败
        //console.log(res1);
      }
    }
  },

  //看课
  look:function(){
    var that=this;
    wx.redirectTo({
      url: '../mineclass/mineclass?id='+that.data.classid,
    })
  },

  //重新拼课
  //拼课购买
  spell: function (e) {
    var that = this;
    if (!userApi.xcx_check_mobile_empty()) {
      //spell_type 1参与拼课 2重新发起拼课
      that.spell_type = 1;
      return;
    }
    if (that.data.datas.need_agreement) {
      wx.navigateTo({
        url: '../agreement/agreement?id=' + that.data.datas.classid + '&group=1&groupid=' + that.data.groupid + '&tjuid=' + that.data.tjuid,
      })
    } else {
      wx.navigateTo({
        url: '../order/order?id=' + that.data.datas.classid + '&group=1&groupid=' + that.data.groupid + '&tjuid=' + that.data.tjuid,
        success: function (res) { },
        fail: function (res) { },
        complete: function (res) { },
      })
    }
    
  },

  //重新拼课购买
  spell_new: function (e) {
    var that = this;
    if (!userApi.xcx_check_mobile_empty()) {
      //spell_type 1参与拼课 2重新发起拼课
      that.spell_type = 1;
      return;
    }
    if (that.data.datas.need_agreement) {
      wx.navigateTo({
        url: '../agreement/agreement?id=' + that.data.datas.classid + '&group=1&groupid=0&tjuid=' + that.data.tjuid,
      })
    } else {
      wx.navigateTo({
        url: '../order/order?id=' + that.data.datas.classid + '&group=1&groupid=' + 0 + '&tjuid=' + that.data.tjuid,
        success: function (res) { },
        fail: function (res) { },
        complete: function (res) { },
      })
    }
  },
  //回到首页
  retuen:function(){
    wx.switchTab({
      url: '../home/home',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  gotoClass: function (e) {
    var pages= getCurrentPages().length;
    console.log(pages);
    if (pages > 2){
      if (e.currentTarget.dataset.viewtype == 2) {
        wx.navigateBack({
          delta: pages - 1,
          success: function (res) { 
            setTimeout(function () {
              wx.navigateTo({
                url: '../childlist/childlist?id=' + e.currentTarget.dataset.id,
              })
            }, 800); 
          }
        })
      } else {
        wx.navigateBack({
          delta: pages-1,
          success: function (res) {
            // console.log('回调成功跳转详情'); 
            setTimeout(function(){
              wx.navigateTo({
                url: '../classx/classx?id=' + e.currentTarget.dataset.id,
                fail: function (res) {
                  console.log(res);
                }
              })
            },800); 
          }
        })  
      }
    }else{
      if (e.currentTarget.dataset.viewtype == 2) {
        wx.navigateTo({
          url: '../childlist/childlist?id=' + e.currentTarget.dataset.id,
        })
      } else {
        wx.navigateTo({
          url: '../classx/classx?id=' + e.currentTarget.dataset.id,
        })
      }  
    }
    
  },

  partake: function (e) {
    wx.navigateTo({
      url: '../sharegroup/sharegroup?groupid=' + e.currentTarget.dataset.partake,
    })
  },

  jumpdetail:function(){
    var that = this;
    wx.navigateTo({
      url: '../classx/classx?id=' + that.data.datas.classid+'&groupid=' + that.data.groupid,
    })  
  },

  cancle: function () {
    var that = this;
    that.setData({
      mobile: false,  //false
    })
  },

  //绑定手机号
  checkmobile: function (e) {
    var that = this;
    var mobile = e.detail.value.mobile;
    userApi.requestAppApi_POST(app.globalData.mainDomain + "App/wxbind", {
      mobile: e.detail.value.mobile,
      captcha: e.detail.value.verifycode
    }, function (res) {
      if (res.data.code == 200) {
        app.globalData.mobile = mobile;
        app.globalData.userToken = res.data.data.token;
        that.setData({
          mobile: false,  //false
          cancle: true
        })
        wx.showModal({
          title: '提示',
          content: '绑定成功',
          showCancel: false,
          success: function (tres) {
            if (that.data.groupid){
              that.spell();
            }else{
              that.spell_new();
            }
          }
        })
      } else {
        wx.showModal({
          title: '提示',
          content: res.data.msg,
          showCancel: false,
          success: function (res) {

          }
        })
      }
    });
  },
  cancle: function () {
    var that = this;
    that.setData({
      mobile: false,  //false
    })
  },

  //获取本机号码
  getPhoneNumber: function (e) {
    const that = this;
    console.log(e.detail.errMsg)
    console.log(e.detail.iv)
    console.log(e.detail.encryptedData)
    if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
      // 未授权
      that.setData({
        mobile: true,  //false
      })
    } else {
      // 同意授权  获取手机号
      userApi.requestAppApi_POST(app.globalData.mainQueryDomain + "App/xcx_get_phone_number",
        { encryptedData: e.detail.encryptedData, iv: e.detail.iv, code: app.globalData.login_session_code }, function (res) {
          console.log(res);
          if (res.data.code == 200) {
            app.globalData.mobile = res.data.data.mobile;
            app.globalData.userToken = res.data.data.token;
            that.setData({
              mobile: false,  //false
            })
            // 重新调支付
            if (that.data.groupid) {
              that.spell();
            } else {
              that.spell_new();
            }
          } else {
            wx.showModal({
              title: '提示',
              content: res.data.msg,
              showCancel: false,
              success: function (res) {

              }
            })
          }
          
        });
    }
  },
  
  // 引导APP
  guideApp: function () {
    const that = this;
    that.setData({
      guideApp: 1
    })
  },

  closeguideApp: function () {
    const that = this;
    that.setData({
      guideApp: 0
    })
  },

  // 直接购买获取手机号
  redirectTocallback: function () {
    var that = this;
    // buyclass_type 1立即购买 2拼课购买 3 0元课购买
    if (that.spell_type == 1) {
      if (that.data.datas.need_agreement) {
        wx.redirectTo({
          url: '../agreement/agreement?id=' + that.data.datas.classid + '&group=1&groupid=' + that.data.groupid + '&tjuid=' + that.data.tjuid,
        })
      } else {
        wx.redirectTo({
          url: '../order/order?id=' + that.data.datas.classid + '&group=1&groupid=' + that.data.groupid + '&tjuid=' + that.data.tjuid,
          success: function (res) { },
          fail: function (res) { },
          complete: function (res) { },
        })
      }
    } else if (that.spell_type == 2) {
      if (that.data.datas.need_agreement) {
        wx.redirectTo({
          url: '../agreement/agreement?id=' + that.data.datas.classid + '&group=1&groupid=0&tjuid=' + that.data.tjuid,
        })
      } else {
        wx.redirectTo({
          url: '../order/order?id=' + that.data.datas.classid + '&group=1&groupid=' + 0 + '&tjuid=' + that.data.tjuid,
          success: function (res) { },
          fail: function (res) { },
          complete: function (res) { },
        })
      }
    }

  }
})