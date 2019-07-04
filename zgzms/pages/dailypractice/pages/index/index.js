const app = getApp();
const userApi = require('../../../../libraries/user.js');
var utilComment = require('../common/commentlist.js');
// 创建一个页面对象用于控制页面的逻辑
Page(utilComment.ext_comment_config({
  data: {
    datas:{},
    is_loadingmore:0
  },
  onLoad(params) {
    if (1 == 0 && wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true
      });
    }
    const that = this;
    userApi.xcx_login_new(1,0,function () {
      that.setData({
        userToken: app.globalData.userToken
      });
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Daily/practice", {id: 1 }, function (res) {
        console.log(res.data);
        that.setData({
          datas: res.data.data    
        });
        wx.setNavigationBarTitle({
          title: res.data.data.title
        })
      });
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Daily/column_lastcomment", {
        inf_id: 0, dailyid:1}, function (res) {
        console.log(res);
        let commentlist =[];
        for (var i = 0; i < res.data.data.length; i++) {
          commentlist.push(res.data.data[i]);
        }
        that.setData({
          common_comment_list: commentlist,
        });
      }) 
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
    const that = this;
    
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    that.setData({
      is_loadingmore: 1,
      loadingmore_text: '正在加载'
    });
    var score = 0;
    var commentlist = that.data.common_comment_list;
    if (commentlist.length > 0) {
      score = commentlist[commentlist.length - 1].score;
    }
    userApi.requestAppApi_POST(app.globalData.mainDomain + "Daily/column_lastcomment", {inf_id: score }, function (res) {
      if (res.data.data.length) {
        for (var i = 0; i < res.data.data.length; i++) {
          commentlist.push(res.data.data[i]);
        }
        that.setData({
          common_comment_list: commentlist,
          is_loadingmore: 0
        });
      } else {
        that.setData({
          loadingmore_text: '没有更多了'
        });
        setTimeout(function () {
          that.setData({
            is_loadingmore: 0
          });
        }, 3000);
      }
    });
  },
  
  // 打卡
  commentClass: function (e) {
    var that = this;
    userApi.requestAppApi_POST(app.globalData.mainQueryDomain + "ApiNlpgbg/xcx_formidByUid", { formid: e.detail.formId, openid: app.globalData.openId, unionid: app.globalData.unionId, token: app.globalData.wx_ltk }, function (res) {
      wx.navigateTo({
        url: '../addcomment/addcomment?id=1',
      })
    });
  },
  //打卡日历
  calendar: function () {
    var that = this;
    wx.navigateTo({
      url: '../datepicker/datepicker?id=1',
    })
  },

  practice:function(){
    var that = this;
    wx.navigateTo({
      url: '../practice/practice?id=1538',
    })
  }
})) 
