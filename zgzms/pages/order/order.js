// pages/order/order.js


const app = getApp();
const userApi = require('../../libraries/user.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    classid:0,
    payinfo: [],
    address:[],
    selectlevel:0,
    levelArray: [],
    prepay_id : '',
    groupid:0,
    ifgroup:0,
    hidden: true,
    tjuid:0,
    examname:'',
    idcard:'',
    isios:0,
    orderid:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    that.setData({ classid: options.id});
    console.log(options.tjuid);
    if (options.tjuid){
      that.setData({ tjuid: options.tjuid });
    }
    if (options.group) {
      that.setData({ ifgroup: options.group, groupid: options.groupid});
      userApi.xcx_login_new(1, 0, function () {
        userApi.requestAppApi_POST(app.globalData.mainDomain + "Course/group_order", {
          classid: that.data.classid,
          groupid: that.data.groupid
        }, function (res) {
          console.log(res.data.data);
          var items = res.data.data;
          var levelArray = [{ 0: '选择学段'}];
          if (items.levellist.length > 0) {
            for (var i = 0; i < items.levellist.length; i++) {
              levelArray.push(items.levellist[i]);
            }
            console.log(levelArray);
          }
          that.setData({
            payinfo: res.data.data,
            levelArray: levelArray,
            price: res.data.data.group_price,
            classname: res.data.data.classname
          });
          if (items.handout > 0) {
            userApi.requestAppApi_GET(app.globalData.mainDomain + "Live/defaultAddress", {
            }, function (res1) {
              if (res1.data.data.list) {
                that.setData({
                  address: res1.data.data.list
                });
              }
            });
          }
        });

      })
    }else{
      userApi.xcx_login_new(1, 0, function () {
        userApi.requestAppApi_POST(app.globalData.mainDomain + "Course/order", {
          classid: that.data.classid,
        }, function (res) {
          console.log(res.data.data);
          var items = res.data.data;
          var levelArray = ['选择学段'];
          if (items.levellist.length > 0) {
            for (var i = 0; i < items.levellist.length; i++) {
              for (var rr in items.levellist[i]) {
                levelArray.push(items.levellist[i][rr]);
              }
            }
          }
          that.setData({
            payinfo: res.data.data,
            levelArray: levelArray,
            price: res.data.data.price,
            classname: res.data.data.classname
          });
          if (items.handout > 0) {
            userApi.requestAppApi_GET(app.globalData.mainDomain + "Live/defaultAddress", {
            }, function (res1) {
              if (res1.data.data.list) {
                that.setData({
                  address: res1.data.data.list
                });
              }
            });
          }
        });
        
      })
    }
    
 
  },
  //选择学段
  bindPickerChange: function (e) {
    this.setData({
      selectlevel: e.detail.value
    })
  },
  confirmOrder:function(e){
    const that = this;
    if (that.data.payinfo.handout > 0){
      if (!that.data.address.id || that.data.address.id == "0" || that.data.address.id == 0){
        wx.showModal({
          title: '提示',
          content: '请您选择收货地址',
          showCancel : false ,
          success: function (res) {

          }
        })
        return false;
      }
    }
    if (that.data.payinfo.examlevel > 0 && that.data.selectlevel == 0) {
        wx.showModal({
          title: '提示',
          content: '请您选择学段',
          showCancel: false,
          success: function (res) {

          }
        })
        return false;
    }
    // 小班面试课
    if (that.data.payinfo.idcard_desc && that.data.payinfo.idcard_desc.length > 0) {
      if (that.data.examname == "") {
        wx.showModal({
          title: '提示',
          content: '请填写姓名',
          showCancel: false,
          success: function (res) {

          }
        })
        return false;
      }
      if (that.data.idcard.length != 18) {
        wx.showModal({
          title: '提示',
          content: '请填写正确的身份证号',
          showCancel: false,
          success: function (res) {

          }
        })
        return false;
      }
    }
    that.setData({
      hidden: !that.data.hidden
    });
    
    if (that.data.ifgroup == 0){
      //正常购课支付
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Live/wxpay", {
        classid: that.data.classid,
        addressid: that.data.address.id ? that.data.address.id : 0,
        discountid: that.data.payinfo.discount.length ? that.data.payinfo.discount[0].id : 0,
        examlevel: that.data.selectlevel,
        openid: app.globalData.openId,
        tjuid: that.data.tjuid,
        idcard: that.data.idcard,
        examname: that.data.examname,
        platform: app.globalData.systemInfo.platform
      }, function (res) {
        that.setData({
          prepay_id: res.data.data.prepay_id,
          hidden: !that.data.hidden
        });
        if (res.data.code == 2000){
          // 如果是IOS
          if (app.globalData.systemInfo.platform == 'ios') {
            that.setData({
              isios: 1,
              orderid: res.data.data.orderid
            })
            return;
          }
        }

        if (res.data.code == 610){
          console.log(res.data.data);
          var nextclassid = res.data.data.classid;
          var tips = res.data.data.tips;
          var classname = tips.slice((tips.indexOf(',') + 5));
          classname = classname.substr(0, classname.length - 2);
          wx.showModal({
            title: '提示',
            showCancel: true,
            content: res.data.data.tips,
            success: function (res) {
              if (res.confirm) {
                that.setData({
                  classid: nextclassid,
                  classname: classname
                });
                that.confirmOrder(); 
              } else if (res.cancel) {
                // 回到详情页
                wx.redirectTo({
                  url: '../classx/classx?id=' + nextclassid,
                  success: function (res) { },
                  fail: function (res) { },
                  complete: function (res) { },
                })
              }
            },
          })  
        }else if(res.data.code == 200){
          wx.requestPayment(
            {
              'timeStamp': res.data.data.timeStamp,
              'nonceStr': res.data.data.nonce_str,
              'package': 'prepay_id=' + res.data.data.prepay_id,
              'signType': 'MD5',
              'paySign': res.data.data.paysign,
              'success': function (res) {
              },
              'fail': function (res) { },
              'complete': function (res) {
                if (res.errMsg == "requestPayment:ok") {
                  //上报formid
                  userApi.requestAppApi_POST(app.globalData.mainDomain + "ApiNlpgbg/xcx_formid", { formid: that.data.prepay_id, openid: app.globalData.openId, type: 'pay' }, function (res) {
                  });
                  wx.redirectTo({
                    url: '../payresult/payresult?id=' + that.data.classid
                  })
                } else {
                  // wx.showModal({
                  //   title: '支付失败',
                  //   content: res.errMsg,
                  //   showCancel:false
                  // })
                }
              }
            })
        }else{
          wx.showModal({
            title: '提示',
            showCancel: false,
            content: res.data.msg,
            success: function (res) {
              if (res.confirm) {

              } else if (res.cancel) {

              }
            },
            complete: function () {
              // 回到详情页
              wx.redirectTo({
                url: '../classx/classx?id=' + that.data.classid,
                success: function (res) { },
                fail: function (res) { },
                complete: function (res) { },
              })
            }
          })  
        }
      });
    } else {
      //拼课支付
      var classid = that.data.classid;
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Weekly/group_wxpay", {
        classid: that.data.classid,
        addressid: that.data.address.id ? that.data.address.id : 0,
        discountid: that.data.payinfo.discount.length ? that.data.payinfo.discount[0].id : 0,
        examlevel: that.data.selectlevel,
        openid: app.globalData.openId,
        groupid: that.data.groupid,
        tjuid: that.data.tjuid,
        idcard: that.data.idcard,
        examname: that.data.examname,
        platform: app.globalData.systemInfo.platform
      }, function (res) {
        if(res.data.code == 201){
          console.log(classid);
          wx.showModal({
            title: '提示',
            showCancel:false,
            content: res.data.msg,
            success: function (res) {
              // 确定重新发起拼课
              if (res.confirm) {
                 
              } else if (res.cancel) {
                
              }
            },
            complete:function(){
              // 回到详情页
              wx.redirectTo({
                url: '../classx/classx?id=' + classid,
                success: function (res) { },
                fail: function (res) { },
                complete: function (res) { },
              })
            }
          })
        }
        that.setData({
          prepay_id: res.data.data.prepay_id,
          orderid: res.data.data.orderid,
          classid: res.data.data.classid,
          groupid: res.data.data.groupid,
          hidden: !that.data.hidden
        });
        if (res.data.code == 2000) {
          // 如果是IOS
          if (app.globalData.systemInfo.platform == 'ios') {
            that.setData({
              isios: 1,
              orderid: res.data.data.orderid
            })
            return;
          }
        }
        wx.requestPayment(
          {
            'timeStamp': res.data.data.timeStamp,
            'nonceStr': res.data.data.nonce_str,
            'package': 'prepay_id=' + res.data.data.prepay_id,
            'signType': 'MD5',
            'paySign': res.data.data.paysign,
            'success': function (res) {
            },
            'fail': function (res) { },
            'complete': function (res) {
              if (res.errMsg == "requestPayment:ok") {
                //上报formid
                userApi.requestAppApi_POST(app.globalData.mainDomain + "ApiNlpgbg/xcx_formid", { formid: that.data.prepay_id, openid: app.globalData.openId, type: 'pay' }, function (res) {
                });
                wx.redirectTo({
                  url: '../payresult/payresult?id=' + that.data.classid + '&orderid=' + that.data.orderid + '&groupid=' + that.data.groupid
                })
              } else {
                // wx.showModal({
                //   title: '支付失败',
                //   content: res.errMsg,
                //   showCancel:false
                // })
              }
            }
          })
      });
    }
    
    
    
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.setNavigationBarTitle({ title: "确认订单" });

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    if (that.data.orderid && that.data.isios == 1){
      userApi.xcx_login_new(1, 0, function () {
        userApi.requestAppApi_POST(app.globalData.mainDomain + "ApiNlpgbg/xcx_query_pay_result", {
          openid: app.globalData.openId,
          orderid: that.data.orderid
        }, function (res) {
          if(res.data.data.result == 1){
            if (that.data.groupid){
              wx.redirectTo({
                url: '../payresult/payresult?id=' + that.data.classid + '&orderid=' + that.data.orderid + '&groupid=' + that.data.groupid
              })
            }else{
              wx.redirectTo({
                url: '../payresult/payresult?id=' + that.data.classid
              })  
            }
          }
        });
      })
    }
    
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


  gotoAddress:function(){
    wx.navigateTo({
      url: '../addresslist/addresslist',
    })
  },

  name:function(e){
    const that = this;
    that.setData({
      examname:e.detail.value
    })
  },

  idcard: function (e) {
    const that = this;
    that.setData({
      idcard:e.detail.value
    })
  }
})