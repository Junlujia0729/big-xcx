import WeCropper from '../../we-cropper/we-cropper.js'

const device = wx.getSystemInfoSync();
const width = device.windowWidth
const height = device.windowHeight - 50

Page({
  data: {
    cropperOpt: {
      id: 'cropper',
      width,
      height,
      scale: 2.5,
      zoom: 8,
      cut: {
        //412 * 531
        x: (width - 309) / 2,
        y: (height - 398.25) / 2,
        width: 309,
        height: 398.25
      }
    }
  },
  touchStart (e) {
    this.wecropper.touchStart(e)
  },
  touchMove (e) {
    this.wecropper.touchMove(e)
  },
  touchEnd (e) {
    this.wecropper.touchEnd(e)
  },
  getCropperImage () {
    console.log(this.wecropper);
    const o_ctx = wx.createCanvasContext('myOutputCanvas');
    var wp = this.wecropper;
    var l = (wp.imgLeft - wp.cut.x) / 0.75;
    var t = (wp.imgTop - wp.cut.y) / 0.75;
    var w = wp.scaleWidth / 0.75;
    var h = wp.scaleHeight / 0.75;
    //console.log(`l:${l} --- t: ${t} --- w: ${w} --- h: ${h} --------`)
    o_ctx.drawImage(wp.croperTarget, l , t, w, h);
    o_ctx.draw();
    setTimeout(() => {
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: 412,
        height: 531,
        destWidth: 412,
        destHeight: 531,
        quality: 1,
        fileType: "jpg",
        canvasId: 'myOutputCanvas',
        success: function (res2) {
          wx.saveImageToPhotosAlbum({
            filePath: res2.tempFilePath,
            success(ires) {
              wx.showModal({
                title: '提示',
                content: '已保存到您的手机相册！',
                showCancel: false
              })
            }
          })
        }
      })
    }, 200);
    // this.wecropper.getCropperImage((avatar) => {
    //   if (avatar) {
    //     //  获取到裁剪后的图片
    //     // wx.redirectTo({
    //     //   url: `../index/index?avatar=${avatar}`
    //     // })
    //     wx.previewImage({
    //       current: avatar, // 当前显示图片的http链接
    //       urls: [avatar] // 需要预览的图片http链接列表
    //     })
    //   } else {
    //     wx.showModal({
    //       title: '提示',
    //       showCancel:false,
    //       content: '获取图片失败',
    //     })
    //   }
    // })
  },
  uploadTap () {
    const self = this

    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success (res) {
        const src = res.tempFilePaths[0]
        //  获取裁剪图片资源后，给data添加src属性及其值

        self.wecropper.pushOrign(src)
      }
    })
  },
  onLoad (option) {
    const { cropperOpt } = this.data

    if (option.src) {
      cropperOpt.src = option.src
      new WeCropper(cropperOpt)
        .on('ready', (ctx) => {
          console.log(`wecropper is ready for work!`)
        })
        .on('beforeImageLoad', (ctx) => {
          console.log(`before picture loaded, i can do something`)
          console.log(`current canvas context:`, ctx)
          wx.showToast({
            title: '上传中',
            icon: 'loading',
            duration: 20000
          })
        })
        .on('imageLoad', (ctx) => {
          console.log(`picture loaded`)
          console.log(`current canvas context:`, ctx)
          wx.hideToast()
        })
        .on('beforeDraw', (ctx, instance) => {
          console.log(`before canvas draw,i can do something`)
          console.log(`current canvas context:`, ctx)
        })
        .updateCanvas()
    }
  }
})
