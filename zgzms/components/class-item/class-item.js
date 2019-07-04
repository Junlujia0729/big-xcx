// components/class-item/class-item.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    classList: { // 属性名
      type: Array, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: [], // 属性初始值（可选），如果未指定则会根据类型选择一个
      //observer: function (newVal, oldVal) { } // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串, 如：'_propertyChange'
    },
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    gotoClass: function(e){
      if (e.currentTarget.dataset.viewtype == 2) {
        wx.navigateTo({
          url: '/pages/childlist/childlist?id=' + e.currentTarget.dataset.id,
        })
      } else {
        wx.navigateTo({
          url: '/pages/classx/classx?id=' + e.currentTarget.dataset.id,
        })
      }
    }
  }
})
