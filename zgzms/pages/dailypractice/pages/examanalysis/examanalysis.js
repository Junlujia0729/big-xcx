// pages/practice/practice/index.js
const app = getApp();
const userApi = require('../../../../libraries/user.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    indicatorDots: false,
    vertical: false,
    autoplay: false,
    interval: 3000,
    duration: 500,
    current: 0, //主动设置swiper页面
    swpIndex: 0, //记录实际的当前swiper页面
    examid: 0,
    items : [],
    answers:[],
    allpage:0,
    starttime:'',
    examanalysis:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面
    wx.setNavigationBarTitle({
      title: '全部解析'
    })
    let examanalysis = prevPage.data.examanalysis;
    
    
    for (let i = 0; i < examanalysis.items.length;i++){
      examanalysis.items[i].allanswer = [0,0,0,0,0,0];
      let _allanswer = examanalysis.items[i].ques.answer;
      let allanswer = _allanswer.split('');
      for (let j = 0; j < allanswer.length;j++){
        if (allanswer[j] == 'A'){
          examanalysis.items[i].allanswer[0] = 1;
        }
        if (allanswer[j] == 'B') {
          examanalysis.items[i].allanswer[1] = 1;
        }
        if (allanswer[j] == 'C') {
          examanalysis.items[i].allanswer[2] = 1;
        }
        if (allanswer[j] == 'D') {
          examanalysis.items[i].allanswer[3] = 1;
        }
        if (allanswer[j] == 'E') {
          examanalysis.items[i].allanswer[4] = 1;
        }
        if (allanswer[j] == 'F') {
          examanalysis.items[i].allanswer[5] = 1;
        }
      }
      var peritem = examanalysis.items[i].globalstats.error / examanalysis.items[i].globalstats.count;
      peritem = peritem.toFixed(2)*100;
      examanalysis.items[i].peritem = peritem;  
    }
    console.log(examanalysis);
    that.setData({
      examanalysis: examanalysis,
      allpage: examanalysis.items.length  
    })
  },
  
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
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
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
   
  },

  /**
   * 处理滚动事件处理
   */
  listenSwiper: function (e) {
    var that = this;
    let cr = e.detail.current;
    that.setData({
      swpIndex: e.detail.current,
    });
  },

})
function compare(property) {
  return function (a, b) {
    var value1 = a[property];
    var value2 = b[property];
    return value2 - value1;
  }
}