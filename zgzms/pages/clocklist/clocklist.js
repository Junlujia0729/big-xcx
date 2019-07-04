const app = getApp()
const userApi = require('../../libraries/user.js')



// 创建一个页面对象用于控制页面的逻辑
Page({
  data: {
    column_id:0,
    items: [] ,
  },
  onLoad(params) {
    if (1 == 0 && wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true
      });
    }
    const that = this;
    that.setData({
      column_id: params.id
    });
    
    userApi.xcx_login_new(1,0,function () {
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/index/column_classes", { column_id: params.id}, function (res) {
        console.log(res.data.data);

        var datas = res.data.data.module_list;
        var clockList = [];
        for (var i = 0; i < datas.length; i++) {

          for (var j = 0; j < datas[i].class_list.length; j++) {

            //创建播放列表
            var json = {};
            json.title = datas[i].class_list[j].title;
            json.module_img = datas[i].class_list[j].module_img;
            json.created_time = datas[i].class_list[j].created_time;
            json.id = datas[i].class_list[j].id;
            clockList.push(json);
          }
        }
        console.log(clockList);
        that.setData({
          items: clockList,
        });
      });  
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  selectcolumn(e){
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../sectiondetail/sectiondetail?id=' + id,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
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
      title: that.data.items.title,
      path: '/pages/column/column?id=' + that.data.column_id,
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

  //打卡日历
  calendar:function(){
    wx.navigateTo({
      url: '../datepicker/datepicker',
    })
  }
})  
