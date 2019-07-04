const app = getApp();
const userApi = require('../../libraries/user.js');

// 创建一个页面对象用于控制页面的逻辑
Page({
  data: {
    name:'',
    limit:'',
    hidden: true
  },
  onLoad(params) {
    if (1 == 0 && wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true
      });
    }
    const that = this;
    userApi.xcx_login_new(1,0,function () {
      userApi.requestAppApi_POST(app.globalData.mainDomain + "/Home/Distribute/profit", {}, function (res) {
        that.setData({
          datas: res.data.data
        })
      });
    });
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

   /**
  * 用户点击右上角分享
  */
  onShareAppMessage: function (res) {
    var that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
     
    }
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
  formSubmit: function (e) {
    var that = this;
    var maxprice = that.data.datas.can_extract;
    if (e.detail.value.limit == "" || parseInt(e.detail.value.limit) < 2 
      || parseInt(e.detail.value.limit) > 20000 || parseInt(e.detail.value.limit) > maxprice) {
      wx.showModal({
        title: '提示',
        content: '请输入正确金额',
        showCancel: false
      })
      return false;
    }
    if (e.detail.value.name == "") {
      wx.showModal({
        title: '提示',
        content: '请输入姓名',
        showCancel: false
      })
      return false;
    }
    that.setData({
      name: e.detail.value.name,
      limit: e.detail.value.limit,
      hidden:false
    });
    userApi.requestAppApi_POST(app.globalData.mainDomain + "/Home/Distribute/withdraw", {
      money: e.detail.value.limit, real_name: e.detail.value.name
    }, function (res) {
      console.log(res);
      that.setData({
        hidden: true
      });
      if(res.data.code == 200){
        wx.showModal({
          title: '提示',
          content: res.data.msg,
          showCancel: false
        }); 
        userApi.requestAppApi_POST(app.globalData.mainDomain + "/Home/Distribute/profit", {}, function (res) {
          that.setData({
            datas: res.data.data
          })
        });
        that.setData({
          name: 0,
          limit: 0
        });
      } else if (res.data.code == 201){
        wx.showModal({
          title: '提示',
          content: res.data.msg,
          showCancel: false
        })  
      }
    });
  },
  cashrate: function (e) {
    wx.navigateTo({
      url: '../cashrate/cashrate',
    })
  }
}) 
