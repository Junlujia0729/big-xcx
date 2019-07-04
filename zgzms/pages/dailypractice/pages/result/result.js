const app = getApp();
const userApi = require('../../../../libraries/user.js');
var utilComment = require('../../../common/commentlist.js');
// 创建一个页面对象用于控制页面的逻辑
Page({
  data: {
    correct_rate:0,
    examanalysis:{}
  },
  onLoad(params) {
    const that = this;
    if (1 == 0 && wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true
      });
    }
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面
    
    var correct_rate = parseInt(prevPage.data.correct_rate*100);
    that.setData({
      questions: prevPage.data.result.result,
      correct_rate: correct_rate,
      examanalysis: prevPage.data.examanalysis
    })
    var id = 1508;
    var title = params.title;
    userApi.xcx_login_new(1, 0, function () {
      
    });
    
  },
  
  onReady: function () {
    const that = this;
    // 页面渲染完成  
    var cxt_arc = wx.createCanvasContext('canvasArc');//创建并返回绘图上下文context对象。  
    cxt_arc.setLineWidth(6);
    cxt_arc.setStrokeStyle('#ffffff');
    cxt_arc.setLineCap('round')
    cxt_arc.beginPath();//开始一个新的路径  
    cxt_arc.arc(106, 106, 73, 0, 2 * Math.PI, false);//设置一个原点(106,106)，半径为100的圆的路径到当前路径  
    cxt_arc.stroke();//对当前路径进行描边  

    cxt_arc.setLineWidth(6);
    cxt_arc.setStrokeStyle('#3eccb3');
    cxt_arc.setLineCap('round')
    cxt_arc.beginPath();//开始一个新的路径  
    cxt_arc.arc(106, 106, 73, -Math.PI * 0.5, Math.PI * (that.data.correct_rate/100*2-0.5), false);
    cxt_arc.stroke();//对当前路径进行描边  

    cxt_arc.draw();

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
    
  },
  
  analysis:function(){
    wx.navigateTo({
      url: '../examanalysis/examanalysis',
    })
  }
}) 
