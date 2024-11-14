// know/know.js
Page({
    /**
       * 页面的初始数据
       */
     data: {
      tabs:[
        {
          id:0,
          value:"综合",
          isActive:true
        },
        {
          id:1,
          value:"销量",
          isActive:false
        },
        {
          id:2,
          value:"价格",
          isActive:false
        }
      ],
      // 被点击的标题的index
  
    },
  
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      console.log(options);
    },
    // 标题的点击事件，只不过是从子组件传递过来的
    handleTabsItemChange(e) {
      // 1 获取被点击的标题索引
      const {index} = e.detail
      // 2 修改原数组，产生一个激活产生效果
      let {tabs} = this.data;
      tabs.forEach((v,i) => {
        // v.isActive = i===index ? true:false 
        i===index?v.isActive=true:v.isActive=false
      })
      // 3 赋值到data中
      this.setData({
        tabs
      })
    }
  })
  