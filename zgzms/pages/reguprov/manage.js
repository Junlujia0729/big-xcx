/**
 * 用户自定义需要显示的分类
 */

const app = getApp()
const userApi = require('../../libraries/user.js')

Page({
    data:{
      provid: 0,
      provs:[]
    },
    onLoad: function (options) {
      var that = this;
      var provid = that.data.provid;
      if (options.pid) {
        provid = options.pid;
      }
      that.setData({
        provid: provid
      })

      userApi.requestAppApi_POST(app.globalData.mainDomain + "Regulations/regu_provs", {}, function (res) {
        that.setData({
          provs: res.data.data
        });
      })
    },
    onReady(){
        wx.setNavigationBarTitle({title:'选择省'})
    },
    selectPro: function(e){
      var provid = e.currentTarget.dataset.id;
      if (this.data.proid != provid){
        this.setData({
          proid: provid
        });

        var pages = getCurrentPages();
        var currPage = pages[pages.length - 1];   //当前页面
        var prevPage = pages[pages.length - 2];  //上一个页面
        wx.showLoading({
          title: '加载中',
        });

        userApi.requestAppApi_POST(app.globalData.mainDomain + "Regulations/regu_area", { provinceid: provid }, function (res) {
            prevPage.setData({
              selectCity: res.data.data[0].items[0].id,
              selectProv: res.data.data[0].id,
              areas: res.data.data
            });
            prevPage.requestRegulist();
            
            wx.hideLoading();
            wx.navigateBack({
              delta: 1
            })
        });
      }
    }
})