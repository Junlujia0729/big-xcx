const app = getApp()
const userApi = require('../../libraries/user.js')
// 创建一个页面对象用于控制页面的逻辑
Page({
  data: {
    /** 
        * 页面配置 
        */
    winWidth: 0,
    winHeight: 0,
    // tab切换  
    currentTab: 0,
    classid:0,
    title:'',
    page: 1,
    items: [] ,
    time: [],
    classlist:[],
    teacherlist:[],
    nodes:[],
    nodes1: [],
    flag:false,
    play:1
  },
  onLoad(params) {
    const that = this; 
    that.setData({
      classid: params.id,
    });
    //课程表
    userApi.requestAppApi_POST(app.globalData.mainDomain + "/Course/chapterlist", {
      classid: params.id,
      page: 1
    }, function (res) {
      that.setData({
        classlist: res.data.data
      });
    });

    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function (params) {
    const that = this;
    var tpg = that.data.page + 1;
    userApi.requestAppApi_POST(app.globalData.mainDomain + "/Course/chapterlist",
      { page: tpg, classid: that.data.classid }, function (res) {
      that.setData({ page: tpg });
      // console.log(res.data.data);
      var datas = res.data.data;
      var itms = that.data.classlist;
      if (datas.length) {
        for (var i = 0; i < datas.length; i++) {
          itms.push(datas[i]);
        }
        that.setData({
          classlist: itms,
        });
      }
    })
  },
  
  onReady: function () {
    wx.setNavigationBarTitle({ title: "课程表" });

  },
  
})  
